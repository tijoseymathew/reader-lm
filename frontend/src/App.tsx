import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import { getSpaces, getFile } from './api/client'
import { Sidebar } from './components/Sidebar'
import { SpaceView } from './components/SpaceView'
import { ReaderView } from './components/ReaderView'

export default function App() {
  const { setSpaces, activeFile, activeSpace, setActiveFile } = useAppStore()

  useEffect(() => {
    getSpaces().then(setSpaces)
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
    </div>
  )
}
