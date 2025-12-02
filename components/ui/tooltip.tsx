"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

type TooltipContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

function TooltipProvider({
  children,
  delayDuration = 0,
}: React.PropsWithChildren<{ delayDuration?: number }>) {
  const [open, setOpen] = React.useState(false)
  const timeoutRef = React.useRef<number>()
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  const setWithDelay = React.useCallback(
    (next: boolean) => {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setOpen(next), delayDuration)
    },
    [delayDuration]
  )

  React.useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current)
  }, [])

  return (
    <TooltipContext.Provider value={{ open, setOpen: setWithDelay, triggerRef }}>
      <div className="relative inline-flex items-center gap-1">{children}</div>
    </TooltipContext.Provider>
  )
}

function Tooltip({ children }: React.PropsWithChildren) {
  return <TooltipProvider>{children}</TooltipProvider>
}

function TooltipTrigger({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(TooltipContext)
  if (!ctx) throw new Error("TooltipTrigger must be used within Tooltip")

  return (
    <button
      type="button"
      data-slot="tooltip-trigger"
      className={cn(
        "text-foreground/70 hover:text-foreground inline-flex items-center justify-center rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[11px] font-semibold leading-none shadow-sm shadow-black/30 transition hover:border-white/25 hover:bg-black/50",
        className
      )}
      onMouseEnter={() => ctx.setOpen(true)}
      onMouseLeave={() => ctx.setOpen(false)}
      onFocus={() => ctx.setOpen(true)}
      onBlur={() => ctx.setOpen(false)}
      ref={ctx.triggerRef}
      {...props}
    >
      {children}
    </button>
  )
}

function TooltipContent({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(TooltipContext)
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(
    null
  )
  const [portalEl, setPortalEl] = React.useState<HTMLElement | null>(null)

  React.useLayoutEffect(() => {
    if (typeof document === "undefined") return
    const existing =
      (document.getElementById("ui-tooltip-portal") as HTMLElement | null) ?? undefined
    const el = existing ?? document.createElement("div")
    if (!existing) {
      el.id = "ui-tooltip-portal"
      Object.assign(el.style, {
        position: "fixed",
        inset: "0px",
        pointerEvents: "none",
        zIndex: "2147483647",
      })
      document.body.appendChild(el)
    }
    setPortalEl(el)
  }, [])

  React.useLayoutEffect(() => {
    if (!ctx?.open) return
    const updatePosition = () => {
      const el = ctx.triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      })
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [ctx?.open, ctx?.triggerRef])

  if (!ctx?.open || !position || !portalEl) return null

  return createPortal(
    <div
      data-slot="tooltip-content"
      className={cn(
        "bg-foreground text-background rounded-md px-3 py-2 text-xs leading-relaxed shadow-lg shadow-black/40 pointer-events-none text-left",
        "absolute -translate-y-1/2 animate-in fade-in-0 zoom-in-95",
        className
      )}
      role="tooltip"
      style={{
        whiteSpace: "nowrap",
        top: position.top,
        left: position.left,
      }}
    >
      {children}
    </div>,
    portalEl
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
