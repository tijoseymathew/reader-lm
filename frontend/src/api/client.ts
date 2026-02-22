import axios from 'axios'
import type { Space, FileMeta, FileStatusResponse, Settings, Voice } from '../types'

const api = axios.create({ baseURL: '/api' })

// Spaces
export const getSpaces = () => api.get<Space[]>('/spaces').then(r => r.data)

export const createSpace = (name: string, description: string) =>
  api.post<Space>('/spaces', { name, description }).then(r => r.data)

export const deleteSpace = (spaceId: string) =>
  api.delete(`/spaces/${spaceId}`)

// Files
export const getFiles = (spaceId: string) =>
  api.get<FileMeta[]>(`/spaces/${spaceId}/files`).then(r => r.data)

export const uploadFile = (spaceId: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post<FileMeta>(`/spaces/${spaceId}/files`, form).then(r => r.data)
}

export const getFile = (spaceId: string, fileId: string) =>
  api.get<FileMeta>(`/spaces/${spaceId}/files/${fileId}`).then(r => r.data)

export const deleteFile = (spaceId: string, fileId: string) =>
  api.delete(`/spaces/${spaceId}/files/${fileId}`)

export const getFileStatus = (spaceId: string, fileId: string) =>
  api.get<FileStatusResponse>(`/spaces/${spaceId}/files/${fileId}/status`).then(r => r.data)

// Settings
export const getSettings = () => api.get<Settings>('/settings').then(r => r.data)
export const updateSettings = (settings: Settings) =>
  api.put<Settings>('/settings', settings).then(r => r.data)
export const getVoices = () => api.get<Voice[]>('/settings/voices').then(r => r.data)

// Audio URL (not a fetch — just a URL)
export const getAudioUrl = (spaceId: string, fileId: string, sectionId: string) =>
  `/api/spaces/${spaceId}/files/${fileId}/audio/${sectionId}`

// PDF URL
export const getPdfUrl = (spaceId: string, fileId: string) =>
  `/api/spaces/${spaceId}/files/${fileId}/pdf`
