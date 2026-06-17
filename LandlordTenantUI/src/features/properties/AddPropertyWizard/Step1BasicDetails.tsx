import { type UseFormReturn } from 'react-hook-form'
import { Input, Select, Textarea } from '@/components/ui'
import {
  type AddPropertyFormValues,
  PROPERTY_TYPES,
  STATES,
} from './types'

interface Step1Props {
  form: UseFormReturn<AddPropertyFormValues>
}

const toOptions = (arr: string[]) =>
  arr.map((v) => ({ value: v, label: v }))

export function Step1BasicDetails({ form }: Step1Props) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Property title"
        placeholder="e.g. Spacious 3-bed flat in Lekki Phase 1"
        error={errors.title?.message}
        {...register('title', { required: 'Title is required' })}
      />

      <Select
        label="Property type"
        options={toOptions(PROPERTY_TYPES)}
        placeholder="Select a type"
        error={errors.propertyType?.message}
        {...register('propertyType', { required: 'Property type is required' })}
      />

      <Input
        label="Street address"
        placeholder="e.g. 12 Admiralty Way"
        error={errors.address?.message}
        {...register('address', { required: 'Address is required' })}
      />

      {/* City / State — 2 columns on sm+ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="City"
          placeholder="e.g. Lekki"
          error={errors.city?.message}
          {...register('city', { required: 'City is required' })}
        />
        <Select
          label="State"
          options={toOptions(STATES)}
          placeholder="Select a state"
          error={errors.state?.message}
          {...register('state', { required: 'State is required' })}
        />
      </div>

      <Textarea
        label="Description"
        placeholder="Describe the property — amenities, nearby landmarks, what makes it special…"
        rows={4}
        error={errors.description?.message}
        {...register('description', { required: 'Description is required' })}
      />
    </div>
  )
}
