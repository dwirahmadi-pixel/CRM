const styles: Record<string, string> = {
  'Aktif':       'bg-green-50 text-green-800',
  'Negosiasi':   'bg-amber-50 text-amber-800',
  'Tidak Aktif': 'bg-red-50 text-red-700',
  'Prospek':     'bg-blue-50 text-blue-800',
  'Follow-up':   'bg-orange-50 text-orange-700',
  'Closing':     'bg-green-100 text-green-900',
  'Proses':      'bg-amber-50 text-amber-800',
  'Restoran':    'bg-blue-50 text-blue-800',
  'Catering':    'bg-amber-50 text-amber-800',
  'Hotel':       'bg-gray-100 text-gray-700',
  'Warung':      'bg-blue-50 text-blue-800',
  'Pasar':       'bg-gray-100 text-gray-700',
}

export default function Badge({ label }: { label: string }) {
  const cls = styles[label] ?? 'bg-gray-100 text-gray-700'
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-md ${cls}`}>{label}</span>
}
