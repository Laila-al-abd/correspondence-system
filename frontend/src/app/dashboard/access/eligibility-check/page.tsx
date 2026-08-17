// 'use client';
// // src/app/dashboard/access/eligibility-check/page.tsx
// //
// // Diagnostic tool, distinct from RBAC permissions (GET /auth/me/permissions,
// // already surfaced via usePermissions()). This answers a different question:
// // given a user's ABAC attributes, which templates can they submit, and for
// // one specific template, which rule(s) are they failing.

// import { useState } from 'react';
// import { useUsers } from '@/lib/hooks/use-users';
// import { useTemplates } from '@/lib/hooks/use-template';
// import { useEligibleTemplates, useTemplateEligibility } from '@/lib/hooks/use-access';
// import { PermissionGate } from '@/components/permission-gate';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
// import { UserSummaryView } from '@/types/identity';

// const selectClass =
//   'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

// function formatRuleValue(value: unknown): string {
//   if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
//     return JSON.stringify(value);
//   }
//   return String(value);
// }

// function EligibilityCheckContent() {
//   const [searchInput, setSearchInput] = useState('');
//   const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
//   const [selectedUser, setSelectedUser] = useState<UserSummaryView | null>(null);
//   const [checkTemplateId, setCheckTemplateId] = useState('');

//   const { data: userResults, isLoading: searching } = useUsers(1, 10, searchTerm);
//   const { data: eligibleTemplates, isLoading: loadingEligible } = useEligibleTemplates(selectedUser?.id ?? '');
//   const { data: templates } = useTemplates();
//   const { data: eligibilityCheck, isLoading: checkingOne } = useTemplateEligibility(
//     selectedUser?.id ?? '',
//     checkTemplateId
//   );

//   function handleSearch() {
//     setSearchTerm(searchInput.trim() || undefined);
//   }

//   function selectUser(user: UserSummaryView) {
//     setSelectedUser(user);
//     setCheckTemplateId('');
//   }

//   return (
//     <div className="space-y-6 p-6">
//       <div>
//         <h1 className="text-2xl font-semibold">Check User Eligibility</h1>
//         <p className="text-sm text-muted-foreground">
//           See which templates a user is eligible to submit, based on ABAC attribute rules.
//         </p>
//       </div>

//       <Card className="max-w-xl">
//         <CardHeader><CardTitle>Find a user</CardTitle></CardHeader>
//         <CardContent className="space-y-3">
//           <div className="flex gap-2">
//             <Input
//               placeholder="Search by name or email"
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//             />
//             <Button onClick={handleSearch} disabled={searching}>Search</Button>
//           </div>

//           {userResults && userResults.items.length > 0 && (
//             <div className="divide-y rounded-md border">
//               {userResults.items.map((u) => (
//                 <button
//                   key={u.id}
//                   onClick={() => selectUser(u)}
//                   className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50 ${
//                     selectedUser?.id === u.id ? 'bg-muted' : ''
//                   }`}
//                 >
//                   <span>{u.fullNameAr}{u.fullNameEn && ` (${u.fullNameEn})`}</span>
//                   <span className="text-muted-foreground">{u.email}</span>
//                 </button>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {selectedUser && (
//         <div className="space-y-6">
//           <p className="text-sm">
//             Showing eligibility for <strong>{selectedUser.fullNameAr}</strong> ({selectedUser.email})
//           </p>

//           <div className="space-y-2">
//             <h2 className="font-medium">Eligible templates</h2>
//             {loadingEligible ? (
//               <p className="text-muted-foreground text-sm">Loading…</p>
//             ) : !eligibleTemplates || eligibleTemplates.length === 0 ? (
//               <p className="text-muted-foreground text-sm">This user is not eligible for any active template.</p>
//             ) : (
//               <ul className="space-y-1">
//                 {eligibleTemplates.map((t) => (
//                   <li key={t.id}>
//                     <Badge variant="default">{t.title.ar}{t.title.en && ` (${t.title.en})`}</Badge>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="checkTemplate">Check a specific template</Label>
//             <select
//               id="checkTemplate"
//               className={selectClass}
//               value={checkTemplateId}
//               onChange={(e) => setCheckTemplateId(e.target.value)}
//             >
//               <option value="">— select template —</option>
//               {templates?.map((t) => (
//                 <option key={t.id} value={t.id}>{t.nameAr}{t.nameEn && ` (${t.nameEn})`}</option>
//               ))}
//             </select>

