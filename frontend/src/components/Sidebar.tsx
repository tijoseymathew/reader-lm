import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { createSpace, deleteSpace, getFiles, uploadFile } from '../api/client'
import type { Space } from '../types'

interface Props {
  onFileSelect: (spaceId: string, fileId: string) => void
}

export function Sidebar({ onFileSelect }: Props) {
  const { spaces, activeSpace, addSpace, removeSpace, setActiveSpace } = useAppStore()
  const [newSpaceName, setNewSpaceName] = useState('')
  const [showNewSpace, setShowNewSpace] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleCreateSpace() {
    if (!newSpaceName.trim()) return
    const space = await createSpace(newSpaceName.trim(), '')
    addSpace(space)
    setNewSpaceName('')
    setShowNewSpace(false)
    setActiveSpace(space)
  }

  async function handleDeleteSpace(space: Space, e: React.MouseEvent) {
    e.stopPropagation()
    await deleteSpace(space.id)
    removeSpace(space.id)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!activeSpace || !e.target.files?.[0]) return
    setUploading(true)
    try {
      const file = await uploadFile(activeSpace.id, e.target.files[0])
      onFileSelect(activeSpace.id, file.id)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="w-56 flex-shrink-0 bg-gray-900 text-gray-100 flex flex-col h-full border-r border-gray-700">
      <div className="p-3 border-b border-gray-700">
        <span className="font-bold text-sm tracking-wide text-indigo-400">reader-lm</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">
          Spaces
        </div>

        {spaces.map((space) => (
          <div
            key={space.id}
            onClick={() => setActiveSpace(space)}
            className={`flex items-center justify-between rounded px-2 py-1.5 cursor-pointer text-sm mb-0.5 group ${
              activeSpace?.id === space.id
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-gray-700 text-gray-300'
            }`}
          >
            <span className="truncate">{space.name}</span>
            <button
              onClick={(e) => handleDeleteSpace(space, e)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 text-xs ml-1"
            >
              ✕
            </button>
          </div>
        ))}

        {showNewSpace ? (
          <div className="mt-1">
            <input
              autoFocus
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateSpace()
                if (e.key === 'Escape') setShowNewSpace(false)
              }}
              placeholder="Space name..."
              className="w-full bg-gray-800 text-gray-100 text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-1 mt-1">
              <button
                onClick={handleCreateSpace}
                className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded py-1"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewSpace(false)}
                className="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewSpace(true)}
            className="w-full text-left text-xs text-gray-500 hover:text-gray-300 px-2 py-1.5 rounded hover:bg-gray-700 mt-1"
          >
            + New Space
          </button>
        )}

        {activeSpace && (
          <div className="mt-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">
              Upload PDF
            </div>
            <label className={`block w-full text-center text-xs rounded py-1.5 cursor-pointer ${
              uploading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-700 hover:bg-indigo-600 text-white'
            }`}>
              {uploading ? 'Uploading...' : '+ Upload PDF'}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
