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
};
