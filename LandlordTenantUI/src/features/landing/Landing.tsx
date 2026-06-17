import { Link } from 'react-router-dom'
import { Building2, X, Check, ChevronDown } from 'lucide-react'
import { PublicNav } from '@/components/layout/PublicNav'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { Logo, Badge } from '@/components/ui'
import { PropertyCard } from '@/features/properties/PropertyCard'

function NeighborhoodCard({ name, image }: { name: string; image: string }) {
  const [error, setError] = useState(false)
  return (
    <div className="overflow-hidden rounded-lg border border-harbour-border bg-harbour-surface shadow-sm">
      <div className="aspect-[4/3] w-full bg-harbour-info-bg">
        {!error ? (
          <img src={image} alt={name} className="h-full w-full object-cover" onError={() => setError(true)} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-10 w-10 text-harbour-text-tertiary opacity-50" />
          </div>
        )}
      </div>
      <div className="bg-harbour-surface py-3 text-center text-sm font-medium text-harbour-text">
        {name}
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-harbour-border">
      <button 
        className="flex w-full items-center justify-between py-5 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-harbour-text">{question}</span>
        <ChevronDown className={`h-5 w-5 text-harbour-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-5 pr-12 text-sm text-harbour-text-secondary">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function Landing() {
  const [imageError, setImageError] = useState(false)
  const [activeTab, setActiveTab] = useState<'tenant' | 'landlord'>('tenant')

  return (
    <div className="min-h-screen bg-harbour-bg">
      <PublicNav />
      
      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
            
            {/* Left Content (~55%) */}
            <div className="flex flex-col lg:w-[55%]">
              <h1 className="font-display text-4xl font-semibold leading-tight text-harbour-primary lg:text-5xl">
                Rent direct. Verified homes, no agents.
              </h1>
              <p className="mt-6 max-w-md text-lg text-harbour-text-secondary">
                VGC connects landlords and tenants across Nigeria directly — verified listings, transparent pricing, and no agent markups.
              </p>
              
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link to="/register">
                  <Button variant="primary" size="lg">
                    Get started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content (~45%) */}
            <div className="lg:w-[45%]">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-harbour-border bg-harbour-info-bg shadow-sm">
                {!imageError ? (
                  <img 
                    src="/images/landing/hero.jpg" 
                    alt="A residential street in Lekki, Lagos" 
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building2 className="h-16 w-16 text-harbour-text-tertiary opacity-50" />
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Trust/stats bar */}
        <section className="w-full border-y border-harbour-border bg-harbour-surface py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm italic text-harbour-text-secondary mb-6">What we're building toward:</p>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-harbour-primary">500+</p>
                <p className="text-sm text-harbour-text-secondary mt-1">Verified listings</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-harbour-primary">6</p>
                <p className="text-sm text-harbour-text-secondary mt-1">Lagos neighborhoods</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-harbour-primary">0</p>
                <p className="text-sm text-harbour-text-secondary mt-1">Agent fees</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-harbour-primary">&lt;24hrs</p>
                <p className="text-sm text-harbour-text-secondary mt-1">Verification turnaround</p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold text-harbour-primary lg:text-3xl">
            Why VGC
          </h2>
          <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:gap-8">
            <div className="flex-1">
              <span className="font-display text-4xl font-bold text-harbour-accent">01</span>
              <h3 className="mt-4 font-display text-lg font-semibold text-harbour-primary">No agent markups</h3>
              <p className="mt-2 text-harbour-text-secondary">Message landlords directly and agree on terms without middleman fees.</p>
            </div>
            <div className="flex-1">
              <span className="font-display text-4xl font-bold text-harbour-accent">02</span>
              <h3 className="mt-4 font-display text-lg font-semibold text-harbour-primary">Verified listings</h3>
              <p className="mt-2 text-harbour-text-secondary">Every landlord and property goes through ID and document checks before going live.</p>
            </div>
            <div className="flex-1">
              <span className="font-display text-4xl font-bold text-harbour-accent">03</span>
              <h3 className="mt-4 font-display text-lg font-semibold text-harbour-primary">Everything in one place</h3>
              <p className="mt-2 text-harbour-text-secondary">Track applications, messages, and inspection scheduling from your dashboard.</p>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold text-harbour-primary lg:text-3xl">
            How it works
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab('tenant')}
              className={`rounded-lg min-h-[44px] w-full sm:w-auto px-6 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'tenant' 
                  ? 'bg-harbour-primary text-white' 
                  : 'bg-harbour-surface border border-harbour-border text-harbour-text-secondary hover:text-harbour-text'
              }`}
            >
              I'm looking for a home
            </button>
            <button
              onClick={() => setActiveTab('landlord')}
              className={`rounded-lg min-h-[44px] w-full sm:w-auto px-6 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'landlord' 
                  ? 'bg-harbour-primary text-white' 
                  : 'bg-harbour-surface border border-harbour-border text-harbour-text-secondary hover:text-harbour-text'
              }`}
            >
              I'm a landlord
            </button>
          </div>
          
          <div className="mt-12 flex flex-col gap-6">
            {activeTab === 'tenant' ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-harbour-info-bg font-semibold text-harbour-primary">1</div>
                  <span className="font-medium text-harbour-text">Browse verified listings</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-harbour-info-bg font-semibold text-harbour-primary">2</div>
                  <span className="font-medium text-harbour-text">Message the landlord directly</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-harbour-info-bg font-semibold text-harbour-primary">3</div>
                  <span className="font-medium text-harbour-text">Apply and schedule an inspection</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-harbour-info-bg font-semibold text-harbour-primary">4</div>
                  <span className="font-medium text-harbour-text">Move in with confidence</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-harbour-info-bg font-semibold text-harbour-primary">1</div>
                  <span className="font-medium text-harbour-text">List your property for free</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-harbour-info-bg font-semibold text-harbour-primary">2</div>
                  <span className="font-medium text-harbour-text">Get verified (ID and property documents)</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-harbour-info-bg font-semibold text-harbour-primary">3</div>
                  <span className="font-medium text-harbour-text">Review applications</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-harbour-info-bg font-semibold text-harbour-primary">4</div>
                  <span className="font-medium text-harbour-text">Choose your tenant directly</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Comparison section */}
        <section id="comparison" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold text-harbour-primary lg:text-3xl text-center">
            The old way vs. the VGC way
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-harbour-border bg-harbour-surface p-8">
              <h3 className="font-display text-xl font-semibold text-harbour-text-secondary">Renting through an agent</h3>
              <ul className="mt-6 flex flex-col gap-4">
                {['Agent fees on top of rent', "Listings you can't verify", 'Slow, fragmented communication', 'No record of your application'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-harbour-warning/20 p-1">
                      <X className="h-4 w-4 text-harbour-warning" />
                    </div>
                    <span className="text-harbour-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border-2 border-harbour-accent bg-harbour-surface p-8">
              <h3 className="font-display text-xl font-semibold text-harbour-primary">Renting on VGC</h3>
              <ul className="mt-6 flex flex-col gap-4">
                {['Deal directly with landlords — no markups', 'Every listing and landlord verified', 'In-app messaging, all in one place', 'Track your application status anytime'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-harbour-success/20 p-1">
                      <Check className="h-4 w-4 text-harbour-success" />
                    </div>
                    <span className="text-harbour-text">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Verification spotlight */}
        <section id="why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
            <div className="lg:w-1/2">
              <h2 className="font-display text-2xl font-semibold text-harbour-primary lg:text-3xl">
                What 'Verified' means
              </h2>
              <p className="mt-6 text-lg text-harbour-text-secondary">
                Landlords submit a government ID and property ownership or lease documents. These are reviewed by our platform's team before a listing ever goes live and shows the Verified badge.
              </p>
            </div>
            <div className="flex justify-center lg:w-1/2">
              <div className="flex h-48 w-full max-w-sm items-center justify-center rounded-2xl border border-harbour-border bg-harbour-surface p-8 shadow-sm">
                <div className="scale-150 transform">
                  <Badge label="Verified" variant="success" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured listings section */}
        <section id="listings" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold text-harbour-primary lg:text-3xl">
            Recently listed
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <PropertyCard property={{
              id: "1",
              title: "3-bed duplex, Lekki Phase 1",
              price: "₦1,800,000 / year",
              image: "/images/landing/listing-lekki.jpg",
              badges: [{label:"Verified", variant:"success"}]
            }} />
            <PropertyCard property={{
              id: "2",
              title: "2-bed bungalow, Yaba",
              price: "₦950,000 / year",
              image: "/images/landing/listing-yaba.jpg",
              badges: [{label:"Verified", variant:"success"}]
            }} />
            <PropertyCard property={{
              id: "3",
              title: "Self-contain, Ikeja",
              price: "₦450,000 / year",
              image: "/images/landing/listing-ikeja.jpg",
              badges: [{label:"Verified", variant:"success"}]
            }} />
          </div>
        </section>

        {/* Neighborhoods section */}
        <section id="neighborhoods" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold text-harbour-primary lg:text-3xl">
              Where we operate
            </h2>
            <p className="mt-4 text-lg text-harbour-text-secondary">
              Currently live in these Lagos neighborhoods, with more on the way.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            <NeighborhoodCard name="Lekki" image="/images/landing/area-lekki.jpg" />
            <NeighborhoodCard name="Yaba" image="/images/landing/area-yaba.jpg" />
            <NeighborhoodCard name="Surulere" image="/images/landing/area-surulere.jpg" />
            <NeighborhoodCard name="Ikeja" image="/images/landing/area-ikeja.jpg" />
          </div>
        </section>

        {/* FAQ section */}
        <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold text-harbour-primary lg:text-3xl text-center">
            Frequently asked questions
          </h2>
          <div className="mt-10 flex flex-col">
            <FAQItem question="Is it really free for tenants?" answer="Yes — browsing, messaging landlords, and applying to properties is free for tenants." />
            <FAQItem question="How does verification work?" answer="Landlords submit a government ID and property ownership or lease documents. Our team reviews these before a listing goes live with the Verified badge." />
            <FAQItem question="What if a landlord doesn't respond?" answer="You can message multiple landlords and track all your applications from your dashboard, so you're never stuck waiting on one response." />
            <FAQItem question="Which cities are supported?" answer="We're starting in Lagos, with Lekki, Yaba, Surulere, and Ikeja live now and more areas coming soon." />
          </div>
        </section>

        {/* Landlord CTA band */}
        <section id="for-landlords" className="bg-harbour-primary px-4 py-16 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-semibold text-white lg:text-3xl">
              Own a property in Nigeria?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              List it for free and reach verified tenants directly — no agent fees, no middlemen.
            </p>
            <div className="mt-8">
              <Link to="/register">
                <Button variant="primary" className="bg-white text-harbour-primary hover:bg-gray-100">
                  List your property
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-harbour-border bg-harbour-bg py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
            {/* Left */}
            <div className="lg:max-w-xs">
              <Logo markSize="h-8 w-8" wordmarkClassName="h-5 object-contain" />
              <p className="mt-4 text-sm text-harbour-text-secondary">
                Direct, verified rentals for Nigeria.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="flex flex-col gap-4">
                <h4 className="font-semibold text-harbour-text">Product</h4>
                <a href="#how-it-works" className="text-sm text-harbour-text-secondary hover:text-harbour-text">How it works</a>
                <a href="#for-landlords" className="text-sm text-harbour-text-secondary hover:text-harbour-text">For landlords</a>
                <a href="#why" className="text-sm text-harbour-text-secondary hover:text-harbour-text">Verification</a>
                <a href="#faq" className="text-sm text-harbour-text-secondary hover:text-harbour-text">FAQ</a>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-semibold text-harbour-text">Company</h4>
                {/* TODO: Create pages */}
                <a href="#" className="text-sm text-harbour-text-secondary hover:text-harbour-text">About</a>
                <a href="#" className="text-sm text-harbour-text-secondary hover:text-harbour-text">Contact</a>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-semibold text-harbour-text">Legal</h4>
                {/* TODO: Create pages */}
                <a href="#" className="text-sm text-harbour-text-secondary hover:text-harbour-text">Privacy policy</a>
                <a href="#" className="text-sm text-harbour-text-secondary hover:text-harbour-text">Terms of service</a>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-harbour-border pt-8">
            <p className="text-sm text-harbour-text-tertiary">
              © {new Date().getFullYear()} VGC. Made for Nigeria.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
