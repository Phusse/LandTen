import { useState } from 'react'
import { Card, Button, Badge, Avatar, Input } from '@/components/ui'
import { Search, CheckCircle, XCircle, FileText, Loader2, Eye } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getKycVerifications, approveKyc, rejectKyc, getKycSignedDocUrl } from './api'
import toast from 'react-hot-toast'

export default function AdminVerifications() {
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
    queryKey: ['kyc-verifications', statusFilter],
    queryFn: () => getKycVerifications(statusFilter),
  })

  const approveMutation = useMutation({
    mutationFn: approveKyc,
    onSuccess: () => {
      toast.success('KYC Approved')
      queryClient.invalidateQueries({ queryKey: ['kyc-verifications'] })
    }
  })

  const rejectMutation = useMutation({
    mutationFn: rejectKyc,
    onSuccess: () => {
      toast.success('KYC Rejected')
      queryClient.invalidateQueries({ queryKey: ['kyc-verifications'] })
    }
  })

  const filtered = (data || []).filter((k: any) => 
    k.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
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
                title="KYC Document PDF"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img 
                src={viewDocument} 
                alt="KYC Document" 
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
        <h1 className="font-display text-2xl font-bold text-harbour-text">KYC Verifications</h1>
        <p className="text-harbour-text-secondary mt-1">Review and moderate identity verification submissions.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-harbour-text-tertiary" size={18} />
              <Input 
                placeholder="Search by name..." 
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
                <th className="pb-3 pl-2">User</th>
                <th className="pb-3">Type</th>
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
                      <Loader2 className="animate-spin" size={16} /> Loading verifications...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-harbour-text-secondary">
                    No verifications found.
                  </td>
                </tr>
              ) : (
                filtered.map((kyc: any) => (
                  <tr key={kyc.id} className="group hover:bg-harbour-bg-subtle/50 transition-colors">
                    <td className="py-4 pl-2 flex items-center gap-3">
                      <Avatar initials={(kyc.userEmail || 'U').slice(0, 2).toUpperCase()} size="sm" />
                      <span className="font-medium text-harbour-text">{kyc.userEmail || 'Unknown'}</span>
                    </td>
                    <td className="py-4 text-sm text-harbour-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <FileText size={16} /> {kyc.documentType || 'KYC Document'}
                      </div>
                    </td>
                    <td className="py-4 text-sm text-harbour-text-secondary">{new Date(kyc.createdAt).toLocaleDateString()}</td>
                    <td className="py-4">
                      <Badge 
                        label={kyc.status || statusFilter || 'Unknown'} 
                        variant={
                          (kyc.status || statusFilter) === 'Approved' ? 'success' : 
                          (kyc.status || statusFilter) === 'Rejected' ? 'neutral' : 
                          'warning'
                        } 
                      />
                    </td>
                    <td className="py-4 pr-2 text-right">
                      {(!kyc.status || kyc.status === 'Pending') ? (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {kyc.fileUrl && (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => openDocument(kyc.fileUrl)}
                            >
                              <Eye size={16} className="mr-1" /> View
                            </Button>
                          )}
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => approveMutation.mutate(kyc.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            <CheckCircle size={16} className="mr-1" /> Approve
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => rejectMutation.mutate(kyc.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            <XCircle size={16} className="mr-1" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                           {kyc.fileUrl && (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => openDocument(kyc.fileUrl)}
                            >
                              <Eye size={16} className="mr-1" /> View
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
