import { useState } from 'react'
import { TopBar } from './components/TopBar'
import { Hero } from './components/Hero'
import { AssistantAndPicks } from './components/AssistantAndPicks'
import { ToolsRow } from './components/ToolsRow'
import { ResourceHub } from './components/ResourceHub'
import { BottomTabBar } from './components/BottomTabBar'

function Users() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className='flex h-screen overflow-hidden bg-slate-50/50 text-slate-800 font-semibold'>
      <div className='flex h-full min-w-0 flex-1 flex-col overflow-hidden'>
        <TopBar />

        <main className='flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8'>
          <div className='mx-auto max-w-[1440px] space-y-5 sm:space-y-6'>
            <Hero />

            <div className='grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3'>
              <div className='space-y-5 sm:space-y-6 lg:col-span-2'>
                <ToolsRow />
                <ResourceHub />
              </div>

              <AssistantAndPicks />
            </div>
          </div>
        </main>
      </div>

      <BottomTabBar
        active={activeTab}
        onSelect={setActiveTab}
      />
    </div>
  )
}

export default Users
