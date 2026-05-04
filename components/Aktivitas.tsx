'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Modal from './Modal'
import { Plus, Phone, MessageSquare, Mail, Users, MapPin } from 'lucide-react'

type Activity = {
  id: string; tipe: string; entity_nama: string;
  catatan: string; tanggal: string; followup_date: string; created_at: string;
}

const TIPE_ICON: Record<string, any> = {
  'Telepon': Phone, 'WhatsApp': MessageSquare, 'Email': Mail,
  'Meeting': Users, 'Kunjungan': MapPin,
}
const TIPE_COLOR: Record<string, string> = {
  'Telepon': 'bg-blue-100 text-blue-700',
  'WhatsApp': 'bg-green-100 text-green-700',
  'Email': 'bg-purple-100 text-purple-700',
  'Meeting': 'bg-orange-100 text-orange-700',
  'Kunjungan': 'bg-amber-100 text-amber-700',
}

const empty = { tipe: 'Telepon', entity_nama: '', catatan: '', tanggal: new Date().toISOString().split('T')[0], followup_date: '' }

export default function Aktivitas() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)

  async function load() {
    const { data } = await supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(50)
    setActivities(data || [])
  }
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    await supabase.from('activities').insert([form])
    setLoading(false); setShowAdd(false); setForm(empty); load()
  }

  const today = new Date().toISOString().split('T')[0]
  const upcomingFollowups = activities.filter(a => a.followup_date && a.followup_date >= today).sort((a, b) => a.followup_date.localeCompare(b.followup_date))

  function relativeTime(dt: string) {
    const d = new Date(dt)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000)
    if (diff < 60) return `${diff} menit lalu`
    if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`
    return `${Math.floor(diff / 1440)} hari lalu`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Aktivitas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Log semua interaksi dengan supplier & buyer</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#E85D04] text-white rounded-lg text-sm font-medium hover:bg-[#c44e03] transition-colors">
          <Plus size={15} /> Catat Aktivitas
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Activity log */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Log Aktivitas Terbaru</h2>
          {activities.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">Belum ada aktivitas. Mulai catat interaksi kamu!</div>
          ) : (
            <div className="space-y-0">
              {activities.map((a, i) => {
                const Icon = TIPE_ICON[a.tipe] || Phone
                const colorClass = TIPE_COLOR[a.tipe] || 'bg-gray-100 text-gray-700'
                return (
                  <div key={a.id} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClass}`}>
                      <Icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900">{a.entity_nama}</p>
                        <span className="text-xs text-gray-400 flex-shrink-0">{relativeTime(a.created_at)}</span>
                      </div>
                      {a.catatan && <p className="text-sm text-gray-500 mt-0.5">{a.catatan}</p>}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">{a.tipe} · {a.tanggal}</span>
                        {a.followup_date && (
                          <span className={`text-xs ${a.followup_date <= today ? 'text-[#E85D04] font-medium' : 'text-gray-400'}`}>
                            Follow-up: {a.followup_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Upcoming follow-ups */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Follow-up Mendatang</h2>
          {upcomingFollowups.length === 0 ? (
            <p className="text-sm text-gray-400">Tidak ada follow-up terjadwal.</p>
          ) : (
            <div className="space-y-3">
              {upcomingFollowups.map(a => (
                <div key={a.id} className={`p-3 rounded-lg border ${a.followup_date === today ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${a.followup_date === today ? 'bg-[#E85D04]' : 'bg-gray-300'}`} />
                    <span className={`text-xs font-medium ${a.followup_date === today ? 'text-[#E85D04]' : 'text-gray-500'}`}>
                      {a.followup_date === today ? 'Hari ini' : a.followup_date}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{a.entity_nama}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.tipe} · {a.catatan}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <Modal title="Catat Aktivitas" onClose={() => { setShowAdd(false); setForm(empty) }}>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Tipe Aktivitas</label>
              <select value={form.tipe} onChange={e => setForm(f => ({ ...f, tipe: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]">
                {['Telepon','WhatsApp','Email','Meeting','Kunjungan'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Nama Buyer / Supplier</label>
              <input type="text" placeholder="Nama kontak..." value={form.entity_nama} onChange={e => setForm(f => ({ ...f, entity_nama: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Catatan / Hasil</label>
              <textarea placeholder="Apa yang dibahas? Apa tindak lanjutnya?" value={form.catatan} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04] resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Tanggal Aktivitas</label>
                <input type="date" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Follow-up Berikutnya</label>
                <input type="date" value={form.followup_date} onChange={e => setForm(f => ({ ...f, followup_date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D04]" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#E85D04] text-white rounded-lg text-sm font-medium hover:bg-[#c44e03] transition-colors disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan Aktivitas'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
