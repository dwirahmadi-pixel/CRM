'use client'
import { Tab } from '@/app/page'
import { LayoutDashboard, Users, ShoppingBag, Kanban, Activity } from 'lucide-react'

const nav = [
  { id: 'overview',   label: 'Overview',   icon: LayoutDashboard },
  { id: 'suppliers',  label: 'Supplier',   icon: ShoppingBag },
  { id: 'buyers',     label: 'Buyer',      icon: Users },
  { id: 'pipeline',   label: 'Pipeline',   icon: Kanban },
  { id: 'aktivitas',  label: 'Aktivitas',  icon: Activity },
] as const

export default function Sidebar({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (t: Tab) => void }) {
  return (
    <aside className="w-52 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E85D04] flex items-center justify-center text-white text-sm font-bold">🐔</div>
          <span className="font-mono text-sm font-bold tracking-tight">AYAM.CRM</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id as Tab)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-orange-50 text-[#E85D04]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>
    </aside>
  )
}
