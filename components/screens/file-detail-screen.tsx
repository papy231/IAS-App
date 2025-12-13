"use client"

import { Trash2, Heart, Download, ChevronLeft, ChevronRight } from "lucide-react"
import type { Screen } from "../file-management-demo"
import { fileResults } from "./search-result-screen"
import { useState } from "react"

interface FileDetailScreenProps {
  onNavigate: (screen: Screen) => void
  fileIndex: number
  onFileIndexChange: (index: number) => void
  onSave: () => void
}

export function FileDetailScreen({ onNavigate, fileIndex, onFileIndexChange, onSave }: FileDetailScreenProps) {
  const [isLiked, setIsLiked] = useState(false)
  const currentFile = fileResults[fileIndex]

  const handlePrevious = () => {
    if (fileIndex > 0) {
      onFileIndexChange(fileIndex - 1)
    }
  }

  const handleNext = () => {
    if (fileIndex < fileResults.length - 1) {
      onFileIndexChange(fileIndex + 1)
    }
  }

  const renderFileIcon = () => {
    const iconSize = 180
    const commonProps = {
      width: iconSize,
      height: iconSize,
      viewBox: "0 0 180 180",
    }

    if (currentFile.type === "pdf") {
      return (
        <svg {...commonProps}>
          <rect x="35" y="30" width="110" height="120" fill="white" stroke="black" strokeWidth="3" rx="4" />
          <path d="M35 30 L115 30 L145 60 L145 150 L35 150 Z" fill="white" stroke="black" strokeWidth="3" />
          <line x1="115" y1="30" x2="115" y2="60" stroke="black" strokeWidth="3" />
          <line x1="115" y1="60" x2="145" y2="60" stroke="black" strokeWidth="3" />
          <text x="90" y="105" fontSize="32" fontWeight="bold" textAnchor="middle" fill="black">
            PDF
          </text>
        </svg>
      )
    } else if (currentFile.type === "mp4") {
      return (
        <svg {...commonProps}>
          <rect x="35" y="30" width="110" height="120" fill="black" rx="4" />
          <rect x="45" y="40" width="90" height="45" fill="white" rx="2" />
          <line x1="55" y1="52" x2="125" y2="52" stroke="black" strokeWidth="2.5" />
          <line x1="55" y1="62" x2="125" y2="62" stroke="black" strokeWidth="2.5" />
          <line x1="55" y1="72" x2="125" y2="72" stroke="black" strokeWidth="2.5" />
          <text x="90" y="120" fontSize="28" fontWeight="bold" textAnchor="middle" fill="white">
            MP4
          </text>
        </svg>
      )
    } else if (currentFile.type === "xlsx") {
      return (
        <svg {...commonProps}>
          <rect x="35" y="30" width="110" height="120" fill="white" stroke="black" strokeWidth="3" rx="4" />
          <path d="M35 30 L115 30 L145 60 L145 150 L35 150 Z" fill="white" stroke="black" strokeWidth="3" />
          <line x1="115" y1="30" x2="115" y2="60" stroke="black" strokeWidth="3" />
          <line x1="115" y1="60" x2="145" y2="60" stroke="black" strokeWidth="3" />
          <rect x="55" y="70" width="70" height="60" fill="none" stroke="black" strokeWidth="2" />
          <line x1="55" y1="90" x2="125" y2="90" stroke="black" strokeWidth="2" />
          <line x1="55" y1="110" x2="125" y2="110" stroke="black" strokeWidth="2" />
          <line x1="78" y1="70" x2="78" y2="130" stroke="black" strokeWidth="2" />
          <line x1="102" y1="70" x2="102" y2="130" stroke="black" strokeWidth="2" />
          <text x="90" y="148" fontSize="16" fontWeight="bold" textAnchor="middle" fill="black">
            XLSX
          </text>
        </svg>
      )
    } else {
      return (
        <svg {...commonProps}>
          <rect x="35" y="30" width="110" height="120" fill="#555" rx="4" />
          <rect x="45" y="45" width="90" height="60" fill="#888" rx="2" />
          <circle cx="65" cy="62" r="8" fill="white" />
          <path d="M55 90 L75 70 L95 85 L125 60 L125 95 L55 95 Z" fill="white" />
        </svg>
      )
    }
  }

  return (
    <div className="relative h-full bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <button className="p-2" onClick={() => onNavigate("side-menu")}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <button className="p-2" onClick={() => onNavigate("search")}>
          <div className="flex items-center gap-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </button>
      </div>

      <div className="flex flex-col items-center px-6 pt-8">
        <div className="mb-8 flex items-center justify-center">{renderFileIcon()}</div>

        {/* Action Buttons */}
        <div className="mb-8 flex items-center gap-8">
          <button className="p-3 hover:opacity-70" onClick={() => console.log("[v0] Delete file")}>
            <Trash2 className="h-8 w-8 text-gray-700" strokeWidth={2} />
          </button>
          <button className="p-3 hover:opacity-70" onClick={() => setIsLiked(!isLiked)}>
            <Heart className="h-8 w-8 text-gray-700" strokeWidth={2} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button className="p-3 hover:opacity-70" onClick={onSave}>
            <Download className="h-8 w-8 text-gray-700" strokeWidth={2} />
          </button>
        </div>

        {/* Description Box */}
        <div className="w-full rounded-3xl border-2 border-gray-300 bg-white/50 p-6 mb-6">
          <p className="text-base text-gray-400">{currentFile.description}</p>
        </div>

        <div className="flex items-center gap-4 mb-4">
          {fileIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div className="text-sm text-gray-500 min-w-[60px] text-center">
            {fileIndex + 1} / {fileResults.length}
          </div>

          {fileIndex < fileResults.length - 1 && (
            <button
              onClick={handleNext}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <button
        onClick={() => onNavigate("search-result")}
        className="absolute bottom-8 left-8 flex h-12 w-12 items-center justify-center rounded-full bg-gray-400 text-white hover:bg-gray-500"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
    </div>
  )
}
