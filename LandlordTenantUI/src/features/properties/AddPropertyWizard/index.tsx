import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button, ProgressBar } from '@/components/ui'
import { createProperty, uploadPropertyImage, uploadPropertyDocument } from '@/features/properties/api'
import { queryKeys } from '@/lib/queryKeys'
import { Step1BasicDetails } from './Step1BasicDetails'
import { Step2PhotosPricing } from './Step2PhotosPricing'
import { Step3Review } from './Step3Review'
import { Step3VerificationDocs } from './Step3VerificationDocs'
import { type AddPropertyFormValues, STEP_NAMES } from './types'

const TOTAL_STEPS = 4

// Only the fields belonging to each step are validated on "Next"
const STEP_FIELDS: (keyof AddPropertyFormValues)[][] = [
  ['title', 'propertyType', 'address', 'city', 'state', 'description'],
  ['rentAmount', 'paymentFrequency', 'bedrooms', 'bathrooms'],
  [],
  [],
]

export function AddPropertyWizard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [step, setStep] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [documents, setDocuments] = useState<File[]>([])

  const form = useForm<AddPropertyFormValues>({
    defaultValues: {
      title: '',
      propertyType: '',
      address: '',
      city: '',
      state: '',
      description: '',
      rentAmount: '',
      paymentFrequency: 'Per year',
      bedrooms: '',
      bathrooms: '',
    },
    mode: 'onTouched',
  })

  const { handleSubmit, trigger } = form

  // ── Submission mutation ──────────────────────────────────────────────────
  const {
    mutate: submitListing,
    isPending,
    error: submitError,
  } = useMutation({
    mutationFn: async (values: AddPropertyFormValues) => {
      // 1. Create the property record
      const { propertyId } = await createProperty({
        title: values.title,
        propertyType: values.propertyType,
        address: values.address,
        city: values.city,
        state: values.state,
        description: values.description,
        rentPrice: Number(values.rentAmount),
        rentFrequency: values.paymentFrequency,
        bedrooms: Number(values.bedrooms) || 1,
        bathrooms: Number(values.bathrooms) || 1,
      })

      // 2. Upload each photo in sequence (avoids flooding the server)
      for (const file of files) {
        await uploadPropertyImage(propertyId, file)
      }

      // 3. Upload verification documents
      for (const doc of documents) {
        await uploadPropertyDocument(propertyId, doc, "Proof of Ownership")
      }

      return propertyId
    },
    onSuccess: () => {
      // Invalidate the properties list cache so Dashboard refetches
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all })
      navigate('/dashboard')
    },
  })

  // ── Step navigation ──────────────────────────────────────────────────────
  async function handleNext() {
    const fields = STEP_FIELDS[step]
    const valid = fields.length === 0 || (await trigger(fields))
    if (valid) setStep((s) => s + 1)
  }

  function handleBack() {
    setStep((s) => s - 1)
  }

  function onSubmit(values: AddPropertyFormValues) {
    submitListing(values)
  }

  // Derive a readable error message from the mutation error
  const errorMessage =
    submitError instanceof Error
      ? submitError.message
      : submitError
      ? 'Something went wrong. Please try again.'
      : null

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-harbour-text">
            Add a new property
          </h1>
          <p className="mt-1 text-sm text-harbour-text-secondary">
            Step {step + 1} of {TOTAL_STEPS} · {STEP_NAMES[step]}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<X size={15} />}
          onClick={() => navigate('/dashboard')}
          className="mt-1 shrink-0"
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────────── */}
      <ProgressBar totalSteps={TOTAL_STEPS} currentStep={step} />

      {/* ── Step content ─────────────────────────────────────────────────── */}
      <div className="min-h-[360px]">
        {step === 0 && <Step1BasicDetails form={form} />}
        {step === 1 && (
          <Step2PhotosPricing form={form} files={files} setFiles={setFiles} />
        )}
        {step === 2 && (
          <Step3VerificationDocs documents={documents} setDocuments={setDocuments} />
        )}
        {step === 3 && <Step3Review form={form} files={files} documents={documents} />}
      </div>

      {/* ── Inline error on submit failure ───────────────────────────────── */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* ── Footer navigation ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-t border-harbour-border pt-5">
        {/* Left — Cancel on step 1, Back on steps 2–3 */}
        {step === 0 ? (
          <Button
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            disabled={isPending}
          >
            Cancel
          </Button>
        ) : (
          <Button variant="secondary" onClick={handleBack} disabled={isPending}>
            Back
          </Button>
        )}

        {/* Right — Next or Submit */}
        {step < TOTAL_STEPS - 1 ? (
          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button
            variant="primary"
            icon={
              isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <CheckCircle size={17} />
              )
            }
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending ? 'Submitting…' : 'Submit for review'}
          </Button>
        )}
      </div>
    </div>
  )
}
