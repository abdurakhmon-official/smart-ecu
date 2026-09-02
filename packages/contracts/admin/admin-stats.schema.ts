// interfaces (no input to validate — this is a read-only aggregate endpoint)

export interface AdminStatsOutput {
  users: {
    total: number;
    customers: number;
    services: number;
    tuners: number;
    admins: number;
  };
  serviceProviders: {
    total: number;
    pending: number;
    verified: number;
    suspended: number;
  };
  orders: {
    total: number;
    new: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  vehicles: number;
  reviews: {
    total: number;
    avgRating: number;
  };
  aiConversations: number;
}
