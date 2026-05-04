'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Briefcase } from 'lucide-react'
import Badge from './Badge'

export default function Overview() {
  const [stats, setStats] = useState({ suppliers: 0, buyers: 0, avgHarga: 0, pipeline: 0 })
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [followups, setFollowups] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const [{ count: sc }, { count: bc }, { data: ph }, { data: fu }, { data: dl }] = await Promise.all([
        supabase.from('suppliers').select('*', { count: 'exact', head: true }),
        supabase.from('buyers').select('*', { count: 'exact', head: true }),
        supabase.from('price_history').select('harga,created_at,supplier_nama').order('created_at', { ascending: true }).limit(60),
        supabase.from('activities').select('*').gte('followup_date', new Date().toISOString().split('T')[0]).order('followup_date').limit(5),
        supabase.from('deals').select('*').not('stage', 'eq', 'Closing'),
      ])

      const avgHarga = ph && ph.length > 0
        ? Math.round(ph.slice(-10).reduce((s, r) => s + r.harga, 0) / Math.min(ph.length, 10))
        : 0

      const pipelineVal = dl ? dl.reduce((s, d) => s + (d.volume_kg || 0) * 38500, 0) : 0

      setStats({ suppliers: sc || 0, buyers: bc || 0, avgHarga, pipeline: pipelineVal })
      setPriceHistory((ph || []).map((r, i) => ({ i, harga: r.harga, nama: r.supplier_nama })))
      setFollowups(fu || [])
      setDeals(dl || [])
    }
    load()
  }, [])

  const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString()
  const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`

  const stagePct = (stage: string) => {
    const total = deals.reduce((s, d) => s + (d.volume_kg || 0), 0)
    const stageVol = deals.filter(d => d.stage === stage).reduce((s, d) => s + (d.volume_kg || 0), 0)
    return total ? Math.round((stageVol / total) * 100) : 0
  }
  const stageVal = (stage: string) => {
    return deals.filter(d => d.stage === stage).reduce((s, d) => s + (d.volume_kg || 0) * 38500, 0)
  }

  const stageColor: Record<string, string> = {
    'Prospek': '#185FA5', 'Follow-up': '#E85D04', 'Negosiasi': '#854F0B'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ringkasan bisnis broker ayam kamu</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Supplier', value: stats.suppliers, icon: ShoppingBag, sub: 'terdaftar' },
          { label: 'Active Buyer', value: stats.buyers, icon: Users, sub: 'terdaftar' },
          { label: 'Harga Rata-rata', value: `Rp ${fmt(stats.avgHarga)}`, icon: DollarSign, sub: '/kg hari ini' },
          { label: 'Pipeline Value', value: `Rp ${fmt(stats.pipeline)}`, icon: Briefcase, sub: 'deal aktif' },
        ].map(({ label, value, icon: Icon, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">{label}</span>
              <Icon size={14} className="text-gray-300" />
            </div>
            <div className="font-mono text-xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Price chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Fluktuasi Harga (Rp/kg)</h2>
            <span className="text-xs text-gray-400">Riwayat update</span>
          </div>
          {priceHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={priceHistory}>
                <XAxis dataKey="i" hide />
                <YAxis domain={['auto', 'auto']} tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip formatter={(v: any) => [fmtRp(v), 'Harga']} labelFormatter={() => ''} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Line type="monotone" dataKey="harga" stroke="#E85D04" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-sm text-gray-400">Belum ada data harga. Update harga supplier dulu.</div>
          )}
        </div>

        {/* Pipeline breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Pipeline by Stage</h2>
          <div className="space-y-3">
            {['Prospek', 'Follow-up', 'Negosiasi'].map(stage => (
              <div key={stage}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{stage}</span>
                  <span className="font-mono font-bold text-gray-800">Rp {fmt(stageVal(stage))}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${stagePct(stage)}%`, background: stageColor[stage] }} />
                </div>
              </div>
            ))}
          </div>

          {/* Follow-up hari ini */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Follow-up Mendatang</h3>
            {followups.length === 0 ? (
              <p className="text-xs text-gray-400">Tidak ada follow-up terjadwal.</p>
            ) : (
              <div className="space-y-2">
                {followups.map(f => (
                  <div key={f.id} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E85D04] mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{f.entity_nama} — {f.catatan}</p>
                      <p className="text-xs text-gray-400">{f.followup_date} · {f.tipe}</p>
                    </div>
                    <Badge label={f.followup_date === new Date().toISOString().split('T')[0] ? 'Hari ini' : 'Segera'} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
