"use client"

import { Menu, Search, FolderOpen, ArrowLeft, ImageIcon } from "lucide-react"
import type { Screen, SavedFile } from "../file-management-demo"

interface FolderContentsScreenProps {
  onNavigate: (screen: Screen) => void
  folderId: number | null
  folderName: string
  files: SavedFile[]
  onFileSelect: (file: SavedFile) => void
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "PDF":
      return (
        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-black bg-white">
          <div className="text-xs font-bold">PDF</div>
        </div>
      )
    case "MP4":
      return (
        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-black text-white">
          <div className="mb-1 h-6 w-10 rounded bg-white" />
          <div className="text-[10px] font-bold">MP4</div>
        </div>
      )
    case "XLSX":
      return (
        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-black bg-white">
          <div className="mb-1 grid grid-cols-3 gap-0.5">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-1 w-1 bg-black" />
            ))}
          </div>
          <div className="text-[9px] font-bold">XLSX</div>
        </div>
      )
    case "Image":
      return (
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-600">
          <ImageIcon className="h-8 w-8 text-white" strokeWidth={1.5} />
        </div>
      )
    default:
      return <div className="h-16 w-16 rounded-lg bg-gray-300" />
  }
}

export function FolderContentsScreen({
  onNavigate,
  folderId,
  folderName,
  files,
  onFileSelect,
}: FolderContentsScreenProps) {
  const isEmpty = files.length === 0

  return (
    <div className="h-full w-full bg-gradient-to-br from-purple-200 via-blue-100 to-pink-200">
      <div className="border-b border-white/50 bg-white/70 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 pt-14 pb-3">
          <button onClick={() => onNavigate("project-library")} className="text-gray-700 hover:text-gray-900">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex gap-3">
            <button onClick={() => onNavigate("side-menu")} className="text-gray-700 hover:text-gray-900">
              <Menu className="h-5 w-5" />
            </button>
            <button className="text-gray-700 hover:text-gray-900">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="pb-3 flex items-center justify-center gap-2">
          <h1 className="text-lg font-semibold text-gray-800">{folderName}</h1>
          <FolderOpen className="h-5 w-5 text-gray-600" />
        </div>
      </div>

      <div className="space-y-4 p-5 pb-32">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <FolderOpen className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-sm">This folder is empty</p>
            <p className="text-gray-400 text-xs mt-2">Save files from search results to add them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => onFileSelect(file)}
                className={`relative flex flex-col items-center gap-2 rounded-2xl p-4 backdrop-blur-sm transition-all hover:shadow-lg active:scale-95 ${
                  file.isNew
                    ? "bg-green-100/90 hover:bg-green-200/90 border-2 border-green-400"
                    : "bg-white/70 hover:bg-white/90"
                }`}
              >
                {file.isNew && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md">
                    NEW
                  </div>
                )}
                {getFileIcon(file.type)}
                <p className="text-[10px] font-medium text-gray-700 text-center truncate w-full">{file.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Abstract text box at bottom */}
      <div className="absolute bottom-8 left-5 right-5">
        <div className="rounded-3xl border-2 border-gray-300 bg-white/70 backdrop-blur-sm p-4">
          <p className="text-sm text-gray-400">Abstract</p>
        </div>
      </div>
    </div>
  )
}
