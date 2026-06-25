import { useState } from 'react'
import { Card, Button, Badge, Input } from '@/components/ui'
import { Search, CheckCircle, XCircle, Home, Loader2, Building2, Eye, FileText } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPropertyVerifications, verifyProperty, rejectProperty, getPropertySignedDocUrl } from './api'
import toast from 'react-hot-toast'

export default function AdminProperties() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Pending')
  const [viewDocument, setViewDocument] = useState<string | null>(null)
  const [loadingDoc, setLoadingDoc] = useState(false)
  const queryClient = useQueryClient()

  const openDocument = (fileUrl: string) => {
    // Route through gateway proxy so browser never directly hits Cloudinary
    setViewDocument(`http://localhost:5000/proxy/document?url=${encodeURIComponent(fileUrl)}`)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['property-verifications', statusFilter],
    queryFn: () => getPropertyVerifications(statusFilter),
  })

  const verifyMutation = useMutation({
    mutationFn: verifyProperty,
    onSuccess: () => {
      toast.success('Property verified')
      queryClient.invalidateQueries({ queryKey: ['property-verifications'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to verify')
  })

  const rejectMutation = useMutation({
    mutationFn: rejectProperty,
    onSuccess: () => {
      toast.success('Property rejected')
      queryClient.invalidateQueries({ queryKey: ['property-verifications'] })
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to reject')
  })

  const items: any[] = Array.isArray(data) ? data : []

  const filtered = items.filter((p: any) =>
    p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto flex flex-col gap-6">

      {viewDocument && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setViewDocument(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            {viewDocument.toLowerCase().endsWith('.pdf') ? (
              <iframe 
                src={viewDocument} 
                className="w-full h-[85vh] bg-white rounded-lg shadow-2xl"
                title="Property Document PDF"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img 
                src={viewDocument} 
                alt="Property Document" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <Button 
              variant="secondary" 
              className="mt-4 bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={() => setViewDocument(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <div>
        <h1 className="font-display text-2xl font-bold text-harbour-text">Property Moderation</h1>
        <p className="text-harbour-text-secondary mt-1">Review new property listings before they go live on the platform.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-harbour-text-tertiary" size={18} />
              <Input
                placeholder="Search by title or address..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-harbour-border rounded-md text-sm bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-harbour-border text-sm font-medium text-harbour-text-secondary">
                <th className="pb-3 pl-2">Property</th>
                <th className="pb-3">Address</th>
                <th className="pb-3">Submitted</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-harbour-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-harbour-text-secondary">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin" size={16} /> Loading properties...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-harbour-text-tertiary">
                      <Building2 size={32} className="opacity-40" />
                      <p className="text-sm">No properties found for this filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item: any) => (
                  <tr key={item.propertyId} className="group hover:bg-harbour-bg-subtle/50 transition-colors">
                    <td className="py-4 pl-2 font-medium text-harbour-text">
                      <div className="flex items-center gap-2">
                        <Home size={16} className="text-harbour-text-tertiary shrink-0" />
                        {item.title || 'Untitled Property'}
                      </div>
                    </td>
                    <td className="py-4 text-sm text-harbour-text-secondary max-w-[200px] truncate">
                      {item.address || '—'}
                    </td>
                    <td className="py-4 text-sm text-harbour-text-secondary">
                      {item.createdAt && item.createdAt !== '0001-01-01T00:00:00Z'
                        ? new Date(item.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="py-4">
                      <Badge
                        label={item.status || 'Pending'}
                        variant={item.status === 'Approved' ? 'success' : item.status === 'Rejected' ? 'neutral' : 'warning'}
                      />
                    </td>
                    <td className="py-4 pr-2 text-right">
                      {(!item.status || item.status === 'Pending') ? (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.documents && item.documents.length > 0 && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => openDocument(item.documents[0].fileUrl)}
                            >
                              <Eye size={16} className="mr-1" /> View Doc
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => verifyMutation.mutate(item.propertyId)}
                            disabled={verifyMutation.isPending || rejectMutation.isPending}
                          >
                            <CheckCircle size={16} className="mr-1" /> Verify
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => rejectMutation.mutate(item.propertyId)}
                            disabled={verifyMutation.isPending || rejectMutation.isPending}
                          >
                            <XCircle size={16} className="mr-1" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {item.documents && item.documents.length > 0 && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openDocument(item.documents[0].fileUrl)}
                            >
                              <Eye size={16} className="mr-1" /> View Doc
                            </Button>
                          )}
                          <span className="text-sm text-harbour-text-tertiary ml-2">Processed</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
