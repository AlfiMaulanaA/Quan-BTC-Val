import { test, expect, describe, beforeAll, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock CompositeChart to avoid lightweight-charts rendering issues in happy-dom
vi.mock('./CompositeChart', () => ({
  CompositeChart: () => <div data-testid="composite-chart-mock">Composite Chart Mock</div>
}));

import { DashboardLayout } from './DashboardLayout';

const mockMetrics = [
  { name: 'aviv_ratio', date: '2026-06-01T00:00:00Z', raw_value: 1.5, normalized_value: 0.5, category: 'fundamental' }
];

const mockComposite = [
  { date: '2026-06-01', composite_score: 0.3, btc_price: 60000.0 }
];

const mockConfigs = [
  { metric_name: 'aviv_ratio', t_minus_2: 2.0, t_minus_1: 1.0, t_zero: null, t_plus_1: -1.0, t_plus_2: -2.0 }
];

const mockOhlc = [
  { date: '2026-06-01T00:00:00Z', open: 59000, high: 61000, low: 58000, close: 60000 }
];

const mockMetricData = [
  { date: '2026-06-01T00:00:00Z', raw_value: 1.5, normalized_value: 0.5, btc_price: 60000.0 }
];

describe('DashboardLayout Component', () => {
  beforeAll(() => {
    // Mock ResizeObserver
    // @ts-ignore
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Mock HTMLCanvasElement.prototype.getContext
    // @ts-ignore
    HTMLCanvasElement.prototype.getContext = (type: string) => {
      if (type === '2d') {
        return {
          clearRect: () => {},
          fillRect: () => {},
          strokeRect: () => {},
          fillText: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          stroke: () => {},
          fill: () => {},
          save: () => {},
          restore: () => {},
          translate: () => {},
          rotate: () => {},
          setLineDash: () => {},
          measureText: () => ({ width: 10 })
        };
      }
      return null;
    };
  });

  test('renders refetch buttons and triggers pipeline correctly', async () => {
    const fetchSpy = vi.fn().mockImplementation((url, _options) => {
      if (url.includes('/api/metrics/configs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockConfigs) });
      }
      if (url.includes('/api/metrics/btc_ohlc')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockOhlc) });
      }
      if (url.includes('/api/metrics/aviv_ratio')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMetricData) });
      }
      if (url.includes('/api/metrics')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMetrics) });
      }
      if (url.includes('/api/composite')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockComposite) });
      }
      if (url.includes('/api/pipeline/run')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, run_all: 'ok', audit: 'ok' })
        });
      }
      return Promise.reject(new Error('Unknown url: ' + url));
    });

    // @ts-ignore
    globalThis.fetch = fetchSpy;

    // Spy/Mock alert and confirm on globalThis and window
    const alertSpy = vi.fn();
    const confirmSpy = vi.fn().mockReturnValue(true);
    // @ts-ignore
    globalThis.alert = alertSpy;
    // @ts-ignore
    globalThis.confirm = confirmSpy;
    // @ts-ignore
    if (globalThis.window) {
      // @ts-ignore
      globalThis.window.alert = alertSpy;
      // @ts-ignore
      globalThis.window.confirm = confirmSpy;
    }

    render(<DashboardLayout />);

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('🔄 REFETCH LATEST')).toBeDefined();
    });

    // Test 1: Click Refetch Latest (delta mode)
    const latestBtn = screen.getByText('🔄 REFETCH LATEST');
    fireEvent.click(latestBtn);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/pipeline/run'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ metric: null, rebuild: false })
        })
      );
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Latest data refetched successfully'));
    });

    // Test 2: Click Full Rebuild and Accept Confirmation
    const rebuildBtn = screen.getByText('⚠️ FULL REBUILD');
    fireEvent.click(rebuildBtn);

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/pipeline/run'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ metric: null, rebuild: true })
        })
      );
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Database full rebuild completed successfully'));
    });

    // Test 3: Click Full Rebuild and Cancel Confirmation
    confirmSpy.mockReturnValueOnce(false);
    fetchSpy.mockClear();
    fireEvent.click(rebuildBtn);
    expect(confirmSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/pipeline/run'),
      expect.any(Object)
    );
  });
});
