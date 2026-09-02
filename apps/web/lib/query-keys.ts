/**
 * Central query key registry (rule: CODING_STANDARDS.md §4).
 * Add new domains here — never write a query key array inline in useQuery.
 */
export const queryKeys = {
  me: ['me'] as const,
  /* base keys — used as a param-less prefix with invalidateQueries (cancels all pages/filters at once) */
  adminUsersBase: ['admin-users'] as const,
  adminUsers: (query: Record<string, unknown> = {}) => [...queryKeys.adminUsersBase, query] as const,

  brands: ['brands'] as const,
  modelsBase: ['models'] as const,
  models: (brandId: string | undefined) => [...queryKeys.modelsBase, brandId] as const,
  generationsBase: ['generations'] as const,
  generations: (modelId: string | undefined) => [...queryKeys.generationsBase, modelId] as const,
  engineOptionsBase: ['engine-options'] as const,
  engineOptions: (generationId: string | undefined) => [...queryKeys.engineOptionsBase, generationId] as const,

  myGarageBase: ['my-garage'] as const,

  serviceCatalog: ['service-catalog'] as const,
  serviceProvidersBase: ['service-providers'] as const,
  serviceProviders: (query: Record<string, unknown> = {}) => [...queryKeys.serviceProvidersBase, query] as const,
  serviceProvider: (id: string) => [...queryKeys.serviceProvidersBase, id] as const,
  adminServiceProvidersBase: ['admin-service-providers'] as const,
  adminServiceProviders: (query: Record<string, unknown> = {}) => [...queryKeys.adminServiceProvidersBase, query] as const,
  myServiceBase: ['my-service'] as const,

  myOrdersBase: ['my-orders'] as const,
  myOrders: (query: Record<string, unknown> = {}) => [...queryKeys.myOrdersBase, query] as const,
  serviceOrdersBase: ['service-orders'] as const,
  serviceOrders: (query: Record<string, unknown> = {}) => [...queryKeys.serviceOrdersBase, query] as const,
  reviews: (serviceProviderId: string, page: number) => ['reviews', serviceProviderId, page] as const,
  notificationsBase: ['notifications'] as const,
  notifications: (query: Record<string, unknown> = {}) => [...queryKeys.notificationsBase, query] as const,
  notificationsUnreadCount: ['notifications-unread-count'] as const,

  aiAssistantMessages: ['ai-assistant-messages'] as const,

  adminStats: ['admin-stats'] as const,
  adminOrdersBase: ['admin-orders'] as const,
  adminOrders: (query: Record<string, unknown> = {}) => [...queryKeys.adminOrdersBase, query] as const,
  adminReviewsBase: ['admin-reviews'] as const,
  adminReviews: (query: Record<string, unknown> = {}) => [...queryKeys.adminReviewsBase, query] as const,
  adminAuditLogBase: ['admin-audit-log'] as const,
  adminAuditLog: (query: Record<string, unknown> = {}) => [...queryKeys.adminAuditLogBase, query] as const,

  tunersBase: ['tuners'] as const,
  tuners: (query: Record<string, unknown> = {}) => [...queryKeys.tunersBase, query] as const,
  tuner: (id: string) => [...queryKeys.tunersBase, id] as const,
  adminTunersBase: ['admin-tuners'] as const,
  adminTuners: (query: Record<string, unknown> = {}) => [...queryKeys.adminTunersBase, query] as const,
  myTunerBase: ['my-tuner'] as const,
  myTuningOrdersBase: ['my-tuning-orders'] as const,
  myTuningOrders: (query: Record<string, unknown> = {}) => [...queryKeys.myTuningOrdersBase, query] as const,
  tunerOrdersBase: ['tuner-orders'] as const,
  tunerOrders: (query: Record<string, unknown> = {}) => [...queryKeys.tunerOrdersBase, query] as const,

  subscriptionPlans: ['subscription-plans'] as const,
  mySubscription: ['my-subscription'] as const,
  myPayments: ['my-payments'] as const,
  adminPaymentsBase: ['admin-payments'] as const,
  adminPayments: (query: Record<string, unknown> = {}) => [...queryKeys.adminPaymentsBase, query] as const,

  vehicleHealthScore: (vehicleId: string) => ['vehicle-health-score', vehicleId] as const,
  reportAnalysesBase: ['report-analyses'] as const,
};
