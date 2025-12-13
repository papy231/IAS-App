"use client"

import { Menu, FileText, FileVideo, ImageIcon, File, ArrowLeft } from "lucide-react"
import type { Screen } from "../file-management-demo"

interface SearchResultScreenProps {
  onNavigate: (screen: Screen) => void
  onFileSelect: (index: number) => void
}

export const fileResults = [
  {
    id: 0,
    icon: "FileVideo",
    label: "Video 1",
    type: "mp4",
    color: "bg-purple-100",
    description: "A creative video project about modern design techniques and workflows",
  },
  {
    id: 1,
    icon: "ImageIcon",
    label: "Image 1",
    type: "jpg",
    color: "bg-blue-100",
    description: "High-resolution photograph capturing the essence of natural lighting",
  },
  {
    id: 2,
    icon: "FileText",
    label: "Doc 1",
    type: "pdf",
    color: "bg-red-100",
    description: "An Essay about Fireflies from Robert Dwayne",
  },
  {
    id: 3,
    icon: "FileText",
    label: "Doc 2",
    type: "pdf",
    color: "bg-red-100",
    description: "Research paper on sustainable architecture and urban planning",
  },
  {
    id: 4,
    icon: "FileText",
    label: "Sheet",
    type: "xlsx",
    color: "bg-green-100",
    description: "Financial analysis spreadsheet with quarterly projections",
  },
  {
    id: 5,
    icon: "ImageIcon",
    label: "Image 2",
    type: "png",
    color: "bg-blue-100",
    description: "Digital illustration showcasing minimalist design principles",
  },
  {
    id: 6,
    icon: "FileText",
    label: "Doc 3",
    type: "pdf",
    color: "bg-red-100",
    description: "Comprehensive guide to creative writing and storytelling",
  },
  {
    id: 7,
    icon: "FileVideo",
    label: "Video 2",
    type: "mp4",
    color: "bg-purple-100",
    description: "Documentary footage exploring cultural heritage and traditions",
  },
  {
    id: 8,
    icon: "ImageIcon",
    label: "Image 3",
    type: "jpg",
    color: "bg-blue-100",
    description: "Artistic photography series on geometric patterns in nature",
  },
  {
    id: 9,
    icon: "FileText",
    label: "Doc 4",
    type: "pdf",
    color: "bg-red-100",
    description: "Technical documentation for software development best practices",
  },
  {
    id: 10,
    icon: "FileVideo",
    label: "Video 3",
    type: "mp4",
    color: "bg-purple-100",
    description: "Animation project featuring motion graphics and visual effects",
  },
  {
    id: 11,
    icon: "FileText",
    label: "Sheet 2",
    type: "xlsx",
    color: "bg-green-100",
    description: "Project management timeline with resource allocation details",
  },
  {
    id: 12,
    icon: "FileText",
    label: "Doc 5",
    type: "pdf",
    color: "bg-red-100",
    description: "Marketing strategy proposal for digital product launch",
  },
  {
    id: 13,
    icon: "File",
    label: "File",
    type: "doc",
    color: "bg-gray-100",
    description: "Meeting notes and action items from quarterly review",
  },
  {
    id: 14,
    icon: "ImageIcon",
    label: "Image 4",
    type: "png",
    color: "bg-blue-100",
    description: "User interface mockup for mobile application redesign",
  },
]

export function SearchResultScreen({ onNavigate, onFileSelect }: SearchResultScreenProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "FileVideo":
        return FileVideo
      case "ImageIcon":
        return ImageIcon
      case "FileText":
        return FileText
      default:
        return File
    }
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-purple-200 via-blue-100 to-pink-200 flex flex-col">
      <div className="pt-14 px-4 pb-3 bg-white/70 backdrop-blur-md border-b border-white/50">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => onNavigate("side-menu")} className="text-gray-700 hover:text-gray-900">
            <Menu className="h-7 w-7" />
          </button>

          <div className="flex gap-4">
            <button onClick={() => onNavigate("reset-search")} className="flex flex-col items-center gap-1">
              <div className="w-5 h-5 bg-gray-700 rotate-45" />
              <span className="text-[10px] text-gray-700">Start</span>
            </button>
            <button onClick={() => onNavigate("quick-modify")} className="flex flex-col items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-gray-700" />
              <span className="text-[10px] text-gray-700">Modify</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="w-5 h-5 bg-blue-600" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
              <span className="text-[10px] text-blue-600 font-semibold">Result</span>
            </button>
          </div>
        </div>

        <div className="text-center">
          <span className="text-lg font-medium text-gray-800">Search Result</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3 p-4 pb-24">
          {fileResults.map((file, index) => {
            const Icon = getIcon(file.icon)
            return (
              <button
                key={index}
                onClick={() => onFileSelect(index)}
                className="flex flex-col items-center gap-2 rounded-xl bg-white/70 p-3 backdrop-blur-sm transition-all hover:bg-white/90 hover:shadow-lg active:scale-95"
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-lg ${file.color}`}>
                  <Icon className="h-8 w-8 text-gray-700" strokeWidth={2} />
                </div>
                <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wide">{file.type}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="absolute bottom-8 left-5">
        <button
          onClick={() => onNavigate("search")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-500/80 text-white backdrop-blur-sm shadow-lg hover:bg-gray-600/80 active:scale-95 transition-all"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
