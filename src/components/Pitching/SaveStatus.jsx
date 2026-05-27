export function SaveStatus({ status, isSaving }) {
  if (isSaving) {
    return (
      <div className="text-sm text-gray-600">Saving...</div>
    )
  }

  if (status === 'saved') {
    return (
      <div className="text-sm text-green-600 font-medium">✓ Saved</div>
    )
  }

  return (
    <div className="text-sm text-orange-600 font-medium">• Not yet saved</div>
  )
}
