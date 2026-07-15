import { redirect, type LoaderFunctionArgs } from 'react-router-dom'
import { getCurrentUser } from '../api/users'

export async function requireAuthLoader({ request }: LoaderFunctionArgs) {
  try {
    const user = await getCurrentUser()
    return user
  } catch {
    const url = new URL(request.url)
    const redirectTo = `${url.pathname}${url.search}${url.hash}`
    throw redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`)
  }
}

export async function requireAdminLoader(args: LoaderFunctionArgs) {
  const user = await requireAuthLoader(args)
  const isAdmin = user.roles?.some((role) => role.code === 'admin') ?? false

  if (!isAdmin) {
    throw redirect('/users')
  }

  return user
}

export async function loginLoader() {
  try {
    await getCurrentUser()
    throw redirect('/users')
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }

    return null
  }
}
