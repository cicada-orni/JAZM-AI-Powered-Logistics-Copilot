export const ROUTES = {
  home: { label: 'JAZM', path: '/' },
  dashboard: { label: 'Dashboard', path: '/' },
  analytics: { label: 'Analytics', path: '/analytics' },
  products: { label: 'Products', path: '/products' },
  customers: { label: 'Customers', path: '/customers' },
  notifications: { label: 'Notifications', path: '/notifications' },
  settings: { label: 'Settings', path: '/settings' },
} as const

export type RouteKey = keyof typeof ROUTES
