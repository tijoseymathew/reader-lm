import { useAppStore } from '../store/useAppStore'
import type { Section } from '../types'

export function SectionPanel() {
  const { activeFile, currentPage, activeSection, setActiveSection, setIsPlaying } =
    useAppStore()

  if (!activeFile) return null

  const sections = activeFile.sections

  // Show sections that include the current page, or all if none match
  const pageSections = sections.filter((s) => s.page_nos.includes(currentPage))
  const displaySections = pageSections.length > 0 ? pageSections : sections

  function handleSelect(section: Section) {
    setActiveSection(section)
    if (section.audio_status === 'ready') {
      setIsPlaying(true)
    }
  }

  const statusBadge = (status: Section['audio_status']) => {
    const base = 'text-xs px-1.5 py-0.5 rounded-full font-medium'
    if (status === 'ready') return <span className={`${base} bg-green-900 text-green-300`}>ready</span>
    if (status === 'generating') return <span className={`${base} bg-yellow-900 text-yellow-300 animate-pulse`}>gen…</span>
    if (status === 'error') return <span className={`${base} bg-red-900 text-red-300`}>error</span>
    return <span className={`${base} bg-gray-700 text-gray-400`}>pending</span>
  }

  return (
    <div className="w-64 flex-shrink-0 bg-gray-850 border-l border-gray-700 flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-gray-700">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Sections — Page {currentPage}
        </span>
        <div className="text-xs text-gray-500 mt-0.5">{sections.length} total</div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {displaySections.length === 0 && (
          <div className="text-xs text-gray-500 px-2 py-4 text-center">
            {activeFile.status === 'processing' ? 'Processing PDF...' : 'No sections'}
          </div>
        )}

        {displaySections.map((section) => (
          <div
            key={section.id}
            onClick={() => handleSelect(section)}
            className={`rounded-lg px-3 py-2 cursor-pointer text-xs group ${
              activeSection?.id === section.id
                ? 'bg-indigo-700 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">▶</span>
                <span className="font-medium truncate max-w-[120px]">
                  {section.headings.length > 0
                    ? section.headings[section.headings.length - 1]
                    : section.label}
                </span>
              </div>
              {statusBadge(section.audio_status)}
            </div>
            <div className="text-gray-400 text-xs leading-relaxed line-clamp-2">
              {section.text.slice(0, 80)}
              {section.text.length > 80 ? '…' : ''}
            </div>
            {section.page_nos.length > 0 && (
              <div className="text-gray-500 text-xs mt-1">
                p.{section.page_nos.join('–')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
