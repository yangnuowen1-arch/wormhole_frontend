export interface NavItem {
  id: string
  label: string
  icon: string
}

export interface StatCard {
  id: string
  value: string
  label: string
  hint: string
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

export interface PinnedSite {
  id: string
  name: string
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
  desc: string
  category: string
  categoryLabel: string
  domain: string
  color: string
  bg: string
  starred?: boolean
  isNew?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'discover', label: 'Discover', icon: '◎' },
  { id: 'favorites', label: 'Favorites', icon: '☆' },
  { id: 'recent', label: 'Recent', icon: '◷' },
  { id: 'collections', label: 'Collections', icon: '❏' },
  { id: 'security', label: 'Security', icon: '⛨' },
]

export const STATS: StatCard[] = [
  { id: 'resources', value: '27', label: 'Resources', hint: '+3 this week', icon: '⊕' },
  { id: 'pinned', value: '6', label: 'Pinned', hint: 'Quick access', icon: '☆' },
  { id: 'collections', value: '4', label: 'Collections', hint: '2 shared', icon: '❏' },
  { id: 'recent', value: '12', label: 'Recent', hint: 'Last 7 days', icon: '◷' },
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
  { id: 'p1', title: 'Ship faster with Vercel Edge Config', source: 'Vercel Blog', time: '1h ago', icon: '⚡', iconBg: '#eef2ff', iconColor: '#6366f1' },
  { id: 'p2', title: 'Claude 3.5: What engineers need to know', source: 'Anthropic', time: '3h ago', icon: '✳', iconBg: '#f5f3ff', iconColor: '#8b5cf6' },
  { id: 'p3', title: 'Design systems that scale with Figma Variables', source: 'Figma', time: '5h ago', icon: '❖', iconBg: '#fff1ed', iconColor: '#f24e1e' },
  { id: 'p4', title: 'Zero-downtime Postgres migrations at scale', source: 'PlanetScale', time: '8h ago', icon: '⬢', iconBg: '#ecfdf5', iconColor: '#10b981' },
]

export const PINNED: PinnedSite[] = [
  { id: 'claude', name: 'Claude', domain: 'claude.ai', short: 'Cl', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'vercel', name: 'Vercel', domain: 'vercel.com', short: 'Ve', color: '#1f2328', bg: '#f3f4f6' },
  { id: 'figma', name: 'Figma', domain: 'figma.com', short: 'Fi', color: '#f24e1e', bg: '#fff1ed' },
  { id: 'linear', name: 'Linear', domain: 'linear.app', short: 'Li', color: '#5e6ad2', bg: '#eef0ff' },
  { id: 'grafana', name: 'Grafana', domain: 'grafana.com', short: 'Gr', color: '#f46800', bg: '#fff4ec' },
]

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { id: 'all', label: 'All Resources', icon: '❖' },
  { id: 'development', label: 'Development', icon: '</>' },
  { id: 'design', label: 'Design', icon: '◈' },
  { id: 'ai', label: 'AI & ML', icon: '✳' },
  { id: 'productivity', label: 'Productivity', icon: '⚡' },
  { id: 'data', label: 'Data & Analytics', icon: '▤' },
  { id: 'infrastructure', label: 'Infrastructure', icon: '⬡' },
  { id: 'security', label: 'Security', icon: '⛨' },
]

