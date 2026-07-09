import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { Hero } from './components/Hero'
import { AssistantAndPicks } from './components/AssistantAndPicks'
import { ToolsRow } from './components/ToolsRow'
import { ResourceHub } from './components/ResourceHub'
import { BottomTabBar } from './components/BottomTabBar'

function Users() {
  const [activeNav, setActiveNav] = useState('home')
  const [activeTab, setActiveTab] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className='flex min-h-screen bg-[#fbfbfd] text-[#1f2328]'>
      {/* 移动端抽屉遮罩 */}
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden'
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 侧边栏：移动端抽屉 + PC 常驻 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 transform flex-col border-r border-[#ececf0] bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          active={activeNav}
          onSelect={(id) => {
            setActiveNav(id)
            setMobileMenuOpen(false)
          }}
        />
      </aside>

      <div className='flex min-w-0 flex-1 flex-col'>
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
        {/* 底部留白避免被移动端 tab 栏遮挡 */}
        <main className='mx-auto w-full max-w-[1500px] space-y-5 px-4 py-4 pb-20 sm:space-y-6 sm:px-6 sm:py-6 lg:pb-6'>
          <Hero />
          <AssistantAndPicks />
          <ToolsRow />
          <ResourceHub />
        </main>
      </div>

      {/* 移动端固定底部 tab 栏 */}
      <BottomTabBar
        active={activeTab}
        onSelect={setActiveTab}
      />
    </div>
  )
}

export default Users
