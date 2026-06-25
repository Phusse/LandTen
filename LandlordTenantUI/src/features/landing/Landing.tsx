import { Link } from 'react-router-dom'
import { Building2, ChevronDown } from 'lucide-react'
import { PublicNav } from '@/components/layout/PublicNav'
import { Button } from '@/components/ui/Button'
import { useState, useEffect, useRef } from 'react'
import { Logo, Badge } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { PropertyCard, PropertyCardSkeleton } from '@/features/properties/PropertyCard'
import { useQuery } from '@tanstack/react-query'
import { getProperties } from '@/features/properties/api'
import type { Property } from '@/features/properties/api'
import { useScrollReveal } from '@/hooks/useScrollReveal'

// ─── Sub-components ──────────────────────────────────────────────────────────

function NeighborhoodCard({ name, image }: { name: string; image: string }) {
  const [error, setError] = useState(false)
  return (
    <div className="w-full max-w-[150px] lg:max-w-[200px] aspect-square overflow-hidden rounded-xl border border-harbour-border bg-harbour-surface shadow-sm group hover:-translate-y-1 hover:shadow-lg transition-all duration-200 ease-out relative mx-auto">
      <div className="h-full w-full bg-harbour-info-bg relative">
        {!error ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-10 w-10 text-harbour-text-tertiary opacity-50" />
          </div>
        )}

        {/* Name Overlay that slides up on hover */}
        <div className="absolute bottom-0 left-0 w-full bg-harbour-primary/80 text-white py-2 text-center text-sm font-medium translate-y-[101%] group-hover:translate-y-0 transition-transform duration-200 ease-out">
          {name}
        </div>
      </div>
    </div>
  )
}