//             {checkTemplateId && (
//               checkingOne ? (
//                 <p className="text-muted-foreground text-sm">Checking…</p>
//               ) : eligibilityCheck && (
//                 <div className="space-y-2 pt-2">
//                   <Badge variant={eligibilityCheck.eligible ? 'default' : 'secondary'}>
//                     {eligibilityCheck.eligible ? 'Eligible' : 'Not eligible'}
//                   </Badge>
//                   {!eligibilityCheck.eligible && eligibilityCheck.unmetRules.length > 0 && (
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Attribute</TableHead>
//                           <TableHead>Operator</TableHead>
//                           <TableHead>Required value</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {eligibilityCheck.unmetRules.map((rule, i) => (
//                           <TableRow key={i}>
//                             <TableCell>{rule.attributeCode ?? rule.attributeId}</TableCell>
//                             <TableCell>{rule.operator}</TableCell>
//                             <TableCell className="font-mono text-xs">{formatRuleValue(rule.value)}</TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   )}
//                 </div>
//               )
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function EligibilityCheckPage() {
//   return (
//     <PermissionGate require="template.manage">
//       <EligibilityCheckContent />
//     </PermissionGate>
//   );
// }
'use client';
// src/app/dashboard/access/eligibility-check/page.tsx
//
// Diagnostic tool, distinct from RBAC permissions (GET /auth/me/permissions,
// already surfaced via usePermissions()). This answers a different question:
// given a user's ABAC attributes, which templates can they submit, and for
// one specific template, which rule(s) are they failing.

import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, CheckCircle2, XCircle, User as UserIcon, FileText } from 'lucide-react';
import { useUsers } from '@/lib/hooks/use-users';
import { useTemplates } from '@/lib/hooks/use-template';
import { useEligibleTemplates, useTemplateEligibility } from '@/lib/hooks/use-access';
import { PermissionGate } from '@/components/permission-gate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { UserSummaryView } from '@/types/identity';

const selectClass =
  'flex h-11 w-full rounded-xl border-2 border-[var(--ics-accent)]/20 bg-white/50 px-4 py-2 text-sm text-[var(--ics-text)] shadow-sm backdrop-blur-sm transition-all focus:border-[var(--ics-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ics-primary)]/20';

function formatRuleValue(value: unknown): string {
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return JSON.stringify(value);
  }
  return String(value);
}

