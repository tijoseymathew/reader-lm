import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { getFiles, deleteFile } from '../api/client'
import type { FileMeta } from '../types'

interface Props {
  onFileSelect: (spaceId: string, fileId: string) => void
}

export function SpaceView({ onFileSelect }: Props) {
  const { activeSpace, activeFile, setActiveFile } = useAppStore()
  const [files, setFiles] = useState<FileMeta[]>([])

  useEffect(() => {
    if (!activeSpace) return
    setFiles([])
    getFiles(activeSpace.id).then(setFiles)
  }, [activeSpace])

  if (!activeSpace) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select or create a space to get started
      </div>
    )
  }

  async function handleDelete(file: FileMeta, e: React.MouseEvent) {
    e.stopPropagation()
    await deleteFile(activeSpace!.id, file.id)
    setFiles((prev) => prev.filter((f) => f.id !== file.id))
    if (activeFile?.id === file.id) setActiveFile(null)
  }

  const statusIcon = (status: FileMeta['status']) => {
    if (status === 'ready') return <span className="text-green-400">✓</span>
    if (status === 'processing') return <span className="text-yellow-400 animate-pulse">⟳</span>
    return <span className="text-red-400">✗</span>
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h2 className="text-xl font-semibold text-gray-100 mb-1">{activeSpace.name}</h2>
      {activeSpace.description && (
        <p className="text-gray-400 text-sm mb-4">{activeSpace.description}</p>
      )}

      {files.length === 0 ? (
        <p className="text-gray-500 text-sm">No files yet. Upload a PDF to get started.</p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => onFileSelect(activeSpace.id, file.id)}
              className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 rounded-lg px-4 py-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-300">📄</span>
                <div>
                  <div className="text-sm font-medium text-gray-100">{file.name}</div>
                  <div className="text-xs text-gray-400">
                    {file.page_count > 0 ? `${file.page_count} pages` : 'Processing...'}
                    {' · '}
                    {file.sections.length > 0
                      ? `${file.sections.length} sections`
                      : file.status === 'processing'
                      ? 'Parsing...'
                      : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {statusIcon(file.status)}
                <button
                  onClick={(e) => handleDelete(file, e)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