function NeighborhoodsSection() {
  const { ref, isVisible } = useScrollReveal()
  const [phase, setPhase] = useState<'idle' | 'vortex' | 'cards' | 'settled'>('idle')
  const hasStarted = useRef(false)
  const prefersReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false

  useEffect(() => {
    if (!isVisible || hasStarted.current) return
    hasStarted.current = true

    if (prefersReducedMotion) {
      setPhase('settled')
      return
    }

    setPhase('vortex')

    const vortexTimer = setTimeout(() => {
      setPhase('cards')
    }, 600)

    const settleTimer = setTimeout(() => {
      setPhase('settled')
    }, 2000)

    return () => {
      clearTimeout(vortexTimer)
      clearTimeout(settleTimer)
    }
  }, [isVisible, prefersReducedMotion])

  const neighborhoods = [
    { name: "Lekki", image: "/images/landing/area-lekki.jpg", rotation: -720 },
    { name: "Yaba", image: "/images/landing/area-yaba.jpg", rotation: 720 },
    { name: "Surulere", image: "/images/landing/area-surulere.jpg", rotation: -360 },
    { name: "Ikeja", image: "/images/landing/area-ikeja.jpg", rotation: 360 },
    { name: "Festac", image: "/images/landing/area-festac.png", rotation: -1080 },
    { name: "Ajegunle", image: "/images/landing/area-ajegunle.png", rotation: 1080 },
    { name: "Badagry", image: "/images/landing/area-badagry.png", rotation: -900 },
    { name: "Ago/Okota", image: "/images/landing/area-ago-okota.png", rotation: 900 },
    { name: "Victoria Island", image: "/images/landing/area-vi.png", rotation: -1440 },
    { name: "Ikoyi", image: "/images/landing/area-ikoyi.png", rotation: 1440 },
    { name: "Ikorodu", image: "/images/landing/area-ikorodu.png", rotation: -1200 },
    { name: "Ketu", image: "/images/landing/area-ketu.png", rotation: 1200 },
    { name: "Isolo", image: "/images/landing/area-isolo.png", rotation: -720 },
    { name: "Jakande", image: "/images/landing/area-jakande.png", rotation: 720 },
  ]

  return (
    <section ref={ref} id="neighborhoods" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="text-center relative z-10">
        <h2 className="font-display text-2xl font-semibold text-harbour-primary lg:text-3xl">
          Where we operate
        </h2>
        <p className="mt-4 text-lg text-harbour-text-secondary">
          Currently live in these Lagos neighborhoods, with more on the way.
        </p>
        <AnimatePresence>
          {phase !== 'settled' && !prefersReducedMotion && (
            <motion.p
              className="mt-2 text-sm italic text-harbour-accent absolute left-1/2 -translate-x-1/2 w-full"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Scroll to discover
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div
        className="mt-8 relative min-h-[350px] flex flex-col items-center justify-center"
        style={{ perspective: '2000px' }}
      >
        {/* Vortex visual */}
        <AnimatePresence>
          {(phase === 'vortex' || phase === 'cards') && !prefersReducedMotion && (
            <motion.div
              className="absolute left-1/2 top-1/2 w-[200px] h-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full z-0"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(0, 168, 107, 0.5), transparent)',
                filter: 'blur(8px)',
              }}
              initial={{ opacity: 0, scale: 0, rotateX: 60 }}
              animate={{ opacity: 1, scale: 1, rotateZ: 360, rotateX: 60 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                opacity: { duration: 0.4 },
                scale: { duration: 0.4, type: 'spring' },
                rotateZ: { duration: 1, repeat: Infinity, ease: "linear" }
              }}
            />
          )}
        </AnimatePresence>

        {/* Phase 2: 3D Tornado Explosion */}
        <AnimatePresence>
          {phase === 'cards' && !prefersReducedMotion && (
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
              {neighborhoods.map((area, i) => {
                // Create a 3D expanding spiral for the burst
                const angle = i * (Math.PI / 2.5); // Golden spiral-ish spacing
                const radius = 50 + (i * 25);
                const targetX = Math.cos(angle) * radius;
                const targetY = Math.sin(angle) * radius;
                const targetZ = 300 + (i * 40); // Pop forward towards the camera

                return (
                  <motion.div
                    layoutId={`card-${area.name}`}
                    key={`spawning-${area.name}`}
                    className="absolute"
                    style={{ originX: 0.5, originY: 0.5 }}
                    initial={{ opacity: 0, scale: 0.1, z: -2000, x: 0, y: 0, rotateZ: area.rotation }}
                    animate={{ opacity: 1, scale: 1.2, z: targetZ, x: targetX, y: targetY, rotateZ: 0 }}
                    exit={{ opacity: 0, scale: 1.5, z: targetZ + 500 }}
                    transition={{
                      duration: 1.4,
                      type: 'spring',
                      damping: 12,
                      delay: i * 0.05
                    }}
                  >
                    <NeighborhoodCard name={area.name} image={area.image} />
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Phase 3: Settled Grid Layout */}
        <div className={`grid grid-cols-2 md:grid-cols-7 gap-4 relative z-10 w-full max-w-7xl mx-auto transition-opacity duration-500 ${(phase === 'idle' || phase === 'vortex') && !prefersReducedMotion ? 'opacity-0' : 'opacity-100'}`}>
          <AnimatePresence>
            {(phase === 'settled' || prefersReducedMotion) && neighborhoods.map((area, i) => (
              <motion.div
                layoutId={prefersReducedMotion ? undefined : `card-${area.name}`}
                key={`settled-${area.name}`}
                className="flex justify-center"
                initial={prefersReducedMotion ? { opacity: 0, y: 20 } : false}
                animate={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1 }}
                transition={{ duration: 1.2, type: 'spring', damping: 20, delay: prefersReducedMotion ? i * 0.05 : 0 }}
              >
                <NeighborhoodCard name={area.name} image={area.image} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function FAQItem({ question, answer, staggerClass = '' }: { question: string; answer: string; staggerClass?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={`border-b border-harbour-border ${staggerClass}`}>
      <button
        className="flex min-h-[44px] w-full items-center justify-between py-5 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-harbour-text">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-harbour-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="pb-5 pr-10 text-sm leading-relaxed text-harbour-text-secondary">
          {answer}
        </div>
      )}
    </div>
  )
}

// ─── Featured Listings — real data ───────────────────────────────────────────

function FeaturedListings() {
  const { ref, className, isVisible } = useScrollReveal()
  const { data, isLoading } = useQuery({
    queryKey: ['public-featured-properties'],
    queryFn: () => getProperties(1, 20),
    staleTime: 5 * 60 * 1000, // 5 minutes — public page, no aggressive polling
  })

  // Filter to verified only, sort by createdAt desc, take first 3
  const verified: Property[] = (data?.items ?? [])
    .filter((p) => p.isVerified)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  // Hide section entirely if no verified listings exist
  if (!isLoading && verified.length === 0) return null

  return (
    <section ref={ref} id="listings" className={`mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 ${className}`}>
      <div className="flex flex-col items-center text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-harbour-accent">
          Recently listed
        </span>
        <h2 className="mt-2 font-display text-3xl font-semibold text-harbour-primary lg:text-4xl">
          Homes people are looking at right now.
        </h2>
        <motion.div
          className="mt-4 h-[2px] w-16 bg-harbour-accent origin-left"
          initial={{ scaleX: 0 }}
          animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      <div className="mt-12">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`stagger-${i + 1} h-full`}>
                  <PropertyCardSkeleton />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {verified.map((property, i) => (
                <div key={property.id} className={`stagger-${i + 1} h-full`}>
                  <PropertyCard property={property} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

// ─── Live Trust Ticker ───────────────────────────────────────────────────────

function useLiveCounter(endValue: number, duration: number = 1800, isVisible: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    let animationFrameId: number

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const timeRatio = Math.min(progress / duration, 1)
      const easedRatio = easeOutCubic(timeRatio)

      setCount(Math.floor(easedRatio * endValue))

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        setCount(endValue)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrameId)
  }, [endValue, duration, isVisible])

  return count
}

function LiveTrustTicker() {
  const { ref, isVisible } = useScrollReveal()
  const { data } = useQuery({
    queryKey: ['public-featured-properties'],
    queryFn: () => getProperties(1, 20),
    staleTime: 5 * 60 * 1000,
  })

  const verifiedCount = (data?.items ?? []).filter((p) => p.isVerified).length
  const totalCount = data?.totalCount ?? 0
  const finalCount = totalCount > 0 ? totalCount : verifiedCount > 0 ? verifiedCount : 0

  const animatedVerified = useLiveCounter(finalCount, 1800, isVisible)
  const animatedNeighborhoods = useLiveCounter(14, 1800, isVisible)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  }

  return (
    <section ref={ref} className="relative w-full bg-harbour-primary py-24 overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />
      {/* SVG Transition Curve from Hero (placed at the top) */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-10 -translate-y-[99%]">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-16 md:h-24 text-harbour-primary block">
          <path fill="currentColor" d="M0,120 C480,0 960,0 1440,120 L1440,120 L0,120 Z" />
        </svg>
      </div>

      <motion.div
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <motion.div className="text-center" variants={itemVariants}>
            <p className="font-display text-5xl font-bold text-harbour-accent">{animatedVerified}+</p>
            <p className="mt-3 text-sm tracking-wide text-white/70 uppercase">Verified listings</p>
          </motion.div>
          <motion.div className="text-center" variants={itemVariants}>
            <p className="font-display text-5xl font-bold text-harbour-accent">{animatedNeighborhoods}+</p>
            <p className="mt-3 text-sm tracking-wide text-white/70 uppercase">Lagos neighborhoods</p>
          </motion.div>
          <motion.div className="text-center" variants={itemVariants}>
            <p className="font-display text-5xl font-bold text-harbour-accent">0</p>
            <p className="mt-3 text-sm tracking-wide text-white/70 uppercase">Agent fees</p>
          </motion.div>
          <motion.div className="text-center" variants={itemVariants}>
            <p className="font-display text-5xl font-bold text-harbour-accent">&lt;24hrs</p>
            <p className="mt-3 text-sm tracking-wide text-white/70 uppercase">Verification</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

// ─── Animated Comparison ──────────────────────────────────────────────────────

function AnimatedComparison() {
  const { ref, isVisible } = useScrollReveal()
  const [act, setAct] = useState<'act1' | 'act2'>('act1')

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setAct('act2')
      }, 3500) // Stay in Act 1 for 3.5s before showing Act 2
      return () => clearTimeout(timer)
    } else {
      setAct('act1') // reset if scrolled out
    }
  }, [isVisible])

  // Coordinates
  const nodePositions = {
    you: { act1: 100, act2: 200 },
    agent1: { act1: 300, act2: 300 },
    agent2: { act1: 500, act2: 500 },
    landlord: { act1: 700, act2: 500 },
    property: { act1: 900, act2: 800 },
  }

  const AgentCross = ({ cx }: { cx: number }) => (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
      <motion.line x1={cx - 20} y1={130} x2={cx + 20} y2={170} stroke="#ef4444" strokeWidth={6} strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />
      <motion.line x1={cx + 20} y1={130} x2={cx - 20} y2={170} stroke="#ef4444" strokeWidth={6} strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.15 }} />
    </motion.g>
  )

  return (
    <section ref={ref} id="comparison" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold text-harbour-primary lg:text-3xl">
          The old way vs. the VGC way
        </h2>
        <p className="mt-4 text-lg text-harbour-text-secondary">
          Renting used to be complicated. We fixed it.
        </p>
      </div>

      <div className="mt-16 w-full overflow-x-auto overflow-y-hidden py-4">
        <div className="min-w-[800px] max-w-4xl mx-auto">
          <svg viewBox="0 0 1000 300" className="w-full h-auto" role="img" aria-label="Animated diagram comparing the old way of renting with agents to the new direct VGC way.">

            {/* Base Lines */}
            <motion.line
              x1={act === 'act1' ? nodePositions.you.act1 : nodePositions.you.act2}
              x2={act === 'act1' ? nodePositions.agent1.act1 : nodePositions.landlord.act2}
              y1={150} y2={150}
              stroke={act === 'act1' ? '#cbd5e1' : '#00A86B'}
              strokeWidth={4}
              animate={{
                x1: act === 'act1' ? nodePositions.you.act1 : nodePositions.you.act2,
                x2: act === 'act1' ? nodePositions.agent1.act1 : nodePositions.landlord.act2,
                stroke: act === 'act1' ? '#cbd5e1' : '#00A86B'
              }}
              transition={{ duration: 0.8, ease: "easeInOut", delay: act === 'act2' ? 0.8 : 0 }}
            />
            <motion.line
              animate={{ opacity: act === 'act1' ? 1 : 0 }}
              transition={{ duration: 0.3, delay: act === 'act2' ? 0.5 : 0 }}
              x1={nodePositions.agent1.act1} x2={nodePositions.agent2.act1} y1={150} y2={150} stroke="#cbd5e1" strokeWidth={4}
            />
            <motion.line
              animate={{ opacity: act === 'act1' ? 1 : 0 }}
              transition={{ duration: 0.3, delay: act === 'act2' ? 0.5 : 0 }}
              x1={nodePositions.agent2.act1} x2={nodePositions.landlord.act1} y1={150} y2={150} stroke="#cbd5e1" strokeWidth={4}
            />
            <motion.line
              x1={act === 'act1' ? nodePositions.landlord.act1 : nodePositions.landlord.act2}
              x2={act === 'act1' ? nodePositions.property.act1 : nodePositions.property.act2}
              y1={150} y2={150}
              stroke={act === 'act1' ? '#cbd5e1' : '#00A86B'}
              strokeWidth={4}
              animate={{
                x1: act === 'act1' ? nodePositions.landlord.act1 : nodePositions.landlord.act2,
                x2: act === 'act1' ? nodePositions.property.act1 : nodePositions.property.act2,
                stroke: act === 'act1' ? '#cbd5e1' : '#00A86B'
              }}
              transition={{ duration: 0.8, ease: "easeInOut", delay: act === 'act2' ? 0.8 : 0 }}
            />

            {/* Travelling dots representing signal/communication */}
            {act === 'act1' && isVisible && (
              <>
                <motion.circle r={6} fill="#94a3b8" cy={150}
                  initial={{ cx: 100 }}
                  animate={{ cx: 900 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
              </>
            )}
            {act === 'act2' && isVisible && (
              <>
                <motion.circle r={6} fill="#00A86B" cy={150}
                  initial={{ cx: 200 }}
                  animate={{ cx: 800 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 1.6 }}
                />
              </>
            )}

            {/* Nodes */}
            <motion.g animate={{ x: act === 'act1' ? 0 : 100 }} transition={{ duration: 0.8, ease: "easeInOut", delay: act === 'act2' ? 0.8 : 0 }}>
              <circle cx={nodePositions.you.act1} cy={150} r={40} fill="#ffffff" stroke="#1c2b4a" strokeWidth={3} />
              <text x={nodePositions.you.act1} y={220} textAnchor="middle" className="text-base font-semibold fill-harbour-text">You</text>
            </motion.g>

            <motion.g
              animate={{
                opacity: act === 'act1' ? 1 : 0,
                scale: act === 'act1' ? 1 : 0.5
              }}
              style={{ transformOrigin: `${nodePositions.agent1.act1}px 150px` }}
              transition={{ opacity: { delay: act === 'act2' ? 0.5 : 0, duration: 0.3 }, scale: { delay: act === 'act2' ? 0.5 : 0, duration: 0.3 } }}
            >
              <circle cx={nodePositions.agent1.act1} cy={150} r={36} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={2} />
              <text x={nodePositions.agent1.act1} y={220} textAnchor="middle" className="text-sm font-medium fill-slate-500">Agent 1</text>
              {act === 'act2' && <AgentCross cx={nodePositions.agent1.act1} />}
            </motion.g>

            <motion.g
              animate={{
                opacity: act === 'act1' ? 1 : 0,
                scale: act === 'act1' ? 1 : 0.5
              }}
              style={{ transformOrigin: `${nodePositions.agent2.act1}px 150px` }}
              transition={{ opacity: { delay: act === 'act2' ? 0.5 : 0, duration: 0.3 }, scale: { delay: act === 'act2' ? 0.5 : 0, duration: 0.3 } }}
            >
              <circle cx={nodePositions.agent2.act1} cy={150} r={36} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={2} />
              <text x={nodePositions.agent2.act1} y={220} textAnchor="middle" className="text-sm font-medium fill-slate-500">Agent 2</text>
              {act === 'act2' && <AgentCross cx={nodePositions.agent2.act1} />}
            </motion.g>

            <motion.g animate={{ x: act === 'act1' ? 0 : -200 }} transition={{ duration: 0.8, ease: "easeInOut", delay: act === 'act2' ? 0.8 : 0 }}>
              <circle cx={nodePositions.landlord.act1} cy={150} r={40} fill="#ffffff" stroke="#1c2b4a" strokeWidth={3} />
              <text x={nodePositions.landlord.act1} y={220} textAnchor="middle" className="text-base font-semibold fill-harbour-text">Landlord</text>
            </motion.g>

            <motion.g animate={{ x: act === 'act1' ? 0 : -100 }} transition={{ duration: 0.8, ease: "easeInOut", delay: act === 'act2' ? 0.8 : 0 }}>
              <circle cx={nodePositions.property.act1} cy={150} r={40} fill="#ffffff" stroke="#1c2b4a" strokeWidth={3} />
              <text x={nodePositions.property.act1} y={220} textAnchor="middle" className="text-base font-semibold fill-harbour-text">Property</text>
            </motion.g>

            {/* Direct Connection Label */}
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: act === 'act2' ? 1 : 0, y: act === 'act2' ? 0 : 10 }}
              transition={{ duration: 0.5, delay: act === 'act2' ? 1.6 : 0 }}
            >
              <rect x={400} y={60} width={200} height={36} rx={18} fill="#00A86B" opacity={0.15} />
              <text x={500} y={83} textAnchor="middle" className="text-sm font-semibold" fill="#00A86B">✓ Direct connection</text>
            </motion.g>

          </svg>
        </div>
      </div>
    </section>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const [isMobile, setIsMobile] = useState(false)
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const useFallback = isMobile

  const getAnimationProps = (delay: number, yOffset: number = 40) => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3 }
      }
    }
    return {
      initial: { opacity: 0, y: yOffset },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.7, ease: "easeOut" as const, delay }
    }
  }

  return (
    <section className="relative h-[100vh] w-full overflow-hidden bg-harbour-bg flex flex-col items-center justify-center">
      {/* Background */}
      {useFallback ? (
        <>
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/images/cinematic/city-layers/city-layer-buildings.png)' }}
          />
          <div className="absolute inset-0 z-10 bg-black/45" />
        </>
      ) : (
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/images/cinematic/city-layers/city-layer-buildings.png)' }}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: prefersReducedMotion ? 1 : 1.05 }}
            transition={{
              opacity: { duration: 0.6 },
              scale: { duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 z-50 bg-black/45" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-40 flex flex-col items-center text-center px-4 w-full mt-16">
        <motion.div
          className="uppercase tracking-[0.2em] text-harbour-accent text-sm font-semibold mb-6"
          {...getAnimationProps(prefersReducedMotion ? 0 : 0.2)}
        >
          LAGOS · VERIFIED RENTALS
        </motion.div>

        <h1 className="font-display text-4xl md:text-7xl lg:text-8xl font-bold text-white leading-tight flex flex-col items-center">
          <div className="flex gap-4 overflow-hidden">
            <motion.span {...getAnimationProps(prefersReducedMotion ? 0 : 0.4)}>Find</motion.span>
            <motion.span {...getAnimationProps(prefersReducedMotion ? 0 : 0.52)}>Home.</motion.span>
          </div>
          <div className="flex gap-4 overflow-hidden mt-2">
            <motion.span {...getAnimationProps(prefersReducedMotion ? 0 : 0.64)}>Trust</motion.span>
            <motion.span {...getAnimationProps(prefersReducedMotion ? 0 : 0.76)}>First.</motion.span>
          </div>
        </h1>

        <motion.p
          className="mt-6 text-white/80 text-lg md:text-xl max-w-lg mx-auto"
          {...getAnimationProps(prefersReducedMotion ? 0 : 1.0)}
        >
          Direct from landlord to you. Verified listings, no agents, no markups.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col md:flex-row gap-3 md:gap-4 justify-center items-center w-full"
          {...getAnimationProps(prefersReducedMotion ? 0 : 1.2)}
        >
          <a href="#listings" className="w-full md:w-auto">
            <button className="bg-harbour-accent text-harbour-primary font-semibold px-8 py-3 rounded-lg hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 w-full md:w-auto">
              Find a home
            </button>
          </a>
          <Link to="/register" className="w-full md:w-auto">
            <button className="border border-white text-white bg-transparent px-8 py-3 rounded-lg hover:bg-white/10 transition-colors duration-200 w-full md:w-auto">
              List your property
            </button>
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-10 z-[60] text-white/60"
        {...getAnimationProps(prefersReducedMotion ? 0 : 1.4)}
      >
        <ChevronDown className="h-8 w-8 animate-[bounce_1.5s_infinite]" />
      </motion.div>
    </section>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────

export default function Landing() {
  const [activeTab, setActiveTab] = useState<'tenant' | 'landlord'>('tenant')

  const valuePropsReveal = useScrollReveal()
  const howItWorksReveal = useScrollReveal()
  const verificationReveal = useScrollReveal()
  const faqReveal = useScrollReveal()

  return (
    <div className="min-h-screen bg-harbour-bg">
      {/* 1. Public Nav */}
      <PublicNav />

      <main>
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Trust / Stats Bar */}
        <LiveTrustTicker />

        {/* 4. Value Props */}
        <section ref={valuePropsReveal.ref} className={`mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 overflow-hidden`}>
          <h2 className={`font-display text-2xl font-semibold text-harbour-primary lg:text-3xl transition-opacity duration-700 ${valuePropsReveal.isVisible ? 'opacity-100' : 'opacity-0'}`}>
            Why VGC
          </h2>
          <motion.div
            className="mt-12 flex flex-col gap-10 lg:flex-row lg:gap-8"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
            }}
            initial="hidden"
            animate={valuePropsReveal.isVisible ? "visible" : "hidden"}
          >
            {[
              {
                num: "01",
                title: "No agent markups",
                desc: "Message landlords directly and agree on terms without middleman fees."
              },
              {
                num: "02",
                title: "Verified listings",
                desc: "Every landlord and property goes through ID and document checks before going live."
              },
              {
                num: "03",
                title: "Everything in one place",
                desc: "Track applications, messages, and inspection scheduling from your dashboard."
              }
            ].map((prop, i) => (
              <motion.div
                key={i}
                className="flex-1"
                variants={{
                  hidden: { opacity: 0, y: 60 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
                }}
              >
                <span className="font-display text-4xl font-bold text-harbour-accent">{prop.num}</span>
                <h3 className="mt-4 font-display text-lg font-semibold text-harbour-primary">
                  {prop.title}
                </h3>
                <p className="mt-2 text-harbour-text-secondary leading-relaxed">
                  {prop.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 5. How it Works */}
        <section ref={howItWorksReveal.ref} id="how-it-works" className={`bg-harbour-surface ${howItWorksReveal.className}`}>
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold text-harbour-primary lg:text-3xl">
              How it works
            </h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setActiveTab('tenant')}
                className={`min-h-[44px] w-full rounded-lg px-6 py-2.5 text-sm font-medium transition-colors sm:w-auto ${activeTab === 'tenant'
                  ? 'bg-harbour-primary text-white'
                  : 'border border-harbour-border bg-harbour-bg text-harbour-text-secondary hover:text-harbour-text'
                  }`}
              >
                I'm looking for a home
              </button>
              <button
                onClick={() => setActiveTab('landlord')}
                className={`min-h-[44px] w-full rounded-lg px-6 py-2.5 text-sm font-medium transition-colors sm:w-auto ${activeTab === 'landlord'
                  ? 'bg-harbour-primary text-white'
                  : 'border border-harbour-border bg-harbour-bg text-harbour-text-secondary hover:text-harbour-text'
                  }`}
              >
                I'm a landlord
              </button>
            </div>

            <div className="mt-10 flex flex-col gap-5">
              {activeTab === 'tenant' ? (
                <>
                  {[
                    'Browse verified listings',
                    'Message the landlord directly',
                    'Apply and schedule an inspection',
                    'Move in with confidence',
                  ].map((step, i) => (
                    <div key={i} className={`flex items-center gap-4 stagger-${i + 1}`}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-harbour-info-bg font-semibold text-harbour-primary">
                        {i + 1}
                      </div>
                      <span className="font-medium text-harbour-text">{step}</span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    'List your property for free',
                    'Get verified (ID and property documents)',
                    'Review tenant applications',
                    'Choose your tenant directly',
                  ].map((step, i) => (
                    <div key={i} className={`flex items-center gap-4 stagger-${i + 1}`}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-harbour-info-bg font-semibold text-harbour-primary">
                        {i + 1}
                      </div>
                      <span className="font-medium text-harbour-text">{step}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </section>

        {/* 6. Fraud Comparison */}
        <AnimatedComparison />

        {/* 7. Verification Spotlight */}
        <section ref={verificationReveal.ref} id="why" className={`bg-harbour-surface ${verificationReveal.className}`}>
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
              <div className="lg:w-1/2 stagger-1">
                <h2 className="font-display text-2xl font-semibold text-harbour-primary lg:text-3xl">
                  What 'Verified' means
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-harbour-text-secondary">
                  Landlords submit a government ID and property ownership or lease
                  documents. These are reviewed by our platform's team before a
                  listing ever goes live and shows the Verified badge.
                </p>
              </div>
              <div className="flex justify-center lg:w-1/2 stagger-2">
                <div className="flex h-48 w-full max-w-sm items-center justify-center rounded-2xl border border-harbour-border bg-harbour-bg p-8 shadow-sm">
                  <div className="scale-150 transform">
                    <Badge label="Verified" variant="success" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Featured Listings — real data */}
        <FeaturedListings />

        {/* 9. Neighborhoods Grid (Tornado Animation) */}
        <NeighborhoodsSection />

        {/* 10. FAQ */}
        <section ref={faqReveal.ref} id="faq" className={`bg-harbour-surface ${faqReveal.className}`}>
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
            <h2 className="text-center font-display text-2xl font-semibold text-harbour-primary lg:text-3xl stagger-1">
              Frequently asked questions
            </h2>
            <div className="mt-10 flex flex-col">
              <FAQItem
                question="Is it really free for tenants?"
                answer="Yes — browsing, messaging landlords, and applying to properties is free for tenants. We don't charge agent fees or platform commissions."
                staggerClass="stagger-2"
              />
              <FAQItem
                question="How does verification work?"
                answer="Landlords submit a government ID and property ownership or lease documents. Our team reviews these before a listing goes live with the Verified badge. This usually takes less than 24 hours."
                staggerClass="stagger-3"
              />
              <FAQItem
                question="What if a landlord doesn't respond?"
                answer="You can message multiple landlords and track all your applications from your dashboard, so you're never stuck waiting on one response."
                staggerClass="stagger-4"
              />
              <FAQItem
                question="Which cities are supported?"
                answer="We're starting in Lagos, with Lekki, Yaba, Surulere, and Ikeja live now and more areas coming soon."
                staggerClass="stagger-5"
              />
              <FAQItem
                question="How do I list my property?"
                answer="Create a landlord account, complete identity verification, then add your property details and documents. Listings go live once our team approves them — typically within 24 hours."
                staggerClass="stagger-6"
              />
            </div>
          </div>
        </section>

        {/* 11. Landlord CTA Band */}
        <section id="for-landlords" className="relative px-4 py-20 text-center bg-cover bg-center" style={{ backgroundImage: 'url(/images/cinematic/hero-aerial-dark.jpg)' }}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-semibold text-white lg:text-3xl">
              Own a property in Nigeria?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              List it for free and reach verified tenants directly — no agent fees, no middlemen.
            </p>
            <div className="mt-8">
              <Link to="/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-white text-harbour-primary hover:bg-harbour-bg border-0"
                >
                  List your property — it's free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 12. Footer */}
      <footer className="border-t border-harbour-border bg-harbour-bg py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
            {/* Brand */}
            <div className="lg:max-w-xs">
              <Logo />
              <p className="mt-4 text-sm text-harbour-text-secondary">
                Direct, verified rentals for Nigeria.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold text-harbour-text">Product</h4>
                <a href="#how-it-works" className="text-sm text-harbour-text-secondary hover:text-harbour-text">
                  How it works
                </a>
                <a href="#for-landlords" className="text-sm text-harbour-text-secondary hover:text-harbour-text">
                  For landlords
                </a>
                <a href="#why" className="text-sm text-harbour-text-secondary hover:text-harbour-text">
                  Verification
                </a>
                <a href="#faq" className="text-sm text-harbour-text-secondary hover:text-harbour-text">
                  FAQ
                </a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold text-harbour-text">Company</h4>
                <a href="#" className="text-sm text-harbour-text-secondary hover:text-harbour-text">
                  About
                </a>
                <a href="#" className="text-sm text-harbour-text-secondary hover:text-harbour-text">
                  Contact
                </a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold text-harbour-text">Legal</h4>
                <a href="#" className="text-sm text-harbour-text-secondary hover:text-harbour-text">
                  Privacy policy
                </a>
                <a href="#" className="text-sm text-harbour-text-secondary hover:text-harbour-text">
                  Terms of service
                </a>
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
