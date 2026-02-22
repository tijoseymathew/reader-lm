import { useEffect, useState } from 'react'
import { useAppStore } from './store/useAppStore'
import { getSpaces, getFile, getSettings } from './api/client'
import { Sidebar } from './components/Sidebar'
import { SpaceView } from './components/SpaceView'
import { ReaderView } from './components/ReaderView'
import { SettingsModal } from './components/SettingsModal'

export default function App() {
  const { setSpaces, activeFile, activeSpace, setActiveFile, setVoice } = useAppStore()
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    getSpaces().then(setSpaces)
    getSettings().then((s) => setVoice(s.voice))
  }, [])

  async function handleFileSelect(spaceId: string, fileId: string) {
    const file = await getFile(spaceId, fileId)
    setActiveFile(file)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100 overflow-hidden">
      {/* Top bar */}
      <div className="h-10 flex-shrink-0 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-3">
        <span className="text-sm font-semibold text-indigo-400">reader-lm</span>
        {activeSpace && (
          <>
            <span className="text-gray-600">/</span>
            <span className="text-sm text-gray-300">{activeSpace.name}</span>
          </>
        )}
        {activeFile && (
          <>
            <span className="text-gray-600">/</span>
            <span className="text-sm text-gray-400">{activeFile.name}</span>
          </>
        )}
        <div className="ml-auto">
          <button
            onClick={() => setShowSettings(true)}
            title="Settings"
            className="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onFileSelect={handleFileSelect} />
        {activeFile ? (
          <ReaderView />
        ) : (
          <SpaceView onFileSelect={handleFileSelect} />
        )}
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}
