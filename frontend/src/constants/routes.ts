/**
 * src/constants/routes.ts
 * Navigation route key constants — prevents typo bugs in menu routing.
 */
export const ROUTES = {
  DASHBOARD:        'dashboard',
  PRODUKSI:         'produksi',
  BAHAN_BAKU:       'bahan-baku',
  MENU_PLANNING:    'menu-planning',
  LOGISTIK:         'logistik',
  TRACKING:         'tracking',
  KEUANGAN:         'keuangan',
  KARYAWAN:         'karyawan',
  VENDORS:          'vendors',
  VENDORS_APPROVAL: 'vendors-approval',
  AI_HISTORY:       'ai-history',
} as const;

export type RouteKey = typeof ROUTES[keyof typeof ROUTES];

/** Routes accessible to non-premium ('user') accounts */
export const USER_ALLOWED_ROUTES: RouteKey[] = [
  ROUTES.KARYAWAN,
  ROUTES.KEUANGAN,
  ROUTES.AI_HISTORY,
];
