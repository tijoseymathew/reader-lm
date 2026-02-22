import { create } from 'zustand'
import type { Space, FileMeta, Section } from '../types'

interface AppState {
  spaces: Space[]
  activeSpace: Space | null
  activeFile: FileMeta | null
  currentPage: number
  activeSection: Section | null
  isPlaying: boolean
  voice: string

  setSpaces: (spaces: Space[]) => void
  addSpace: (space: Space) => void
  removeSpace: (spaceId: string) => void
  setActiveSpace: (space: Space | null) => void
  setActiveFile: (file: FileMeta | null) => void
  updateActiveFile: (file: FileMeta) => void
  setCurrentPage: (page: number) => void
  setActiveSection: (section: Section | null) => void
  setIsPlaying: (playing: boolean) => void
  setVoice: (voice: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  spaces: [],
  activeSpace: null,
  activeFile: null,
  currentPage: 1,
  activeSection: null,
  isPlaying: false,
  voice: 'af_heart',

  setSpaces: (spaces) => set({ spaces }),
  addSpace: (space) => set((s) => ({ spaces: [...s.spaces, space] })),
  removeSpace: (spaceId) =>
    set((s) => ({
      spaces: s.spaces.filter((sp) => sp.id !== spaceId),
      activeSpace: s.activeSpace?.id === spaceId ? null : s.activeSpace,
      activeFile: s.activeSpace?.id === spaceId ? null : s.activeFile,
    })),
  setActiveSpace: (space) =>
    set({ activeSpace: space, activeFile: null, currentPage: 1, activeSection: null }),
  setActiveFile: (file) =>
    set({ activeFile: file, currentPage: 1, activeSection: null, isPlaying: false }),
  updateActiveFile: (file) => set({ activeFile: file }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setActiveSection: (section) => set({ activeSection: section, isPlaying: false }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setVoice: (voice) => set({ voice }),
}))
