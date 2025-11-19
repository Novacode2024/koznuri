import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import api from '../services/api'
import type { ApiError } from '../services/api'
import { useDebounce } from '../hooks/useDebounce'

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

interface RegisterResponse {
  success?: boolean
  message?: string
  data?: {
    first_name?: string
    last_name?: string
    phone?: string
    age?: number | null
    client_uuid?: string
    access?: string
    refresh?: string
    username?: string
    uuid?: string
    created_at?: string
    updated_at?: string
    is_active?: boolean
  }
  // New format: profile fields directly on root
  access?: string
  refresh?: string
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

const normalizeAuth = (response: RegisterResponse): NormalizedAuth | null => {
  // Support both new format (flat) and old format (nested in data)
  const access = response.access || response.data?.access || ''
  if (!access) {
    // Check if it's the old format with success flag
    if (response.success === false || !response.data?.access) {
      return null
    }
    return null
  }
  
  // Support both new format (flat) and old format (nested in data)
  // New format: first_name, last_name, etc. directly on root
  // Old format: data.first_name, data.last_name, etc.
  const firstName = response.first_name || response.data?.first_name
  const lastName = response.last_name || response.data?.last_name
  const phone = response.phone || response.data?.phone
  const age = response.age !== undefined ? response.age : (response.data?.age ?? null)
  const username = response.username || response.data?.username
  const uuid = response.uuid || response.data?.uuid || response.data?.client_uuid
  const clientUuid = response.client_uuid || response.data?.client_uuid || response.uuid
  const createdAt = response.created_at || response.data?.created_at
  const updatedAt = response.updated_at || response.data?.updated_at
  const isActive = response.is_active !== undefined ? response.is_active : (response.data?.is_active !== undefined ? response.data.is_active : true)
  const refresh = response.refresh || response.data?.refresh || ''

  return {
    access,
    refresh: refresh,
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


const Register = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Username validation state
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  
  // Age validation state
  const [ageError, setAgeError] = useState<string | null>(null)
  
  // Ref to track current username for validation checks
  const usernameRef = useRef(username)
  
  // Update ref when username changes
  useEffect(() => {
    usernameRef.current = username
  }, [username])
  
  // Debounce username for API calls - wait 2 seconds after user stops typing
  const debouncedUsername = useDebounce(username.trim(), 2000)
  
  // Calculate age from birth date
  const calculateAgeFromDate = useCallback((birthDate: string): number | null => {
    if (!birthDate) return null
    
    const today = new Date()
    const birth = new Date(birthDate)
    
    // Check if birth date is valid
    if (isNaN(birth.getTime())) {
      return null
    }
    
    // Check if birth date is not in the future
    if (birth > today) {
      return null
    }
    
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }, [])
  
  // Calculate min and max dates for age input
  const minDate = useMemo(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() - 150)
    return date.toISOString().split('T')[0]
  }, [])
  
  const maxDate = useMemo(() => {
    return new Date().toISOString().split('T')[0]
  }, [])
  
  // Calculate age from birth date (memoized)
  const calculatedAge = useMemo(() => {
    if (!age || age.trim() === '') return null
    return calculateAgeFromDate(age)
  }, [age, calculateAgeFromDate])

  // Reset username validation state
  const resetUsernameValidation = useCallback(() => {
    setUsernameError(null)
    setUsernameAvailable(null)
    setIsCheckingUsername(false)
  }, [])

