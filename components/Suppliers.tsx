'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Modal from './Modal'
import Badge from './Badge'
import { Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react'

type Supplier = {
  id: string; nama: string; kota: string; kontak: string;
  jenis_ayam: string; harga_per_kg: number; volume_maks: number; status: string; catatan: string;
}
type PriceHistory = { supplier_id: string; harga: number; created_at: string }

const empty = { nama: '', kota: '', kontak: '', jenis_ayam: 'Broiler', harga_per_kg: 0, volume_maks: 0, status: 'Aktif', catatan: '' }

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [history, setHistory] = useState<PriceHistory[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [showPrice, setShowPrice] = useState<Supplier | null>(null)
  const [form, setForm] = useState(empty)
  const [newPrice, setNewPrice] = useState('')
  const [priceCatatan, setPriceCatatan] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    const [{ data: s }, { data: h }] = await Promise.all([
      supabase.from('suppliers').select('*').order('created_at', { ascending: false }),
      supabase.from('price_history').select('supplier_id,harga,created_at').order('created_at', { ascending: false }).limit(200),
    ])
    setSuppliers(s || [])
    setHistory(h || [])
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const { data } = await supabase.from('suppliers').insert([form]).select().single()
    if (data && form.harga_per_kg) {
      await supabase.from('price_history').insert([{ supplier_id: data.id, supplier_nama: data.nama, harga: form.harga_per_kg, catatan: 'Harga awal' }])
    }
    setLoading(false); setShowAdd(false); setForm(empty); load()
  }

  async function handlePriceUpdate(e: React.FormEvent) {
    e.preventDefault(); if (!showPrice || !newPrice) return; setLoading(true)
    await Promise.all([
      supabase.from('suppliers').update({ harga_per_kg: parseInt(newPrice) }).eq('id', showPrice.id),
      supabase.from('price_history').insert([{ supplier_id: showPrice.id, supplier_nama: showPrice.nama, harga: parseInt(newPrice), catatan: priceCatatan }]),
    ])
    setLoading(false); setShowPrice(null); setNewPrice(''); setPriceCatatan(''); load()
  }

  async function toggleStatus(s: Supplier) {
    const next = s.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif'
    await supabase.from('suppliers').update({ status: next }).eq('id', s.id)
    load()
  }

  function lastPrice(id: string) {
    const hist = history.filter(h => h.supplier_id === id).slice(0, 2)
    if (hist.length < 2) return null
    return hist[0].harga - hist[1].harga
  }

  const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Supplier</h1>
          <p className="text-sm text-gray-500 mt-0.5">{suppliers.length} supplier terdaftar</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#E85D04] text-white rounded-lg text-sm font-medium hover:bg-[#c44e03] transition-colors">
          <Plus size={15} /> Tambah Supplier
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Supplier','Lokasi','Jenis','Harga/kg','Perubahan','Vol. Maks','Status',''].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">Belum ada supplier. Tambahkan yang pertama!</td></tr>
            )}
            {suppliers.map(s => {
              const diff = lastPrice(s.id)
              return (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.nama}</td>
                  <td className="px-4 py-3 text-gray-500">{s.kota}</td>
                  <td className="px-4 py-3 text-gray-600">{s.jenis_ayam}</td>
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">{s.harga_per_kg ? fmtRp(s.harga_per_kg) : '—'}</td>
                  <td className="px-4 py-3">
                    {diff === null ? <span className="text-gray-300">—</span>
                      : diff > 0 ? <span className="flex items-center gap-1 text-green-600 font-mono text-xs"><TrendingUp size={12} />+{diff.toLocaleString('id-ID')}</span>
                      : diff < 0 ? <span className="flex items-center gap-1 text-red-500 font-mono text-xs"><TrendingDown size={12} />{diff.toLocaleString('id-ID')}</span>
                      : <span className="flex items-center gap-1 text-gray-400 text-xs"><Minus size={12} />0</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.volume_maks ? `${s.volume_maks.toLocaleString('id-ID')} kg` : '—'}</td>
                  <td className="px-4 py-3"><Badge label={s.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setShowPrice(s); setNewPrice(String(s.harga_per_kg || '')) }}
                        className="text-xs text-[#E85D04] border border-[#E85D04] px-2 py-1 rounded-md hover:bg-orange-50 transition-colors">
                        Update Harga
                      </button>
                      <button onClick={() => toggleStatus(s)} className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded-md transition-colors">
                        {s.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add Supplier Modal */}
      {showAdd && (
        <Modal title="Tambah Supplier" onClose={() => { setShowAdd(false); setForm(empty) }}>
          <form onSubmit={handleAdd} className="space-y-3">
            {[['Nama Supplier', 'nama', 'text', 'Nama farm / perusahaan'],
              ['Kota', 'kota', 'text', 'Bogor, Bekasi...'],
              ['Kontak (WhatsApp)', 'kontak', 'text', '08xxx'],
            ].map(([label, key, type, placeholder]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
                <input type={type} placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" required={key === 'nama'} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Jenis Ayam</label>
                <select value={form.jenis_ayam} onChange={e => setForm(f => ({ ...f, jenis_ayam: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]">
                  <option>Broiler</option><option>Kampung</option><option>Pejantan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Harga/kg (Rp)</label>
                <input type="number" placeholder="38000" value={form.harga_per_kg || ''} onChange={e => setForm(f => ({ ...f, harga_per_kg: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Volume Maks (kg/hari)</label>
              <input type="number" placeholder="2000" value={form.volume_maks || ''} onChange={e => setForm(f => ({ ...f, volume_maks: parseInt(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Catatan</label>
              <textarea placeholder="Info tambahan..." value={form.catatan} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04] resize-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#E85D04] text-white rounded-lg text-sm font-medium hover:bg-[#c44e03] transition-colors disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan Supplier'}
            </button>
          </form>
        </Modal>
      )}

      {/* Update Price Modal */}
      {showPrice && (
        <Modal title={`Update Harga — ${showPrice.nama}`} onClose={() => setShowPrice(null)}>
          <form onSubmit={handlePriceUpdate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Harga Saat Ini</label>
              <p className="font-mono text-lg font-bold text-gray-800">{showPrice.harga_per_kg ? `Rp ${showPrice.harga_per_kg.toLocaleString('id-ID')}` : '—'}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Harga Baru (Rp/kg)</label>
              <input type="number" placeholder="38500" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Catatan (opsional)</label>
              <input type="text" placeholder="Alasan perubahan harga..." value={priceCatatan} onChange={e => setPriceCatatan(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#E85D04] text-white rounded-lg text-sm font-medium hover:bg-[#c44e03] transition-colors disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan Harga'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
