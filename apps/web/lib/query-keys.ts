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
  models: (brandId: string | undefined) => ['models', brandId] as const,
  generations: (modelId: string | undefined) => ['generations', modelId] as const,
  engineOptions: (generationId: string | undefined) => ['engine-options', generationId] as const,

  myGarageBase: ['my-garage'] as const,
};
