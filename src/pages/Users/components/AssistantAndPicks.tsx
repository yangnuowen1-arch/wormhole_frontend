import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Carousel,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  message
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useMemo, useState, type DragEvent } from 'react'
import type { Pick, Slide } from '../data'

interface AssistantAndPicksProps {
  editMode: boolean
  recommendations: Pick[]
  slides: Slide[]
  onOpenUrl: (url: string) => void
  onSaveRecommendations: (recommendations: Pick[]) => Promise<void> | void
  onSaveSlides: (slides: Slide[]) => Promise<void> | void
}

interface SlideFormValues {
  slides: Array<{
    id: string
    code: string
    title: string
    subtitle: string
    description: string
    buttonText: string
    targetUrl: string
    sortOrder?: number
    status?: number
  }>
}

const CAROUSEL_COLOR_SCHEMES = [
  { background: '#c8614f', accent: '#9248e8' },
  { background: '#1d5dc5', accent: '#3d70c9' },
  { background: '#4b29e4', accent: '#2e5afe' },
  { background: '#dc3805', accent: '#ee7900' },
  { background: '#078d97', accent: '#087ce5' },
  { background: '#bd285d', accent: '#7e48d2' }
] as const

const CAROUSEL_AUTOPLAY_SPEED = 5_000

interface RecommendationFormValues {
  title: string
  source?: string
  icon?: string
  targetUrl?: string
  publishedAt?: Dayjs
}

export function AssistantAndPicks({
  editMode,
  recommendations,
  slides,
  onOpenUrl,
  onSaveRecommendations,
  onSaveSlides
}: AssistantAndPicksProps) {
  return (
    <div className='space-y-5 sm:space-y-6'>
      <SlidesPanel
        editMode={editMode}
        slides={slides}
        onOpenUrl={onOpenUrl}
        onSaveSlides={onSaveSlides}
      />
      <TodayRecommend
        editMode={editMode}
        recommendations={recommendations}
        onOpenUrl={onOpenUrl}
        onSaveRecommendations={onSaveRecommendations}
      />
    </div>
  )
}

