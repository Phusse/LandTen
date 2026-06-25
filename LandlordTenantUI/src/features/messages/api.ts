import { api } from '@/lib/apiClient'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConversationSummary {
  conversationId: string
  propertyId: string | null
  otherUserId: string
  lastMessage: {
    content: string
    createdAt: string
    isRead: boolean
  } | null
}

export interface ConversationsResponse {
  items: ConversationSummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface MessageItem {
  messageId: string
  senderId: string
  content: string
  createdAt: string
  isRead: boolean
  isDeleted: boolean
  editedAt: string | null
  attachmentUrl: string | null
  attachmentType: string | null
  isOptimistic?: boolean
  isFailed?: boolean
}

export interface MessagesResponse {
  items: MessageItem[]
  totalCount: number
  page: number
  pageSize: number
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function startOrGetConversation(
  otherUserId: string,
  propertyId?: string,
): Promise<{ conversationId: string }> {
  const { data } = await api.post<{ conversationId: string }>('/conversations', {
    otherUserId,
    propertyId: propertyId ?? null,
  })
  return data
}

export async function getConversations(
  page = 1,
  pageSize = 50,
): Promise<ConversationsResponse> {
  const { data } = await api.get<ConversationsResponse>('/conversations', {
    params: { page, pageSize },
  })
  return data
}

export async function getMessages(
  conversationId: string,
  page = 1,
  pageSize = 50,
): Promise<MessagesResponse> {
  const { data } = await api.get<MessagesResponse>(
    `/conversations/${conversationId}/messages`,
    { params: { page, pageSize } },
  )
  return data
}

export async function sendMessage(
  conversationId: string,
  content: string,
  attachmentUrl: string | null = null,
  attachmentType: string | null = null,
): Promise<{ messageId: string; createdAt: string }> {
  const { data } = await api.post<{ messageId: string; createdAt: string }>(
    `/conversations/${conversationId}/messages`,
    { content, attachmentUrl, attachmentType },
  )
  return data
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>('/conversations/unread-count')
  return data.count
}

export async function editMessage(conversationId: string, messageId: string, newContent: string): Promise<void> {
  await api.patch(`/conversations/${conversationId}/messages/${messageId}`, { newContent })
}

export async function deleteMessage(conversationId: string, messageId: string): Promise<void> {
  await api.delete(`/conversations/${conversationId}/messages/${messageId}`)
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await api.delete(`/conversations/${conversationId}`)
}

export async function setTypingStatus(conversationId: string): Promise<void> {
  await api.post(`/conversations/${conversationId}/typing`)
}

export async function getTypingStatus(conversationId: string): Promise<boolean> {
  const { data } = await api.get<{ isTyping: boolean }>(`/conversations/${conversationId}/typing`)
  return data.isTyping
}

export async function uploadAttachment(conversationId: string, file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  
  const { data } = await api.post<{ url: string }>(`/conversations/${conversationId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data.url
}


// ─── Public profile helper ────────────────────────────────────────────────────
// Re-export from settings for convenience
export { getPublicLandlordProfile as getPublicProfile } from '@/features/settings/api'
