import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { uploadBreederDocument, type BreederDocument, type DocumentType } from '@/api/breeders.api'

const DOCUMENT_TYPES: { value: DocumentType; labelKey: string; labelFallback: string }[] = [
  {
    value: 'kennel_cert',
    labelKey: 'documents.types.kennel_cert',
    labelFallback: 'Kennel Certificate',
  },
  { value: 'fci_papers', labelKey: 'documents.types.fci_papers', labelFallback: 'FCI Papers' },
  { value: 'achr_papers', labelKey: 'documents.types.achr_papers', labelFallback: 'AChR Papers' },
  {
    value: 'vaccination_records',
    labelKey: 'documents.types.vaccination_records',
    labelFallback: 'Vaccination Records',
  },
  {
    value: 'health_tests',
    labelKey: 'documents.types.health_tests',
    labelFallback: 'Health Test Results',
  },
  { value: 'other', labelKey: 'documents.types.other', labelFallback: 'Other Document' },
]

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

interface Props {
  breederId: number
  onUploaded: (doc: BreederDocument) => void
}

export function DocumentUpload({ breederId, onUploaded }: Props) {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docType, setDocType] = useState<DocumentType>('kennel_cert')
  const [clientError, setClientError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => uploadBreederDocument(breederId, selectedFile!, docType),
    onSuccess: (res) => {
      onUploaded(res.data.data)
      setSelectedFile(null)
      setClientError(null)
      if (fileRef.current) fileRef.current.value = ''
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    if (file.size > MAX_SIZE_BYTES) {
      setClientError(t('documents.error.too_large', 'File exceeds 10 MB limit.'))
      setSelectedFile(null)
      return
    }
    setClientError(null)
    setSelectedFile(file)
  }

  function formatBytes(bytes: number): string {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Document type selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('documents.type_label', 'Document Type')}
          </label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            {DOCUMENT_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {t(dt.labelKey, dt.labelFallback)}
              </option>
            ))}
          </select>
        </div>

        {/* File input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('documents.file_label', 'File')}
            <span className="ml-1 text-gray-400 font-normal text-xs">(PDF / image, max 10 MB)</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:rounded-md file:text-sm file:bg-white file:cursor-pointer"
          />
        </div>
      </div>

      {selectedFile && (
        <p className="text-xs text-gray-500">
          {selectedFile.name} — {formatBytes(selectedFile.size)}
        </p>
      )}

      {clientError && <p className="text-red-600 text-sm">{clientError}</p>}

      {mutation.isError && (
        <p className="text-red-600 text-sm">
          {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? t('documents.error.upload_failed', 'Upload failed. Please try again.')}
        </p>
      )}

      {mutation.isSuccess && (
        <p className="text-green-600 text-sm">
          {t('documents.upload_success', 'Document uploaded successfully.')}
        </p>
      )}

      <button
        type="button"
        disabled={!selectedFile || mutation.isPending}
        onClick={() => mutation.mutate()}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
      >
        {mutation.isPending
          ? t('common.uploading', 'Uploading…')
          : t('documents.upload_cta', 'Upload Document')}
      </button>
    </div>
  )
}
