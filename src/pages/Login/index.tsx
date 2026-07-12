import { useCallback, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PrismaticBurst from '../../components/PrismaticBurst'
import TextType from '../../components/TextType'
import SpotlightCard from '../../components/SpotlightCard'
import { API_BASE_URL } from '../../api/request'

const burstColors = ['#06B6D4', '#3B82F6', '#10B981']

const burstOffset = { x: 0, y: 0 }

function Login() {
  const [open, setOpen] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const signInStartedRef = useRef(false)
  const [searchParams] = useSearchParams()
  const returnTo = useMemo(
    () => normalizeReturnTo(searchParams.get('redirect')),
    [searchParams],
  )
  const handleLogin = useCallback(() => {
    if (signInStartedRef.current) {
      return
    }

    signInStartedRef.current = true
    setIsSigningIn(true)
    handleSSOLogin(returnTo)
  }, [returnTo])

  return (
    <section className='relative isolate min-h-screen overflow-hidden bg-black text-white'>
      <div
        aria-hidden='true'
        className='absolute inset-0 z-0'
      >
        <PrismaticBurst
          animationType='rotate3d'
          intensity={3.2}
          speed={0.58}
          distort={2.8}
          paused={false}
          offset={burstOffset}
          hoverDampness={0.25}
          rayCount={24}
          mixBlendMode='lighten'
          colors={burstColors}
        />
      </div>

      <div
        aria-hidden='true'
        className='absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.2)_42%,rgba(0,0,0,0.76)_100%)]'
      />

      <div className='relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10 sm:gap-8 sm:px-6'>
        {!open ? (
          <TextType
            as='h1'
            className='md:max-w-[920px] text-xl text-center  md:text-3xl font-semibold tracking-normal text-white drop-shadow-[0_0_18px_rgba(34,211,238,0.45)] sm:text-4xl md:text-5xl'
            text={['科技文化融合 创造世界光色之美']}
            typingSpeed={120}
            deletingSpeed={60}
            initialDelay={300}
            pauseDuration={2000}
            loop
            showCursor
          />
        ) : (
          <div className='h-0' />
        )}
        <div className='flex w-full items-center justify-center text-center'>
          {!open ? (
            <button
              type='button'
              onClick={() => setOpen(true)}
              className='cursor-pointer rounded-full border-0 bg-transparent p-0 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black'
            >
              <SpotlightCard
                className='flex items-center justify-center gap-2.5 rounded-full border-2 border-cyan-300/65 bg-[#050b12]/60 px-6 py-3 shadow-[0_0_10px_rgba(34,211,238,0.5),0_0_26px_rgba(34,211,238,0.32),inset_0_0_14px_rgba(34,211,238,0.16)] transition hover:border-cyan-200 hover:bg-cyan-300/10 sm:gap-3 sm:px-8 sm:py-4'
                spotlightColor='#22d3ee40'
              >
                <span className='flex items-center text-sm font-bold tracking-normal text-white sm:text-base'>
                  开始使用
                </span>
              </SpotlightCard>
            </button>
          ) : (
            <div className='w-full max-w-[90vw] origin-center animate-[panel-expand_0.4s_cubic-bezier(0.22,1,0.36,1)_forwards] overflow-hidden rounded-2xl border border-white/10 bg-white/30 shadow-[0_24px_70px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl backdrop-saturate-150 sm:w-[420px] sm:rounded-3xl'>
              <div className='flex flex-col items-center gap-1.5 border-b border-white/10 px-5 pb-6 pt-7 sm:px-8 sm:pb-7 sm:pt-8'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:h-14 sm:w-14'>
                  <svg
                    viewBox='0 0 24 24'
                    width='24'
                    height='24'
                    fill='none'
                    stroke='rgba(255,255,255,0.85)'
                    strokeWidth='1.5'
                    className='sm:h-7 sm:w-7'
                  >
                    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
                    <path d='m9 12 2 2 4-4' />
                  </svg>
                </div>
                <h1 className='mt-2.5 text-xl font-bold tracking-normal text-white sm:mt-3 sm:text-[1.35rem]'>
                  企业身份认证
                </h1>
                <p className='text-xs text-white/45 sm:text-sm'>
                  安全单点登录认证
                </p>
              </div>

              <div className='flex flex-col gap-3 p-5 sm:gap-3.5 sm:p-6'>
                <button
                  type='button'
                  onClick={handleLogin}
                  disabled={isSigningIn}
                  aria-busy={isSigningIn}
                  className='group relative flex w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-white/15 bg-white/10 p-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md transition-all duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70'
                >
                  <div className='flex w-full items-center justify-center gap-2 rounded-[10px] bg-white/8 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 group-hover:bg-white/12 sm:gap-2.5 sm:py-3.5 sm:text-base'>
                    <svg
                      viewBox='0 0 24 24'
                      width='16'
                      height='16'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='sm:h-[18px] sm:w-[18px]'
                    >
                      <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
                    </svg>
                    <span>{isSigningIn ? '正在跳转...' : '使用 SSO 继续'}</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function normalizeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/users'
  }

  return value
}

function handleSSOLogin(returnTo: string) {
  window.location.href =
    `${API_BASE_URL}/auth/sso/login?return_to=${encodeURIComponent(returnTo)}`
}

export default Login
