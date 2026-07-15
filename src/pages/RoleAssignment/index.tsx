import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AdminUser } from '../../api/types'
import { getAdminUsers, updateUserRoles } from '../../api/users'

const ROLE_CODES = ['admin', 'user'] as const

type RoleCode = (typeof ROLE_CODES)[number]

interface RoleDefinition {
  code: RoleCode
  name: string
  description: string
  badgeClassName: string
  dotClassName: string
}

interface 公共Member {
  id: number
  name: string
  initials: string
  email: string
  username: string
  roles: RoleCode[]
  avatarClassName: string
  avatarUrl?: string
  status?: number
}

const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    code: 'admin',
    name: '管理员',
    description: '管理工作台配置和人员角色',
    badgeClassName: 'border-violet-100 bg-violet-50 text-violet-700',
    dotClassName: 'bg-violet-500'
  },
  {
    code: 'user',
    name: '普通用户',
    description: '访问工作台和可见资源',
    badgeClassName: 'border-slate-200 bg-slate-50 text-slate-600',
    dotClassName: 'bg-slate-400'
  }
]

const AVATAR_CLASS_NAMES = [
  'from-violet-500 to-indigo-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-400 to-rose-500',
  'from-pink-500 to-fuchsia-500',
  'from-slate-500 to-slate-700'
]

