'use client'

import { useState, useRef } from 'react'
import { getAccessToken } from '@/lib/supabase/token'

interface Props {
  gameId: string
  existingPhotos?: string[]
  onPhotosChange: (urls: string[]) => void
  locale: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const MAX_FILES = 6
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export function MultiImageUpload({ gameId, existingPhotos = [], onPhotosChange, locale }: Props) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const t = locale === 'ru'
    ? {
        upload: 'Загрузить фото',
        dragOrClick: 'Перетащите или нажмите для загрузки',
        maxSize: 'JPEG, PNG, WebP — макс. 5МБ каждый',
        remove: 'Удалить',
        maxReached: `Максимум ${MAX_FILES} фото`,
        tooLarge: 'Файл слишком большой (макс. 5МБ)',
        invalidType: 'Неверный формат файла',
        uploadFailed: 'Ошибка загрузки',
      }
    : {
        upload: 'Upload Photos',
        dragOrClick: 'Drag & drop or click to upload',
        maxSize: 'JPEG, PNG, WebP — max 5MB each',
        remove: 'Remove',
        maxReached: `Maximum ${MAX_FILES} photos`,
        tooLarge: 'File too large (max 5MB)',
        invalidType: 'Invalid file type',
        uploadFailed: 'Upload failed',
      }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError('')

    const remaining = MAX_FILES - photos.length
    if (remaining <= 0) {
      setError(t.maxReached)
      return
    }

    const validFiles = Array.from(files).slice(0, remaining)
    for (const file of validFiles) {
      if (file.size > MAX_SIZE) {
        setError(t.tooLarge)
        return
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(t.invalidType)
        return
      }
    }

    setUploading(true)
    const token = getAccessToken()
    const newUrls: string[] = []

    for (const file of validFiles) {
      const ext = file.name.split('.').pop()
      const path = `official/${gameId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

      try {
        const res = await fetch(`${supabaseUrl}/storage/v1/object/game-photos/${path}`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token || supabaseKey}`,
          },
          body: file,
        })

        if (res.ok) {
          newUrls.push(`${supabaseUrl}/storage/v1/object/public/game-photos/${path}`)
        } else {
          setError(t.uploadFailed)
        }
      } catch {
        setError(t.uploadFailed)
      }
    }

    if (newUrls.length > 0) {
      const updated = [...photos, ...newUrls]
      setPhotos(updated)
      onPhotosChange(updated)
    }
    setUploading(false)
  }

  function removePhoto(index: number) {
    const updated = photos.filter((_, i) => i !== index)
    setPhotos(updated)
    onPhotosChange(updated)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {photos.length < MAX_FILES && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors"
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Uploading...</span>
            </div>
          ) : (
            <>
              <div className="text-3xl text-gray-400 mb-2">+</div>
              <p className="text-sm text-gray-600">{t.dragOrClick}</p>
              <p className="text-xs text-gray-400 mt-1">{t.maxSize}</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
