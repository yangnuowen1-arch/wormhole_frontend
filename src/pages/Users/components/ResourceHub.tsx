import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, Modal, Select, message } from 'antd'
import { useMemo, useState, type DragEvent, type FormEvent } from 'react'
import type { Resource, ResourceCategory } from '../data'

const ALL_CATEGORY: ResourceCategory = {
  id: 'all',
  label: '全部资源',
  sortOrder: 0
}

interface ResourceHubProps {
  activeSearchQuery: string
  allResources: Resource[]
  categories: ResourceCategory[]
  editMode: boolean
  favoriteIds: string[]
  isSearchLoading: boolean
  recentSearches: string[]
  resources: Resource[]
  searchQuery: string
  onOpenResource: (resource: Resource) => void
  onSaveResourceHub: (change: {
    categories: ResourceCategory[]
    removedCategories: ResourceCategory[]
    resources: Resource[]
    removedResources: Resource[]
  }) =>
    | Promise<{ categories: ResourceCategory[]; resources: Resource[] }>
    | {
        categories: ResourceCategory[]
        resources: Resource[]
      }
  onSearchQueryChange: (value: string) => void
  onSearchResourceSelect: (resource: Resource) => void
  onSearchSubmit: (query: string) => void
  onToggleFavorite: (resource: Resource) => void
}

interface ResourceFormValues {
  category: string
  description?: string
  name: string
  orgType: string
  targetUrl?: string
  tier?: Resource['tier'] | ''
}

interface CategoryFormValues {
  categories: Array<{
    id: string
    label: string
  }>
}

type HubChange = {
  categories: ResourceCategory[]
  removedCategories: ResourceCategory[]
  resources: Resource[]
  removedResources: Resource[]
}

