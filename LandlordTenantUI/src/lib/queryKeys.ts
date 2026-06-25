// Centralised React Query key factory.
// Always import from here — never inline string arrays in useQuery calls.
export const queryKeys = {
  properties: {
    all: ['properties'] as const,
    list: (page: number) => ['properties', 'list', page] as const,
    detail: (id: string) => ['properties', 'detail', id] as const,
  },
  applications: {
    all: ['applications'] as const,
    list: () => ['applications', 'list'] as const,
  },
  conversations: {
    all: ['conversations'] as const,
    list: () => ['conversations', 'list'] as const,
    messages: (conversationId: string, page: number | 'all' = 1) =>
      ['conversations', 'messages', conversationId, page] as const,
    typing: (conversationId: string) => ['conversations', 'typing', conversationId] as const,
    unreadCount: ['conversations', 'unread-count'] as const,
  },
  publicProfile: (userId: string) => ['public-profile', userId] as const,
}
