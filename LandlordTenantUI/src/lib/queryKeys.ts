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
}