function SlidesPanel({
  editMode,
  slides,
  onOpenUrl,
  onSaveSlides
}: {
  editMode: boolean
  slides: Slide[]
  onOpenUrl: (url: string) => void
  onSaveSlides: (slides: Slide[]) => Promise<void> | void
}) {
  const orderedSlides = useMemo(
    () => [...slides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [slides]
  )
  const visibleSlides = useMemo(
    () => orderedSlides.filter((slide) => (slide.status ?? 1) !== 0),
    [orderedSlides]
  )
  const colorSchemeBySlideId = useMemo(
    () =>
      new Map(
        orderedSlides.map((slide, index) => [
          slide.id,
          CAROUSEL_COLOR_SCHEMES[index % CAROUSEL_COLOR_SCHEMES.length]
        ])
      ),
    [orderedSlides]
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form] = Form.useForm<SlideFormValues>()
  const safeActiveIndex =
    visibleSlides.length > 0
      ? Math.min(activeIndex, visibleSlides.length - 1)
      : 0
  const activeSlide = visibleSlides[safeActiveIndex] ?? visibleSlides[0]

  const openEditModal = () => {
    form.setFieldsValue({
      slides: visibleSlides.map((slide) => ({
        id: slide.id,
        code: slide.code ?? slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        buttonText: slide.buttonText,
        targetUrl: slide.targetUrl,
        sortOrder: slide.sortOrder,
        status: slide.status ?? 1
      }))
    })
    setIsModalOpen(true)
  }

  const saveSlides = async ({ slides: nextSlides }: SlideFormValues) => {
    const currentById = new Map(slides.map((slide) => [slide.id, slide]))
    const next = nextSlides.map((slide, index) => {
      const previous = currentById.get(slide.id)
      const title = slide.title.trim()

      return {
        ...previous,
        ...slide,
        buttonText: slide.buttonText.trim(),
        code: slide.code.trim(),
        description: slide.description.trim(),
        id: slide.id,
        sortOrder: slide.sortOrder ?? (index + 1) * 10,
        status: slide.status ?? previous?.status ?? 1,
        subtitle: slide.subtitle.trim(),
        targetUrl: slide.targetUrl.trim(),
        title
      }
    })

    setIsSaving(true)
    try {
      await onSaveSlides(next)
      message.success('轮播内容已保存')
      setIsModalOpen(false)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '轮播内容保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {editMode && !activeSlide && (
        <div className='flex justify-end'>
          <Button
            type='default'
            size='small'
            icon={<EditOutlined />}
            onClick={openEditModal}
          >
            管理轮播图
          </Button>
        </div>
      )}

      {activeSlide && (
        <Carousel
          afterChange={setActiveIndex}
          autoplay={
            !isModalOpen && !editMode && visibleSlides.length > 1
              ? { dotDuration: true }
              : false
          }
          autoplaySpeed={CAROUSEL_AUTOPLAY_SPEED}
          dotPlacement='bottom'
          draggable
          infinite={visibleSlides.length > 1}
          pauseOnFocus={false}
          pauseOnHover={false}
          rootClassName='overflow-hidden    rounded-2xl shadow-xl shadow-slate-950/10 [&_.slick-dots]:!bottom-4 [&_.slick-dots]:!z-20 [&_.slick-dots_li]:!mx-1 [&_.slick-dots_button]:!h-1 [&_.slick-dots_button]:!rounded-full'
          swipeToSlide
          touchMove
          waitForAnimate
        >
          {visibleSlides.map((slide) => {
            const colorScheme =
              colorSchemeBySlideId.get(slide.id) ?? CAROUSEL_COLOR_SCHEMES[0]

            return (
              <section
                key={slide.id}
                className='relative h-[300px] cursor-pointer align-bottom overflow-hidden text-white sm:h-[320px]'
                style={{ background: colorScheme.background }}
              >
                <div
                  className='absolute inset-0'
                  aria-hidden='true'
                >
                  <div
                    className='absolute inset-0'
                    style={{
                      background: `linear-gradient(135deg, ${colorScheme.background}, ${colorScheme.accent})`
                    }}
                  />
                  <div className='absolute -right-10 top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl' />
                  <div className='absolute bottom-8 right-10 h-28 w-44 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm' />
                  <div className='absolute bottom-16 right-20 h-3 w-28 rounded-full bg-white/35' />
                  <div className='absolute bottom-24 right-16 h-3 w-36 rounded-full bg-white/25' />
                </div>

                <div className='absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/35 to-slate-950/10' />

                <div className='relative z-10 flex h-full flex-col justify-between gap-5 p-5 pb-14 sm:p-6 sm:pb-16'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between gap-3'>
                      <div className='flex min-w-0 items-center gap-2.5'>
                        <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md'>
                          <SparklesIcon className='h-4 w-4' />
                        </span>
                        <span className='truncate text-sm font-bold tracking-wide'>
                          {slide.subtitle}
                        </span>
                      </div>

                      {editMode && (
                        <div className='flex items-center gap-1.5'>
                          <Button
                            type='text'
                            size='small'
                            icon={<EditOutlined />}
                            className='!text-white hover:!bg-white/15'
                            onClick={openEditModal}
                          >
                            管理
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className='max-w-[78%] space-y-2'>
                      <h3 className='text-xl font-extrabold leading-tight sm:text-2xl'>
                        {slide.title}
                      </h3>
                      <p className='line-clamp-3 text-sm font-semibold leading-relaxed text-white/80'>
                        {slide.description}
                      </p>
                    </div>
                  </div>

                  {slide.buttonText && (
                    <Button
                      className='w-fit !border-white !bg-white !px-4 !font-extrabold !text-slate-900 hover:!border-slate-100 hover:!bg-slate-100'
                      onClick={() => onOpenUrl(slide.targetUrl)}
                    >
                      {slide.buttonText}
                    </Button>
                  )}
                </div>
              </section>
            )
          })}
        </Carousel>
      )}

      <Modal
        title='管理轮播图'
        open={isModalOpen}
        width={880}
        okText='保存'
        cancelText='取消'
        onCancel={() => setIsModalOpen(false)}
        onOk={() => void form.submit()}
        confirmLoading={isSaving}
        destroyOnHidden
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={saveSlides}
        >
          <Form.List name='slides'>
            {(fields, { add, remove }) => (
              <div className='max-h-[560px] space-y-3 overflow-y-auto pr-1'>
                {fields.map((field, index) => (
                  <div
                    key={field.key}
                    className='rounded-xl border border-slate-100 bg-slate-50/70 p-3'
                  >
                    <Form.Item
                      name={[field.name, 'id']}
                      hidden
                    >
                      <Input />
                    </Form.Item>
                    <div className='mb-2 flex items-center justify-between gap-3'>
                      <span className='text-sm font-bold text-slate-700'>
                        轮播图 {index + 1}
                      </span>
                      <Button
                        danger
                        type='text'
                        size='small'
                        icon={<DeleteOutlined />}
                        disabled={fields.length === 1}
                        onClick={() => remove(field.name)}
                      >
                        移除
                      </Button>
                    </div>
                    <div className='grid grid-cols-1 gap-x-3 sm:grid-cols-2'>
                      <Form.Item
                        label='唯一标识'
                        name={[field.name, 'code']}
                        rules={[
                          { required: true, message: '请输入唯一标识' },
                          { max: 64, message: '唯一标识不能超过 64 个字符' }
                        ]}
                      >
                        <Input placeholder='resource-map' />
                      </Form.Item>
                      <Form.Item
                        label={`轮播 ${index + 1} 标题`}
                        name={[field.name, 'title']}
                        rules={[{ required: true, message: '请输入标题' }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        label='副标题'
                        name={[field.name, 'subtitle']}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        label='排序'
                        name={[field.name, 'sortOrder']}
                      >
                        <InputNumber
                          className='w-full'
                          min={0}
                        />
                      </Form.Item>
                      <Form.Item
                        label='状态'
                        name={[field.name, 'status']}
                      >
                        <Select
                          options={[
                            { label: '启用', value: 1 },
                            { label: '下架', value: 0 }
                          ]}
                        />
                      </Form.Item>
                      <Form.Item
                        label='按钮文案'
                        name={[field.name, 'buttonText']}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        label='跳转链接'
                        name={[field.name, 'targetUrl']}
                      >
                        <Input />
                      </Form.Item>
                    </div>
                    <Form.Item
                      label='描述'
                      name={[field.name, 'description']}
                      className='!mb-0'
                    >
                      <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
                    </Form.Item>
                  </div>
                ))}
                <Button
                  block
                  type='dashed'
                  icon={<PlusOutlined />}
                  onClick={() => {
                    const timestamp = Date.now()
                    const code = `slide-${timestamp}`

                    add({
                      buttonText: '查看详情',
                      code,
                      description: '',
                      id: createClientId('slide'),
                      sortOrder: (orderedSlides.length + 1) * 10,
                      status: 1,
                      subtitle: '资源专栏',
                      targetUrl: '',
                      title: ''
                    })
                  }}
                >
                  新增轮播图
                </Button>
                <p className='text-xs font-medium text-slate-400'>
                  移除已有轮播图会将其下架，不会物理删除；保存后会同步到前台。
                </p>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </>
  )
}

function TodayRecommend({
  editMode,
  recommendations,
  onOpenUrl,
  onSaveRecommendations
}: {
  editMode: boolean
  recommendations: Pick[]
  onOpenUrl: (url: string) => void
  onSaveRecommendations: (recommendations: Pick[]) => Promise<void> | void
}) {
  const orderedRecommendations = useMemo(
    () =>
      [...recommendations].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      ),
    [recommendations]
  )
  const visibleRecommendations = useMemo(
    () =>
      orderedRecommendations.filter(
        (recommendation) => recommendation.status !== 0
      ),
    [orderedRecommendations]
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingRecommendation, setEditingRecommendation] = useState<Pick>()
  const [draggingRecommendationId, setDraggingRecommendationId] =
    useState<string>()
  const [recommendationDropTargetId, setRecommendationDropTargetId] =
    useState<string>()
  const [form] = Form.useForm<RecommendationFormValues>()
  const canArrangeRecommendations = editMode && !isSaving

  const resetRecommendationDrag = () => {
    setDraggingRecommendationId(undefined)
    setRecommendationDropTargetId(undefined)
  }

  const openAddRecommendation = () => {
    setEditingRecommendation(undefined)
    form.setFieldsValue({
      icon: '▧',
      publishedAt: dayjs(),
      source: '',
      targetUrl: '',
      title: ''
    })
    setIsModalOpen(true)
  }

  const openEditRecommendation = (recommendation: Pick) => {
    setEditingRecommendation(recommendation)
    form.setFieldsValue({
      icon: recommendation.icon,
      publishedAt: recommendation.publishedAt
        ? dayjs(recommendation.publishedAt)
        : undefined,
      source: recommendation.source,
      targetUrl: recommendation.targetUrl ?? '',
      title: recommendation.title
    })
    setIsModalOpen(true)
  }

  const saveRecommendation = async (values: RecommendationFormValues) => {
    const title = values.title.trim()
    const existing = editingRecommendation
    const nextRecommendation: Pick = {
      ...existing,
      icon: values.icon?.trim() || existing?.icon || '▧',
      iconBg: existing?.iconBg ?? '#ecfdf5',
      iconColor: existing?.iconColor ?? '#059669',
      id: existing?.id ?? createClientId('recommendation'),
      publishedAt: values.publishedAt?.toISOString() ?? existing?.publishedAt,
      sortOrder:
        existing?.sortOrder ??
        (orderedRecommendations.at(-1)?.sortOrder ?? 0) + 10,
      source: values.source?.trim() || '',
      sourceUrl: existing?.sourceUrl,
      status: existing?.status ?? 1,
      subtitle: existing?.subtitle,
      targetUrl: values.targetUrl?.trim() || undefined,
      time: existing?.time ?? '刚刚',
      title
    }
    const next = existing
      ? recommendations.map((recommendation) =>
          recommendation.id === existing.id
            ? nextRecommendation
            : recommendation
        )
      : [...recommendations, nextRecommendation]

    setIsSaving(true)
    try {
      await onSaveRecommendations(next)
      message.success(existing ? '推荐已保存' : '推荐已添加')
      setIsModalOpen(false)
      setEditingRecommendation(undefined)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '今日推荐保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteRecommendation = async () => {
    if (!editingRecommendation) {
      return
    }

    setIsSaving(true)
    try {
      await onSaveRecommendations(
        recommendations.filter(
          (recommendation) => recommendation.id !== editingRecommendation.id
        )
      )
      message.success('推荐已下架')
      setIsModalOpen(false)
      setEditingRecommendation(undefined)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '今日推荐保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  const reorderRecommendations = async (targetId: string) => {
    const sourceId = draggingRecommendationId
    resetRecommendationDrag()

    if (!sourceId || sourceId === targetId || isSaving) {
      return
    }

    const reorderedVisible = reorderById(
      visibleRecommendations,
      sourceId,
      targetId
    )
    const visibleIds = new Set(
      visibleRecommendations.map((recommendation) => recommendation.id)
    )
    let visibleIndex = 0
    const next = orderedRecommendations
      .map((recommendation) =>
        visibleIds.has(recommendation.id)
          ? reorderedVisible[visibleIndex++]
          : recommendation
      )
      .map((recommendation, index) => ({
        ...recommendation,
        sortOrder: (index + 1) * 10
      }))

    setIsSaving(true)
    try {
      await onSaveRecommendations(next)
      message.success('推荐排序已保存')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '推荐排序保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <section
        id='recommendations'
        className='rounded-2xl mt-3 border border-slate-100 bg-white p-5 shadow-sm sm:p-6'
      >
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <h3 className='flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base'>
              <span className='text-emerald-600'>▧</span>
              今日推荐
            </h3>
            <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600'>
              {visibleRecommendations.length} 条
            </span>
          </div>
        </div>

        <div className='space-y-3'>
          {visibleRecommendations.map((pick) => (
            <article
              key={pick.id}
              onDragEnd={resetRecommendationDrag}
              onDragOver={(event) => {
                if (!canArrangeRecommendations || !draggingRecommendationId) {
                  return
                }
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                if (draggingRecommendationId !== pick.id) {
                  setRecommendationDropTargetId(pick.id)
                }
              }}
              onDrop={(event) => {
                event.preventDefault()
                void reorderRecommendations(pick.id)
              }}
              className={`group flex items-center gap-3 rounded-xl p-2 transition-all duration-200 ${
                draggingRecommendationId === pick.id
                  ? 'scale-[0.98] bg-slate-50 opacity-50'
                  : recommendationDropTargetId === pick.id
                    ? 'bg-sky-50 ring-1 ring-sky-300'
                    : 'hover:bg-slate-50'
              }`}
            >
              <button
                type='button'
                onClick={() => onOpenUrl(pick.targetUrl ?? '#')}
                className='flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-sky-500'
                aria-label={`打开 ${pick.title}`}
              >
                <span
                  className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold'
                  style={{
                    backgroundColor: pick.iconBg,
                    color: pick.iconColor
                  }}
                >
                  {pick.icon}
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block w-full truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-sky-700'>
                    {pick.title}
                  </span>
                  <span className='mt-0.5 block truncate text-[11px] font-semibold text-slate-400'>
                    {pick.source}
                  </span>
                </span>
              </button>
              <span className='shrink-0 text-[11px] font-semibold text-slate-400'>
                {pick.time}
              </span>
              {editMode && (
                <div className='flex shrink-0 items-center gap-1'>
                  <Button
                    type='text'
                    size='small'
                    icon={<EditOutlined />}
                    onClick={() => openEditRecommendation(pick)}
                  >
                    编辑
                  </Button>
                  <button
                    type='button'
                    draggable={canArrangeRecommendations}
                    disabled={!canArrangeRecommendations}
                    onDragStart={(event: DragEvent<HTMLButtonElement>) => {
                      event.dataTransfer.effectAllowed = 'move'
                      setDraggingRecommendationId(pick.id)
                      setRecommendationDropTargetId(undefined)
                    }}
                    className='flex h-7 w-7 cursor-grab touch-none items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-sky-50 hover:text-sky-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40'
                    aria-label={`拖拽调整 ${pick.title} 的顺序`}
                    title='拖拽调整顺序'
                  >
                    <DragHandleIcon />
                  </button>
                </div>
              )}
            </article>
          ))}
          {editMode && (
            <button
              type='button'
              onClick={openAddRecommendation}
              disabled={isSaving}
              className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-sky-200 bg-sky-50/40 px-3 py-3 text-sm font-bold text-sky-700 transition-colors hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <PlusOutlined />
              添加今日推荐
            </button>
          )}
        </div>
      </section>

      <Modal
        title={editingRecommendation ? '编辑推荐' : '添加今日推荐'}
        open={isModalOpen}
        width={640}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        destroyOnHidden
      >
        <Form
          form={form}
          layout='vertical'
          onFinish={saveRecommendation}
        >
          <div className='grid grid-cols-1 gap-x-3 sm:grid-cols-[80px_minmax(0,1fr)]'>
            <Form.Item
              label='图标'
              name='icon'
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='标题'
              name='title'
              rules={[{ required: true, message: '请输入推荐标题' }]}
            >
              <Input />
            </Form.Item>
          </div>
          <div className='grid grid-cols-1 gap-x-3 sm:grid-cols-2'>
            <Form.Item
              label='来源'
              name='source'
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='跳转链接'
              name='targetUrl'
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='发布时间'
              name='publishedAt'
            >
              <DatePicker
                showTime={{ format: 'HH:mm:ss' }}
                format='YYYY-MM-DD HH:mm:ss'
                className='w-full'
                placeholder='请选择发布时间'
              />
            </Form.Item>
          </div>
          <div className='flex justify-between gap-2'>
            <span>
              {editingRecommendation && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={isSaving}
                  onClick={() => void deleteRecommendation()}
                >
                  删除
                </Button>
              )}
            </span>
            <span className='flex gap-2'>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button
                type='primary'
                htmlType='submit'
                loading={isSaving}
              >
                保存
              </Button>
            </span>
          </div>
        </Form>
      </Modal>
    </>
  )
}

function reorderById<T extends { id: string }>(
  items: T[],
  sourceId: string,
  targetId: string
) {
  const sourceIndex = items.findIndex((item) => item.id === sourceId)
  const targetIndex = items.findIndex((item) => item.id === targetId)

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return items
  }

  const next = [...items]
  const [source] = next.splice(sourceIndex, 1)
  next.splice(targetIndex, 0, source)
  return next
}

function createClientId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function DragHandleIcon() {
  return (
    <svg
      aria-hidden='true'
      className='h-4 w-4'
      fill='currentColor'
      viewBox='0 0 16 16'
    >
      <circle
        cx='5'
        cy='3.5'
        r='1.25'
      />
      <circle
        cx='11'
        cy='3.5'
        r='1.25'
      />
      <circle
        cx='5'
        cy='8'
        r='1.25'
      />
      <circle
        cx='11'
        cy='8'
        r='1.25'
      />
      <circle
        cx='5'
        cy='12.5'
        r='1.25'
      />
      <circle
        cx='11'
        cy='12.5'
        r='1.25'
      />
    </svg>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M12 3.5 13.7 8l4.8 1.7-4.8 1.8L12 16l-1.7-4.5-4.8-1.8L10.3 8 12 3.5Z'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinejoin='round'
      />
    </svg>
  )
}