  // Check username availability
  const checkUsernameAvailability = useCallback(async (usernameToCheck: string) => {
    const trimmedUsername = usernameToCheck.trim()
    
    // Reset validation if username is too short or empty
    if (!trimmedUsername || trimmedUsername.length < 3) {
      resetUsernameValidation()
      return
    }

    // Build API URL with username parameter (declare outside try block for error handling)
    // API expects: /client/available/username/?username=value
    const encodedUsername = encodeURIComponent(trimmedUsername)
    const apiUrl = `/client/available/username/?username=${encodedUsername}`

    try {
      setIsCheckingUsername(true)
      setUsernameError(null)
      
      // Use GET method with query parameter
      const response = await api.get<{ exists: boolean }>(
        apiUrl,
        {
          skipAuth: true,
        }
      )
      
      // Check if username still matches (user might have changed it while request was in flight)
      if (trimmedUsername !== usernameRef.current.trim()) {
        return
      }
      
      // Extract exists value from response
      // API returns: { exists: boolean }
      // exists: false = username bo'sh (mavjud emas, foydalanish mumkin)
      // exists: true = username band (mavjud, foydalanish mumkin emas)
      let existsValue: boolean | undefined = undefined
      
      if (response && typeof response === 'object') {
        // Check if response has 'exists' property
        if ('exists' in response) {
          const exists = (response as { exists: unknown }).exists
          if (typeof exists === 'boolean') {
            existsValue = exists
          } else if (typeof exists === 'string') {
            existsValue = exists.toLowerCase() === 'true'
          } else if (typeof exists === 'number') {
            existsValue = exists !== 0
          }
        }
        // Response might be directly the exists value wrapped in object
      } else if (typeof response === 'boolean') {
        existsValue = response
      }
      
      // Apply logic based on exists value
      if (existsValue === undefined || existsValue === null) {
        resetUsernameValidation()
        return
      }
      
      // API logic: 
      // exists: false → username bo'sh (mavjud emas) → foydalanish mumkin → usernameAvailable = true
      // exists: true → username band (mavjud) → foydalanish mumkin emas → usernameAvailable = false
      if (existsValue === false) {
        setUsernameAvailable(true)
        setUsernameError(null)
      } else if (existsValue === true) {
        const errorMessage = t('common.usernameTaken') as string || 'Bunday username mavjud'
        setUsernameAvailable(false)
        setUsernameError(errorMessage)
      }
    } catch (err) {
      // Check if username still matches before handling error
      if (trimmedUsername !== usernameRef.current.trim()) {
        return
      }
      
      // Extract error details
      const apiErr = err as { status?: number; response?: { status?: number } }
      const statusCode = apiErr?.status || apiErr?.response?.status
      
      // Handle 400 error specifically - this might mean invalid request format or username already exists
      if (statusCode === 400) {
        // 400 xatosi bo'lsa, bu username allaqachon mavjud yoki noto'g'ri format degani
        // Foydalanuvchiga xatolik xabarini ko'rsatamiz
        const errorMessage = t('common.usernameTaken') as string || 'Bunday username mavjud. Iltimos, boshqa username tanlang'
        setUsernameAvailable(false)
        setUsernameError(errorMessage)
        setIsCheckingUsername(false)
        return
      }
      
      // For other errors (404, 405, 500, etc.), reset validation silently
      // These might be endpoint availability issues
      if (statusCode === 404 || statusCode === 405 || (statusCode && statusCode >= 500)) {
        resetUsernameValidation()
        return
      }
      
      // For network errors or unknown errors, reset validation
      resetUsernameValidation()
    } finally {
      // Only set checking to false if username still matches
      if (trimmedUsername === usernameRef.current.trim()) {
      setIsCheckingUsername(false)
      }
    }
  }, [t, resetUsernameValidation])

  // Check username when debounced value changes (real-time validation)
  useEffect(() => {
    if (debouncedUsername) {
      checkUsernameAvailability(debouncedUsername)
    } else {
      resetUsernameValidation()
    }
  }, [debouncedUsername, checkUsernameAvailability, resetUsernameValidation])

  // Handle username input change
  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value
    setUsername(newUsername)
    setError(null) // Clear form error when user types
    
