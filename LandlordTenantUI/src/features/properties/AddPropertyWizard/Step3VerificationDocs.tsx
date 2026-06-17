import { useRef, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'

interface Step3Props {
  documents: File[]
  setDocuments: React.Dispatch<React.SetStateAction<File[]>>
}

export function Step3VerificationDocs({ documents, setDocuments }: Step3Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const valid = Array.from(incoming).filter((f) =>
      f.type.startsWith('image/') || f.type === 'application/pdf',
    )
    setDocuments((prev) => [...prev, ...valid])
  }

  function removeFile(index: number) {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-medium text-harbour-text mb-2">Proof of Ownership</h2>
        <p className="text-sm text-harbour-text-secondary mb-4">
          To list your property and build trust with tenants, we need a document verifying your ownership or right to lease. This can be a title deed, recent utility bill, or official property tax document.
        </p>

        {/* Drop area */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            addFiles(e.dataTransfer.files)
          }}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-7 text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbour-accent ${
            isDragging
              ? 'border-harbour-accent bg-harbour-accent/5'
              : 'border-harbour-border hover:border-harbour-accent/50 hover:bg-harbour-bg'
          }`}
        >
          <Upload size={28} className="text-harbour-text-tertiary" />
          <p className="text-sm font-medium text-harbour-text">
            Drag documents here or click to upload
          </p>
          <p className="text-xs text-harbour-text-tertiary">
            PDF, JPG, or PNG up to 10MB
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        {/* Document List */}
        {documents.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {documents.map((file, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-harbour-border bg-harbour-bg p-3">
                <div className="flex items-center gap-3">
                  <FileText className="text-harbour-accent" size={20} />
                  <div>
                    <p className="text-sm font-medium text-harbour-text">{file.name}</p>
                    <p className="text-xs text-harbour-text-tertiary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-harbour-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
                  aria-label="Remove document"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
