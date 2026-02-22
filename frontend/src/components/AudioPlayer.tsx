import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { getAudioUrl } from '../api/client'

export function AudioPlayer() {
  const { activeFile, activeSection, isPlaying, setIsPlaying } = useAppStore()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioUrl =
    activeFile && activeSection && activeSection.audio_status === 'ready'
      ? getAudioUrl(activeFile.space_id, activeFile.id, activeSection.id)
      : null

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (audioUrl) {
      audio.src = audioUrl
      audio.load()
      if (isPlaying) {
        audio.play().catch(() => setIsPlaying(false))
      }
    } else {
      audio.pause()
      audio.src = ''
    }
    setCurrentTime(0)
    setDuration(0)
  }, [audioUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying])

  function fmt(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const title =
    activeSection?.headings.length
      ? activeSection.headings[activeSection.headings.length - 1]
      : activeSection?.label ?? 'No section selected'

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!activeSection) {
    return (
      <div className="h-14 bg-gray-900 border-t border-gray-700 flex items-center justify-center">
        <span className="text-gray-500 text-sm">Select a section to play audio</span>
      </div>
    )
  }

  return (
    <div className="h-14 bg-gray-900 border-t border-gray-700 flex items-center gap-4 px-4">
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setIsPlaying(false)}
      />

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        disabled={!audioUrl}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm flex-shrink-0"
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      <div className="flex-1 flex items-center gap-3 min-w-0">
        <span className="text-xs text-gray-400 w-10 text-right flex-shrink-0">{fmt(currentTime)}</span>
        <div
          className="flex-1 h-1.5 bg-gray-700 rounded-full cursor-pointer relative"
          onClick={(e) => {
            if (!audioRef.current || !duration) return
            const rect = e.currentTarget.getBoundingClientRect()
            const ratio = (e.clientX - rect.left) / rect.width
            audioRef.current.currentTime = ratio * duration
          }}
        >
          <div
            className="h-full bg-indigo-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 w-10 flex-shrink-0">{fmt(duration)}</span>
      </div>

      <div className="flex-shrink-0 max-w-xs truncate">
        <span className="text-xs text-gray-300 truncate">
          {activeSection.audio_status === 'generating' && (
            <span className="text-yellow-400 mr-2">Generating...</span>
          )}
          {activeSection.audio_status === 'pending' && (
            <span className="text-gray-500 mr-2">Pending</span>
          )}
          {activeSection.audio_status === 'error' && (
            <span className="text-red-400 mr-2">Error</span>
          )}
          {title}
        </span>
      </div>
    </div>
  )
}
