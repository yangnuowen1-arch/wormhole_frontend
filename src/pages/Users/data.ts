export interface NavItem {
  id: string
  label: string
  icon: string
}

export interface Shortcut {
  key: string
  label: string
  icon: string
  color: string
}

export interface Pick {
  id: string
  title: string
  source: string
  time: string
  icon: string
  iconBg: string
  iconColor: string
}

export interface Tool {
  id: string
  name: string
  role: string
  domain: string
  short: string
  color: string
  bg: string
}

export interface ResourceCategory {
  id: string
  label: string
  icon: string
}

export interface Resource {
  id: string
  name: string
  short: string
  orgType: string
  models: string
  followers: string
  tier?: 'Enterprise' | 'Team'
  category: string
  color: string
  bg: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '首页', icon: '⌂' },
  { id: 'discover', label: '发现', icon: '◎' },
  { id: 'favorites', label: '收藏', icon: '☆' },
  { id: 'recent', label: '最近', icon: '◷' },
  { id: 'collections', label: '收藏夹', icon: '❏' },
  { id: 'security', label: '安全', icon: '⛨' },
]

export const SHORTCUTS: Shortcut[] = [
  { key: 'github', label: 'GitHub', icon: '</>', color: '#1f2328' },
  { key: 'vercel', label: 'Vercel', icon: '▲', color: '#1f2328' },
  { key: 'figma', label: 'Figma', icon: '❖', color: '#f24e1e' },
  { key: 'claude', label: 'Claude', icon: '✳', color: '#8b5cf6' },
  { key: 'linear', label: 'Linear', icon: '▤', color: '#5e6ad2' },
  { key: 'supabase', label: 'Supabase', icon: '⬡', color: '#3ecf8e' },
]

export const PICKS: Pick[] = [
  { id: 'p1', title: '用 Vercel Edge Config 更快发布', source: 'Vercel 博客', time: '1 小时前', icon: '⚡', iconBg: '#eef2ff', iconColor: '#6366f1' },
  { id: 'p2', title: 'Claude 3.5：工程师需要了解的要点', source: 'Anthropic', time: '3 小时前', icon: '✳', iconBg: '#f5f3ff', iconColor: '#8b5cf6' },
  { id: 'p3', title: '用 Figma Variables 打造可扩展的设计系统', source: 'Figma', time: '5 小时前', icon: '❖', iconBg: '#fff1ed', iconColor: '#f24e1e' },
  { id: 'p4', title: '大规模零停机 Postgres 迁移实践', source: 'PlanetScale', time: '8 小时前', icon: '⬢', iconBg: '#ecfdf5', iconColor: '#10b981' },
]

// 常用工具（横向卡片：图标 + 名称 + 用途 + 域名）
export const TOOLS: Tool[] = [
  { id: 'claude', name: 'Claude', role: 'AI 助手', domain: 'claude.ai', short: 'Cl', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'vercel', name: 'Vercel', role: '部署平台', domain: 'vercel.com', short: 'Ve', color: '#1f2328', bg: '#f3f4f6' },
  { id: 'figma', name: 'Figma', role: '设计工具', domain: 'figma.com', short: 'Fi', color: '#f24e1e', bg: '#fff1ed' },
  { id: 'linear', name: 'Linear', role: '项目管理', domain: 'linear.app', short: 'Li', color: '#5e6ad2', bg: '#eef0ff' },
  { id: 'grafana', name: 'Grafana', role: '数据可视化', domain: 'grafana.com', short: 'Gr', color: '#f46800', bg: '#fff4ec' },
]

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { id: 'all', label: '全部资源', icon: '❖' },
  { id: 'development', label: '开发工具', icon: '</>' },
  { id: 'design', label: '设计资源', icon: '◈' },
  { id: 'ai', label: 'AI 与机器学习', icon: '✳' },
  { id: 'productivity', label: '生产力工具', icon: '⚡' },
  { id: 'data', label: '数据与分析', icon: '▤' },
  { id: 'infrastructure', label: '基础设施', icon: '⬡' },
  { id: 'security', label: '安全工具', icon: '⛨' },
]

