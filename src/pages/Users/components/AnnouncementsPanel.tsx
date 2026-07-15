import {
  CloseOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SoundOutlined
} from '@ant-design/icons'
import {
  Button,
  Drawer,
  Empty,
  Form,
  Grid,
  Input,
  Modal,
  Popover,
  Select,
  Spin,
  Switch,
  Tag,
  message
} from 'antd'
import { forwardRef, useMemo, useState, type ButtonHTMLAttributes } from 'react'
import type { AdminAnnouncementPayload } from '../../../api/workbench'
import type { Announcement } from '../data'

interface AnnouncementsPanelProps {
  adminAnnouncements: Announcement[]
  announcements: Announcement[]
  isAdmin: boolean
  isAdminAnnouncementsLoading: boolean
  onLoadAdminAnnouncements: () => Promise<void> | void
  onSaveAnnouncement: (
    announcement: Announcement | undefined,
    payload: AdminAnnouncementPayload
  ) => Promise<void> | void
  onUpdateAnnouncementStatus: (
    announcement: Announcement,
    status: number
  ) => Promise<void> | void
}

interface AnnouncementFormValues {
  content: string
  expiresAt?: string
  isPinned: boolean
  publishedAt?: string
  status: number
  title: string
}

const STATUS_OPTIONS = [
  { label: '发布', value: 1 },
  { label: '草稿/下架', value: 0 }
]

