"use client"

import type React from "react"

import { Menu, Search, Folder, ArrowLeft, FolderPlus, X, Trash2 } from "lucide-react"
import type { Screen, SavedFile, Folder as FolderType } from "../file-management-demo"
import { useState } from "react"

interface ProjectLibraryScreenProps {
  onNavigate: (screen: Screen) => void
  isSaveMode?: boolean
  onFolderSelect?: (folderId: number, folderName: string) => void
  onCancel?: () => void
  folderFiles?: { [key: number]: SavedFile[] }
  folders?: FolderType[]
  onCreateFolder?: (folderName: string) => FolderType
  onDeleteFolder?: (folderId: number) => void
}

export function ProjectLibraryScreen({
  onNavigate,
  isSaveMode = false,
  onFolderSelect,
  onCancel,
  folderFiles = {},
  folders = [],
  onCreateFolder,
  onDeleteFolder,
}: ProjectLibraryScreenProps) {
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [deleteModeFolder, setDeleteModeFolder] = useState<number | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)

  const handlePressStart = (folderId: number) => {
    const timer = setTimeout(() => {
      setDeleteModeFolder(folderId)
    }, 500) // 500ms for long press
    setLongPressTimer(timer)
  }

  const handlePressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleDeleteFolder = (folderId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDeleteFolder) {
      onDeleteFolder(folderId)
    }
    setDeleteModeFolder(null)
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim() && onCreateFolder) {
      const newFolder = onCreateFolder(newFolderName)
      setNewFolderName("")
      setShowCreateFolder(false)
      if (isSaveMode && onFolderSelect) {
        setTimeout(() => {
          onFolderSelect(newFolder.id, newFolder.name)
        }, 0)
      }
    }
  }

  const handleFolderClick = (project: { id: number; name: string }) => {
    if (deleteModeFolder === project.id) {
      setDeleteModeFolder(null)
      return
    }
    if (onFolderSelect) {
      onFolderSelect(project.id, project.name)
    }
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-purple-200 via-blue-100 to-pink-200">
      <div className="border-b border-white/50 bg-white/70 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 pt-14 pb-3">
          <button
            onClick={() => (isSaveMode && onCancel ? onCancel() : onNavigate("search-result"))}
            className="text-gray-700 hover:text-gray-900"
          >
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
        <h1 className="pb-3 text-center text-lg font-semibold text-gray-800">
          {isSaveMode ? "Save to Project" : "Project Library"}
        </h1>
      </div>

      <div className="space-y-4 p-5 pb-8">
        <div className="grid grid-cols-3 gap-3">
          {folders.map((project) => {
            const itemCount = folderFiles[project.id]?.length || 0
            const isInDeleteMode = deleteModeFolder === project.id

            return (
              <div key={project.id} className="relative">
                <button
                  onClick={() => handleFolderClick(project)}
                  onMouseDown={() => handlePressStart(project.id)}
                  onMouseUp={handlePressEnd}
                  onMouseLeave={handlePressEnd}
                  onTouchStart={() => handlePressStart(project.id)}
                  onTouchEnd={handlePressEnd}
                  className={`flex flex-col items-center gap-2 rounded-2xl bg-white/70 p-4 backdrop-blur-sm transition-all hover:bg-white/90 hover:shadow-lg active:scale-95 w-full ${
                    isInDeleteMode ? "ring-2 ring-red-400" : ""
                  }`}
                >
                  <Folder
                    className={`h-14 w-14 ${project.color}`}
                    strokeWidth={1.5}
                    fill="currentColor"
                    fillOpacity={0.3}
                  />
                  <div className="text-center w-full">
                    <p className="text-xs font-semibold text-gray-800 truncate">{project.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{itemCount} items</p>
                  </div>
                </button>

                {isInDeleteMode && (
                  <button
                    onClick={(e) => handleDeleteFolder(project.id, e)}
                    className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )
          })}

          <button
            onClick={() => setShowCreateFolder(true)}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 p-4 backdrop-blur-sm transition-all hover:bg-white/90 hover:shadow-lg active:scale-95 border-2 border-dashed border-gray-400"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200">
              <FolderPlus className="h-7 w-7 text-gray-600" strokeWidth={2} />
            </div>
            <p className="text-xs font-semibold text-gray-700">New Folder</p>
          </button>
        </div>
      </div>

      {showCreateFolder && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="mx-6 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Create New Folder</h2>
              <button onClick={() => setShowCreateFolder(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name..."
              className="mb-4 w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-sm focus:border-purple-400 focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateFolder()
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateFolder(false)}
                className="flex-1 rounded-xl bg-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex-1 rounded-xl bg-purple-600 py-3 text-sm font-medium text-white hover:bg-purple-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