    // Reset validation state while user is typing (wait for 2 seconds after typing stops)
    const trimmedUsername = newUsername.trim()
    if (!trimmedUsername || trimmedUsername.length < 3) {
      resetUsernameValidation()
    } else {
      // User is still typing - reset validation state, will check after 2 seconds
      setUsernameError(null)
      setUsernameAvailable(null)
      setIsCheckingUsername(false)
    }
  }, [resetUsernameValidation])

  // Handle password input change
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setError(null) // Clear form error when user types
  }, [])

  // Handle age (birth date) input change
  const handleAgeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAge(value)
    setError(null) // Clear form error when user types
    setAgeError(null) // Clear age error when user types
    
    // Age is optional, so empty value is allowed
    if (!value || value.trim() === '') {
      setAgeError(null)
      return
    }
    
    // Calculate age from birth date
    const calculatedAgeValue = calculateAgeFromDate(value)
    
    // Check if birth date is valid
    if (calculatedAgeValue === null) {
      setAgeError(t('common.ageInvalid') as string || 'Noto\'g\'ri tug\'ilgan sana')
      return
    }
    
    // Check if age is within valid range (1-150)
    if (calculatedAgeValue < 1) {
      setAgeError(t('common.ageMin') as string || 'Yosh kamida 1 bo\'lishi kerak')
    } else if (calculatedAgeValue > 150) {
      setAgeError(t('common.ageMax') as string || 'Yosh ko\'pi bilan 150 bo\'lishi kerak')
    } else {
      // Valid age
      setAgeError(null)
    }
  }, [t, calculateAgeFromDate])

  // Check if error is about username already exists
  const isUsernameError = useCallback((
    errorDetails: { message?: string; username?: string[]; password?: string[] } | undefined,
    errorMessage: string
  ): boolean => {
    if (errorDetails?.username && Array.isArray(errorDetails.username)) {
      return errorDetails.username.some((msg: string) => {
        const lowerMsg = msg.toLowerCase()
        return (
          lowerMsg.includes('already') ||
          lowerMsg.includes('exists') ||
          lowerMsg.includes('taken') ||
          lowerMsg.includes('mavjud') ||
          lowerMsg.includes('band')
        )
      })
    }
    
    const lowerMsg = errorMessage.toLowerCase()
    return (
      lowerMsg.includes('username') &&
      (
        lowerMsg.includes('already') ||
        lowerMsg.includes('exists') ||
        lowerMsg.includes('taken') ||
        lowerMsg.includes('mavjud') ||
        lowerMsg.includes('band')
      )
    )
  }, [])

  // Handle registration errors
  const handleRegistrationError = useCallback((apiErr: ApiError) => {
    const errorDetails = apiErr.details as { message?: string; username?: string[]; password?: string[] } | undefined
    const errorMessage = errorDetails?.message || apiErr.message || ''
    
    // Handle 400 error - username or password issue
    if (apiErr.status === 400) {
      // Check if error is specifically about username
      if (isUsernameError(errorDetails, errorMessage)) {
        // Username already exists or invalid
        const usernameErrorMessage = t('common.usernameTakenSubmit') as string || 'Bunday username mavjud. Iltimos, boshqa username tanlang'
        setError(usernameErrorMessage)
        setUsernameAvailable(false)
        setUsernameError(t('common.usernameTaken') as string || 'Bunday username mavjud')
      } else {
        // General 400 error - username or password issue
        const genericErrorMessage = t('common.usernameOrPasswordError') as string || 'Username yoki parolni boshqa kirgizing'
        setError(genericErrorMessage)
      }
      return
    }
    
    // Handle 409 error - conflict (username already exists)
    if (apiErr.status === 409) {
      const usernameErrorMessage = t('common.usernameTakenSubmit') as string || 'Bunday username mavjud. Iltimos, boshqa username tanlang'
      setError(usernameErrorMessage)
      setUsernameAvailable(false)
      setUsernameError(t('common.usernameTaken') as string || 'Bunday username mavjud')
      return
    }
    
    // Other errors
    setError(apiErr.message || (t('common.errorOccurred') as string) || 'Xatolik yuz berdi')
  }, [t, isUsernameError])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedUsername = username.trim()

    // Validate inputs
    if (!trimmedUsername || !password) {
      setError(t('common.loginRequired') as string || 'Username va parol talab qilinadi')
      return
    }

    // Validate age (birth date) if provided
    if (age && age.trim() !== '') {
      const calculatedAgeValue = calculateAgeFromDate(age.trim())
      
      if (calculatedAgeValue === null) {
        setAgeError(t('common.ageInvalid') as string || 'Noto\'g\'ri tug\'ilgan sana')
        setError(t('common.ageInvalid') as string || 'Noto\'g\'ri tug\'ilgan sana')
        return
      }
      
      if (calculatedAgeValue < 1 || calculatedAgeValue > 150) {
        setAgeError(t('common.ageInvalid') as string || 'Yosh 1 dan 150 gacha bo\'lishi kerak')
        setError(t('common.ageInvalid') as string || 'Yosh 1 dan 150 gacha bo\'lishi kerak')
        return
      }
    }

    // Check if username is available before submitting
    if (usernameAvailable === false) {
      setError(t('common.usernameTakenSubmit') as string || 'Bunday username mavjud. Iltimos, boshqa username tanlang')
      return
    }

    // If still checking, wait a bit
    if (isCheckingUsername) {
      setError(t('common.checkingUsername') as string || 'Username tekshirilmoqda, iltimos kuting...')
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('username', trimmedUsername)
      formData.append('password', password)
      
      // Add age if provided (calculate from birth date)
      if (age && age.trim() !== '') {
        const calculatedAgeValue = calculateAgeFromDate(age.trim())
        if (calculatedAgeValue !== null && calculatedAgeValue >= 1 && calculatedAgeValue <= 150) {
          formData.append('age', calculatedAgeValue.toString())
        }
      }

      const response = await api.post<RegisterResponse>('/client/register/', formData)
      const normalized = normalizeAuth(response)

      if (!normalized) {
        setError(t('common.registerError') as string || 'Ro\'yxatdan o\'tishda xatolik yuz berdi')
        return
      }

      // Save auth data and redirect
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
    } catch (err: unknown) {
      const apiErr = err as ApiError
      handleRegistrationError(apiErr)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-gray-50 py-10 min-h-screen flex items-center">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-full">
          <h1 className="text-2xl font-bold text-center mb-6">{t('common.register') || 'Ro‘yxatdan o‘tish'}</h1>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.username') || 'Username'}</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 transition-colors ${
                    usernameError || usernameAvailable === false
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                      : usernameAvailable === true
                      ? 'border-green-300 focus:ring-green-200 focus:border-green-500'
                      : 'border-gray-200 focus:ring-[#1857FE]/20 focus:border-[#1857FE]'
                  }`}
                  placeholder={t('common.username') as string || 'username'}
                  autoComplete="username"
                />
                {isCheckingUsername && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="w-4 h-4 border-2 border-[#1857FE] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {!isCheckingUsername && usernameAvailable === true && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {!isCheckingUsername && usernameAvailable === false && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Show error only if username is taken (not available) */}
              {(usernameError || usernameAvailable === false) && (
                <p className="mt-1 text-sm text-red-600">
                  {t('common.usernameTaken') || 'Bunday username mavjud'}
                </p>
              )}
              {/* Show min length message only if username is too short and no other errors */}
              {username.trim() && username.trim().length < 3 && !usernameError && usernameAvailable === null && (
                <p className="mt-1 text-sm text-gray-500">{t('common.usernameMinLength') || 'Username kamida 3 ta belgi bo\'lishi kerak'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.password') || 'Password'}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 focus:border-[#1857FE]"
                  placeholder={t('common.password') as string || 'password'}
                  autoComplete="new-password"
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
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('dashboard.profile.age') || 'Tug\'ilgan sana'}
              </label>
              <input
                type="date"
                value={age}
                onChange={handleAgeChange}
                max={maxDate}
                min={minDate}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-colors ${
                  ageError
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-200 focus:ring-[#1857FE]/20 focus:border-[#1857FE]'
                }`}
                placeholder={t('dashboard.profile.agePlaceholder') as string || 'Tug\'ilgan sana'}
                autoComplete="bday"
              />
              {ageError && (
                <p className="mt-1 text-sm text-red-600">{ageError}</p>
              )}
              {!ageError && age && calculatedAge !== null && calculatedAge >= 1 && calculatedAge <= 150 && (
                <p className="mt-1 text-sm text-gray-500">
                  {t('common.ageCalculated') || 'Yosh'}: {calculatedAge} {t('common.years') || 'yosh'}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || isCheckingUsername || usernameAvailable === false || !!ageError}
              className="w-full bg-[#1857FE] text-white rounded-md py-2 font-semibold hover:bg-[#0d47e8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (t('common.loading') || 'Yuklanmoqda...') : (t('common.register') || 'Ro‘yxatdan o‘tish')}
            </button>
          </form>
          <div className="mt-4 text-sm text-center text-gray-600">
            {t('common.haveAccount') || 'Akkauntingiz bormi?'}{' '}
            <Link to="/login" className="text-[#1857FE] hover:underline">
              {t('common.login') || 'Kirish'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
