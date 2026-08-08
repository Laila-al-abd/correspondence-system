import apiClient from './axios-client';
import {
  OverviewReport,
  VolumeBucket,
  PathPerformanceRow,
  StepBottleneckRow,
  ClassificationReport,
} from '@/types/reporting';
/**
 * All methods here reject with `ApiError` (src/types/shared.ts) on failure —
 * axios-client's response interceptor normalizes it before it gets here.
 * Callers should catch ApiError and branch on `.code`, not `.message`.
 */
export const reportsApi = {
  /**
   * Get overview report with aggregate counts and derived ratios.
   * GET /reports/overview
   */
  getOverview: async (params?: { from?: string; to?: string; format?: 'json' | 'csv' }): Promise<OverviewReport> => {
    const { data } = await apiClient.get<OverviewReport>('/reports/overview', {
      params: {
        from: params?.from ?? undefined,
        to: params?.to ?? undefined,
        format: params?.format ?? undefined,
      },
    });
    return data;
  },

  /**
   * Get request volume time series report.
   * GET /reports/volume
   * Returns raw array of VolumeBucket (not wrapped).
   */
  getVolume: async (params?: {
    from?: string;
    to?: string;
    groupBy?: 'day' | 'week' | 'month';
    format?: 'json' | 'csv';
  }): Promise<VolumeBucket[]> => {
    const { data } = await apiClient.get<VolumeBucket[]>('/reports/volume', {
      params: {
        from: params?.from ?? undefined,
        to: params?.to ?? undefined,
        groupBy: params?.groupBy ?? undefined,
        format: params?.format ?? undefined,
      },
    });
    return data;
  },

  /**
   * Get path performance report.
   * GET /reports/paths
   * Returns raw array of PathPerformanceRow (not wrapped).
   */
  getPathPerformance: async (params?: {
    from?: string;
    to?: string;
    format?: 'json' | 'csv';
  }): Promise<PathPerformanceRow[]> => {
    const { data } = await apiClient.get<PathPerformanceRow[]>('/reports/paths', {
      params: {
        from: params?.from ?? undefined,
        to: params?.to ?? undefined,
        format: params?.format ?? undefined,
      },
    });
    return data;
  },

  /**
   * Get step bottlenecks report.
   * GET /reports/steps
   * Returns raw array of StepBottleneckRow (not wrapped).
   */
  getStepBottlenecks: async (params?: {
    from?: string;
    to?: string;
    format?: 'json' | 'csv';
  }): Promise<StepBottleneckRow[]> => {
    const { data } = await apiClient.get<StepBottleneckRow[]>('/reports/steps', {
      params: {
        from: params?.from ?? undefined,
        to: params?.to ?? undefined,
        format: params?.format ?? undefined,
      },
    });
    return data;
  },

  /**
   * Get classification report with derived ratios.
   * GET /reports/classification
   */
  getClassification: async (params?: { from?: string; to?: string; format?: 'json' | 'csv' }): Promise<ClassificationReport> => {
    const { data } = await apiClient.get<ClassificationReport>('/reports/classification', {
      params: {
        from: params?.from ?? undefined,
        to: params?.to ?? undefined,
        format: params?.format ?? undefined,
      },
    });
    return data;
  },
};