function EligibilityCheckContent() {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<UserSummaryView | null>(null);
  const [checkTemplateId, setCheckTemplateId] = useState('');

  const { data: userResults, isLoading: searching } = useUsers(1, 10, searchTerm);
  const { data: eligibleTemplates, isLoading: loadingEligible } = useEligibleTemplates(selectedUser?.id ?? '');
  const { data: templates } = useTemplates();
  const { data: eligibilityCheck, isLoading: checkingOne } = useTemplateEligibility(
    selectedUser?.id ?? '',
    checkTemplateId
  );

  function handleSearch() {
    setSearchTerm(searchInput.trim() || undefined);
  }

  function selectUser(user: UserSummaryView) {
    setSelectedUser(user);
    setCheckTemplateId('');
  }

  return (
    <div className="relative min-h-screen bg-(--ics-background) overflow-hidden">
      {/* Ambient Background matching the landing page */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-(--ics-secondary) opacity-[0.1] blur-[100px]" />
        <div className="absolute top-[40%] right-[-15%] h-[60%] w-[50%] rounded-full bg-(--ics-primary) opacity-[0.08] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl space-y-8 p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-(--ics-primary)">
            Check User Eligibility
          </h1>
          <p className="mt-2 text-base text-(--ics-text)/70 max-w-2xl">
            See which templates a user is eligible to submit, based on ABAC attribute rules.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-12">
          {/* Left Column: User Search */}
          <motion.div
             className="md:col-span-5 space-y-6"
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="overflow-hidden border-2 border-(--ics-accent)/10 bg-white/70 shadow-xl shadow-(--ics-primary)/5 backdrop-blur-md">
              <CardHeader className="border-b border-(--ics-accent)/10 bg-(--ics-primary)/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-(--ics-primary) text-lg">
                  <Search className="h-5 w-5" />
                  Find a user
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="h-11 rounded-xl border-(--ics-accent)/20 bg-white shadow-sm focus-visible:ring-(--ics-primary)"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={searching}
                    className="h-11 rounded-xl bg-(--ics-primary) text-white transition-all hover:bg-(--ics-primary)/90 hover:shadow-md disabled:opacity-50"
                  >
                    Search
                  </Button>
                </div>

                {userResults && userResults.items.length > 0 && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-(--ics-accent)/20 bg-white shadow-sm">
                    <div className="divide-y divide-(--ics-accent)/10">
                      {userResults.items.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => selectUser(u)}
                          className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-(--ics-accent)/5 ${
                            selectedUser?.id === u.id ? 'bg-(--ics-primary)/10 border-l-4 border-(--ics-primary)' : 'border-l-4 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedUser?.id === u.id ? 'bg-(--ics-primary)/20 text-(--ics-primary)' : 'bg-gray-100 text-gray-500'}`}>
                              <UserIcon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm text-(--ics-text)">
                                {u.fullNameAr}{u.fullNameEn && ` (${u.fullNameEn})`}
                              </span>
                              <span className="text-xs text-(--ics-text)/60">{u.email}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column: User Eligibility */}
          <motion.div
             className="md:col-span-7"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {selectedUser ? (
              <Card className="border-2 border-(--ics-accent)/10 bg-white/70 shadow-xl shadow-(--ics-primary)/5 backdrop-blur-md">
                <CardHeader className="border-b border-(--ics-accent)/10 bg-(--ics-primary)/5 pb-4">
                  <p className="text-sm text-(--ics-text)/80">
                    Showing eligibility for <strong className="text-(--ics-primary)">{selectedUser.fullNameAr}</strong> ({selectedUser.email})
                  </p>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  {/* Eligible Templates Section */}
                  <div className="space-y-3">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-(--ics-text)">
                      <CheckCircle2 className="h-5 w-5 text-(--ics-secondary)" />
                      Eligible Templates
                    </h2>
                    {loadingEligible ? (
                      <div className="flex animate-pulse gap-2">
                         <div className="h-8 w-24 rounded-full bg-gray-200" />
                         <div className="h-8 w-32 rounded-full bg-gray-200" />
                      </div>
                    ) : !eligibleTemplates || eligibleTemplates.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                        This user is not eligible for any active template.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {eligibleTemplates.map((t) => (
                          <Badge key={t.id} className="bg-(--ics-secondary)/20 text-(--ics-primary) hover:bg-(--ics-secondary)/30 border-0 px-3 py-1.5 text-sm font-medium">
                            <FileText className="mr-1.5 h-3.5 w-3.5" />
                            {t.title.ar}{t.title.en && ` (${t.title.en})`}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="h-px w-full bg-linear-to-r from-transparent via-(--ics-accent)/20 to-transparent" />

                  {/* Check Specific Template Section */}
                  <div className="space-y-4">
                    <Label htmlFor="checkTemplate" className="text-base font-semibold text-(--ics-text)">
                      Verify Specific Template
                    </Label>
                    <select
                      id="checkTemplate"
                      className={selectClass}
                      value={checkTemplateId}
                      onChange={(e) => setCheckTemplateId(e.target.value)}
                    >
                      <option value="">— Select a template to check —</option>
                      {templates?.map((t) => (
                        <option key={t.id} value={t.id}>{t.nameAr}{t.nameEn && ` (${t.nameEn})`}</option>
                      ))}
                    </select>

                    {checkTemplateId && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-4"
                      >
                        {checkingOne ? (
                          <div className="flex items-center gap-2 text-sm text-(--ics-primary)">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-(--ics-primary) border-t-transparent" />
                            Checking eligibility...
                          </div>
                        ) : eligibilityCheck && (
                          <div className="space-y-4 rounded-xl border border-(--ics-accent)/20 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-(--ics-text)/70">Status</span>
                              <Badge className={`px-3 py-1 text-sm border-0 ${eligibilityCheck.eligible ? 'bg-(--ics-primary) text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                                {eligibilityCheck.eligible ? (
                                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Eligible</span>
                                ) : (
                                  <span className="flex items-center gap-1.5"><XCircle className="h-4 w-4" /> Not Eligible</span>
                                )}
                              </Badge>
                            </div>
                            
                            {!eligibilityCheck.eligible && eligibilityCheck.unmetRules.length > 0 && (
                              <div className="mt-4 overflow-hidden rounded-lg border border-red-100">
                                <Table>
                                  <TableHeader className="bg-red-50/50">
                                    <TableRow className="hover:bg-transparent">
                                      <TableHead className="text-red-900">Attribute</TableHead>
                                      <TableHead className="text-red-900">Operator</TableHead>
                                      <TableHead className="text-red-900">Required value</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {eligibilityCheck.unmetRules.map((rule, i) => (
                                      <TableRow key={i} className="hover:bg-red-50/30">
                                        <TableCell className="font-medium text-red-800">{rule.attributeCode ?? rule.attributeId}</TableCell>
                                        <TableCell className="text-red-600">
                                          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                                            {rule.operator}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <span className="font-mono text-xs text-red-800 bg-red-50/80 rounded px-1.5 py-0.5">
                                            {formatRuleValue(rule.value)}
                                          </span>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex h-full min-h-100 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-(--ics-accent)/20 bg-white/40 p-8 text-center backdrop-blur-sm">
                <div className="mb-4 rounded-full bg-(--ics-primary)/10 p-4">
                  <UserIcon className="h-8 w-8 text-(--ics-primary)" />
                </div>
                <h3 className="text-lg font-semibold text-(--ics-text)">No User Selected</h3>
                <p className="mt-2 text-sm text-(--ics-text)/60 max-w-sm">
                  Search and select a user from the panel to view their template eligibility and ABAC attributes.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function EligibilityCheckPage() {
  return (
    <PermissionGate require="template.manage">
      <EligibilityCheckContent />
    </PermissionGate>
  );
}
