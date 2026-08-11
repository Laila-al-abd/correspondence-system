import apiClient from '@/lib/api/axios-client';

/**
 * Downloads a report as CSV directly via apiClient (so the auth interceptor
 * still applies), bypassing the typed useXReport() hooks entirely. When
 * format=csv, ReportsController.respond() returns a raw CSV string (see
 * csv.util.ts's toCsv()) -- not the JSON shape those hooks are typed for.
 * Routing a csv request through TanStack Query would hand the page a string
 * while the hook's return type still claims OverviewReport/etc.
 */
export async function downloadReportCsv(
  path: string,
  params: Record<string, string | undefined>,
  filename: string,
): Promise<void> {
  const response = await apiClient.get<string>(path, {
    params: { ...params, format: 'csv' },
    responseType: 'text',
  });
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}