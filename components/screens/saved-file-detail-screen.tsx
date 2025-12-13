"use client"

import { ArrowLeft, Share2, ImageIcon } from "lucide-react"
import type { Screen, SavedFile } from "../file-management-demo"

interface SavedFileDetailScreenProps {
  onNavigate: (screen: Screen) => void
  file: SavedFile | null
  folderName: string
  onDelete?: (fileId: number) => void
}

export function SavedFileDetailScreen({ onNavigate, file, folderName, onDelete }: SavedFileDetailScreenProps) {
  const handleDelete = () => {
    if (file && onDelete) {
      onDelete(file.id)
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return (
          <div className="flex h-56 w-44 flex-col items-center justify-center rounded-xl border-4 border-black bg-white shadow-2xl">
            <div className="mb-2 h-20 w-32 rounded bg-white border-2 border-black flex items-center justify-center">
              <div className="text-xs font-bold">📄</div>
            </div>
            <div className="text-4xl font-bold">PDF</div>
          </div>
        )
      case "MP4":
        return (
          <div className="flex h-56 w-44 flex-col items-center justify-center rounded-xl bg-black text-white shadow-2xl">
            <div className="mb-4 h-20 w-36 rounded bg-white">
              <div className="flex flex-col gap-2 p-3">
                <div className="h-2 w-full bg-black rounded" />
                <div className="h-2 w-full bg-black rounded" />
                <div className="h-2 w-full bg-black rounded" />
              </div>
            </div>
            <div className="text-4xl font-bold">MP4</div>
          </div>
        )
      case "XLSX":
        return (
          <div className="flex h-56 w-44 flex-col items-center justify-center rounded-xl border-4 border-black bg-white shadow-2xl">
            <div className="mb-4 grid grid-cols-4 gap-1">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="h-2 w-2 bg-black" />
              ))}
            </div>
            <div className="text-3xl font-bold">XLSX</div>
          </div>
        )
      case "Image":
        return (
          <div className="flex h-56 w-44 items-center justify-center rounded-xl bg-gray-700 shadow-2xl">
            <ImageIcon className="h-24 w-24 text-white" strokeWidth={1.5} />
          </div>
        )
      default:
        return <div className="h-56 w-44 rounded-xl bg-gray-300 shadow-2xl" />
    }
  }

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <p className="text-gray-400">No file selected</p>
      </div>
    )
  }

  return (
    <div className="relative h-full bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100">
      {/* Header with Project Name and Folder Icon */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-gray-600">Project Name</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-500"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">{file.name}</p>
        <p className="text-xs text-gray-400">{file.savedDate}</p>
      </div>

      {/* File Preview */}
      <div className="flex justify-center px-5 pt-6 pb-8">
        <div className="relative">
          {getFileIcon(file.type)}
          {/* Crosshatch pattern background */}
          <div
            className="absolute inset-0 -z-10 opacity-10 rounded-xl"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #ccc 0, #ccc 1px, transparent 0, transparent 50%), 
                              repeating-linear-gradient(-45deg, #ccc 0, #ccc 1px, transparent 0, transparent 50%)`,
              backgroundSize: "10px 10px",
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6 px-5 pb-6">
        <button className="flex-1 max-w-[140px] rounded-xl bg-gray-200/80 backdrop-blur-sm px-8 py-3 text-sm font-medium text-gray-800 hover:bg-gray-300 border border-gray-300">
          Modify
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 max-w-[140px] rounded-xl bg-gray-800 px-8 py-3 text-sm font-medium text-white hover:bg-black"
        >
          Delete
        </button>
      </div>

      {/* Abstract Box */}
      <div className="px-5 pb-6">
        <div className="rounded-3xl border-2 border-gray-300 bg-white/60 backdrop-blur-sm p-6 min-h-[120px]">
          <p className="text-sm text-gray-500 mb-2">Abstract</p>
          <p className="text-sm text-gray-700">{file.description}</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-8 left-5 right-5 flex items-center justify-between">
        <button
          onClick={() => onNavigate("folder-contents")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-400 text-white hover:bg-gray-500 shadow-lg"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-gray-300 hover:bg-gray-50 shadow-md">
          <Share2 className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  )
}
