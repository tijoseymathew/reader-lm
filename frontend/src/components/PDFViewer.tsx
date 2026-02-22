import { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useAppStore } from '../store/useAppStore'
import { getPdfUrl } from '../api/client'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export function PDFViewer() {
  const { activeFile, activeSection, currentPage, setCurrentPage } = useAppStore()
  const [numPages, setNumPages] = useState(0)
  const [containerWidth, setContainerWidth] = useState(600)

  const pdfUrl = activeFile ? getPdfUrl(activeFile.space_id, activeFile.id) : null

  // When active section changes, navigate to its first page
  useEffect(() => {
    if (activeSection && activeSection.page_nos.length > 0) {
      setCurrentPage(activeSection.page_nos[0])
    }
  }, [activeSection])

  useEffect(() => {
    setNumPages(0)
    setCurrentPage(1)
  }, [activeFile?.id])

  if (!activeFile || !pdfUrl) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950">
        <span>Select a file to view</span>
      </div>
    )
  }

  if (activeFile.status === 'processing') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-950 gap-3">
        <div className="text-3xl animate-spin">⟳</div>
        <span>Processing PDF…</span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden">
      {/* PDF canvas area */}
      <div
        className="flex-1 overflow-auto flex justify-center p-4"
        ref={(el) => {
          if (el) setContainerWidth(el.clientWidth - 32)
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="flex items-center justify-center text-gray-500 mt-20">
              Loading PDF…
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            width={Math.min(containerWidth, 900)}
            renderTextLayer
            renderAnnotationLayer
          />
        </Document>
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-center gap-4 py-2 border-t border-gray-700 bg-gray-900">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-gray-200 rounded"
        >
          ←
        </button>
        <span className="text-sm text-gray-300">
          Page {currentPage} / {numPages || activeFile.page_count || '?'}
        </span>
        <button
          onClick={() =>
            setCurrentPage(Math.min(numPages || activeFile.page_count, currentPage + 1))
          }
          disabled={currentPage >= (numPages || activeFile.page_count)}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-gray-200 rounded"
        >
          →
        </button>
      </div>
    </div>
  )
}
