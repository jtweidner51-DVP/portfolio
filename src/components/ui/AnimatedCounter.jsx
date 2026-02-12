import { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

function AnimatedCounter({ value, prefix = '', suffix = '', duration = 2000, trigger = false }) {
  const [display, setDisplay] = useState(0)
  const reducedMotion = useReducedMotion()
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!trigger || hasAnimated.current) return
    hasAnimated.current = true

    if (reducedMotion) {
      setDisplay(value)
      return
    }

    const startTime = performance.now()

    function animate(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [trigger, value, duration, reducedMotion])

  return <>{prefix}{display}{suffix}</>
}

export default AnimatedCounter
