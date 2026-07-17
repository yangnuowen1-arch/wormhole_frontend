import { Link } from 'react-router-dom'
import type { AdminAnnouncementPayload } from '../../../api/workbench'
import type { Announcement } from '../data'
import { AnnouncementsPanel } from './AnnouncementsPanel'

interface TopBarProps {
  adminAnnouncements: Announcement[]
  announcements: Announcement[]
  editMode: boolean
  isAdmin: boolean
  isAdminAnnouncementsLoading: boolean
  userName: string
  onLoadAdminAnnouncements: () => Promise<void> | void
  onLogout: () => void
  onSaveAnnouncement: (
    announcement: Announcement | undefined,
    payload: AdminAnnouncementPayload
  ) => Promise<void> | void
  onToggleEditMode: () => void
  onUpdateAnnouncementStatus: (
    announcement: Announcement,
    status: number
  ) => Promise<void> | void
}

export function TopBar({
  adminAnnouncements,
  announcements,
  editMode,
  isAdmin,
  isAdminAnnouncementsLoading,
  userName,
  onLoadAdminAnnouncements,
  onLogout,
  onSaveAnnouncement,
  onToggleEditMode,
  onUpdateAnnouncementStatus
}: TopBarProps) {
  return (
    <header className='flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-8'>
      <div className='flex min-w-0 items-center gap-3'>
        <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-200'>
          <LayoutGridIcon />
        </span>
        <div className='hidden leading-none sm:block'>
          <h1 className='text-base font-extrabold tracking-wide text-slate-900'>
            智能工作台
          </h1>
        </div>
      </div>

      <div className='ml-3 flex items-center gap-2 sm:ml-4 sm:gap-3'>
        {isAdmin && (
          <Link
            to='/users/role-assignment'
            aria-label='人员角色管理'
            title='人员角色管理'
            className='flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-violet-100 bg-violet-50 px-2 text-violet-700 transition-colors hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 sm:px-2.5'
          >
            <UserShieldIcon className='h-4 w-4' />
            <span className='hidden text-xs font-bold md:inline'>角色管理</span>
          </Link>
        )}
        <div className='hidden h-4 w-px bg-slate-200 sm:block' />
        <AnnouncementsPanel
          adminAnnouncements={adminAnnouncements}
          announcements={announcements}
          isAdmin={isAdmin}
          isAdminAnnouncementsLoading={isAdminAnnouncementsLoading}
          onLoadAdminAnnouncements={onLoadAdminAnnouncements}
          onSaveAnnouncement={onSaveAnnouncement}
          onUpdateAnnouncementStatus={onUpdateAnnouncementStatus}
        />
        {isAdmin && (
          <button
            type='button'
            aria-label={editMode ? '退出编辑模式' : '进入编辑模式'}
            aria-pressed={editMode}
            onClick={onToggleEditMode}
            className={`flex h-8 cursor-pointer shrink-0 items-center justify-center gap-1 rounded-lg px-2 transition-colors sm:w-8 sm:px-0 ${
              editMode
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <SettingsIcon className='h-4 w-4' />
            <span className='text-xs font-bold sm:hidden'>
              {editMode ? '完成' : '编辑'}
            </span>
          </button>
        )}
        <div className='hidden h-4 w-px bg-slate-200 sm:block' />
        <div className='flex min-w-0 items-center gap-2'>
          <span
            className='hidden max-w-28 truncate text-xs font-bold text-slate-500 lg:inline'
            title={userName}
          >
            {userName}
          </span>
          <button
            type='button'
            aria-label='退出登录'
            title='退出登录'
            onClick={onLogout}
            className='flex h-8 cursor-pointer shrink-0 items-center justify-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-2 text-rose-600 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 sm:px-2.5'
          >
            <LogoutIcon className='h-4 w-4' />
            <span className='hidden text-xs font-bold md:inline'>退出</span>
          </button>
        </div>
      </div>
    </header>
  )
}

function LayoutGridIcon() {
  return (
    <svg
      className='h-5 w-5'
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function UserShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M9.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 8.5v-1a4.5 4.5 0 0 1 4.5-4.5h1M15.5 12.5l4-1.5v3.7c0 2.6-1.7 4.8-4 5.3-2.3-.5-4-2.7-4-5.3V11l4 1.5Z'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z'
        stroke='currentColor'
        strokeWidth='2'
      />
      <path
        d='M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.08a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.08a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.08a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.22.6.79 1 1.55 1H21a2 2 0 0 1 0 4h-.08a1.7 1.7 0 0 0-1.55 1Z'
        stroke='currentColor'
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M10 6H6.8A2.8 2.8 0 0 0 4 8.8v6.4A2.8 2.8 0 0 0 6.8 18H10M15 8l4 4m0 0-4 4m4-4H9'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
