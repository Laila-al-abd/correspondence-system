// src/lib/hooks/use-reports.ts
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';
import {
  OverviewReport,
  VolumeBucket,
  PathPerformanceRow,
  StepBottleneckRow,
  ClassificationReport,
} from '@/types/reporting';

export const reportKeys = {
  all: ['reports'] as const,
  overview: (params?: { from?: string; to?: string }) =>
    ['reports', 'overview', params ?? null] as const,
  volume: (params?: { from?: string; to?: string; groupBy?: 'day' | 'week' | 'month' }) =>
    ['reports', 'volume', params ?? null] as const,
  pathPerformance: (params?: { from?: string; to?: string }) =>
    ['reports', 'path-performance', params ?? null] as const,
  stepBottlenecks: (params?: { from?: string; to?: string }) =>
    ['reports', 'step-bottlenecks', params ?? null] as const,
  classification: (params?: { from?: string; to?: string }) =>
    ['reports', 'classification', params ?? null] as const,
};

/**
 * Overview report with aggregate counts and derived ratios.
 * GET /reports/overview
 */
export function useOverviewReport(params?: { from?: string; to?: string; format?: 'json' | 'csv' }) {
  return useQuery({
    queryKey: reportKeys.overview(params),
    queryFn: () => reportsApi.getOverview(params),
  });
}

/**
 * Request volume time series report (array of buckets).
 * GET /reports/volume
 */
export function useVolumeReport(params?: {
  from?: string;
  to?: string;
  groupBy?: 'day' | 'week' | 'month';
  format?: 'json' | 'csv';
}) {
  return useQuery({
    queryKey: reportKeys.volume(params),
    queryFn: () => reportsApi.getVolume(params),
  });
}

/**
 * Path performance report (array of rows).
 * GET /reports/paths
 */
export function usePathPerformanceReport(params?: { from?: string; to?: string; format?: 'json' | 'csv' }) {
  return useQuery({
    queryKey: reportKeys.pathPerformance(params),
    queryFn: () => reportsApi.getPathPerformance(params),
  });
}

/**
 * Step bottlenecks report (array of rows).
 * GET /reports/steps
 */
export function useStepBottlenecksReport(params?: { from?: string; to?: string; format?: 'json' | 'csv' }) {
  return useQuery({
    queryKey: reportKeys.stepBottlenecks(params),
    queryFn: () => reportsApi.getStepBottlenecks(params),
  });
}

/**
 * Classification report with derived ratios.
 * GET /reports/classification
 */
export function useClassificationReport(params?: { from?: string; to?: string; format?: 'json' | 'csv' }) {
  return useQuery({
    queryKey: reportKeys.classification(params),
    queryFn: () => reportsApi.getClassification(params),
  });
}