function RoleAssignment() {
  const [members, setMembers] = useState<公共Member[]>([])
  const [savedMembers, setSavedMembers] = useState<公共Member[]>([])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleCode | 'all'>('all')
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadMembers = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    setSaveMessage(null)

    try {
      const users = await getAdminUsers()
      const nextMembers = users.map(memberFromAdminUser)

      setMembers(nextMembers)
      setSavedMembers(nextMembers)
      setSaveMessage(null)
    } catch (error) {
      setMembers([])
      setSavedMembers([])
      setLoadError(errorMessage(error, '用户列表加载失败'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadInitialMembers() {
      try {
        const users = await getAdminUsers()

        if (cancelled) {
          return
        }

        const nextMembers = users.map(memberFromAdminUser)
        setMembers(nextMembers)
        setSavedMembers(nextMembers)
        setSaveMessage(null)
      } catch (error) {
        if (cancelled) {
          return
        }

        setMembers([])
        setSavedMembers([])
        setLoadError(errorMessage(error, '用户列表加载失败'))
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialMembers()

    return () => {
      cancelled = true
    }
  }, [])

  const editingMember = useMemo(
    () => members.find((member) => member.id === editingMemberId),
    [editingMemberId, members]
  )

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return members.filter((member) => {
      const matchesQuery =
        !normalizedQuery ||
        [member.name, member.email, member.username, statusLabel(member.status)]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      const matchesRole =
        roleFilter === 'all' || member.roles.includes(roleFilter)

      return matchesQuery && matchesRole
    })
  }, [members, query, roleFilter])

  const administratorCount = useMemo(
    () => members.filter((member) => member.roles.includes('admin')).length,
    [members]
  )

  const userCount = useMemo(
    () => members.filter((member) => member.roles.includes('user')).length,
    [members]
  )

  const changedMembers = useMemo(
    () =>
      members.filter((member) => {
        const savedMember = savedMembers.find((item) => item.id === member.id)

        return !savedMember || !sameRoleSet(member.roles, savedMember.roles)
      }),
    [members, savedMembers]
  )

  const changedMemberCount = changedMembers.length

  const handleRoleToggle = (memberId: number, roleCode: RoleCode) => {
    const member = members.find((item) => item.id === memberId)
    const isRemovingLastRole =
      member?.roles.includes(roleCode) && member.roles.length === 1

    if (isRemovingLastRole) {
      setSaveMessage('每位成员至少需要保留一个角色。')
      return
    }

    setMembers((current) =>
      current.map((member) => {
        if (member.id !== memberId) {
          return member
        }

        const hasRole = member.roles.includes(roleCode)
        const roles = hasRole
          ? member.roles.filter((code) => code !== roleCode)
          : [...member.roles, roleCode]

        return { ...member, roles }
      })
    )
    setSaveMessage(null)
  }

  const handleSave = async () => {
    if (changedMembers.length === 0 || isSaving) {
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const results = await Promise.allSettled(
        changedMembers.map((member) => updateUserRoles(member.id, member.roles))
      )
      const successfulMembers = results
        .filter(
          (result): result is PromiseFulfilledResult<AdminUser> =>
            result.status === 'fulfilled'
        )
        .map((result) => memberFromAdminUser(result.value))
      const successfulMembersById = new Map(
        successfulMembers.map((member) => [member.id, member])
      )

      if (successfulMembersById.size > 0) {
        setMembers((current) =>
          current.map(
            (member) => successfulMembersById.get(member.id) ?? member
          )
        )
        setSavedMembers((current) =>
          current.map((member) => {
            const savedMember = successfulMembersById.get(member.id)

            return savedMember
              ? { ...savedMember, roles: [...savedMember.roles] }
              : member
          })
        )
      }

      const failedCount = changedMembers.length - successfulMembers.length
      setSaveMessage(
        failedCount > 0
          ? `已保存 ${successfulMembers.length} 名人员；${failedCount} 名保存失败，请检查权限或网络后重试。`
          : `已保存 ${successfulMembers.length} 名人员的角色分配。`
      )
    } catch {
      setSaveMessage('保存失败，请检查网络后重试。')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setMembers(savedMembers)
    setEditingMemberId(null)
    setSaveMessage('已撤销未保存的更改。')
  }

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800'>
      <header className='border-b border-slate-200/80 bg-white/95 backdrop-blur'>
        <div className='mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8'>
          <div className='flex min-w-0 items-center gap-3'>
            <Link
              to='/users'
              className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400'
              aria-label='返回智能工作台'
              title='返回智能工作台'
            >
              <ArrowLeftIcon className='h-5 w-5' />
            </Link>
            <span
              className='h-7 w-px bg-slate-200'
              aria-hidden='true'
            />
            <div className='min-w-0'>
              <div className='flex items-center gap-2'>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm shadow-violet-200'>
                  <ShieldIcon className='h-4 w-4' />
                </span>
                <h1 className='truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg'>
                  人员角色管理
                </h1>
              </div>
              <p className='ml-10 mt-0.5 hidden text-xs font-medium text-slate-400 sm:block'>
                为团队成员分配工作台权限
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8'>
        <section className='rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 px-5 py-6 text-white shadow-xl shadow-slate-300/40 sm:px-8 sm:py-8'>
          <div className='flex flex-col justify-between gap-6 lg:flex-row lg:items-end'>
            <div className='max-w-2xl'>
              <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-violet-100'>
                <span className='h-1.5 w-1.5 rounded-full bg-emerald-400' />
                角色分配
              </div>
              <h2 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
                统一管理团队访问权限
              </h2>
              <p className='mt-2 max-w-xl text-sm font-medium leading-6 text-slate-300'>
                已接入管理员用户列表和角色分配接口，角色修改会完整替换该用户的角色集合。
              </p>
            </div>

            <div className='grid grid-cols-3 gap-2.5 sm:gap-3'>
              <SummaryMetric
                label='成员'
                value={members.length}
              />
              <SummaryMetric
                label='管理员'
                value={administratorCount}
              />
              <SummaryMetric
                label='普通用户'
                value={userCount}
              />
            </div>
          </div>
        </section>

        <section className='mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40'>
          <div className='flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <h2 className='text-base font-extrabold text-slate-900'>
                团队成员
              </h2>
              <p className='mt-1 text-sm font-medium text-slate-500'>
                点击“编辑角色”可为成员增减多个角色。
              </p>
            </div>

            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
              <label className='relative block min-w-0 sm:w-64'>
                <span className='sr-only'>搜索人员</span>
                <SearchIcon className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
                <input
                  type='search'
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder='搜索姓名、邮箱或账号'
                  className='h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50'
                />
              </label>
              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value as RoleCode | 'all')
                }
                aria-label='按角色筛选'
                className='h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50'
              >
                <option value='all'>全部角色</option>
                {ROLE_DEFINITIONS.map((role) => (
                  <option
                    key={role.code}
                    value={role.code}
                  >
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='min-w-[780px] w-full text-left'>
              <thead className='bg-slate-50/80 text-xs font-bold text-slate-500'>
                <tr>
                  <th className='px-5 py-3.5'>人员</th>
                  <th className='px-5 py-3.5'>账号状态</th>
                  <th className='px-5 py-3.5'>已分配角色</th>
                  <th className='px-5 py-3.5 text-right'>操作</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className='transition-colors hover:bg-slate-50/70'
                  >
                    <td className='px-5 py-4'>
                      <div className='flex items-center gap-3'>
                        <MemberAvatar member={member} />
                        <span className='min-w-0'>
                          <span className='block font-bold text-slate-800'>
                            {member.name}
                          </span>
                          <span className='mt-0.5 block truncate text-xs font-medium text-slate-400'>
                            {member.email}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className='px-5 py-4'>
                      <div className='text-sm font-semibold text-slate-600'>
                        @{member.username}
                      </div>
                      <StatusBadge status={member.status} />
                    </td>
                    <td className='px-5 py-4'>
                      <div className='flex max-w-md flex-wrap gap-1.5'>
                        {member.roles.length > 0 ? (
                          member.roles.map((roleCode) => (
                            <RoleBadge
                              key={roleCode}
                              roleCode={roleCode}
                            />
                          ))
                        ) : (
                          <span className='rounded-md border border-dashed border-slate-200 px-2 py-1 text-xs font-semibold text-slate-400'>
                            暂未分配
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-5 py-4 text-right'>
                      <button
                        type='button'
                        onClick={() => setEditingMemberId(member.id)}
                        disabled={isSaving || isLoading}
                        className='inline-flex items-center gap-1.5 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700 transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60'
                      >
                        <EditIcon className='h-3.5 w-3.5' />
                        编辑角色
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isLoading && (
            <div className='px-5 py-14 text-center'>
              <UsersIcon className='mx-auto h-8 w-8 text-slate-300' />
              <p className='mt-3 text-sm font-bold text-slate-500'>
                正在加载用户列表
              </p>
            </div>
          )}

          {!isLoading && loadError && (
            <div className='px-5 py-14 text-center'>
              <UsersIcon className='mx-auto h-8 w-8 text-rose-300' />
              <p className='mt-3 text-sm font-bold text-slate-600'>
                {loadError}
              </p>
              <button
                type='button'
                onClick={() => void loadMembers()}
                className='mt-2 text-sm font-bold text-sky-600 hover:text-sky-700'
              >
                重新加载
              </button>
            </div>
          )}

          {!isLoading && !loadError && filteredMembers.length === 0 && (
            <div className='px-5 py-14 text-center'>
              <UsersIcon className='mx-auto h-8 w-8 text-slate-300' />
              <p className='mt-3 text-sm font-bold text-slate-500'>
                {members.length === 0 ? '暂无用户' : '没有匹配的成员'}
              </p>
              {members.length > 0 && (
                <button
                  type='button'
                  onClick={() => {
                    setQuery('')
                    setRoleFilter('all')
                  }}
                  className='mt-2 text-sm font-bold text-sky-600 hover:text-sky-700'
                >
                  清除筛选
                </button>
              )}
            </div>
          )}

          <div className='flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
            <p className='text-xs font-medium text-slate-500'>
              {saveMessage ??
                loadError ??
                '保存将调用角色分配接口；每位成员至少需要保留一个角色。'}
            </p>
            <div className='flex items-center gap-2'>
              {changedMemberCount > 0 && (
                <button
                  type='button'
                  onClick={handleReset}
                  disabled={isSaving}
                  className='inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  <ResetIcon className='h-4 w-4' />
                  撤销更改
                </button>
              )}
              <button
                type='button'
                onClick={() => void handleSave()}
                disabled={changedMemberCount === 0 || isSaving || isLoading}
                aria-busy={isSaving}
                className='inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500'
              >
                <CheckIcon className='h-4 w-4' />
                {isSaving
                  ? '正在保存…'
                  : `保存更改${
                      changedMemberCount > 0 ? ` (${changedMemberCount})` : ''
                    }`}
              </button>
            </div>
          </div>
        </section>

        <section className='mt-6 grid gap-3 sm:grid-cols-2'>
          {ROLE_DEFINITIONS.map((role) => (
            <article
              key={role.code}
              className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30'
            >
              <div className='flex items-center gap-2'>
                <span className={`h-2 w-2 rounded-full ${role.dotClassName}`} />
                <h3 className='text-sm font-extrabold text-slate-800'>
                  {role.name}
                </h3>
              </div>
              <p className='mt-2 text-xs font-medium leading-5 text-slate-500'>
                {role.description}
              </p>
              <p className='mt-3 font-mono text-[11px] font-semibold text-slate-400'>
                {role.code}
              </p>
            </article>
          ))}
        </section>
      </main>

      {editingMember && (
        <div
          className='fixed inset-0 z-50 flex items-end bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-4'
          onClick={() => setEditingMemberId(null)}
        >
          <section
            role='dialog'
            aria-modal='true'
            aria-labelledby='role-dialog-title'
            className='w-full rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl'
            onClick={(event) => event.stopPropagation()}
          >
            <div className='flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6'>
              <div className='flex min-w-0 items-center gap-3'>
                <MemberAvatar
                  member={editingMember}
                  size='lg'
                />
                <div className='min-w-0'>
                  <h2
                    id='role-dialog-title'
                    className='truncate text-lg font-extrabold text-slate-900'
                  >
                    编辑 {editingMember.name} 的角色
                  </h2>
                  <p className='mt-0.5 truncate text-sm font-medium text-slate-400'>
                    @{editingMember.username} ·{' '}
                    {statusLabel(editingMember.status)}
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setEditingMemberId(null)}
                className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400'
                aria-label='关闭'
              >
                <CloseIcon className='h-5 w-5' />
              </button>
            </div>

            <div className='space-y-2 p-5 sm:p-6'>
              <p className='mb-3 text-sm font-medium text-slate-500'>
                可为同一人员分配多个角色；接口要求每位成员至少保留一个角色。
              </p>
              {ROLE_DEFINITIONS.map((role) => {
                const selected = editingMember.roles.includes(role.code)
                const cannotRemoveLastRole =
                  selected && editingMember.roles.length === 1

                return (
                  <button
                    key={role.code}
                    type='button'
                    onClick={() =>
                      handleRoleToggle(editingMember.id, role.code)
                    }
                    aria-pressed={selected}
                    disabled={isSaving || cannotRemoveLastRole}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60 ${
                      selected
                        ? 'border-sky-200 bg-sky-50/70'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        selected
                          ? 'border-sky-600 bg-sky-600 text-white'
                          : 'border-slate-300 bg-white text-transparent'
                      }`}
                    >
                      <CheckIcon className='h-3.5 w-3.5' />
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='flex items-center gap-2'>
                        <span
                          className={`h-2 w-2 rounded-full ${role.dotClassName}`}
                        />
                        <span className='text-sm font-extrabold text-slate-800'>
                          {role.name}
                        </span>
                      </span>
                      <span className='mt-1 block text-xs font-medium text-slate-500'>
                        {role.description}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <div className='flex justify-end border-t border-slate-100 px-5 py-4 sm:px-6'>
              <button
                type='button'
                onClick={() => setEditingMemberId(null)}
                disabled={isSaving}
                className='h-10 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2'
              >
                完成
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className='rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2.5 text-center backdrop-blur-sm sm:min-w-24'>
      <div className='text-xl font-extrabold text-white'>{value}</div>
      <div className='mt-0.5 text-[11px] font-bold text-slate-300'>{label}</div>
    </div>
  )
}

function MemberAvatar({
  member,
  size = 'md'
}: {
  member: 公共Member
  size?: 'md' | 'lg'
}) {
  const sizeClassName = size === 'lg' ? 'h-11 w-11' : 'h-10 w-10'

  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt=''
        className={`${sizeClassName} shrink-0 rounded-xl object-cover shadow-sm`}
      />
    )
  }

  return (
    <span
      className={`flex ${sizeClassName} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-extrabold text-white shadow-sm ${member.avatarClassName}`}
    >
      {member.initials}
    </span>
  )
}

function StatusBadge({ status }: { status?: number }) {
  const active = status !== 0

  return (
    <span
      className={`mt-1 inline-flex rounded-md border px-2 py-0.5 text-xs font-bold ${
        active
          ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-slate-100 text-slate-500'
      }`}
    >
      {statusLabel(status)}
    </span>
  )
}

function RoleBadge({ roleCode }: { roleCode: RoleCode }) {
  const role = ROLE_DEFINITIONS.find((item) => item.code === roleCode)

  if (!role) {
    return null
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-bold ${role.badgeClassName}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${role.dotClassName}`} />
      {role.name}
    </span>
  )
}

function memberFromAdminUser(user: AdminUser): 公共Member {
  const name =
    cleanText(user.nickname) || cleanText(user.username) || `用户 ${user.id}`
  const username = cleanText(user.username) || String(user.id)
  const email = cleanText(user.email) || '未设置邮箱'
  const roles = (user.roles ?? []).map((role) => role.code).filter(isRoleCode)

  return {
    id: user.id,
    name,
    initials: initialsFromName(name),
    email,
    username,
    roles,
    avatarUrl: cleanText(user.avatar),
    avatarClassName:
      AVATAR_CLASS_NAMES[Math.abs(user.id) % AVATAR_CLASS_NAMES.length],
    status: user.status
  }
}

function isRoleCode(value: string): value is RoleCode {
  return ROLE_CODES.includes(value as RoleCode)
}

function cleanText(value: string | undefined) {
  const text = value?.trim()
  return text || undefined
}

function initialsFromName(name: string) {
  const first = name.trim().charAt(0)
  return first ? first.toUpperCase() : '用'
}

function statusLabel(status?: number) {
  return status === 0 ? '已停用' : '启用中'
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function sameRoleSet(left: RoleCode[], right: RoleCode[]) {
  return (
    left.length === right.length && left.every((role) => right.includes(role))
  )
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='m14.5 5-7 7 7 7M8 12h10'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M12 3.5 19 6v5.8c0 4.3-2.9 7.9-7 8.7-4.1-.8-7-4.4-7-8.7V6l7-2.5Z'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinejoin='round'
      />
      <path
        d='m9.4 12 1.7 1.7 3.7-3.7'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='m20 20-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M16 20v-1.7a4.3 4.3 0 0 0-4.3-4.3H7.3A4.3 4.3 0 0 0 3 18.3V20m6.5-10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm5.5-6.5a3.4 3.4 0 0 1 0 6.6M21 20v-1.7a4.3 4.3 0 0 0-2.5-3.9'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='m14.7 5.3 4 4M5 19l3.6-.8L19 7.8a1.9 1.9 0 0 0-2.7-2.7L5.8 15.6 5 19Z'
        stroke='currentColor'
        strokeWidth='1.9'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='m5 12 4.2 4.2L19 6.8'
        stroke='currentColor'
        strokeWidth='2.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='m6 6 12 12M18 6 6 18'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  )
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M4 7v5h5M20 17v-5h-5M6.1 16.8A7.6 7.6 0 0 0 19 12.2M17.9 7.2A7.6 7.6 0 0 0 5 11.8'
        stroke='currentColor'
        strokeWidth='1.9'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default RoleAssignment
