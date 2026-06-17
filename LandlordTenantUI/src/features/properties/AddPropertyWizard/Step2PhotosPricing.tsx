import { useRef, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { Upload, X } from 'lucide-react'
import { Input, Select } from '@/components/ui'
import {
  type AddPropertyFormValues,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
} from './types'

interface Step2Props {
  form: UseFormReturn<AddPropertyFormValues>
  files: File[]
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
}

const toOptions = (arr: string[]) =>
  arr.map((v) => ({ value: v, label: v }))

export function Step2PhotosPricing({ form, files, setFiles }: Step2Props) {
  const {
    register,
    formState: { errors },
  } = form

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const valid = Array.from(incoming).filter((f) =>
      f.type.startsWith('image/'),
    )
    setFiles((prev) => [...prev, ...valid])
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Dropzone ─────────────────────────────────────────────────────── */}
      <div>
        <p className="mb-1.5 text-sm font-medium text-harbour-text-secondary">
          Property photos
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
            Drag photos here or click to upload
          </p>
          <p className="text-xs text-harbour-text-tertiary">
            Clear, well-lit photos help build trust with tenants
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        {/* Thumbnails */}
        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {files.map((file, i) => (
              <div key={i} className="group relative h-[68px] w-[68px] shrink-0">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-full w-full rounded-md object-cover"
                />
                {/* Remove button overlay */}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-harbour-text text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label="Remove photo"
                >
                  <X size={11} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Rent amount (₦)"
          placeholder="e.g. 1800000"
          inputMode="numeric"
          error={errors.rentAmount?.message}
          {...register('rentAmount', {
            required: 'Rent amount is required',
            pattern: {
              value: /^\d+$/,
              message: 'Enter a numeric amount',
            },
          })}
        />
        <Select
          label="Payment frequency"
          options={toOptions(['Per year', 'Per month'])}
          error={errors.paymentFrequency?.message}
          {...register('paymentFrequency', {
            required: 'Payment frequency is required',
          })}
        />
      </div>

      {/* ── Bedrooms / bathrooms ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Bedrooms"
          options={toOptions(BEDROOM_OPTIONS)}
          placeholder="Select"
          error={errors.bedrooms?.message}
          {...register('bedrooms', { required: 'Bedrooms is required' })}
        />
        <Select
          label="Bathrooms"
          options={toOptions(BATHROOM_OPTIONS)}
          placeholder="Select"
          error={errors.bathrooms?.message}
          {...register('bathrooms', { required: 'Bathrooms is required' })}
        />
      </div>
    </div>
  )
}
