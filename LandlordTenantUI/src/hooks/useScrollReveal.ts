import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'

/**
 * Hook to trigger a state change once when an element intersects the viewport.
 * Returns a ref to attach to the element, and the `isVisible` boolean.
 */
export function useScrollReveal(options: IntersectionObserverInit = { threshold: 0.15 }) {
  const ref = useRef<HTMLElement | HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // If reduced motion is preferred, show immediately and skip observer
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.unobserve(el)
      }
    }, options)

    observer.observe(el)

    return () => {
      if (el) observer.unobserve(el)
      observer.disconnect()
    }
  }, [options])

  // Helper class for easy spreading
  const className = clsx('reveal-hidden', isVisible && 'reveal-visible')

  return { ref, isVisible, className }
}

/**
 * Hook to animate a numeric counter from 0 to `endValue`.
 * Returns the current integer value to render.
 */
export function useAnimatedCounter(endValue: number, duration: number = 1200, startAnimating: boolean = true) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!startAnimating || endValue === 0) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(endValue)
      return
    }

    let startTime: number | null = null
    let animationFrameId: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime

      // easeOutExpo
      const easeOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
      
      const timeFraction = Math.min(progress / duration, 1)
      const currentVal = Math.floor(easeOut(timeFraction) * endValue)
      
      setValue(currentVal)

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        setValue(endValue)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrameId)
  }, [endValue, duration, startAnimating])

  return value
}
