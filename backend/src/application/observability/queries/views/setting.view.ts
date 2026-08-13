/**
 * One administrable setting as the API returns it.
 *
 * `configured` is the field that matters: a fresh database has no rows in
 * `system_settings`, yet the system is still running on real values. Returning
 * the effective defaults with `configured: false` tells the caller what is in
 * force today, instead of a 404 that would suggest the setting does not exist.
 */
export interface SettingView {
  key: string
  value: unknown
  description?: string
  configured: boolean
  updatedAt?: string
  updatedBy?: string
}

/** A settings key as listed in the admin index. */
export interface SettingKeyView {
  key: string
  description: string
}
