"use client"

import { useEffect, useRef, useState } from "react"

type StaggerFrom = "first" | "last" | "center" | number

interface LetterSwapTransition {
  duration?: number
  easing?: string
}

interface TextProps {
  label: string
  reverse?: boolean
  transition?: LetterSwapTransition
  staggerDuration?: number
  staggerFrom?: StaggerFrom
  className?: string
  onClick?: () => void
}

const LetterSwapForward = ({
  label,
  reverse = true,
  transition = {
    duration: 0.7,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  staggerDuration = 0.03,
  staggerFrom = "first",
  className,
  onClick,
  ...props
}: TextProps) => {
  const scopeRef = useRef<HTMLSpanElement | null>(null)
  const [blocked, setBlocked] = useState(false)
  const timeoutRef = useRef<Array<ReturnType<typeof setTimeout>>>([])

  useEffect(() => {
    return () => {
      timeoutRef.current.forEach((timer) => clearTimeout(timer))
      timeoutRef.current = []
    }
  }, [])

  const easing = transition?.easing ?? "cubic-bezier(0.22, 1, 0.36, 1)"
  const durationMs = Math.max(0, (transition?.duration ?? 0.7) * 1000)

  const buildDelayMap = (count: number, from: StaggerFrom, step: number) => {
    const indexes = Array.from({ length: count }, (_, i) => i)
    if (typeof from === "number") {
      const pivot = from
      indexes.sort((a, b) => {
        const diff = Math.abs(a - pivot) - Math.abs(b - pivot)
        return diff === 0 ? a - b : diff
      })
    } else if (from === "last") {
      indexes.reverse()
    } else if (from === "center") {
      const center = (count - 1) / 2
      indexes.sort((a, b) => {
        const diff = Math.abs(a - center) - Math.abs(b - center)
        return diff === 0 ? a - b : diff
      })
    }

    const delays = new Array<number>(count).fill(0)
    indexes.forEach((index, order) => {
      delays[index] = order * step * 1000
    })
    return delays
  }

  const scheduleTimeout = (cb: () => void, delay: number) => {
    const timer = setTimeout(cb, delay)
    timeoutRef.current.push(timer)
    return timer
  }

  const hoverStart = () => {
    if (blocked) return

    setBlocked(true)
    const scope = scopeRef.current
    if (!scope) {
      setBlocked(false)
      return
    }

    const letters = scope.querySelectorAll<HTMLElement>(".letter")
    const secondaries = scope.querySelectorAll<HTMLElement>(".letter-secondary")
    const delays = buildDelayMap(letters.length, staggerFrom, staggerDuration)
    const targetPrimary = reverse ? "100%" : "-100%"
    const targetSecondary = reverse ? "-100%" : "100%"

    letters.forEach((letter, index) => {
      const delay = delays[index] ?? 0
      scheduleTimeout(() => {
        const animation = letter.animate(
          [
            { transform: "translateY(0%)" },
            { transform: `translateY(${targetPrimary})` },
          ],
          { duration: durationMs, easing, fill: "forwards" }
        )
        animation.finished.finally(() => {
          letter.style.transform = "translateY(0%)"
        })
      }, delay)
    })

    secondaries.forEach((letter, index) => {
      const delay = delays[index] ?? 0
      scheduleTimeout(() => {
        const animation = letter.animate(
          [
            { transform: `translateY(${targetSecondary})` },
            { transform: "translateY(0%)" },
          ],
          { duration: durationMs, easing, fill: "forwards" }
        )
        animation.finished.finally(() => {
          letter.style.transform = `translateY(${targetSecondary})`
        })
      }, delay)
    })

    const totalDelay = Math.max(0, ...delays)
    scheduleTimeout(() => setBlocked(false), totalDelay + durationMs + 20)
  }

  return (
    <span
      className={`flex justify-center items-center relative overflow-hidden  ${className} `}
      onMouseEnter={hoverStart}
      onClick={onClick}
      ref={scopeRef}
      {...props}
    >
      <span className="sr-only">{label}</span>

      {label.split("").map((letter: string, i: number) => {
        return (
          <span
            className="whitespace-pre relative flex"
            key={i}
            aria-hidden={true}
          >
            <span className={`relative letter`} style={{ transform: "translateY(0%)" }}>
              {letter}
            </span>
            <span
              className="absolute letter-secondary "
              style={{ transform: `translateY(${reverse ? "-100%" : "100%"})` }}
            >
              {letter}
            </span>
          </span>
        )
      })}
    </span>
  )
}

export default LetterSwapForward
