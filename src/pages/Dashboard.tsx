import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { profileService, type ProfileUpdate } from '../services/profileService'
import { applicationService } from '../services/applicationService'
import { paymentService } from '../services/paymentService'
import { interestsService, type Interest } from '../services/interestsService'
import { useApp } from '../context/AppContext'
import { useDebounce } from '../hooks/useDebounce'
import api, { logout as apiLogout } from '../services/api'
import { useReCaptcha } from '../hooks/useReCaptcha'
import type { Application } from '../types/Application'
import type { Payment } from '../types/Payment'
import LoadingSpinner from '../components/LoadingSpinner'


interface AuthPayload {
  access: string
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
  // Legacy support for old format with profile nested
  profile?: {
    first_name?: string
    last_name?: string
    phone?: string
    age?: number | null
    client_uuid?: string
    username?: string
  }
}

type TabType = 'profile' | 'applications' | 'payments' | 'interests'

// SVG Icons Components
const UserIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const EditIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const LogoutIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const ApplicationsIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const PaymentIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

const PhoneIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const CalendarIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const ArrowRightIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const SaveIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const CancelIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const HeartIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const Dashboard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getCaptchaToken } = useReCaptcha()
  const { addNotification } = useApp()
  const [auth, setAuth] = useState<AuthPayload | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState<ProfileUpdate>({
    first_name: '',
    last_name: '',
    phone: '',
    age: null,
    username: '',
    password: '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Username validation state
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  // Debounce username for API calls
  const debouncedUsername = useDebounce(profileForm.username?.trim() || "", 500)

  // Applications state
  const [applications, setApplications] = useState<Application[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [applicationsError, setApplicationsError] = useState<string | null>(null)
  const [applicationsPage, setApplicationsPage] = useState(1)
  const [applicationsPageSize] = useState(10)
  const [applicationsTotalPages, setApplicationsTotalPages] = useState(1)
  const [applicationsTotalItems, setApplicationsTotalItems] = useState(0)

  // Payments state
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)

  // Interests state
  const [interests, setInterests] = useState<Interest[]>([])
  const [interestsLoading, setInterestsLoading] = useState(false)
  const [interestsError, setInterestsError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const saved = localStorage.getItem('auth')
    if (!token) {
      navigate('/login')
      return
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAuth(parsed)
        // Support both new format (flat) and old format (nested profile)
        // New format: first_name, last_name, etc. directly on root
        // Old format: profile.first_name, profile.last_name, etc.
        const firstName = parsed.first_name || parsed.profile?.first_name || ''
        const lastName = parsed.last_name || parsed.profile?.last_name || ''
        const phone = parsed.phone || parsed.profile?.phone || ''
        const age = parsed.age !== undefined ? parsed.age : (parsed.profile?.age ?? null)
        const username = parsed.username || parsed.profile?.username || ''
        
        setProfileForm({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          age: age,
          username: username,
          password: '',
        })
      } catch {
        setAuth({ access: token })
      }
    } else {
      setAuth({ access: token })
    }
  }, [navigate])

  const fetchApplications = useCallback(async (page: number = 1) => {
    try {
      setApplicationsLoading(true)
      setApplicationsError(null)
      const response = await applicationService.getApplications({
        page,
        page_size: applicationsPageSize,
      })
      
      setApplications(response.items || [])
      setApplicationsPage(response.page || 1)
      setApplicationsTotalPages(response.total_pages || 1)
      setApplicationsTotalItems(response.total_items || 0)
    } catch (err) {
      const message = (err as { message?: string })?.message || t('dashboard.applications.error')
      setApplicationsError(message)
      setApplications([])
    } finally {
      setApplicationsLoading(false)
    }
  }, [t, applicationsPageSize])

  const fetchPayments = useCallback(async () => {
    try {
      setPaymentsLoading(true)
      setPaymentsError(null)
      const data = await paymentService.getPayments()
      
      // Ensure data is always an array
      // Handle different response formats: array, { data: [] }, or { bills: [] }
      let paymentsArray: Payment[] = []
      
      if (Array.isArray(data)) {
        paymentsArray = data
      } else if (data && typeof data === 'object') {
        // Handle wrapped responses
        const dataObj = data as Record<string, unknown>
        if ('data' in dataObj && Array.isArray(dataObj.data)) {
          paymentsArray = dataObj.data as Payment[]
        } else if ('bills' in dataObj && Array.isArray(dataObj.bills)) {
          paymentsArray = dataObj.bills as Payment[]
        } else if ('results' in dataObj && Array.isArray(dataObj.results)) {
          paymentsArray = dataObj.results as Payment[]
        } else {
          // If it's a single object, wrap it in array
          paymentsArray = [data as Payment]
        }
      }
      
      setPayments(paymentsArray)
    } catch (err) {
      const message = (err as { message?: string })?.message || t('dashboard.payments.error')
      setPaymentsError(message)
      setPayments([]) // Set empty array on error
    } finally {
      setPaymentsLoading(false)
    }
  }, [t])

  const fetchInterests = useCallback(async () => {
    try {
      setInterestsLoading(true)
      setInterestsError(null)
      const data = await interestsService.getInterests()
      
      // Handle different response formats: array, { data: [] }, or { results: [] }
      let interestsArray: Interest[] = []
      
      if (Array.isArray(data)) {
        interestsArray = data
      } else if (data && typeof data === 'object') {
        // Handle wrapped responses
        const dataObj = data as Record<string, unknown>
        if ('data' in dataObj && Array.isArray(dataObj.data)) {
          interestsArray = dataObj.data as Interest[]
        } else if ('results' in dataObj && Array.isArray(dataObj.results)) {
          interestsArray = dataObj.results as Interest[]
        } else {
          // If it's a single object, wrap it in array
          interestsArray = [data as Interest]
        }
      }
      
      setInterests(interestsArray)
    } catch (err) {
      const message = (err as { message?: string })?.message || t('dashboard.interests.error')
      setInterestsError(message)
      setInterests([]) // Set empty array on error
    } finally {
      setInterestsLoading(false)
    }
  }, [t])

  // Reset page to 1 when tab changes
  useEffect(() => {
    if (activeTab === 'applications') {
      setApplicationsPage(1)
    }
  }, [activeTab])

  // Fetch data when tab or page changes
  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications(applicationsPage)
    } else if (activeTab === 'payments') {
      fetchPayments()
    } else if (activeTab === 'interests') {
      fetchInterests()
    }
  }, [activeTab, applicationsPage, fetchApplications, fetchPayments, fetchInterests])

  const fullName = useMemo(() => {
    // Support both new format (flat) and old format (nested profile)
    const f = auth?.first_name || auth?.profile?.first_name || profileForm.first_name || ''
    const l = auth?.last_name || auth?.profile?.last_name || profileForm.last_name || ''
    return (f + ' ' + l).trim() || '—'
  }, [auth, profileForm])

  // Check username availability
  const checkUsernameAvailability = useCallback(async (usernameToCheck: string) => {
    // Support both new format (flat) and old format (nested profile)
    const currentUsername = auth?.username || auth?.profile?.username || ''
    
    // If username is same as current, it's available
    if (usernameToCheck === currentUsername) {
      setUsernameAvailable(true)
      setUsernameError(null)
      setIsCheckingUsername(false)
      return
    }

    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameError(null)
      setUsernameAvailable(null)
      setIsCheckingUsername(false)
      return
    }

    try {
      setIsCheckingUsername(true)
      setUsernameError(null)
      
      // GET request without token - use skipAuth flag
      const response = await api.get<{ exists: boolean }>(
        `/client/available/username/?username=${encodeURIComponent(usernameToCheck)}`,
        {
          skipAuth: true,
        }
      )
      
      // API logic: exists: false = username bo'sh (mavjud emas, foydalanish mumkin)
      //            exists: true = username band (mavjud, foydalanish mumkin emas)
      if (response.exists === false) {
        // Username is available (bo'sh/mavjud emas) - exists: false means username bo'sh
        setUsernameAvailable(true)
        setUsernameError(null)
      } else if (response.exists === true) {
        // Username is taken (band/mavjud) - exists: true means username band
        setUsernameAvailable(false)
        setUsernameError(t('common.usernameTaken') || 'Bu username allaqachon band qilingan')
      }
    } catch (err) {
      const apiErr = err as { status?: number; message?: string }
      // If it's a network error or server error, don't block the user
      if (apiErr.status && apiErr.status >= 500) {
        setUsernameError(null)
        setUsernameAvailable(null)
      } else {
        setUsernameAvailable(false)
        setUsernameError(apiErr.message || t('common.usernameCheckError') || 'Username tekshirishda xatolik')
      }
    } finally {
      setIsCheckingUsername(false)
    }
  }, [t, auth?.username, auth?.profile?.username])

  // Check username when debounced value changes
  useEffect(() => {
    if (debouncedUsername && isEditingProfile) {
      checkUsernameAvailability(debouncedUsername)
    } else {
      setUsernameError(null)
      setUsernameAvailable(null)
      setIsCheckingUsername(false)
    }
  }, [debouncedUsername, checkUsernameAvailability, isEditingProfile])

  const handleProfileSave = async () => {
    try {
      setProfileLoading(true)
      setProfileError(null)
      
      // Check if username is available before submitting
      if (profileForm.username && profileForm.username.trim()) {
        // Support both new format (flat) and old format (nested profile)
        const currentUsername = auth?.username || auth?.profile?.username || ''
        if (profileForm.username.trim() !== currentUsername) {
          if (usernameAvailable === false) {
            setProfileError(t('common.usernameTakenSubmit') || 'Bu username allaqachon band qilingan. Iltimos, boshqa username tanlang')
            setProfileLoading(false)
            return
          }

          // If still checking, wait a bit
          if (isCheckingUsername) {
            setProfileError(t('common.checkingUsername') || 'Username tekshirilmoqda, iltimos kuting...')
            setProfileLoading(false)
            return
          }

          // If username is new and not checked yet, check it first
          if (usernameAvailable === null && profileForm.username.trim().length >= 3) {
            // Check username availability synchronously using GET without token
            try {
              const response = await api.get<{ exists: boolean }>(
                `/client/available/username/?username=${encodeURIComponent(profileForm.username.trim())}`,
                {
                  skipAuth: true,
                }
              )
              
              if (response.exists) {
                setProfileError(t('common.usernameTakenSubmit') || 'Bu username allaqachon band qilingan. Iltimos, boshqa username tanlang')
                setProfileLoading(false)
                return
              }
            } catch (err) {
              const apiErr = err as { status?: number; message?: string }
              if (!apiErr.status || apiErr.status < 500) {
                setProfileError(t('common.usernameTakenSubmit') || 'Bu username allaqachon band qilingan. Iltimos, boshqa username tanlang')
                setProfileLoading(false)
                return
              }
            }
          }
        }
      }
      
      // Prepare data for update - only send fields that have values
      const updateData: ProfileUpdate = {}
      if (profileForm.first_name) updateData.first_name = profileForm.first_name
      if (profileForm.last_name) updateData.last_name = profileForm.last_name
      if (profileForm.phone) updateData.phone = profileForm.phone
      if (profileForm.age !== null && profileForm.age !== undefined) {
        updateData.age = profileForm.age
      }
      if (profileForm.username) updateData.username = profileForm.username
      if (profileForm.password) updateData.password = profileForm.password

      const { getCaptchaToken } = useReCaptcha()
      const captchaToken = await getCaptchaToken()
      const updated = await profileService.updateProfile(updateData, captchaToken)
      
      // Update auth state with new profile data
      // Support both new format (flat) and old format (nested profile)
      const updatedAuth: AuthPayload = {
        ...auth!,
        // Update flat fields (new format)
        first_name: updated.first_name !== undefined ? updated.first_name : auth?.first_name,
        last_name: updated.last_name !== undefined ? updated.last_name : auth?.last_name,
        phone: updated.phone !== undefined ? updated.phone : auth?.phone,
        age: updated.age !== undefined ? updated.age : auth?.age,
        username: updated.username !== undefined ? updated.username : (auth?.username || auth?.profile?.username),
        // Also update nested profile for backward compatibility
        profile: {
          first_name: updated.first_name !== undefined ? updated.first_name : (auth?.first_name || auth?.profile?.first_name),
          last_name: updated.last_name !== undefined ? updated.last_name : (auth?.last_name || auth?.profile?.last_name),
          phone: updated.phone !== undefined ? updated.phone : (auth?.phone || auth?.profile?.phone),
          age: updated.age !== undefined ? updated.age : (auth?.age !== undefined ? auth.age : (auth?.profile?.age ?? null)),
          username: updated.username !== undefined ? updated.username : (auth?.username || auth?.profile?.username),
          client_uuid: auth?.client_uuid || auth?.uuid || auth?.profile?.client_uuid,
        },
      }
      setAuth(updatedAuth)
      localStorage.setItem('auth', JSON.stringify(updatedAuth))
      
      // Reset password field after successful update
      setProfileForm((prev) => ({ ...prev, password: '' }))
      setIsEditingProfile(false)
      
      // Show success notification
      addNotification({
        type: 'success',
        title: t('dashboard.profile.updateSuccess'),
        message: t('dashboard.profile.updateSuccessMessage'),
      })
    } catch (err) {
      // Enhanced error handling
      const apiError = err as { message?: string; status?: number; details?: unknown }
      let errorMessage = t('dashboard.profile.updateError')
      
      if (apiError.status === 405) {
        errorMessage = t('dashboard.profile.updateErrorMethodNotAllowed')
      } else if (apiError.status === 401) {
        errorMessage = t('dashboard.profile.updateErrorUnauthorized')
      } else if (apiError.status === 400) {
        errorMessage = apiError.message || t('dashboard.profile.updateErrorBadRequest')
      } else if (apiError.message) {
        errorMessage = apiError.message
      }
      
      
      setProfileError(errorMessage)
      addNotification({
        type: 'error',
        title: 'Xatolik',
        message: errorMessage,
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleProfileCancel = () => {
    // Support both new format (flat) and old format (nested profile)
    setProfileForm({
      first_name: auth?.first_name || auth?.profile?.first_name || '',
      last_name: auth?.last_name || auth?.profile?.last_name || '',
      phone: auth?.phone || auth?.profile?.phone || '',
      age: auth?.age !== undefined ? auth.age : (auth?.profile?.age ?? null),
      username: auth?.username || auth?.profile?.username || '',
      password: '',
    })
    setIsEditingProfile(false)
    setProfileError(null)
    setUsernameError(null)
    setUsernameAvailable(null)
    setIsCheckingUsername(false)
  }

  const logout = () => {
    // Use api.logout for consistent cleanup
    apiLogout()
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'pending':
        return t('dashboard.status.pending')
      case 'approved':
        return t('dashboard.status.approved')
      case 'rejected':
        return t('dashboard.status.rejected')
      case 'completed':
        return t('dashboard.status.completed')
      case 'cancelled':
        return t('dashboard.status.cancelled')
      case 'paid':
        return t('dashboard.status.paid')
      case 'failed':
        return t('dashboard.status.failed')
      case 'refunded':
        return t('dashboard.status.refunded')
      default:
        return status || t('dashboard.status.unknown')
    }
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: t('dashboard.tabs.profile'), icon: <UserIcon className="w-5 h-5" /> },
    { id: 'applications', label: t('dashboard.tabs.applications'), icon: <ApplicationsIcon className="w-5 h-5" /> },
    { id: 'payments', label: t('dashboard.tabs.payments'), icon: <PaymentIcon className="w-5 h-5" /> },
    { id: 'interests', label: t('dashboard.tabs.interests'), icon: <HeartIcon className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#1857FE] to-[#0d47e8] flex items-center justify-center shadow-lg">
                  <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{t('dashboard.subtitle')}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors duration-200 text-sm sm:text-base font-medium border border-red-200 w-full sm:w-auto justify-center"
              >
                <LogoutIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t('dashboard.logout')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base whitespace-nowrap transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? 'text-[#1857FE] bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1857FE]"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('dashboard.profile.title')}</h2>
                  <p className="text-sm text-gray-500 mt-1">{t('dashboard.profile.subtitle')}</p>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1857FE] hover:bg-[#0d47e8] text-white rounded-lg transition-colors duration-200 text-sm sm:text-base font-medium shadow-sm w-full sm:w-auto justify-center"
                  >
                    <EditIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{t('dashboard.profile.edit')}</span>
                  </button>
                )}
              </div>

              {profileError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{profileError}</span>
                </div>
              )}

              {isEditingProfile ? (
                <div className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.profile.firstName')}</label>
                      <input
                        type="text"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 focus:border-[#1857FE] transition-colors"
                        placeholder={t('dashboard.profile.firstNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.profile.lastName')}</label>
                      <input
                        type="text"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 focus:border-[#1857FE] transition-colors"
                        placeholder={t('dashboard.profile.lastNamePlaceholder')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <PhoneIcon className="w-4 h-4" />
                        <span>{t('dashboard.profile.phone')}</span>
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 focus:border-[#1857FE] transition-colors"
                        placeholder={t('dashboard.profile.phonePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.profile.age')}</label>
                      <input
                        type="number"
                        value={profileForm.age ?? ''}
                        onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 focus:border-[#1857FE] transition-colors"
                        placeholder={t('dashboard.profile.agePlaceholder')}
                        min="1"
                        max="150"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.profile.username')}</label>
                      <input
                        type="text"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 transition-colors ${
                          usernameError
                            ? 'border-red-300 focus:border-red-500'
                            : usernameAvailable === true
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-gray-300 focus:border-[#1857FE]'
                        }`}
                        placeholder={t('dashboard.profile.usernamePlaceholder')}
                      />
                      {isCheckingUsername && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="animate-spin">⏳</span>
                          {t('common.checkingUsername') || 'Username tekshirilmoqda...'}
                        </p>
                      )}
                      {usernameError && (
                        <p className="text-xs text-red-600 mt-1">{usernameError}</p>
                      )}
                      {usernameAvailable === true && !isCheckingUsername && profileForm.username?.trim() && profileForm.username.trim() !== (auth?.username || auth?.profile?.username || '') && (
                        <p className="text-xs text-green-600 mt-1">{t('common.usernameAvailable') || 'Username mavjud'}</p>
                      )}
                      {profileForm.username?.trim() && profileForm.username.trim().length > 0 && profileForm.username.trim().length < 3 && (
                        <p className="text-xs text-gray-500 mt-1">{t('common.usernameMinLength') || 'Username kamida 3 ta belgi bo\'lishi kerak'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('dashboard.profile.password')}</label>
                      <input
                        type="password"
                        value={profileForm.password}
                        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 focus:border-[#1857FE] transition-colors"
                        placeholder={t('dashboard.profile.passwordPlaceholder')}
                      />
                      <p className="text-xs text-gray-500 mt-1">{t('dashboard.profile.passwordHint')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleProfileSave}
                      disabled={profileLoading}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1857FE] hover:bg-[#0d47e8] text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                    >
                      <SaveIcon className="w-5 h-5" />
                      <span>{profileLoading ? t('dashboard.profile.saving') : t('dashboard.profile.save')}</span>
                    </button>
                    <button
                      onClick={handleProfileCancel}
                      disabled={profileLoading}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <CancelIcon className="w-5 h-5" />
                      <span>{t('dashboard.profile.cancel')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs sm:text-sm text-gray-500 mb-2 flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        <span>{t('dashboard.profile.fields.fullName')}</span>
                      </div>
                      <div className="font-semibold text-gray-900 text-base sm:text-lg">{fullName}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs sm:text-sm text-gray-500 mb-2 flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4" />
                        <span>{t('dashboard.profile.fields.phone')}</span>
                      </div>
                      <div className="font-semibold text-gray-900 text-base sm:text-lg">{auth?.phone || auth?.profile?.phone || '—'}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs sm:text-sm text-gray-500 mb-2 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{t('dashboard.profile.fields.age')}</span>
                      </div>
                      <div className="font-semibold text-gray-900 text-base sm:text-lg">{auth?.age !== undefined ? auth.age : (auth?.profile?.age ?? '—')}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs sm:text-sm text-gray-500 mb-2">{t('dashboard.profile.fields.username')}</div>
                      <div className="font-semibold text-gray-900 text-base sm:text-lg">{auth?.username || auth?.profile?.username || '—'}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs sm:text-sm text-gray-500 mb-2">{t('dashboard.profile.fields.clientUuid')}</div>
                      <div className="font-mono text-xs sm:text-sm break-all text-gray-700">{auth?.uuid || auth?.client_uuid || auth?.profile?.client_uuid || '—'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('dashboard.applications.title')}</h2>
                <p className="text-sm text-gray-500">{t('dashboard.applications.subtitle')}</p>
              </div>
              {applicationsLoading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                  <LoadingSpinner size="lg" text={t('dashboard.applications.loading')} />
                </div>
              ) : applicationsError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {applicationsError}
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-16">
                  <ApplicationsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">{t('dashboard.applications.empty')}</p>
                  <p className="text-gray-400 text-sm mt-2">{t('dashboard.applications.emptyDescription')}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 sm:space-y-4">
                    {applications.map((app) => {
                      const fullName = [app.first_name, app.last_name].filter(Boolean).join(' ') || app.client_name || t('dashboard.applications.application')
                      const appointmentDate = app.date || app.appointment_date
                      const appointmentTime = app.start_time || app.end_time ? `${app.start_time || ''}${app.start_time && app.end_time ? ' - ' : ''}${app.end_time || ''}` : app.appointment_time
                      
                      return (
                        <Link
                          key={app.id || app.uuid}
                          to={`/application/${app.id || app.uuid}`}
                          className="block p-4 sm:p-5 border border-gray-200 rounded-xl hover:border-[#1857FE] hover:shadow-md transition-all duration-200 bg-white group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                                  {fullName}
                                </h3>
                                {app.is_active !== undefined && (
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                    app.is_active 
                                      ? 'bg-green-100 text-green-800 border-green-200' 
                                      : 'bg-gray-100 text-gray-800 border-gray-200'
                                  }`}>
                                    {app.is_active ? t('dashboard.status.approved') || 'Faol' : t('dashboard.status.cancelled') || 'Nofaol'}
                                  </span>
                                )}
                                {app.status && app.is_active === undefined && (
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                                    {getStatusText(app.status)}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1.5 text-sm text-gray-600">
                                {app.phone && (
                                  <p className="flex items-center gap-2">
                                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                                    <span>{app.phone}</span>
                                  </p>
                                )}
                                {app.message && (
                                  <p className="text-gray-700">{app.message}</p>
                                )}
                                {appointmentDate && (
                                  <p className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                                    <span>
                                      {t('dashboard.applications.date')}: {new Date(appointmentDate).toLocaleDateString('uz-UZ')}
                                      {appointmentTime && `, ${appointmentTime}`}
                                    </span>
                                  </p>
                                )}
                                {app.doctor_name && !app.doctor && (
                                  <p className="flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                    <span>{t('dashboard.applications.doctor')}: {app.doctor_name}</span>
                                  </p>
                                )}
                                {app.service_name && !app.service && (
                                  <p className="flex items-center gap-2">
                                    <ApplicationsIcon className="w-4 h-4 text-gray-400" />
                                    <span>{t('dashboard.applications.service')}: {app.service_name}</span>
                                  </p>
                                )}
                              </div>
                              {app.created_at && (
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>
                                    {new Date(app.created_at).toLocaleDateString('uz-UZ', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-end sm:justify-start">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 group-hover:bg-[#1857FE] text-gray-400 group-hover:text-white flex items-center justify-center transition-colors duration-200">
                                <ArrowRightIcon className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                  
                  {/* Pagination */}
                  {applicationsTotalPages > 1 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        {t('dashboard.applications.showing') || 'Ko\'rsatilmoqda'}:{' '}
                        <span className="font-medium">
                          {((applicationsPage - 1) * applicationsPageSize) + 1} - {Math.min(applicationsPage * applicationsPageSize, applicationsTotalItems)}
                        </span>{' '}
                        {t('dashboard.applications.of') || 'dan'} <span className="font-medium">{applicationsTotalItems}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newPage = applicationsPage - 1
                            if (newPage >= 1) {
                              setApplicationsPage(newPage)
                              fetchApplications(newPage)
                            }
                          }}
                          disabled={applicationsPage <= 1 || applicationsLoading}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {t('dashboard.applications.previous') || 'Oldingi'}
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(applicationsTotalPages, 5) }, (_, i) => {
                            let pageNum: number
                            if (applicationsTotalPages <= 5) {
                              pageNum = i + 1
                            } else if (applicationsPage <= 3) {
                              pageNum = i + 1
                            } else if (applicationsPage >= applicationsTotalPages - 2) {
                              pageNum = applicationsTotalPages - 4 + i
                            } else {
                              pageNum = applicationsPage - 2 + i
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => {
                                  setApplicationsPage(pageNum)
                                  fetchApplications(pageNum)
                                }}
                                disabled={applicationsLoading}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  applicationsPage === pageNum
                                    ? 'bg-[#1857FE] text-white'
                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                        </div>
                        <button
                          onClick={() => {
                            const newPage = applicationsPage + 1
                            if (newPage <= applicationsTotalPages) {
                              setApplicationsPage(newPage)
                              fetchApplications(newPage)
                            }
                          }}
                          disabled={applicationsPage >= applicationsTotalPages || applicationsLoading}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {t('dashboard.applications.next') || 'Keyingi'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Interests Tab */}
          {activeTab === 'interests' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('dashboard.interests.title')}</h2>
                <p className="text-sm text-gray-500">{t('dashboard.interests.subtitle')}</p>
              </div>
              {interestsLoading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                  <LoadingSpinner size="lg" text={t('dashboard.interests.loading')} />
                </div>
              ) : interestsError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {interestsError}
                </div>
              ) : interests.length === 0 ? (
                <div className="text-center py-16">
                  <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">{t('dashboard.interests.empty')}</p>
                  <p className="text-gray-400 text-sm mt-2">{t('dashboard.interests.emptyDescription')}</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {interests.map((interest) => (
                    <div
                      key={interest.id || interest.uuid}
                      className="block p-4 sm:p-5 border border-gray-200 rounded-xl hover:border-[#1857FE] hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                              {interest.full_name || interest.title || t('dashboard.interests.interest')}
                            </h3>
                            {interest.is_active !== undefined && (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                interest.is_active 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                              }`}>
                                {interest.is_active ? t('dashboard.status.approved') || 'Faol' : t('dashboard.status.cancelled') || 'Nofaol'}
                              </span>
                            )}
                            {interest.status && !interest.is_active && (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(interest.status)}`}>
                                {getStatusText(interest.status)}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5 text-sm text-gray-600">
                            {interest.phone && (
                              <p className="flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4 text-gray-400" />
                                <span>{interest.phone}</span>
                              </p>
                            )}
                            {interest.message && (
                              <p className="mt-2 text-gray-700">{interest.message}</p>
                            )}
                            {interest.description && !interest.message && (
                              <p className="mt-2 text-gray-700">{interest.description}</p>
                            )}
                          </div>
                          {interest.created_at && (
                            <p className="text-xs text-gray-400 mt-3 flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              <span>
                                {new Date(interest.created_at).toLocaleDateString('uz-UZ', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('dashboard.payments.title')}</h2>
                <p className="text-sm text-gray-500">{t('dashboard.payments.subtitle')}</p>
              </div>
              {paymentsLoading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                  <LoadingSpinner size="lg" text={t('dashboard.payments.loading')} />
                </div>
              ) : paymentsError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {paymentsError}
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-16">
                  <PaymentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">{t('dashboard.payments.empty')}</p>
                  <p className="text-gray-400 text-sm mt-2">{t('dashboard.payments.emptyDescription')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('dashboard.payments.amount')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{t('dashboard.payments.status')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">{t('dashboard.payments.date')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">{t('dashboard.payments.method')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">{t('dashboard.payments.description')}</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payments.map((payment) => (
                            <tr key={payment.id || payment.uuid} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <PaymentIcon className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm sm:text-base font-medium text-gray-900">
                                    {payment.amount ? `${payment.amount} ${payment.currency || 'UZS'}` : '—'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                                  {getStatusText(payment.status)}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                                {payment.payment_date
                                  ? new Date(payment.payment_date).toLocaleDateString('uz-UZ')
                                  : payment.created_at
                                  ? new Date(payment.created_at).toLocaleDateString('uz-UZ')
                                  : '—'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">{payment.payment_method || '—'}</td>
                              <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell max-w-xs truncate">{payment.description || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Dashboard;
