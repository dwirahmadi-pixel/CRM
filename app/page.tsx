'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Overview from '@/components/Overview'
import Suppliers from '@/components/Suppliers'
import Buyers from '@/components/Buyers'
import Pipeline from '@/components/Pipeline'
import Aktivitas from '@/components/Aktivitas'

export type Tab = 'overview' | 'suppliers' | 'buyers' | 'pipeline' | 'aktivitas'

export default function Home() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9f7f4]">
      <Sidebar activeTab={tab} onTabChange={setTab} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {tab === 'overview'   && <Overview />}
          {tab === 'suppliers'  && <Suppliers />}
          {tab === 'buyers'     && <Buyers />}
          {tab === 'pipeline'   && <Pipeline />}
          {tab === 'aktivitas'  && <Aktivitas />}
        </div>
      </main>
    </div>
  )
}
