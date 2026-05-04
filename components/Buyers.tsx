'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Modal from './Modal'
import Badge from './Badge'
import { Plus } from 'lucide-react'

type Buyer = {
  id: string; nama: string; tipe: string; kota: string; kebutuhan_kg: number;
  jenis_ayam: string; harga_deal: number; pic: string; kontak: string; status: string; catatan: string;
}

const empty: Omit<Buyer, 'id'> = {
  nama: '', tipe: 'Restoran', kota: '', kebutuhan_kg: 0,
  jenis_ayam: 'Broiler', harga_deal: 0, pic: '', kontak: '', status: 'Prospek', catatan: ''
}

export default function Buyers() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('Semua')

  async function load() {
    const { data } = await supabase.from('buyers').select('*').order('created_at', { ascending: false })
    setBuyers(data || [])
  }
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    await supabase.from('buyers').insert([form])
    setLoading(false); setShowAdd(false); setForm(empty); load()
  }

  const statuses = ['Semua', 'Prospek', 'Follow-up', 'Negosiasi', 'Aktif']
  const filtered = filter === 'Semua' ? buyers : buyers.filter(b => b.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Buyer</h1>
          <p className="text-sm text-gray-500 mt-0.5">{buyers.length} buyer terdaftar</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#E85D04] text-white rounded-lg text-sm font-medium hover:bg-[#c44e03] transition-colors">
          <Plus size={15} /> Tambah Buyer
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-[#E85D04] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Nama Bisnis','Tipe','Kota','Kebutuhan','Jenis','Harga Deal','PIC','Status'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">Belum ada buyer. Tambahkan yang pertama!</td></tr>
            )}
            {filtered.map(b => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{b.nama}</td>
                <td className="px-4 py-3"><Badge label={b.tipe} /></td>
                <td className="px-4 py-3 text-gray-500">{b.kota}</td>
                <td className="px-4 py-3 font-mono text-xs font-bold text-gray-700">{b.kebutuhan_kg ? `${b.kebutuhan_kg.toLocaleString('id-ID')} kg/mgg` : '—'}</td>
                <td className="px-4 py-3 text-gray-600">{b.jenis_ayam}</td>
                <td className="px-4 py-3 font-mono text-xs font-bold text-gray-800">{b.harga_deal ? `Rp ${b.harga_deal.toLocaleString('id-ID')}` : '—'}</td>
                <td className="px-4 py-3 text-gray-600">{b.pic || '—'}</td>
                <td className="px-4 py-3"><Badge label={b.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Tambah Buyer" onClose={() => { setShowAdd(false); setForm(empty) }}>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Nama Bisnis</label>
              <input type="text" placeholder="Restoran, catering, hotel..." value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Tipe</label>
                <select value={form.tipe} onChange={e => setForm(f => ({ ...f, tipe: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]">
                  {['Restoran','Catering','Hotel','Warung','Pasar'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Kota</label>
                <input type="text" placeholder="Jakarta Selatan..." value={form.kota} onChange={e => setForm(f => ({ ...f, kota: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Kebutuhan (kg/minggu)</label>
                <input type="number" placeholder="500" value={form.kebutuhan_kg || ''} onChange={e => setForm(f => ({ ...f, kebutuhan_kg: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Jenis Ayam</label>
                <select value={form.jenis_ayam} onChange={e => setForm(f => ({ ...f, jenis_ayam: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]">
                  <option>Broiler</option><option>Kampung</option><option>Mix</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">PIC</label>
                <input type="text" placeholder="Nama kontak" value={form.pic} onChange={e => setForm(f => ({ ...f, pic: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Kontak (WA)</label>
                <input type="text" placeholder="08xxx" value={form.kontak} onChange={e => setForm(f => ({ ...f, kontak: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]">
                {['Prospek','Follow-up','Negosiasi','Aktif'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Catatan</label>
              <textarea placeholder="Info tambahan..." value={form.catatan} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04] resize-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#E85D04] text-white rounded-lg text-sm font-medium hover:bg-[#c44e03] transition-colors disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan Buyer'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
