// Shared form schema for the Add Property wizard.
// One instance of useForm<AddPropertyFormValues> spans all 3 steps.

export interface AddPropertyFormValues {
  // Step 1 — Basic details
  title: string
  propertyType: string
  address: string
  city: string
  state: string
  description: string

  // Step 2 — Photos & pricing
  rentAmount: string
  paymentFrequency: 'Per year' | 'Per month'
  bedrooms: string
  bathrooms: string
}

export const PROPERTY_TYPES = [
  'Self-contain',
  'Mini flat',
  '2-bedroom flat',
  '3-bedroom flat',
  'Duplex',
  'Bungalow',
]

export const STATES = ['Lagos', 'Abuja (FCT)', 'Ogun', 'Rivers', 'Oyo']

export const CITIES = [
  'Lekki',
  'Yaba',
  'Surulere',
  'Ikeja',
  'Festac',
  'Ajegunle',
  'Badagry',
  'Ago/Okota',
  'Victoria Island',
  'Ikoyi',
  'Ikorodu',
  'Ketu',
  'Isolo',
  'Jakande'
]

export const BEDROOM_OPTIONS = ['1', '2', '3', '4+']
export const BATHROOM_OPTIONS = ['1', '2', '3', '4+']

export const STEP_NAMES = [
  'Basic details',
  'Photos & pricing',
  'Verification docs',
  'Review',
] as const
