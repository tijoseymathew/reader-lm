export interface Space {
  id: string
  name: string
  description: string
  created_at: string
}

export type AudioStatus = 'pending' | 'generating' | 'ready' | 'error'
export type FileStatus = 'processing' | 'ready' | 'error'

export interface Section {
  id: string
  text: string
  headings: string[]
  page_nos: number[]
  label: string
  audio_status: AudioStatus
}

export interface FileMeta {
  id: string
  space_id: string
  name: string
  page_count: number
  status: FileStatus
  sections: Section[]
}

export interface FileStatusResponse {
  status: FileStatus
  sections: Section[]
}
