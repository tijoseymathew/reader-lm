# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
```bash
# Backend (requires espeak-ng installed)
cd backend && uvicorn main:app --reload

# Frontend (separate terminal)
cd frontend && npm run dev
```

### Docker (preferred for full environment)
```bash
docker compose up --build   # first run downloads ~300MB ML models
docker compose up           # subsequent runs
```

### Frontend Build/Check
```bash
cd frontend && npm run build    # TypeScript compile + Vite bundle
cd frontend && npm run preview  # preview production build
```

## Architecture

### Data Flow
1. User uploads PDF → `POST /api/spaces/{sid}/files`
2. FastAPI saves PDF, creates `FileMeta` with `status="processing"`, kicks off `BackgroundTasks`
3. Background: Docling parses PDF → `sections.json`; Kokoro generates `audio/{section_id}.wav` per section
4. Frontend polls `GET /api/spaces/{sid}/files/{fid}/status` every 2s until `status="ready"` and all `audio_status="ready"`
5. User selects section → audio plays; clicking PDF page → section panel filters to that page

### Backend Structure
- `main.py` — FastAPI app, CORS middleware, lifespan (creates data dirs), router registration
- `config.py` — `BASE_DIR`, `DATA_DIR`, `SPACES_DIR` path constants
- `models.py` — Pydantic models: `SpaceMeta`, `FileMeta`, `Section`
- `storage.py` — JSON read/write helpers (no database)
- `routers/spaces.py` — `/api/spaces` CRUD
- `routers/files.py` — file upload, background PDF+TTS processing, status polling, PDF serving
- `routers/audio.py` — WAV audio serving
- `services/pdf_service.py` — `parse_pdf()` via Docling `HierarchicalChunker`
- `services/tts_service.py` — `generate_audio()` via Kokoro `KPipeline` singleton

CPU-bound work (Docling, Kokoro) runs in `asyncio.run_in_executor(None, fn)` to avoid blocking the event loop.

### Frontend Structure
- `store/useAppStore.ts` — Zustand store: spaces list, activeFile, activeSection, currentPage, isPlaying
- `api/client.ts` — axios wrappers for all API calls + URL helpers for PDF/audio assets
- `components/` — Sidebar → SpaceView or ReaderView → PDFViewer + SectionPanel + AudioPlayer

### File Storage Layout
```
data/spaces/{space_id}/
  meta.json
  files/{file_id}/
    meta.json
    original.pdf
    sections.json
    audio/{section_id}.wav
```

## Key Environment Variables
- `CORS_ORIGINS` — backend allowed origins (default: `http://localhost:5173`)
- `BACKEND_URL` — used by `vite.config.ts` proxy (default: `http://localhost:8000`)

## Git Workflow
- New features/fixes: create a feature branch from `main`, commit there
- Direct commits to `main` only for initial setup or hotfixes explicitly requested