export function ResourceHub({
  activeSearchQuery,
  allResources,
  categories,
  editMode,
  favoriteIds,
  isSearchLoading,
  recentSearches,
  resources,
  searchQuery,
  onOpenResource,
  onSaveResourceHub,
  onSearchQueryChange,
  onSearchResourceSelect,
  onSearchSubmit,
  onToggleFavorite
}: ResourceHubProps) {
  const [active, setActive] = useState('all')
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource>()
  const [draggingCategoryId, setDraggingCategoryId] = useState<string>()
  const [draggingResourceId, setDraggingResourceId] = useState<string>()
  const [categoryDropTargetId, setCategoryDropTargetId] = useState<string>()
  const [resourceDropTargetId, setResourceDropTargetId] = useState<string>()
  const [categoryForm] = Form.useForm<CategoryFormValues>()
  const [resourceForm] = Form.useForm<ResourceFormValues>()
  const normalizedQuery = searchQuery.trim().toLowerCase()

  const orderedCategories = useMemo(
    () => [
      ALL_CATEGORY,
      ...sortByOrder(categories.filter((category) => category.id !== 'all'))
    ],
    [categories]
  )
  const editableCategories = orderedCategories.filter(
    (category) => category.id !== ALL_CATEGORY.id
  )
  const categoryOptions = editableCategories.map((category) => ({
    label: category.label,
    value: category.id
  }))

  const filtered = useMemo(() => {
    const next =
      active === ALL_CATEGORY.id
        ? resources
        : resources.filter((resource) => resource.category === active)

    return sortByOrder(next)
  }, [active, resources])

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return []
    }

    return resources
      .filter((resource) => {
        const content = [
          resource.name,
          resource.orgType,
          resource.category,
          resource.description,
          resource.models,
          resource.followers
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return content.includes(normalizedQuery)
      })
      .slice(0, 6)
  }, [normalizedQuery, resources])

  const showSearchPanel =
    isSearchFocused &&
    (isSearchLoading ||
      (normalizedQuery ? searchResults.length > 0 : recentSearches.length > 0))
  const canArrangeItems = editMode && !activeSearchQuery && !isSaving

  const persistHubChange = async (
    change: HubChange,
    successMessage: string
  ) => {
    setIsSaving(true)
    try {
      const saved = await onSaveResourceHub(change)
      message.success(successMessage)
      return saved
    } catch (error) {
      message.error(error instanceof Error ? error.message : '资源中心保存失败')
      return undefined
    } finally {
      setIsSaving(false)
    }
  }

  const resetCategoryDrag = () => {
    setDraggingCategoryId(undefined)
    setCategoryDropTargetId(undefined)
  }

  const resetResourceDrag = () => {
    setDraggingResourceId(undefined)
    setResourceDropTargetId(undefined)
  }

  const handleCategoryDrop = async (targetId: string) => {
    const sourceId = draggingCategoryId
    resetCategoryDrag()

    if (!sourceId || sourceId === targetId || isSaving) {
      return
    }

    const nextCategories = assignSortOrder(
      reorderById(
        sortByOrder(categories.filter((category) => category.id !== 'all')),
        sourceId,
        targetId
      )
    )
    await persistHubChange(
      {
        categories: nextCategories,
        removedCategories: [],
        resources: allResources,
        removedResources: []
      },
      '分类排序已保存'
    )
  }

  const handleResourceDrop = async (targetId: string) => {
    const sourceId = draggingResourceId
    resetResourceDrag()

    if (!sourceId || sourceId === targetId || isSaving) {
      return
    }

    const nextResources = reorderVisibleResources(
      allResources,
      filtered,
      sourceId,
      targetId
    )
    await persistHubChange(
      {
        categories,
        removedCategories: [],
        resources: nextResources,
        removedResources: []
      },
      '资源排序已保存'
    )
  }

  const openCategoryManager = () => {
    categoryForm.setFieldsValue({
      categories: editableCategories.map((category) => ({
        id: category.id,
        label: category.label
      }))
    })
    setIsCategoryModalOpen(true)
  }

  const saveCategories = async ({ categories: values }: CategoryFormValues) => {
    const current = new Map(
      categories.map((category) => [category.id, category])
    )
    const nextCategories = values.map((category, index) => ({
      ...current.get(category.id),
      id: category.id,
      label: category.label.trim(),
      sortOrder: current.get(category.id)?.sortOrder ?? (index + 1) * 10
    }))
    const categoryIds = new Set(nextCategories.map((category) => category.id))

    if (nextCategories.some((category) => !category.label)) {
      message.error('请输入分类名称')
      return
    }
    if (hasDuplicateLabels(nextCategories)) {
      message.error('分类名称不能重复')
      return
    }

    const resourcesInRemovedCategory = allResources.some(
      (resource) => !categoryIds.has(resource.category)
    )
    if (resourcesInRemovedCategory) {
      message.error('删除分类前，请先调整或删除其下资源')
      return
    }

    const removedCategories = categories.filter(
      (category) =>
        category.id !== 'all' &&
        typeof category.numericId === 'number' &&
        !categoryIds.has(category.id)
    )
    const saved = await persistHubChange(
      {
        categories: nextCategories,
        removedCategories,
        resources: allResources,
        removedResources: []
      },
      '分类已保存'
    )

    if (saved) {
      if (active !== ALL_CATEGORY.id && !categoryIds.has(active)) {
        setActive(ALL_CATEGORY.id)
      }
      setIsCategoryModalOpen(false)
    }
  }

  const openAddResource = () => {
    const category =
      active !== ALL_CATEGORY.id &&
      categoryOptions.some((item) => item.value === active)
        ? active
        : categoryOptions[0]?.value

    if (!category) {
      message.warning('请先添加至少一个分类')
      return
    }

    setEditingResource(undefined)
    resourceForm.setFieldsValue({
      category,
      description: '',
      name: '',
      orgType: '资源',
      targetUrl: '',
      tier: ''
    })
    setIsResourceModalOpen(true)
  }

  const openEditResource = (resource: Resource) => {
    setEditingResource(resource)
    resourceForm.setFieldsValue({
      category: resource.category,
      description: resource.description ?? '',
      name: resource.name,
      orgType: resource.orgType,
      targetUrl: resource.targetUrl ?? '',
      tier: resource.tier ?? ''
    })
    setIsResourceModalOpen(true)
  }

  const saveResource = async (values: ResourceFormValues) => {
    const name = values.name.trim()
    if (!name) {
      message.error('请输入资源名称')
      return
    }

    const existing = editingResource
    const nextResource: Resource = {
      ...existing,
      bg: existing?.bg ?? '#f1f5f9',
      category: values.category,
      color: existing?.color ?? '#0f172a',
      description: values.description?.trim() || undefined,
      followerCount: existing?.followerCount,
      followers: existing?.followers ?? '0 关注者',
      id: existing?.id ?? createClientId('resource'),
      modelCount: existing?.modelCount,
      models: existing?.models ?? '0 个模型',
      name,
      orgType: values.orgType.trim() || '资源',
      short: existing?.short ?? resourceInitials(name),
      sortOrder:
        existing?.sortOrder ??
        (sortByOrder(allResources).at(-1)?.sortOrder ?? 0) + 10,
      targetUrl: values.targetUrl?.trim() || undefined,
      tier: values.tier || undefined
    }
    const nextResources = existing
      ? allResources.map((resource) =>
          resource.id === existing.id ? nextResource : resource
        )
      : [...allResources, nextResource]
    const saved = await persistHubChange(
      {
        categories,
        removedCategories: [],
        resources: nextResources,
        removedResources: []
      },
      existing ? '资源已保存' : '资源已添加'
    )

    if (saved) {
      setIsResourceModalOpen(false)
      setEditingResource(undefined)
    }
  }

  const deleteResource = async () => {
    if (!editingResource) {
      return
    }

    const saved = await persistHubChange(
      {
        categories,
        removedCategories: [],
        resources: allResources.filter(
          (resource) => resource.id !== editingResource.id
        ),
        removedResources:
          typeof editingResource.numericId === 'number' ? [editingResource] : []
      },
      '资源已删除'
    )

    if (saved) {
      setIsResourceModalOpen(false)
      setEditingResource(undefined)
    }
  }

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (searchQuery.trim()) {
      setActive(ALL_CATEGORY.id)
      setIsSearchFocused(false)
      onSearchSubmit(searchQuery)
    }
  }

  return (
    <>
      <section className='rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6'>
        <div className='mb-5 grid gap-4 sm:mb-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center'>
          <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center'>
            <div className='flex shrink-0 items-center gap-2'>
              <h3 className='text-sm font-bold text-slate-900 sm:text-base'>
                资源中心
              </h3>
              <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600'>
                {activeSearchQuery
                  ? `搜索到 ${resources.length} 个资源`
                  : `共 ${resources.length} 个资源`}
              </span>
              {editMode && (
                <Button
                  type='text'
                  size='small'
                  icon={<EditOutlined />}
                  onClick={openCategoryManager}
                >
                  管理分类
                </Button>
              )}
            </div>

            <form
              className='relative w-full min-w-0 sm:max-w-sm xl:max-w-md'
              onSubmit={handleSearchSubmit}
            >
              <button
                type='submit'
                aria-label='搜索资源'
                title='搜索资源'
                disabled={isSearchLoading || !searchQuery.trim()}
                className='absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-sky-600 disabled:pointer-events-none disabled:opacity-60'
              >
                <SearchIcon className='h-4 w-4' />
              </button>
              <input
                type='search'
                value={searchQuery}
                onBlur={() =>
                  window.setTimeout(() => setIsSearchFocused(false), 140)
                }
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder='搜索资源、AI 工具、文档...'
                className='w-full rounded-xl border border-transparent bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:bg-slate-100/70 focus:border-sky-200 focus:bg-white focus:ring-4 focus:ring-sky-50'
              />

              {showSearchPanel && (
                <div className='absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70'>
                  {isSearchLoading ? (
                    <div className='px-3 py-3 text-sm font-semibold text-slate-500'>
                      搜索中...
                    </div>
                  ) : !normalizedQuery ? (
                    <div className='p-2'>
                      <div className='px-2 pb-1 pt-1 text-[11px] font-bold text-slate-400'>
                        最近搜索
                      </div>
                      {recentSearches.slice(0, 4).map((query) => (
                        <button
                          key={query}
                          type='button'
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            onSearchQueryChange(query)
                            setActive(ALL_CATEGORY.id)
                            onSearchSubmit(query)
                            setIsSearchFocused(false)
                          }}
                          className='flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950'
                        >
                          <HistoryIcon className='h-4 w-4 text-slate-400' />
                          <span className='truncate'>{query}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className='p-2'>
                      <div className='px-2 pb-1 pt-1 text-[11px] font-bold text-slate-400'>
                        搜索结果
                      </div>
                      {searchResults.map((resource) => (
                        <button
                          key={resource.id}
                          type='button'
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setActive(ALL_CATEGORY.id)
                            onSearchResourceSelect(resource)
                            setIsSearchFocused(false)
                          }}
                          className='flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-slate-50'
                        >
                          <span
                            className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold'
                            style={{
                              backgroundColor: resource.bg,
                              color: resource.color
                            }}
                          >
                            {resource.short}
                          </span>
                          <span className='min-w-0 flex-1'>
                            <span className='block truncate text-sm font-bold text-slate-800'>
                              {resource.name}
                            </span>
                            <span className='block truncate text-[11px] font-semibold text-slate-400'>
                              {resource.orgType} · {resource.models}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          <div className='no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1 text-xs font-semibold sm:text-sm'>
            {orderedCategories.map((category) => {
              const isActive = category.id === active
              const isDraggable =
                canArrangeItems && category.id !== ALL_CATEGORY.id

              return (
                <button
                  key={category.id}
                  type='button'
                  draggable={isDraggable}
                  onClick={() => setActive(category.id)}
                  onDragEnd={resetCategoryDrag}
                  onDragStart={(event) => {
                    if (!isDraggable) {
                      return
                    }
                    setDraggingCategoryId(category.id)
                    event.dataTransfer.effectAllowed = 'move'
                    event.dataTransfer.setData('text/plain', category.id)
                  }}
                  onDragOver={(event) => {
                    if (
                      !isDraggable ||
                      !draggingCategoryId ||
                      category.id === draggingCategoryId
                    ) {
                      return
                    }
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                    setCategoryDropTargetId(category.id)
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    void handleCategoryDrop(category.id)
                  }}
                  className={`shrink-0 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-sky-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-950'
                  } ${
                    isDraggable
                      ? 'cursor-grab active:cursor-grabbing'
                      : 'cursor-pointer'
                  } ${
                    categoryDropTargetId === category.id
                      ? 'ring-2 ring-sky-400 ring-offset-1'
                      : ''
                  }`}
                  title={
                    isDraggable
                      ? '拖拽调整分类顺序'
                      : category.label.replace('资源', '')
                  }
                >
                  {category.label.replace('资源', '')}
                </button>
              )
            })}
          </div>
        </div>

        {editMode && !activeSearchQuery && (
          <p className='mb-4 text-xs font-medium text-slate-400'>
            拖拽分类或资源卡片右侧手柄即可调整显示顺序。
          </p>
        )}

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {filtered.map((resource) => (
            <ResourceCard
              key={resource.id}
              isEditing={editMode}
              isFavorite={favoriteIds.includes(resource.id)}
              isDraggable={canArrangeItems}
              isDropTarget={resourceDropTargetId === resource.id}
              isDragging={draggingResourceId === resource.id}
              resource={resource}
              onDragEnd={resetResourceDrag}
              onDragOver={(event) => {
                if (
                  !canArrangeItems ||
                  !draggingResourceId ||
                  resource.id === draggingResourceId
                ) {
                  return
                }
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                setResourceDropTargetId(resource.id)
              }}
              onDragStart={(event) => {
                if (!canArrangeItems) {
                  return
                }
                setDraggingResourceId(resource.id)
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', resource.id)
              }}
              onDrop={(event) => {
                event.preventDefault()
                void handleResourceDrop(resource.id)
              }}
              onEditResource={openEditResource}
              onOpenResource={onOpenResource}
              onToggleFavorite={onToggleFavorite}
            />
          ))}

          {editMode && !activeSearchQuery && (
            <button
              type='button'
              onClick={openAddResource}
              disabled={isSaving || categoryOptions.length === 0}
              className='flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-sky-200 bg-sky-50/30 p-4 text-sm font-bold text-sky-600 transition-colors hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-45'
            >
              <span className='flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm'>
                <PlusOutlined />
              </span>
              添加资源
            </button>
          )}

          {filtered.length === 0 && !editMode && (
            <div className='col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-sm font-semibold text-slate-400'>
              {activeSearchQuery
                ? `没有找到与“${activeSearchQuery}”相关的资源`
                : '暂无资源'}
            </div>
          )}
        </div>
      </section>

      <Modal
        title='管理分类'
        open={isCategoryModalOpen}
        width={640}
        footer={null}
        onCancel={() => setIsCategoryModalOpen(false)}
        destroyOnHidden
      >
        <Form
          form={categoryForm}
          layout='vertical'
          onFinish={saveCategories}
        >
          <p className='mb-4 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500'>
            显示顺序可直接在上方分类栏拖拽调整。
          </p>
          <Form.List name='categories'>
            {(fields, { add, remove }) => (
              <div className='space-y-3'>
                {fields.map((field) => (
                  <div
                    key={field.key}
                    className='flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3'
                  >
                    <Form.Item
                      name={[field.name, 'id']}
                      hidden
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      className='!mb-0 flex-1'
                      label='分类名称'
                      name={[field.name, 'label']}
                      rules={[{ required: true, message: '请输入分类名称' }]}
                    >
                      <Input placeholder='例如：开发工具' />
                    </Form.Item>
                    <Button
                      danger
                      type='text'
                      icon={<DeleteOutlined />}
                      className='mt-7'
                      onClick={() => remove(field.name)}
                      aria-label='删除分类'
                    />
                  </div>
                ))}
                <Button
                  block
                  type='dashed'
                  icon={<PlusOutlined />}
                  onClick={() =>
                    add({
                      id: createClientId('category'),
                      label: ''
                    })
                  }
                >
                  添加分类
                </Button>
              </div>
            )}
          </Form.List>
          <div className='mt-5 flex justify-end gap-2'>
            <Button onClick={() => setIsCategoryModalOpen(false)}>取消</Button>
            <Button
              type='primary'
              htmlType='submit'
              loading={isSaving}
            >
              保存分类
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={editingResource ? '编辑资源' : '添加资源'}
        open={isResourceModalOpen}
        width={680}
        footer={null}
        onCancel={() => setIsResourceModalOpen(false)}
        destroyOnHidden
      >
        <Form
          form={resourceForm}
          layout='vertical'
          onFinish={saveResource}
        >
          <div className='grid grid-cols-1 gap-x-3 sm:grid-cols-2'>
            <Form.Item
              label='资源名称'
              name='name'
              rules={[{ required: true, message: '请输入资源名称' }]}
            >
              <Input placeholder='例如：Figma' />
            </Form.Item>
            <Form.Item
              label='机构类型'
              name='orgType'
            >
              <Input placeholder='例如：设计工具' />
            </Form.Item>
            <Form.Item
              label='分类'
              name='category'
              rules={[{ required: true, message: '请选择资源分类' }]}
            >
              <Select options={categoryOptions} />
            </Form.Item>
            <Form.Item
              label='标签'
              name='tier'
            >
              <Select
                allowClear
                options={[
                  { label: '技术', value: '技术' },
                  { label: '公共', value: '公共' }
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item
            label='跳转链接'
            name='targetUrl'
          >
            <Input placeholder='https://example.com' />
          </Form.Item>
          <Form.Item
            label='描述'
            name='description'
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 4 }}
              placeholder='简要介绍资源用途'
            />
          </Form.Item>
          <div className='flex justify-between gap-2'>
            <span>
              {editingResource && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={isSaving}
                  onClick={() => void deleteResource()}
                >
                  删除资源
                </Button>
              )}
            </span>
            <span className='flex gap-2'>
              <Button onClick={() => setIsResourceModalOpen(false)}>
                取消
              </Button>
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

function ResourceCard({
  isDraggable,
  isDragging,
  isDropTarget,
  isEditing,
  isFavorite,
  resource,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onEditResource,
  onOpenResource,
  onToggleFavorite
}: {
  isDraggable: boolean
  isDragging: boolean
  isDropTarget: boolean
  isEditing: boolean
  isFavorite: boolean
  resource: Resource
  onDragEnd: () => void
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDragStart: (event: DragEvent<HTMLButtonElement>) => void
  onDrop: (event: DragEvent<HTMLElement>) => void
  onEditResource: (resource: Resource) => void
  onOpenResource: (resource: Resource) => void
  onToggleFavorite: (resource: Resource) => void
}) {
  const canToggleFavorite =
    typeof resource.numericId === 'number' &&
    Number.isFinite(resource.numericId)

  return (
    <article
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`group relative rounded-xl border bg-slate-50/30 p-4 transition-all duration-200 hover:border-sky-100 hover:bg-white hover:shadow-md ${
        isDragging
          ? 'scale-[0.98] border-sky-200 opacity-50'
          : isDropTarget
            ? 'border-sky-400 bg-sky-50 shadow-md shadow-sky-100'
            : 'border-slate-100'
      }`}
    >
      <button
        type='button'
        onClick={() => onOpenResource(resource)}
        className='absolute inset-0 z-10 cursor-pointer rounded-xl bg-transparent outline-none transition-colors active:bg-sky-50/50 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2'
        aria-label={`打开 ${resource.name}`}
      />

      <div className='flex items-center justify-between gap-3'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <span
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold'
            style={{ backgroundColor: resource.bg, color: resource.color }}
          >
            {resource.short}
          </span>
          <div className='min-w-0 flex-1'>
            <span className='block w-full truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-sky-700'>
              {resource.name}
            </span>
          </div>
        </div>

        <div className='relative z-20 flex shrink-0 items-center gap-1.5'>
          {isEditing && (
            <button
              type='button'
              onClick={() => onEditResource(resource)}
              className='rounded-md px-2 cursor-pointer py-1 text-xs font-bold text-sky-600 transition-colors hover:bg-sky-50'
            >
              编辑
            </button>
          )}
          {resource.tier && (
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                resource.tier === '技术'
                  ? 'bg-sky-50 text-sky-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {resource.tier}
            </span>
          )}
          <button
            type='button'
            onClick={() => onToggleFavorite(resource)}
            disabled={!canToggleFavorite}
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
              isFavorite
                ? 'bg-amber-50 text-amber-400 hover:bg-amber-100'
                : 'text-slate-300 hover:bg-slate-100 hover:text-amber-400'
            } disabled:cursor-not-allowed disabled:opacity-40`}
            aria-label={
              canToggleFavorite
                ? isFavorite
                  ? '取消星标'
                  : '加入常用工具'
                : '资源同步后可加入常用工具'
            }
          >
            ★
          </button>
          {isEditing && (
            <button
              type='button'
              draggable={isDraggable}
              onDragStart={onDragStart}
              disabled={!isDraggable}
              className='flex h-7 w-7 cursor-grab touch-none items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-sky-50 hover:text-sky-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40'
              aria-label={`拖拽调整 ${resource.name} 的顺序`}
              title='拖拽调整顺序'
            >
              <DragHandleIcon />
            </button>
          )}
        </div>
      </div>

      <p className='pointer-events-none mt-3 truncate text-xs font-semibold text-slate-500'>
        {resource.orgType} · {resource.category} ·{' '}
        {resource.description ?? '企业资源与模型生态入口。'}
      </p>
    </article>
  )
}

function sortByOrder<T extends { sortOrder?: number }>(items: T[]) {
  return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

function assignSortOrder<T extends { sortOrder?: number }>(items: T[]) {
  return items.map((item, index) => ({
    ...item,
    sortOrder: (index + 1) * 10
  }))
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

function reorderVisibleResources(
  allResources: Resource[],
  visibleResources: Resource[],
  sourceId: string,
  targetId: string
) {
  const nextVisible = reorderById(visibleResources, sourceId, targetId)
  const visibleIds = new Set(visibleResources.map((resource) => resource.id))
  let index = 0
  const next = sortByOrder(allResources).map((resource) =>
    visibleIds.has(resource.id) ? nextVisible[index++] : resource
  )

  return assignSortOrder(next)
}

function hasDuplicateLabels(categories: ResourceCategory[]) {
  const labels = new Set<string>()

  return categories.some((category) => {
    const label = category.label.trim().toLocaleLowerCase()
    if (labels.has(label)) {
      return true
    }
    labels.add(label)
    return false
  })
}

function createClientId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function resourceInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? 'R'
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? ''
  return `${first}${second}`.toUpperCase()
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
        d='m21 21-4.35-4.35M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  )
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <path
        d='M12 8v4l2.5 1.5M21 12a9 9 0 1 1-2.64-6.36'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M21 4v5h-5'
        stroke='currentColor'
        strokeWidth='1.8'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
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
