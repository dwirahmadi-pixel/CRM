'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Modal from './Modal'
import { Plus } from 'lucide-react'

type Deal = {
  id: string; buyer_id: string; buyer_nama: string; volume_kg: number;
  stage: string; harga_deal: number; tanggal_followup: string; catatan: string; created_at: string;
}

const STAGES = ['Prospek', 'Follow-up', 'Negosiasi', 'Closing']
const STAGE_COLOR: Record<string, string> = {
  'Prospek': 'border-blue-200',
  'Follow-up': 'border-orange-300',
  'Negosiasi': 'border-amber-300',
  'Closing': 'border-green-300',
}
const STAGE_DOT: Record<string, string> = {
  'Prospek': 'bg-blue-400', 'Follow-up': 'bg-orange-400',
  'Negosiasi': 'bg-amber-500', 'Closing': 'bg-green-500',
}

const empty = { buyer_id: '', buyer_nama: '', volume_kg: 0, stage: 'Prospek', harga_deal: 0, tanggal_followup: '', catatan: '' }

export default function Pipeline() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)

  async function load() {
    const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false })
    setDeals(data || [])
  }
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    await supabase.from('deals').insert([form])
    setLoading(false); setShowAdd(false); setForm(empty); load()
  }

  async function moveStage(id: string, stage: string) {
    await supabase.from('deals').update({ stage }).eq('id', id)
    load()
  }

  const today = new Date().toISOString().split('T')[0]
  const isUrgent = (d: Deal) => d.tanggal_followup && d.tanggal_followup <= today

  const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K`

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">{deals.length} deal aktif</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#E85D04] text-white rounded-lg text-sm font-medium hover:bg-[#c44e03] transition-colors">
          <Plus size={15} /> Tambah Deal
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {STAGES.map(stage => {
          const stagDeals = deals.filter(d => d.stage === stage)
          const vol = stagDeals.reduce((s, d) => s + (d.volume_kg || 0), 0)
          return (
            <div key={stage} className="bg-white rounded-lg border border-gray-100 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className={`w-2 h-2 rounded-full ${STAGE_DOT[stage]}`} />
                <span className="text-xs text-gray-500 font-medium">{stage}</span>
              </div>
              <div className="font-mono text-sm font-bold text-gray-800">{stagDeals.length} deal</div>
              <div className="text-xs text-gray-400">{vol.toLocaleString('id-ID')} kg/mgg</div>
            </div>
          )
        })}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-4 gap-3">
        {STAGES.map(stage => (
          <div key={stage} className="bg-gray-50 rounded-xl p-3 min-h-48"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (dragging) moveStage(dragging, stage) }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${STAGE_DOT[stage]}`} />
                <span className="text-xs font-semibold text-gray-600">{stage}</span>
              </div>
              <span className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-500">
                {deals.filter(d => d.stage === stage).length}
              </span>
            </div>

            {deals.filter(d => d.stage === stage).map(deal => (
              <div key={deal.id} draggable
                onDragStart={() => setDragging(deal.id)}
                onDragEnd={() => setDragging(null)}
                className={`bg-white rounded-lg border p-3 mb-2 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all ${isUrgent(deal) ? 'border-l-2 border-l-[#E85D04] border-gray-100' : 'border-gray-100'}`}>
                <p className="text-sm font-medium text-gray-900">{deal.buyer_nama}</p>
                {deal.catatan && <p className="text-xs text-gray-400 mt-0.5 truncate">{deal.catatan}</p>}
                <p className="font-mono text-xs font-bold text-gray-700 mt-2">{deal.volume_kg?.toLocaleString('id-ID')} kg/mgg</p>
                {deal.tanggal_followup && (
                  <p className={`text-xs mt-1 ${isUrgent(deal) ? 'text-[#E85D04] font-semibold' : 'text-gray-400'}`}>
                    {isUrgent(deal) ? '⚡ ' : ''}Followup: {deal.tanggal_followup}
                  </p>
                )}
                {/* Move buttons */}
                <div className="flex gap-1 mt-2">
                  {STAGES.filter(s => s !== stage).slice(0, 2).map(s => (
                    <button key={s} onClick={() => moveStage(deal.id, s)}
                      className="text-xs text-gray-400 hover:text-gray-700 border border-gray-100 hover:border-gray-300 px-1.5 py-0.5 rounded transition-colors">
                      → {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {deals.filter(d => d.stage === stage).length === 0 && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-300">Tidak ada deal</div>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <Modal title="Tambah Deal" onClose={() => { setShowAdd(false); setForm(empty) }}>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Nama Buyer</label>
              <input type="text" placeholder="Nama restoran / catering..." value={form.buyer_nama} onChange={e => setForm(f => ({ ...f, buyer_nama: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Volume (kg/minggu)</label>
                <input type="number" placeholder="500" value={form.volume_kg || ''} onChange={e => setForm(f => ({ ...f, volume_kg: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Stage</label>
                <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]">
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Tanggal Follow-up</label>
              <input type="date" value={form.tanggal_followup} onChange={e => setForm(f => ({ ...f, tanggal_followup: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Catatan</label>
              <textarea placeholder="Detail deal..." value={form.catatan} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04] resize-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#E85D04] text-white rounded-lg text-sm font-medium hover:bg-[#c44e03] transition-colors disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan Deal'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