// 资源中心（机构目录卡片：logo + 名称 + 徽章 + 机构类型 · 模型数 · 关注者）
export const RESOURCES: Resource[] = [
  { id: 'ai2', name: 'Ai2', short: 'A2', orgType: '非营利组织', models: '968 个模型', followers: '6.24k 关注者', tier: 'Enterprise', category: 'ai', color: '#ec4899', bg: '#1a1a2e' },
  { id: 'meta', name: 'AI at Meta', short: 'M', orgType: '公司', models: '2.35k 个模型', followers: '13.6k 关注者', tier: 'Enterprise', category: 'ai', color: '#0866ff', bg: '#e7f0ff' },
  { id: 'amazon', name: 'Amazon', short: 'a', orgType: '公司', models: '36 个模型', followers: '4.14k 关注者', tier: 'Enterprise', category: 'infrastructure', color: '#ff9900', bg: '#fff7e6' },
  { id: 'google', name: 'Google', short: 'G', orgType: '公司', models: '1.13k 个模型', followers: '61.1k 关注者', tier: 'Enterprise', category: 'ai', color: '#4285f4', bg: '#eaf1fe' },
  { id: 'intel', name: 'Intel', short: 'in', orgType: '公司', models: '255 个模型', followers: '4.07k 关注者', tier: 'Enterprise', category: 'infrastructure', color: '#0068b5', bg: '#e6f2fb' },
  { id: 'microsoft', name: 'Microsoft', short: 'MS', orgType: '公司', models: '523 个模型', followers: '20.7k 关注者', tier: 'Enterprise', category: 'ai', color: '#00a4ef', bg: '#eaf6fe' },
  { id: 'grammarly', name: 'Grammarly', short: 'Gr', orgType: '公司', models: '11 个模型', followers: '226 关注者', tier: 'Team', category: 'productivity', color: '#15c39a', bg: '#e7f9f3' },
  { id: 'writer', name: 'Writer', short: 'W', orgType: '公司', models: '38 个模型', followers: '397 关注者', tier: 'Enterprise', category: 'productivity', color: '#1f2328', bg: '#f3f4f6' },
  { id: 'anthropic', name: 'Anthropic', short: 'An', orgType: '公司', models: '42 个模型', followers: '18.9k 关注者', tier: 'Enterprise', category: 'ai', color: '#d97757', bg: '#fbf0ec' },
  { id: 'openai', name: 'OpenAI', short: 'Oa', orgType: '公司', models: '29 个模型', followers: '45.3k 关注者', tier: 'Enterprise', category: 'ai', color: '#10a37f', bg: '#e7f7f2' },
  { id: 'mistral', name: 'Mistral AI', short: 'Mi', orgType: '公司', models: '88 个模型', followers: '12.4k 关注者', tier: 'Enterprise', category: 'ai', color: '#fa520f', bg: '#fff0e9' },
  { id: 'huggingface', name: 'Hugging Face', short: 'HF', orgType: '公司', models: '1.9k 个模型', followers: '88.2k 关注者', tier: 'Enterprise', category: 'development', color: '#ffb000', bg: '#fff6e0' },
  { id: 'github', name: 'GitHub', short: 'GH', orgType: '公司', models: '19 个模型', followers: '8.3k 关注者', tier: 'Enterprise', category: 'development', color: '#1f2328', bg: '#f3f4f6' },
  { id: 'databricks', name: 'Databricks', short: 'Db', orgType: '公司', models: '143 个模型', followers: '15.4k 关注者', tier: 'Enterprise', category: 'data', color: '#ff3621', bg: '#ffece9' },
  { id: 'nvidia', name: 'NVIDIA', short: 'nv', orgType: '公司', models: '476 个模型', followers: '32.1k 关注者', tier: 'Enterprise', category: 'infrastructure', color: '#76b900', bg: '#f1f8e3' },
  { id: 'salesforce', name: 'Salesforce', short: 'Sf', orgType: '公司', models: '91 个模型', followers: '5.6k 关注者', tier: 'Enterprise', category: 'data', color: '#00a1e0', bg: '#e6f5fc' },
  { id: 'cohere', name: 'Cohere', short: 'Co', orgType: '公司', models: '34 个模型', followers: '7.1k 关注者', tier: 'Team', category: 'ai', color: '#39594d', bg: '#eaefed' },
  { id: 'ibm', name: 'IBM', short: 'IB', orgType: '公司', models: '388 个模型', followers: '11.2k 关注者', tier: 'Enterprise', category: 'security', color: '#0f62fe', bg: '#e8effe' },
  { id: 'cloudflare', name: 'Cloudflare', short: 'CF', orgType: '公司', models: '15 个模型', followers: '4.9k 关注者', tier: 'Enterprise', category: 'security', color: '#f38020', bg: '#fff5eb' },
  { id: 'adobe', name: 'Adobe', short: 'Ad', orgType: '公司', models: '52 个模型', followers: '6.7k 关注者', tier: 'Enterprise', category: 'design', color: '#fa0f00', bg: '#ffeceb' },
  { id: 'canva', name: 'Canva', short: 'Ca', orgType: '公司', models: '5 个模型', followers: '1.1k 关注者', tier: 'Team', category: 'design', color: '#00c4cc', bg: '#e3fafb' },
  { id: 'notion', name: 'Notion', short: 'No', orgType: '公司', models: '7 个模型', followers: '512 关注者', tier: 'Team', category: 'productivity', color: '#1f2328', bg: '#f3f4f6' },
  { id: 'bytedance', name: 'ByteDance', short: 'Bd', orgType: '公司', models: '210 个模型', followers: '9.2k 关注者', tier: 'Enterprise', category: 'ai', color: '#325ab4', bg: '#eaeff8' },
  { id: 'databend', name: 'Together AI', short: 'To', orgType: '公司', models: '156 个模型', followers: '6.8k 关注者', tier: 'Team', category: 'infrastructure', color: '#1f2328', bg: '#f3f4f6' },
]
