import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { clsx } from 'clsx'
import { ArrowLeft, Send, Trash2, Paperclip, Pencil, Check, CheckCheck, Loader2, X, AlertCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient, useQueries, useInfiniteQuery } from '@tanstack/react-query'
import { Avatar, Button } from '@/components/ui'
import { useAuth } from '@/features/auth/AuthContext'
import { queryKeys } from '@/lib/queryKeys'
import {
  getConversations,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  deleteConversation,
  setTypingStatus,
  getTypingStatus,
  uploadAttachment,
  type ConversationSummary,
} from './api'
import { api } from '@/lib/apiClient'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName || '?')[0]}${(lastName || '')[0] || ''}`.toUpperCase()
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Messages() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get('conversationId'),
  )
  const [searchQuery, setSearchQuery] = useState('')

  // Clear the param from URL after reading it
  useEffect(() => {
    if (searchParams.has('conversationId')) {
      setSelectedId(searchParams.get('conversationId'))
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // Invalidate conversation list when opening a new conversation to clear the unread dot
  const queryClient = useQueryClient()
  useEffect(() => {
    if (selectedId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      })
    }
  }, [selectedId, queryClient])

  // ── Conversation list ────────────────────────────────────────────────────────
  const { data: convData, isLoading: convsLoading } = useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: () => getConversations(),
    staleTime: 0,                       // always stale → refetch on tab focus
    refetchInterval: 5_000,
    refetchIntervalInBackground: true,
  })
  const conversations = convData?.items ?? []

  // ── Resolve user profiles for all otherUserIds ──────────────────────────────
  const otherUserIds = [...new Set(conversations.map((c) => c.otherUserId))]
  const profileQueries = useQueries({
    queries: otherUserIds.map((uid) => ({
      queryKey: queryKeys.publicProfile(uid),
      queryFn: () =>
        api
          .get<{ firstName: string; lastName: string; avatarUrl: string | null }>(
            `/users/${uid}/public-profile`,
          )
          .then((r) => r.data),
      staleTime: 10 * 60 * 1000,
      retry: 1,
      enabled: !!uid,
    })),
  })
  const profileMap = new Map<
    string,
    { firstName: string; lastName: string; avatarUrl: string | null }
  >()
  otherUserIds.forEach((uid, i) => {
    const d = profileQueries[i]?.data
    if (d) profileMap.set(uid, d)
  })

  // ── Select conversation ──────────────────────────────────────────────────────
  const selectedConv = conversations.find((c) => c.conversationId === selectedId)

  // ── Filter conversations ─────────────────────────────────────────────────────
  const filteredConversations = conversations.filter(c => {
    if (!searchQuery) return true
    const profile = profileMap.get(c.otherUserId)
    const name = profile ? `${profile.firstName} ${profile.lastName}`.toLowerCase() : ''
    return name.includes(searchQuery.toLowerCase())
  })

  return (
    <div className="-mx-4 -mt-5 -mb-24 flex h-[calc(100svh-96px)] lg:-mx-10 lg:-mt-8 lg:-mb-8 lg:h-[100svh] overflow-hidden">
      {/* ── Left panel: conversation list ────────────────────────────────── */}
      <div
        className={clsx(
          'flex flex-col border-r border-harbour-border bg-harbour-surface',
          selectedId ? 'hidden lg:flex' : 'flex w-full',
          'lg:flex lg:w-[300px] lg:shrink-0',
        )}
      >
        <div className="shrink-0 border-b border-harbour-border px-5 py-4 space-y-3">
          <h1 className="font-display text-xl font-semibold text-harbour-text">
            Messages
          </h1>
          <input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-harbour-border bg-harbour-bg px-3 py-1.5 text-sm text-harbour-text placeholder:text-harbour-text-tertiary focus:border-harbour-accent focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-harbour-border">
          {convsLoading ? (
            <div className="flex items-center justify-center p-8">
              <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-harbour-border border-t-harbour-accent" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <p className="text-sm text-harbour-text-secondary leading-relaxed">
                No messages yet. Start a conversation from a property you
                have applied to or an application you have received.
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const profile = profileMap.get(conv.otherUserId)
              const name = profile
                ? `${profile.firstName} ${profile.lastName}`.trim() || 'Unknown user'
                : 'Unknown user'
              const initials = profile
                ? getInitials(profile.firstName, profile.lastName)
                : '?'
              const isUnread =
                conv.lastMessage &&
                !conv.lastMessage.isRead &&
                conv.otherUserId !== user?.id
              const isSelected = conv.conversationId === selectedId

              return (
                <button
                  key={conv.conversationId}
                  type="button"
                  onClick={() => setSelectedId(conv.conversationId)}
                  className={clsx(
                    'flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors',
                    isSelected
                      ? 'bg-harbour-accent/8'
                      : 'hover:bg-harbour-bg',
                  )}
                >
                  <Avatar
                    initials={initials}
                    src={profile?.avatarUrl || undefined}
                    size="md"
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={clsx(
                          'truncate text-sm',
                          isUnread
                            ? 'font-semibold text-harbour-text'
                            : 'font-medium text-harbour-text',
                        )}
                      >
                        {name}
                      </p>
                      {conv.lastMessage && (
                        <span className="shrink-0 text-[11px] text-harbour-text-tertiary">
                          {relativeTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="mt-0.5 truncate text-xs text-harbour-text-secondary">
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {isUnread && (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-harbour-accent" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Right panel: thread ──────────────────────────────────────────── */}
      <div
        className={clsx(
          'flex flex-1 flex-col bg-harbour-bg',
          selectedId ? 'flex w-full' : 'hidden',
          'lg:flex',
        )}
      >
        {selectedId && selectedConv ? (
          <ThreadPanel
            conversationId={selectedId}
            conv={selectedConv}
            currentUserId={user?.id ?? ''}
            profileMap={profileMap}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-harbour-surface text-harbour-text-tertiary">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-harbour-text">Your Messages</h3>
              <p className="mt-1 max-w-sm text-sm text-harbour-text-secondary">
                Select an existing conversation from the list to view the thread, or start a new one from a property listing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Thread Panel ─────────────────────────────────────────────────────────────

function ThreadPanel({
  conversationId,
  conv,
  currentUserId,
  profileMap,
  onBack,
}: {
  conversationId: string
  conv: ConversationSummary
  currentUserId: string
  profileMap: Map<string, { firstName: string; lastName: string; avatarUrl: string | null }>
  onBack: () => void
}) {
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [draft, setDraft] = useState('')
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)

  const profile = profileMap.get(conv.otherUserId)
  const otherName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : 'User'
  const otherInitials = getInitials(profile?.firstName, profile?.lastName)

  // ── Fetch property title if applicable ─────────────────────────────────────
  const { data: propertyData } = useQuery({
    queryKey: queryKeys.properties.detail(conv.propertyId ?? ''),
    queryFn: () =>
      api
        .get<{ title: string }>(`/properties/${conv.propertyId}`)
        .then((r) => r.data),
    enabled: !!conv.propertyId,
    staleTime: 10 * 60 * 1000,
  })

  // ── Infinite Messages ──────────────────────────────────────────────────────
  const {
    data: msgData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.conversations.messages(conversationId, 'all'),
    queryFn: ({ pageParam = 1 }) => getMessages(conversationId, pageParam as number),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.totalCount ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    refetchInterval: 3_000,
  })

  const messages = [...(msgData?.pages || [])].reverse().flatMap((p) => p.items)

  // Typing Status polling
  const { data: isOtherUserTyping } = useQuery({
    queryKey: queryKeys.conversations.typing(conversationId),
    queryFn: () => getTypingStatus(conversationId),
    refetchInterval: 2_000,
  })

  // Track if user is scrolled to bottom
  const [wasNearBottom, setWasNearBottom] = useState(true)

  const checkIfAtBottom = useCallback(() => {
    const el = scrollAreaRef.current
    if (!el) return
    setWasNearBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 100)
    
    // Auto-fetch next page if scrolled to top
    if (el.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Scroll to bottom on initial load + new messages if already at bottom
  const prevCountRef = useRef(0)
  useEffect(() => {
    if (messages.length > 0 && messages.length !== prevCountRef.current) {
      if (prevCountRef.current === 0 || wasNearBottom) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }, 100)
      }
      prevCountRef.current = messages.length
    }
  }, [messages.length, wasNearBottom])

  // Also invalidate unread count when messages load
  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.conversations.unreadCount,
    })
  }, [messages.length, queryClient])

  // ── Send mutation ──────────────────────────────────────────────────────────
  const { mutate: doSend, isPending: isSending } = useMutation({
    mutationFn: async (payload: { content: string, file: File | null, tempId?: string }) => {
      let attachmentUrl = null
      let attachmentType = null
      if (payload.file) {
        attachmentUrl = await uploadAttachment(conversationId, payload.file)
        attachmentType = payload.file.type.startsWith('image/') ? 'image' : 'file'
      }
      return sendMessage(conversationId, payload.content, attachmentUrl, attachmentType)
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.conversations.messages(conversationId, 'all') })
      const previousMessages = queryClient.getQueryData(queryKeys.conversations.messages(conversationId, 'all'))
      
      if (payload.tempId) {
        const optimisticMsg = {
          messageId: payload.tempId,
          senderId: currentUserId,
          content: payload.content,
          createdAt: new Date().toISOString(),
          isRead: false,
          isDeleted: false,
          editedAt: null,
          attachmentUrl: payload.file ? URL.createObjectURL(payload.file) : null,
          attachmentType: payload.file ? 'image' : null,
          isOptimistic: true,
          isFailed: false
        }
        queryClient.setQueryData(queryKeys.conversations.messages(conversationId, 'all'), (old: any) => {
          if (!old) return old
          const newPages = [...old.pages]
          if (newPages.length > 0) {
            newPages[0] = { ...newPages[0], items: [optimisticMsg, ...newPages[0].items] }
          }
          return { ...old, pages: newPages }
        })
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100)
      }
      return { previousMessages }
    },
    onError: (err: any, payload, _context) => {
      if (payload.tempId) {
        queryClient.setQueryData(queryKeys.conversations.messages(conversationId, 'all'), (old: any) => {
          if (!old) return old
          const newPages = old.pages.map((p: any) => ({
            ...p,
            items: p.items.map((m: any) => m.messageId === payload.tempId ? { ...m, isOptimistic: false, isFailed: true } : m)
          }))
          return { ...old, pages: newPages }
        })
      }
      if (err.response?.status === 429) {
        setAttachmentError("You're sending messages too quickly. Please wait a moment.")
        setTimeout(() => setAttachmentError(null), 3000)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.messages(conversationId, 'all') })
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() })
    },
  })

  function retrySend(failedMsg: any) {
    if (isSending) return
    // Optimistically revert failed state first
    queryClient.setQueryData(queryKeys.conversations.messages(conversationId, 'all'), (old: any) => {
      if (!old) return old
      const newPages = old.pages.map((p: any) => ({
        ...p,
        items: p.items.map((m: any) => m.messageId === failedMsg.messageId ? { ...m, isOptimistic: true, isFailed: false } : m)
      }))
      return { ...old, pages: newPages }
    })
    doSend({ content: failedMsg.content, file: null, tempId: failedMsg.messageId })
  }

  // ── Edit mutation ──────────────────────────────────────────────────────────
  const { mutate: doEdit } = useMutation({
    mutationFn: (newContent: string) => editMessage(conversationId, editingMsgId!, newContent),
    onSuccess: () => {
      setDraft('')
      setEditingMsgId(null)
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.messages(conversationId, 'all') })
    }
  })

  // ── Delete message mutation ────────────────────────────────────────────────
  const { mutate: doDeleteMessage } = useMutation({
    mutationFn: (msgId: string) => deleteMessage(conversationId, msgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.messages(conversationId, 'all') })
    }
  })

  // ── Delete conversation mutation ───────────────────────────────────────────
  const { mutate: doDeleteConv } = useMutation({
    mutationFn: () => deleteConversation(conversationId),
    onSuccess: () => {
      onBack()
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list() })
    }
  })

  function handleSend() {
    const trimmed = draft.trim()
    if ((!trimmed && !attachmentFile) || isSending || trimmed.length > 2000) return

    if (editingMsgId) {
      doEdit(trimmed)
    } else {
      const tempId = `temp-${Date.now()}`
      doSend({ content: trimmed, file: attachmentFile, tempId })
      setDraft('')
      setAttachmentFile(null)
      setAttachmentPreview(null)
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-grow textarea and typing indicator
  const lastTypingTime = useRef<number>(0)
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 80)}px`

    // Throttle typing indicator
    const now = Date.now()
    if (now - lastTypingTime.current > 2000) {
      setTypingStatus(conversationId)
      lastTypingTime.current = now
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      setAttachmentError('Images must be under 5MB')
      setTimeout(() => setAttachmentError(null), 3000)
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setAttachmentError('Only JPG, PNG, WEBP, and GIF images are supported')
      setTimeout(() => setAttachmentError(null), 3000)
      return
    }

    setAttachmentFile(file)
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setAttachmentPreview(url)
    } else {
      setAttachmentPreview(null)
    }
  }

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-harbour-border bg-harbour-surface px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="lg:hidden shrink-0 rounded-md p-1.5 text-harbour-text-secondary hover:bg-harbour-bg transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={18} />
          </button>
          <Avatar
            initials={otherInitials}
            src={profile?.avatarUrl || undefined}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-harbour-text">
              {otherName}
            </p>
            {conv.propertyId && propertyData && (
              <p className="truncate text-xs text-harbour-text-tertiary">
                Re: {propertyData.title}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => { if (window.confirm('Delete conversation forever?')) doDeleteConv() }}
          className="p-2 text-harbour-text-tertiary hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
          title="Delete Conversation"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* ── Messages list ──────────────────────────────────────────────── */}
      <div
        ref={scrollAreaRef}
        onScroll={checkIfAtBottom}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pt-4 pb-2"
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <Loader2 className="animate-spin text-harbour-text-tertiary" size={16} />
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-harbour-text-tertiary">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isDeleted) {
              return (
                <div key={msg.messageId} className={clsx('flex flex-col', msg.senderId === currentUserId ? 'items-end' : 'items-start')}>
                  <div className="max-w-[70%] rounded-xl px-3.5 py-2 text-sm italic text-harbour-text-tertiary border border-harbour-border bg-harbour-surface">
                    This message was deleted.
                  </div>
                </div>
              )
            }

            const isOwn = msg.senderId === currentUserId
            return (
              <div
                key={msg.messageId}
                className={clsx(
                  'group flex flex-col',
                  isOwn ? 'items-end' : 'items-start',
                )}
              >
                <div className="flex items-end gap-2">
                  {!isOwn && (
                    <Avatar
                      initials={otherInitials}
                      size="sm"
                      className="mb-[22px] shrink-0"
                    />
                  )}
                  {isOwn && !msg.isOptimistic && !msg.isFailed && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button onClick={() => {
                        setEditingMsgId(msg.messageId)
                        setDraft(msg.content)
                        if (textareaRef.current) textareaRef.current.focus()
                      }} className="p-1 text-harbour-text-tertiary hover:text-harbour-accent">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => {
                        if (window.confirm('Delete message?')) doDeleteMessage(msg.messageId)
                      }} className="p-1 text-harbour-text-tertiary hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  <div
                    className={clsx(
                      'max-w-[70%] rounded-xl text-sm leading-relaxed overflow-hidden transition-all',
                      isOwn
                        ? 'bg-harbour-accent text-white rounded-br-sm'
                        : 'bg-harbour-surface border border-harbour-border text-harbour-text rounded-bl-sm',
                      msg.isOptimistic && 'opacity-70',
                      msg.isFailed && 'bg-red-500/90'
                    )}
                  >
                    {msg.attachmentUrl && msg.attachmentType === 'image' && (
                      <img src={msg.attachmentUrl} alt="attachment" className="w-full max-w-xs object-cover" />
                    )}
                    {msg.content && (
                      <div className="px-3.5 py-2.5">
                        {msg.content}
                        {msg.editedAt && <span className="text-[10px] opacity-70 ml-2">(edited)</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className={clsx("flex items-center gap-1 mt-1", isOwn ? "justify-end pr-1" : "pl-[44px]")}>
                  {msg.isFailed ? (
                    <button onClick={() => retrySend(msg)} className="text-[10px] text-red-500 hover:underline flex items-center gap-1">
                      <AlertCircle size={10} /> Failed to send &middot; Tap to retry
                    </button>
                  ) : (
                    <>
                      <span className="text-[10px] text-harbour-text-tertiary">
                        {relativeTime(msg.createdAt)}
                      </span>
                      {isOwn && (
                        msg.isOptimistic ? <Loader2 size={10} className="animate-spin text-harbour-text-tertiary" /> :
                        msg.isRead ? <CheckCheck size={12} className="text-harbour-accent" /> : <Check size={12} className="text-harbour-text-tertiary" />
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
        
        {isOtherUserTyping && (
          <div className="flex items-end gap-2">
            <Avatar
              initials={otherInitials}
              size="sm"
              className="shrink-0"
            />
            <div className="bg-harbour-surface border border-harbour-border rounded-xl rounded-bl-sm px-3 py-2 mb-[22px]">
              <div className="flex space-x-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-harbour-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-harbour-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-harbour-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4 shrink-0" />
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-harbour-border bg-harbour-surface p-3 flex flex-col gap-2 relative">
        {attachmentError && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-full border border-red-200 shadow-sm flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle size={14} />
            {attachmentError}
          </div>
        )}

        {editingMsgId && (
          <div className="flex items-center justify-between bg-harbour-accent/10 text-harbour-accent text-xs px-3 py-1.5 rounded-md">
            <span>Editing message</span>
            <button onClick={() => { setEditingMsgId(null); setDraft(''); }} className="hover:opacity-70">
              <X size={14} />
            </button>
          </div>
        )}
        
        {attachmentFile && (
          <div className="flex items-center gap-3 bg-harbour-bg border border-harbour-border p-2 rounded-md w-fit">
            {attachmentPreview ? (
              <img src={attachmentPreview} alt="preview" className="h-10 w-10 object-cover rounded" />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center bg-harbour-surface rounded border border-harbour-border">
                <Paperclip size={16} className="text-harbour-text-secondary" />
              </div>
            )}
            <div className="text-xs text-harbour-text max-w-[150px] truncate">
              {attachmentFile.name}
            </div>
            <button onClick={() => { setAttachmentFile(null); setAttachmentPreview(null); }} className="text-harbour-text-tertiary hover:text-red-500">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {!editingMsgId && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-harbour-text-secondary hover:text-harbour-accent transition-colors"
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>
            </>
          )}

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={draft}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={editingMsgId ? "Edit your message..." : "Type a message…"}
              className="w-full resize-none rounded-lg border border-harbour-border bg-harbour-bg px-3 py-2 text-sm text-harbour-text placeholder:text-harbour-text-tertiary focus:border-harbour-accent focus:outline-none focus:ring-1 focus:ring-harbour-accent/30 pr-12"
              style={{ maxHeight: 80 }}
            />
          </div>

          <div className="flex flex-col items-end shrink-0 gap-1">
            {draft.trim().length >= 1600 && (
              <span className={clsx("text-[10px] px-1 font-medium", draft.trim().length > 1900 ? "text-harbour-warning" : "text-harbour-text-tertiary")}>
                {draft.trim().length}/2000
              </span>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={editingMsgId ? <Check size={14} /> : <Send size={14} />}
              onClick={handleSend}
              isLoading={isSending && !editingMsgId}
              disabled={(!draft.trim() && !attachmentFile) || draft.trim().length > 2000}
            >
              {editingMsgId ? "Save" : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