export const RESOURCES: Resource[] = [
  { id: 'claude', name: 'Claude', short: 'Cl', desc: "Anthropic's advanced AI for analysis, coding, writing, and nuanced...", category: 'ai', categoryLabel: 'AI & ML', domain: 'claude.ai', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'copilot', name: 'GitHub Copilot', short: 'GH', desc: 'AI pair programmer that suggests code completions across your editor...', category: 'ai', categoryLabel: 'AI & ML', domain: 'github.com/copilot', color: '#1f2328', bg: '#f3f4f6', isNew: true },
  { id: 'perplexity', name: 'Perplexity', short: 'Px', desc: 'AI-powered search that delivers direct answers with live citations from the...', category: 'ai', categoryLabel: 'AI & ML', domain: 'perplexity.ai', color: '#20808d', bg: '#e8f6f7' },
  { id: 'runway', name: 'Runway ML', short: 'RW', desc: 'Next-generation AI creative suite for video generation, inpainting, and...', category: 'ai', categoryLabel: 'AI & ML', domain: 'runwayml.com', color: '#1f2328', bg: '#f3f4f6' },
  { id: 'replicate', name: 'Replicate', short: 'Re', desc: 'Run and fine-tune open-source AI models via a simple API. Pay only fo...', category: 'ai', categoryLabel: 'AI & ML', domain: 'replicate.com', color: '#1f2328', bg: '#f3f4f6' },
  { id: 'vercel', name: 'Vercel', short: 'Ve', desc: 'Deploy web projects with zero configuration. Edge functions,...', category: 'development', categoryLabel: 'Development', domain: 'vercel.com', color: '#1f2328', bg: '#f3f4f6', starred: true },
  { id: 'github', name: 'GitHub', short: 'GH', desc: "The world's leading platform for version control, collaboration, and...", category: 'development', categoryLabel: 'Development', domain: 'github.com', color: '#1f2328', bg: '#f3f4f6' },
  { id: 'tailwind', name: 'Tailwind CSS', short: 'TW', desc: 'Utility-first CSS framework for rapidly building modern interfaces in any...', category: 'development', categoryLabel: 'Development', domain: 'tailwindcss.com', color: '#06b6d4', bg: '#ecfeff' },
  { id: 'retool', name: 'Retool', short: 'Rt', desc: 'Build internal tools remarkably fast. Drag-and-drop builder with powerful...', category: 'development', categoryLabel: 'Development', domain: 'retool.com', color: '#3d3d3d', bg: '#f3f4f6' },
  { id: 'supabase', name: 'Supabase', short: 'Sb', desc: 'Open source Firebase alternative with Postgres, auth, storage, and edge...', category: 'development', categoryLabel: 'Development', domain: 'supabase.com', color: '#3ecf8e', bg: '#ecfdf5', isNew: true },
  { id: 'bun', name: 'Bun', short: 'Bu', desc: 'A fast all-in-one JavaScript runtime, bundler, transpiler, and package...', category: 'development', categoryLabel: 'Development', domain: 'bun.sh', color: '#f472b6', bg: '#fdf2f8' },
  { id: 'figma', name: 'Figma', short: 'Fi', desc: 'Collaborative interface design tool for prototyping, components, and desig...', category: 'design', categoryLabel: 'Design', domain: 'figma.com', color: '#f24e1e', bg: '#fff1ed', starred: true },
  { id: 'framer', name: 'Framer', short: 'Fr', desc: 'Design and publish stunning sites with rich animations and zero code...', category: 'design', categoryLabel: 'Design', domain: 'framer.com', color: '#1f2328', bg: '#f3f4f6' },
  { id: 'spline', name: 'Spline', short: 'Sp', desc: 'Create and publish 3D web experiences collaboratively, right in...', category: 'design', categoryLabel: 'Design', domain: 'spline.design', color: '#e5484d', bg: '#fef2f2' },
  { id: 'mobbin', name: 'Mobbin', short: 'Mo', desc: "Save time on UI & UX research with world's largest mobile and web app...", category: 'design', categoryLabel: 'Design', domain: 'mobbin.com', color: '#6366f1', bg: '#eef2ff' },
  { id: 'linear', name: 'Linear', short: 'Li', desc: 'The issue tracker built for high-performance teams. Streamline...', category: 'productivity', categoryLabel: 'Productivity', domain: 'linear.app', color: '#5e6ad2', bg: '#eef0ff', starred: true },
  { id: 'notion', name: 'Notion', short: 'No', desc: "All-in-one workspace for notes, wikis, tasks, and databases. Your team's...", category: 'productivity', categoryLabel: 'Productivity', domain: 'notion.so', color: '#1f2328', bg: '#f3f4f6' },
  { id: 'raycast', name: 'Raycast', short: 'Rc', desc: 'Blazingly fast productivity launcher for macOS. Control all your tools in...', category: 'productivity', categoryLabel: 'Productivity', domain: 'raycast.com', color: '#ff6363', bg: '#fff1f1' },
  { id: 'loom', name: 'Loom', short: 'Lo', desc: 'Record and share async video messages for demos, feedback, and...', category: 'productivity', categoryLabel: 'Productivity', domain: 'loom.com', color: '#625df5', bg: '#eef0ff' },
  { id: 'grafana', name: 'Grafana', short: 'Gr', desc: 'Open-source observability platform for metrics, logs, traces, and...', category: 'data', categoryLabel: 'Data & Analytics', domain: 'grafana.com', color: '#f46800', bg: '#fff4ec', starred: true },
  { id: 'datadog', name: 'Datadog', short: 'Dd', desc: 'Cloud monitoring and security platform for full-stack observability...', category: 'data', categoryLabel: 'Data & Analytics', domain: 'datadoghq.com', color: '#632ca6', bg: '#f4effb' },
  { id: 'metabase', name: 'Metabase', short: 'Mb', desc: 'The easy, open source way to share data and analytics across your...', category: 'data', categoryLabel: 'Data & Analytics', domain: 'metabase.com', color: '#509ee3', bg: '#eef6fd' },
  { id: 'cloudflare', name: 'Cloudflare', short: 'CF', desc: 'Global network for security, CDN, DNS, and Zero Trust solutions at any...', category: 'infrastructure', categoryLabel: 'Infrastructure', domain: 'cloudflare.com', color: '#f38020', bg: '#fff5eb' },
  { id: 'aws', name: 'AWS Console', short: 'AW', desc: 'Manage your Amazon Web Services resources, compute, storage, and...', category: 'infrastructure', categoryLabel: 'Infrastructure', domain: 'console.aws.amazon.com', color: '#ff9900', bg: '#fff7e6' },
  { id: 'planetscale', name: 'PlanetScale', short: 'PS', desc: "The world's most advanced serverless MySQL platform, built for...", category: 'infrastructure', categoryLabel: 'Infrastructure', domain: 'planetscale.com', color: '#1f2328', bg: '#f3f4f6' },
  { id: '1password', name: '1Password', short: '1P', desc: 'Password manager and secure digital wallet for teams and enterprise...', category: 'security', categoryLabel: 'Security', domain: '1password.com', color: '#1a8cff', bg: '#e9f4ff' },
  { id: 'snyk', name: 'Snyk', short: 'Sk', desc: 'Developer security platform that helps find and fix vulnerabilities in code an...', category: 'security', categoryLabel: 'Security', domain: 'snyk.io', color: '#4c4a73', bg: '#eeeef5' },
]
