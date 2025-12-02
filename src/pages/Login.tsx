import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useReCaptcha } from '../hooks/useReCaptcha'

interface AuthProfile {
  first_name?: string
  last_name?: string
  phone?: string
  age?: number | null
  client_uuid?: string
  username?: string
  uuid?: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
}

interface AuthResponseShape {
  success?: boolean
  message?: string
  data?: (AuthProfile & { access?: string; refresh?: string; token?: string })
  access?: string
  refresh?: string
  token?: string
  // New format: profile fields directly on root
  uuid?: string
  username?: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
  first_name?: string
  last_name?: string
  phone?: string
  age?: number | null
  client_uuid?: string
}

interface NormalizedAuth {
  access: string
  refresh: string
  // Support both new format (flat) and old format (nested profile)
  uuid?: string
  username?: string
  created_at?: string
  updated_at?: string
  is_active?: boolean
  first_name?: string
  last_name?: string
  phone?: string
  age?: number | null
  client_uuid?: string
  // Legacy support for old format with profile nested
  profile?: AuthProfile
}

const normalizeAuth = (res: AuthResponseShape): NormalizedAuth | null => {
  const access = res.access || res.token || res.data?.access || res.data?.token || ''
  if (!access) return null
  
  // Support both new format (flat) and old format (nested in data)
  // New format: first_name, last_name, etc. directly on root
  // Old format: data.first_name, data.last_name, etc.
  const firstName = res.first_name || res.data?.first_name
  const lastName = res.last_name || res.data?.last_name
  const phone = res.phone || res.data?.phone
  const age = res.age !== undefined ? res.age : (res.data?.age ?? null)
  const username = res.username || res.data?.username
  const uuid = res.uuid || res.data?.uuid || res.data?.client_uuid
  const clientUuid = res.client_uuid || res.data?.client_uuid || res.uuid
  const createdAt = res.created_at || res.data?.created_at
  const updatedAt = res.updated_at || res.data?.updated_at
  const isActive = res.is_active !== undefined ? res.is_active : (res.data?.is_active !== undefined ? res.data.is_active : true)
  
  return {
    access,
    refresh: res.refresh || res.data?.refresh || '',
    // New format (flat)
    uuid: uuid,
    username: username,
    created_at: createdAt,
    updated_at: updatedAt,
    is_active: isActive,
    first_name: firstName,
    last_name: lastName,
    phone: phone,
    age: age,
    client_uuid: clientUuid,
    // Legacy support for old format (nested profile)
    profile: {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      age: age,
      client_uuid: clientUuid,
      username: username,
      uuid: uuid,
      created_at: createdAt,
      updated_at: updatedAt,
      is_active: isActive,
    },
  }
}

const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getCaptchaToken } = useReCaptcha()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!username.trim() || !password) {
      setError(t('common.loginRequired') as string || 'Username va parol talab qilinadi')
      return
    }
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)
      
      const captchaToken = await getCaptchaToken()
      if (captchaToken) {
        formData.append('captcha', captchaToken)
      }
      
      const res = await api.post<AuthResponseShape>('/login/', formData)
      const normalized = normalizeAuth(res)
      if (normalized) {
        // Save access token
        localStorage.setItem('auth_token', normalized.access)
        
        // Save full auth data including refresh token
        // Save in new format (flat) with backward compatibility (nested profile)
        const authData = {
          access: normalized.access,
          refresh: normalized.refresh,
          // New format (flat)
          uuid: normalized.uuid,
          username: normalized.username,
          created_at: normalized.created_at,
          updated_at: normalized.updated_at,
          is_active: normalized.is_active,
          first_name: normalized.first_name,
          last_name: normalized.last_name,
          phone: normalized.phone,
          age: normalized.age,
          client_uuid: normalized.client_uuid,
          // Legacy support for old format (nested profile)
          profile: normalized.profile,
        }
        localStorage.setItem('auth', JSON.stringify(authData))
        
        // Also save refresh token separately for easier access
        if (normalized.refresh) {
          localStorage.setItem('refresh_token', normalized.refresh)
        }
        
        navigate('/dashboard')
        return
      }
      setError(t('common.loginInvalidResponse') as string || 'Noto‘g‘ri javob: token topilmadi')
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || (t('common.loginError') as string) || 'Kirishda xatolik yuz berdi'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-gray-50 py-10 min-h-screen flex items-center">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-full">
          <h1 className="text-2xl font-bold text-center mb-6">{t('common.login') || 'Kirish'}</h1>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.username') || 'Username'}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 focus:border-[#1857FE]"
                placeholder={t('common.username') as string || 'username'}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.password') || 'Password'}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 focus:border-[#1857FE]"
                  placeholder={t('common.password') as string || 'password'}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (t('common.hidePassword') || 'Hide') : (t('common.showPassword') || 'Show')}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1857FE] text-white rounded-md py-2 font-semibold hover:bg-[#0d47e8] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading ? (t('common.loading') || 'Yuklanmoqda...') : (t('common.login') || 'Kirish')}
            </button>
          </form>
          <div className="mt-4 text-sm text-center text-gray-600">
            {t('common.noAccount') || 'Ro‘yxatdan o‘tmaganmisiz?'}{' '}
            <Link to="/register" className="text-[#1857FE] hover:underline">
              {t('common.register') || 'Ro‘yxatdan o‘tish'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login;