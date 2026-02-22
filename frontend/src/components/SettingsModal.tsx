import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { getVoices, updateSettings } from '../api/client'
import type { Voice } from '../types'

interface Props {
  onClose: () => void
}

export function SettingsModal({ onClose }: Props) {
  const { voice, setVoice } = useAppStore()
  const [voices, setVoices] = useState<Voice[]>([])
  const [selected, setSelected] = useState(voice)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getVoices().then(setVoices)
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await updateSettings({ voice: selected })
      setVoice(selected)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-80 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            TTS Voice
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-100 text-sm rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1.5">
            Applies to files uploaded after saving.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
