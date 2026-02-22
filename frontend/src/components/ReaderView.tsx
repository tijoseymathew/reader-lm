import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { getFileStatus } from '../api/client'
import type { FileMeta } from '../types'
import { PDFViewer } from './PDFViewer'
import { SectionPanel } from './SectionPanel'
import { AudioPlayer } from './AudioPlayer'

function needsPolling(file: FileMeta | null): boolean {
  if (!file) return false
  if (file.status === 'processing') return true
  return file.sections.some(
    (s) => s.audio_status === 'generating' || s.audio_status === 'pending'
  )
}

export function ReaderView() {
  const { activeFile, updateActiveFile } = useAppStore()
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Keep a ref to the latest activeFile so the interval callback reads fresh data
  const activeFileRef = useRef(activeFile)
  activeFileRef.current = activeFile

  useEffect(() => {
    if (!activeFile) return

    function stopPolling() {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }

    // Only start polling if needed and not already polling
    if (!needsPolling(activeFile) || pollRef.current) return

    pollRef.current = setInterval(async () => {
      const current = activeFileRef.current
      if (!current) return
      try {
        const status = await getFileStatus(current.space_id, current.id)
        const updated = {
          ...current,
          status: status.status,
          sections: status.sections.length > 0 ? status.sections : current.sections,
        }
        updateActiveFile(updated)
        if (!needsPolling(updated)) {
          stopPolling()
        }
      } catch {
        stopPolling()
      }
    }, 2000)

    return stopPolling
  }, [activeFile?.id])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <PDFViewer />
        <SectionPanel />
      </div>
      <AudioPlayer />
    </div>
  )
}
