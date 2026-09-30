"use client"

import { useCallback, useRef, useState } from "react"
import { UploadCloud, X, FileText, Film, ImageIcon, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export type UploadedMedia = {
  id: string
  name: string
  type: string
  size: number
  previewUrl: string
  dataUrl: string
}

const MAX_IMAGE_DIMENSION = 1600
const IMAGE_QUALITY = 0.72

async function compressImage(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.crossOrigin = "anonymous"
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = objectUrl
    })

    let { width, height } = img
    if (width > height && width > MAX_IMAGE_DIMENSION) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width)
      width = MAX_IMAGE_DIMENSION
    } else if (height > MAX_IMAGE_DIMENSION) {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height)
      height = MAX_IMAGE_DIMENSION
    }

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return objectUrlToDataUrl(file)
    ctx.drawImage(img, 0, 0, width, height)
    return canvas.toDataURL("image/jpeg", IMAGE_QUALITY)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function objectUrlToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaUpload({
  files,
  onChange,
}: {
  files: UploadedMedia[]
  onChange: (files: UploadedMedia[]) => void
}) {
  const { t } = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const processFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return
      setIsProcessing(true)
      const incoming: UploadedMedia[] = []
      for (const file of Array.from(fileList)) {
        const isImage = file.type.startsWith("image/")
        const dataUrl = isImage ? await compressImage(file) : await objectUrlToDataUrl(file)
        incoming.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          previewUrl: isImage ? dataUrl : "",
          dataUrl,
        })
      }
      onChange([...files, ...incoming])
      setIsProcessing(false)
    },
    [files, onChange],
  )

  const removeFile = (id: string) => {
    onChange(files.filter((f) => f.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          processFiles(e.dataTransfer.files)
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-[var(--color-navy)] bg-[var(--color-navy)]/5"
            : "border-[var(--color-border-soft)] bg-[var(--color-bg-light)] hover:border-[var(--color-navy)]/40"
        }`}
      >
        <div className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-sm">
          {isProcessing ? (
            <Loader2 className="size-6 animate-spin text-[var(--color-navy)]" aria-hidden="true" />
          ) : (
            <UploadCloud className="size-6 text-[var(--color-navy)]" aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--color-navy)]">
            {isProcessing ? t.mediaProcessing : t.mediaDropHere}
          </p>
          <p className="mt-1 text-xs text-slate-500">{t.mediaOrClick}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf"
          className="sr-only"
          onChange={(e) => {
            processFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {files.map((file) => (
            <li
              key={file.id}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-light)]"
            >
              {file.previewUrl ? (
                <img
                  src={file.previewUrl || "/placeholder.svg"}
                  alt={file.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-1.5 p-2 text-center">
                  {file.type.startsWith("video/") ? (
                    <Film className="size-6 text-[var(--color-navy)]" aria-hidden="true" />
                  ) : file.type.startsWith("image/") ? (
                    <ImageIcon className="size-6 text-[var(--color-navy)]" aria-hidden="true" />
                  ) : (
                    <FileText className="size-6 text-[var(--color-navy)]" aria-hidden="true" />
                  )}
                  <span className="line-clamp-2 text-[10px] font-medium text-slate-600">{file.name}</span>
                </div>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 text-[10px] font-medium text-white">
                {formatSize(file.size)}
              </span>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-transform hover:scale-110"
                aria-label={t.mediaRemove(file.name)}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