export function AnnouncementsPanel({
  adminAnnouncements,
  announcements,
  isAdmin,
  isAdminAnnouncementsLoading,
  onLoadAdminAnnouncements,
  onSaveAnnouncement,
  onUpdateAnnouncementStatus
}: AnnouncementsPanelProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isManageOpen, setIsManageOpen] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<
    Announcement | undefined
  >()
  const [statusChangingId, setStatusChangingId] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)
  const [form] = Form.useForm<AnnouncementFormValues>()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.sm

  const orderedAnnouncements = useMemo(
    () => [...announcements].sort(compareAnnouncements),
    [announcements]
  )
  const orderedAdminAnnouncements = useMemo(
    () => [...adminAnnouncements].sort(compareAnnouncements),
    [adminAnnouncements]
  )
  const hasAnnouncements = orderedAnnouncements.length > 0

  const openManageModal = () => {
    setIsPopoverOpen(false)
    setIsMobileDrawerOpen(false)
    setIsManageOpen(true)
    void Promise.resolve(onLoadAdminAnnouncements()).catch(() => undefined)
  }

  const openEditor = (announcement?: Announcement) => {
    setEditingAnnouncement(announcement)
    form.setFieldsValue({
      content: announcement?.content ?? '',
      expiresAt: isoToLocalDateTime(announcement?.expiresAt),
      isPinned: announcement?.isPinned ?? false,
      publishedAt: isoToLocalDateTime(announcement?.publishedAt),
      status: announcement?.status ?? 1,
      title: announcement?.title ?? ''
    })
    setIsEditorOpen(true)
  }

  const closeEditor = () => {
    setIsEditorOpen(false)
    setEditingAnnouncement(undefined)
    form.resetFields()
  }

  const saveAnnouncement = async (values: AnnouncementFormValues) => {
    setIsSaving(true)
    try {
      await onSaveAnnouncement(editingAnnouncement, {
        content: values.content,
        expiresAt: localDateTimeToApiValue(values.expiresAt),
        isPinned: values.isPinned,
        publishedAt: localDateTimeToApiValue(values.publishedAt),
        status: values.status,
        title: values.title
      })
      message.success(editingAnnouncement ? '公告已保存' : '公告已创建')
      closeEditor()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '公告保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleStatus = async (announcement: Announcement) => {
    const nextStatus = announcement.status === 1 ? 0 : 1

    setStatusChangingId(announcement.id)
    try {
      await onUpdateAnnouncementStatus(announcement, nextStatus)
      message.success(nextStatus === 1 ? '公告已发布' : '公告已下架')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '公告状态更新失败')
    } finally {
      setStatusChangingId(undefined)
    }
  }

  return (
    <>
      {isMobile ? (
        <>
          <AnnouncementTrigger
            hasAnnouncements={hasAnnouncements}
            onClick={() => setIsMobileDrawerOpen(true)}
          />
          <Drawer
            open={isMobileDrawerOpen}
            placement='bottom'
            closable={false}
            height='min(78dvh, 560px)'
            styles={{
              body: { padding: 0 },
              content: {
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                overflow: 'hidden'
              }
            }}
            onClose={() => setIsMobileDrawerOpen(false)}
          >
            <AnnouncementPopoverContent
              announcements={orderedAnnouncements}
              isAdmin={isAdmin}
              isSheet
              onClose={() => setIsMobileDrawerOpen(false)}
              onOpenManage={openManageModal}
            />
          </Drawer>
        </>
      ) : (
        <Popover
          arrow={false}
          content={
            <AnnouncementPopoverContent
              announcements={orderedAnnouncements}
              isAdmin={isAdmin}
              onOpenManage={openManageModal}
            />
          }
          open={isPopoverOpen}
          placement='bottomRight'
          trigger='click'
          styles={{
            root: { width: 340, maxWidth: 'calc(100vw - 2rem)' },
            container: { padding: 0 }
          }}
          onOpenChange={setIsPopoverOpen}
        >
          <AnnouncementTrigger
            hasAnnouncements={hasAnnouncements}
            title='通知公告'
          />
        </Popover>
      )}

      <Modal
        title='公告管理'
        open={isManageOpen}
        width={isMobile ? 'calc(100% - 2rem)' : 900}
        footer={null}
        onCancel={() => setIsManageOpen(false)}
        destroyOnHidden
      >
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <span className='text-sm font-semibold text-slate-500'>
            共 {orderedAdminAnnouncements.length} 条公告
          </span>
          <div className='flex items-center gap-2'>
            <Button
              icon={<ReloadOutlined />}
              onClick={() =>
                void Promise.resolve(onLoadAdminAnnouncements()).catch(
                  () => undefined
                )
              }
            >
              刷新
            </Button>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => openEditor()}
            >
              新增公告
            </Button>
          </div>
        </div>

        {isAdminAnnouncementsLoading ? (
          <div className='flex min-h-44 items-center justify-center'>
            <Spin />
          </div>
        ) : orderedAdminAnnouncements.length === 0 ? (
          <Empty description='暂无公告' />
        ) : (
          <div className='max-h-[560px] space-y-3 overflow-y-auto pr-1'>
            {orderedAdminAnnouncements.map((announcement) => (
              <article
                key={announcement.id}
                className='rounded-xl border border-slate-100 bg-slate-50/70 p-4'
              >
                <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-2 flex flex-wrap items-center gap-2'>
                      <h3 className='max-w-full break-words text-sm font-bold text-slate-900'>
                        {announcement.title}
                      </h3>
                      {announcement.isPinned && <Tag color='gold'>置顶</Tag>}
                      <Tag
                        color={announcement.status === 1 ? 'green' : 'default'}
                      >
                        {announcement.status === 1 ? '已发布' : '草稿/下架'}
                      </Tag>
                    </div>
                    <p className='line-clamp-2 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-600'>
                      {announcement.content}
                    </p>
                    <div className='mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-400'>
                      <span>
                        发布时间：
                        {formatDateTime(announcement.publishedAt) || '立即'}
                      </span>
                      <span>
                        到期时间：
                        {formatDateTime(announcement.expiresAt) || '永不过期'}
                      </span>
                      <span>
                        更新：{formatDateTime(announcement.updatedAt) || '-'}
                      </span>
                    </div>
                  </div>

                  <div className='flex shrink-0 items-center gap-2'>
                    <Button
                      size='small'
                      icon={<EditOutlined />}
                      onClick={() => openEditor(announcement)}
                    >
                      编辑
                    </Button>
                    <Button
                      size='small'
                      loading={statusChangingId === announcement.id}
                      onClick={() => void toggleStatus(announcement)}
                    >
                      {announcement.status === 1 ? '下架' : '发布'}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        title={editingAnnouncement ? '编辑公告' : '新增公告'}
        open={isEditorOpen}
        width={isMobile ? 'calc(100% - 2rem)' : 720}
        okText='保存'
        cancelText='取消'
        confirmLoading={isSaving}
        onCancel={closeEditor}
        onOk={() => void form.submit()}
        destroyOnHidden
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={saveAnnouncement}
          initialValues={{ isPinned: false, status: 1 }}
        >
          <Form.Item
            label='标题'
            name='title'
            rules={[{ required: true, message: '请输入公告标题' }]}
          >
            <Input
              maxLength={128}
              showCount
            />
          </Form.Item>
          <Form.Item
            label='内容'
            name='content'
            rules={[{ required: true, message: '请输入公告内容' }]}
          >
            <Input.TextArea
              autoSize={{ minRows: 4, maxRows: 8 }}
              maxLength={10000}
              showCount
            />
          </Form.Item>

          <div className='grid grid-cols-1 gap-x-3 sm:grid-cols-2'>
            <Form.Item
              label='状态'
              name='status'
            >
              <Select options={STATUS_OPTIONS} />
            </Form.Item>
            <Form.Item
              label='置顶'
              name='isPinned'
              valuePropName='checked'
            >
              <Switch
                checkedChildren='置顶'
                unCheckedChildren='普通'
              />
            </Form.Item>
            <Form.Item
              label='发布时间'
              name='publishedAt'
            >
              <Input type='datetime-local' />
            </Form.Item>
            <Form.Item
              label='到期时间'
              name='expiresAt'
            >
              <Input type='datetime-local' />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  )
}

function AnnouncementPopoverContent({
  announcements,
  isAdmin,
  isSheet = false,
  onClose,
  onOpenManage
}: {
  announcements: Announcement[]
  isAdmin: boolean
  isSheet?: boolean
  onClose?: () => void
  onOpenManage: () => void
}) {
  return (
    <div
      className={`w-full p-3 sm:p-4 ${
        isSheet
          ? 'flex h-full min-h-0 flex-col overflow-hidden'
          : 'max-h-[calc(100dvh-2rem)] overflow-y-auto'
      }`}
    >
      <div className='mb-3 flex shrink-0 items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700'>
            <SoundOutlined />
          </span>
          <div className='min-w-0'>
            <h3 className='truncate text-sm font-bold text-slate-900'>
              通知公告
            </h3>
            <span className='block text-[11px] font-semibold text-slate-400'>
              {announcements.length} 条可见公告
            </span>
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-1'>
          {isAdmin && (
            <Button
              type='text'
              size='small'
              icon={<EditOutlined />}
              onClick={onOpenManage}
            >
              管理
            </Button>
          )}
          {onClose && (
            <button
              type='button'
              aria-label='关闭通知公告'
              onClick={onClose}
              className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500'
            >
              <CloseOutlined className='text-sm' />
            </button>
          )}
        </div>
      </div>

      {announcements.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description='暂无公告'
        />
      ) : (
        <div
          className={
            isSheet
              ? 'min-h-0 flex-1 space-y-2 overflow-y-auto pr-1'
              : 'max-h-[min(420px,calc(100dvh-10rem))] space-y-2 overflow-y-auto pr-1'
          }
        >
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className='rounded-xl border border-slate-100 bg-slate-50/70 p-3'
            >
              <div className='mb-1.5 flex items-start gap-2'>
                {announcement.isPinned && (
                  <Tag
                    className='!mr-0 shrink-0'
                    color='gold'
                  >
                    置顶
                  </Tag>
                )}
                <h4 className='min-w-0 flex-1 break-words text-sm font-bold leading-5 text-slate-900'>
                  {announcement.title}
                </h4>
              </div>
              <p className='whitespace-pre-wrap break-words text-xs font-semibold leading-5 text-slate-600'>
                {announcement.content}
              </p>
              <div className='mt-2 text-[11px] font-semibold text-slate-400'>
                {formatDateTime(
                  announcement.publishedAt || announcement.createdAt
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

interface AnnouncementTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hasAnnouncements: boolean
}

const AnnouncementTrigger = forwardRef<
  HTMLButtonElement,
  AnnouncementTriggerProps
>(function AnnouncementTrigger(
  { hasAnnouncements, className, ...buttonProps },
  ref
) {
  return (
    <button
      ref={ref}
      type='button'
      aria-label='通知公告'
      {...buttonProps}
      className={`relative cursor-pointer flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${className ?? ''}`}
    >
      <BellIcon className='h-4 w-4' />
      {hasAnnouncements && (
        <span className='absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500' />
      )}
    </button>
  )
})

function compareAnnouncements(a: Announcement, b: Announcement) {
  if (a.isPinned !== b.isPinned) {
    return a.isPinned ? -1 : 1
  }

  return announcementTimestamp(b) - announcementTimestamp(a)
}

function announcementTimestamp(announcement: Announcement) {
  const timestamp = Date.parse(
    announcement.publishedAt ??
      announcement.updatedAt ??
      announcement.createdAt ??
      ''
  )
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function formatDateTime(value?: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function isoToLocalDateTime(value?: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

function localDateTimeToApiValue(value?: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M18 9.8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7ZM14 20a2.2 2.2 0 0 1-4 0'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
