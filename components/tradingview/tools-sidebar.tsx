"use client"

import * as React from "react"
import {
  ArrowUpRight,
  Crosshair,
  Eraser,
  GitBranch,
  Magnet,
  MousePointer2,
  PenTool,
  Ruler,
  Triangle,
  Type,
} from "lucide-react"

import { cn } from "@/lib/utils"

const TOOLS = [
  { id: "cursor", icon: MousePointer2, label: "Cursor" },
  { id: "cross", icon: Crosshair, label: "Crosshair" },
  { id: "trend", icon: ArrowUpRight, label: "Trend Line" },
  { id: "fib", icon: GitBranch, label: "Fib Retracement" },
  { id: "draw", icon: PenTool, label: "Brush" },
  { id: "shapes", icon: Triangle, label: "Shapes" },
  { id: "text", icon: Type, label: "Text" },
  { id: "ruler", icon: Ruler, label: "Measure" },
  { id: "magnet", icon: Magnet, label: "Magnet" },
  { id: "erase", icon: Eraser, label: "Remove" },
]

export function ToolsSidebar() {
  const [active, setActive] = React.useState("cross")
  return (
    <div className="flex h-full w-10 flex-col items-center gap-1 border-r border-[#2a2e39] bg-[#131722] py-2">
      {TOOLS.map((t) => {
        const Icon = t.icon
        return (
          <button
            key={t.id}
            title={t.label}
            onClick={() => setActive(t.id)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded text-[#9598a1] hover:bg-[#2a2e39] hover:text-white",
              active === t.id && "bg-[#2a2e39] text-white"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
