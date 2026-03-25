import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { submitVerificationRequest } from '@/api/breeders.api'
import type { BreederDocument } from '@/api/breeders.api'

interface Props {
  breederId: number
  documents: BreederDocument[]
  onSubmitted: () => void
  onClose: () => void
}

export default function VerificationSubmitModal({
  breederId: _breederId,
  documents,
  onSubmitted,
  onClose,
}: Props) {
  const { t } = useTranslation()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const mutation = useMutation({
    mutationFn: () => submitVerificationRequest({ document_ids: Array.from(selectedIds) }),
    onSuccess: () => {
      onSubmitted()
      onClose()
    },
  })

  const toggle = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('verification.modal_title')}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('verification.modal_title')}
        </h2>

        {documents.length === 0 ? (
          <p className="text-sm text-gray-500">{t('verification.modal_no_docs')}</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {documents.map((doc) => (
              <li key={doc.id}>
                <label className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(doc.id)}
                    onChange={() => toggle(doc.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700">{doc.filename}</span>
                  <span className="text-xs text-gray-400 capitalize">{doc.document_type}</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        {mutation.isError && (
          <p className="text-sm text-red-600 mb-3">
            {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message ?? 'Something went wrong.'}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedIds.size === 0 || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
          >
            {mutation.isPending ? '…' : t('verification.modal_submit')}
          </button>
        </div>
      </div>
    </div>
  )
}
