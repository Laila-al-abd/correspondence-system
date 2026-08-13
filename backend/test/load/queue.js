/*
 * Load test: the reviewer's working loop.
 *
 * Run with k6 (https://k6.io), which is a single binary and needs no project:
 *
 *   k6 run test/load/queue.js
 *   k6 run -e BASE_URL=http://localhost:3000 -e VUS=30 test/load/queue.js
 *
 * What it measures, and why these routes: the queue screen is the page every
 * member of staff keeps open, so it is the one request that arrives at a
 * multiple of everybody else's. It is also the most expensive read in the
 * system -- it joins requests, step instances, templates and users, and it is
 * paginated -- which makes it the honest subject of a load test. Logging in
 * once per virtual user and then looping mirrors real behaviour; logging in on
 * every iteration would measure bcrypt instead of the queue.
 *
 * Thresholds are the pass/fail contract. 500 ms at the 95th percentile is the
 * point at which a list stops feeling instant, and a 1% error budget is there
 * to catch the pool exhausting, not to tolerate bugs.
 */
import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'
const VUS = Number(__ENV.VUS || 20)

export const options = {
  stages: [
    { duration: '30s', target: VUS }, // ramp up
    { duration: '1m', target: VUS }, // hold: this is the measurement
    { duration: '20s', target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
}

const USERS = [
  { email: 'reviewer1@correspondence.local', password: 'Review@12345' },
  { email: 'reviewer2@correspondence.local', password: 'Review@12345' },
]

export function setup() {
  // One login per account, shared by every virtual user. The rate limiter caps
  // logins at 5 a minute per address, so 20 VUs logging in individually would
  // measure the throttler.
  const tokens = []
  for (const user of USERS) {
    const response = http.post(`${BASE_URL}/auth/login`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.status !== 200 && response.status !== 201)
      throw new Error(
        `setup: login failed for ${user.email}: ${response.status} ${response.body}`,
      )
    tokens.push(JSON.parse(response.body).accessToken)
  }
  return { tokens }
}

export default function (data) {
  const token = data.tokens[__VU % data.tokens.length]
  const params = {
    headers: { Authorization: `Bearer ${token}` },
    // Tags group the numbers by route in the summary; without them every
    // request is averaged together and a slow endpoint hides behind a fast one.
    tags: { name: 'queue' },
  }

  const queue = http.get(`${BASE_URL}/requests?page=1&pageSize=20`, params)
  check(queue, {
    'queue answered 200': (r) => r.status === 200,
  })

  const unread = http.get(`${BASE_URL}/notifications/unread-count`, {
    ...params,
    tags: { name: 'unread-count' },
  })
  check(unread, {
    'unread count answered 200': (r) => r.status === 200,
  })

  // A person reads before acting. Without this the test measures how fast the
  // server can be flooded, which is not a question anybody asked.
  sleep(1)
}
