import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useReCaptcha } from '../hooks/useReCaptcha'

// Types
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  language?: string
}

interface ChatResponse {
  answer: string
  confidence?: number
  sources?: Array<{
    text: string
    metadata: {
      source?: string
      type?: string
      key?: string
    }
    distance?: number
  }>
  conversation_id?: number
}

// Constants
// Use relative path in development (Vite proxy) and absolute path in production
const CHAT_API_URL = 'http://178.18.248.134:8111/api/chat/'  // Direct API in production (with trailing slash)
const USER_ID_STORAGE_KEY = 'chat_user_id'
const TOP_K = 6
const TYPING_DELAY = 500
const FOCUS_DELAY = 100
const SCROLL_BEHAVIOR: ScrollBehavior = 'smooth'

// Helper functions
/**
 * Get or create user ID for chat
 * Tries to get from auth data first (uuid or client_uuid as string),
 * otherwise generates random number and stores it
 * Returns number if possible, otherwise string
 */
const getUserId = (): number | string => {
  // Try to get from auth data (localStorage) - use as string if available
  try {
    const authData = localStorage.getItem('auth')
    if (authData) {
      const auth = JSON.parse(authData)
      // Use uuid or client_uuid if available (as string)
      if (auth.uuid) {
        return auth.uuid
      }
      if (auth.client_uuid) {
        return auth.client_uuid
      }
      if (auth.profile?.client_uuid) {
        return auth.profile.client_uuid
      }
      if (auth.profile?.uuid) {
        return auth.profile.uuid
      }
    }
  } catch {
    // Silently fail if auth data is invalid
  }

  // Try to get stored user ID from localStorage
  let userId = localStorage.getItem(USER_ID_STORAGE_KEY)
  if (!userId) {
    // Generate random number (100000000 - 999999999, 9 digits)
    const randomNumber = Math.floor(Math.random() * 900000000) + 100000000
    userId = randomNumber.toString()
    localStorage.setItem(USER_ID_STORAGE_KEY, userId)
  }
  
  // Try to parse as number, return as number if valid, otherwise return as string
  const numUserId = parseInt(userId, 10)
  return isNaN(numUserId) ? userId : numUserId
}

const formatTime = (locale: string): string => {
  return new Date().toLocaleTimeString(locale, { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const ChatWidget = () => {
  const { t, i18n } = useTranslation()
  const { getCaptchaToken } = useReCaptcha()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Initialize welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: t('common.chat.welcomeMessage'),
      timestamp: formatTime(i18n.language),
    }
    setMessages([welcomeMessage])
  }, [t, i18n.language])

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    if (isOpen && !isMinimized && messagesEndRef.current) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: SCROLL_BEHAVIOR })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [messages, isOpen, isMinimized])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, FOCUS_DELAY)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isMinimized])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close chat with Escape key
      if (e.key === 'Escape' && isOpen && !isMinimized) {
        setIsMinimized(true)
      }
    }

    if (isOpen && !isMinimized) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isMinimized])

  // Send message function
  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: formatTime(i18n.language),
      language: i18n.language,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Get user ID (from auth or generate random)
      const userId = getUserId()

      // Prepare request payload
      // Ensure user_id is always a number (API expects number)
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId
      const finalUserId = isNaN(numericUserId) ? 0 : numericUserId
      
      // Create FormData for form-data request
      const formData = new FormData()
      formData.append('user_id', finalUserId.toString())
      formData.append('message', text.trim())
      formData.append('language', i18n.language)
      formData.append('top_k', TOP_K.toString())
      
      const captchaToken = await getCaptchaToken()
      if (captchaToken) {
        formData.append('captcha', captchaToken)
      }

      // Send request to API with timeout
      let response: Response
      const timeout = 30000 // 30 seconds
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      try {
        response = await fetch(CHAT_API_URL, {
          method: 'POST',
          headers: {
            // Don't set Content-Type - browser will set it automatically with boundary for FormData
            Accept: 'application/json',
          },
          body: formData,
          signal: controller.signal,
          // Add mode and credentials for CORS
          mode: 'cors',
          credentials: 'omit',
        })
        
        clearTimeout(timeoutId)
      } catch (fetchError) {
        clearTimeout(timeoutId)
        

        
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            throw new Error('TIMEOUT_ERROR')
          }
          
          // Check for CORS or network errors
          const errorMessage = fetchError.message.toLowerCase()
          if (
            errorMessage.includes('failed to fetch') ||
            errorMessage.includes('networkerror') ||
            errorMessage.includes('network request failed') ||
            errorMessage.includes('cors') ||
            errorMessage.includes('cross-origin')
          ) {
            throw new Error('CORS_OR_NETWORK_ERROR')
          }
        }
        throw fetchError
      }

      // Check response status
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.message || errorData.error || errorData.detail) {
            errorMessage = errorData.message || errorData.error || errorData.detail
          }
        } catch {
          // If response is not JSON, use status text
          const text = await response.text().catch(() => '')
          if (text) {
            errorMessage = text
          }
        }
        throw new Error(`API_ERROR: ${errorMessage}`)
      }

      // Parse response
      let data: ChatResponse
      try {
        const responseText = await response.text()
        
        if (!responseText || responseText.trim() === '') {
          throw new Error('EMPTY_RESPONSE')
        }
        
        try {
          data = JSON.parse(responseText)
        } catch {
          throw new Error('PARSE_ERROR')
        }
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message === 'EMPTY_RESPONSE') {
          throw new Error('EMPTY_RESPONSE')
        }
        throw new Error('PARSE_ERROR')
      }

      // Extract answer from response (only answer field is used)
      if (!data || typeof data !== 'object') {
        throw new Error('INVALID_RESPONSE')
      }

      const answer = data.answer || t('common.chat.noResponse')

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer,
        timestamp: formatTime(i18n.language),
      }

      // Add typing delay for better UX
      setTimeout(() => {
        setMessages((prev) => [...prev, assistantMessage])
        setIsTyping(false)
      }, TYPING_DELAY)
    } catch (error) {
      // Handle errors with detailed messages
      let errorContent = t('common.chat.error')
      
      if (error instanceof Error) {
        const errorMsg = error.message
        const errorName = error.name
        
        // Handle specific error types
        if (errorMsg.includes('CORS_OR_NETWORK_ERROR') || errorName === 'TypeError') {
          // CORS or network error - server might be down or CORS not configured
          errorContent = 'Server bilan bog\'lanishda muammo yuz berdi. Iltimos, quyidagilarni tekshiring:\n\n1. Internet ulanishi\n2. Server holati\n3. CORS sozlamalari\n\nQayta urinib ko\'ring.'
        } else if (errorMsg.includes('TIMEOUT_ERROR') || errorName === 'AbortError') {
          // Timeout error
          errorContent = 'Javob kutish vaqti tugadi (30 soniya). Server javob bermayapti. Iltimos, qayta urinib ko\'ring.'
        } else if (errorMsg.includes('API_ERROR')) {
          // API returned an error
          const apiError = errorMsg.replace('API_ERROR: ', '')
          
          // Check for specific error types
          if (apiError.toLowerCase().includes('invalid request') || 
              apiError.toLowerCase().includes('validation') ||
              apiError.toLowerCase().includes('bad request')) {
            errorContent = t('common.chat.error') || 'Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.'
          } else if (apiError.toLowerCase().includes('status code 500') || 
                     apiError.toLowerCase().includes('500') ||
                     apiError.toLowerCase().includes('internal server error')) {
            errorContent = 'Server ichki xatosi yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
          } else if (apiError.toLowerCase().includes('status code 404') || 
                     apiError.toLowerCase().includes('404')) {
            errorContent = 'So\'ralgan resurs topilmadi. Iltimos, qayta urinib ko\'ring.'
          } else if (apiError.toLowerCase().includes('status code 403') || 
                     apiError.toLowerCase().includes('403')) {
            errorContent = 'Ruxsat rad etildi. Iltimos, qayta urinib ko\'ring.'
          } else if (apiError.toLowerCase().includes('status code 401') || 
                     apiError.toLowerCase().includes('401')) {
            errorContent = 'Autentifikatsiya talab qilinadi. Iltimos, qayta urinib ko\'ring.'
          } else {
            errorContent = `Server xatosi (${apiError}). Iltimos, qayta urinib ko'ring.`
          }
        } else if (errorMsg.includes('PARSE_ERROR')) {
          // Failed to parse response
          errorContent = 'Server javobini qayta ishlashda muammo yuz berdi. Server noto\'g\'ri formatda javob qaytardi.'
        } else if (errorMsg.includes('EMPTY_RESPONSE')) {
          // Empty response
          errorContent = 'Server bo\'sh javob qaytardi. Iltimos, qayta urinib ko\'ring.'
        } else if (errorMsg.includes('INVALID_RESPONSE')) {
          // Invalid response format
          errorContent = 'Server noto\'g\'ri javob qaytardi. Kutilgan formatdagi ma\'lumot kelmadi.'
        } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.toLowerCase().includes('network')) {
          // Generic network error
          errorContent = 'Tarmoq xatosi yuz berdi. Iltimos, quyidagilarni tekshiring:\n\n1. Internet ulanishi\n2. Server holati (http://178.18.248.134:8111)\n3. CORS sozlamalari\n\nQayta urinib ko\'ring.'
        } else {
          // Generic error - show more details
          errorContent = `Xatolik yuz berdi: ${errorMsg}\n\nIltimos, qayta urinib ko'ring yoki yordamchi bilan bog'laning.`
        }
      } else {
        // Non-Error object
        errorContent = `Kutilmagan xatolik: ${String(error)}\n\nIltimos, qayta urinib ko'ring.`
      }
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errorContent,
        timestamp: formatTime(i18n.language),
      }
      
      setMessages((prev) => [...prev, errorMessage])
      setIsTyping(false)
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, i18n.language, t])

  // Toggle chat function
  const toggleChat = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true)
      setIsMinimized(false)
    } else if (!isMinimized) {
      setIsMinimized(true)
    } else {
      setIsMinimized(false)
    }
  }, [isOpen, isMinimized])

  // Close chat function
  const closeChat = useCallback(() => {
    setIsMinimized(true)
  }, [])

  return (
    <div 
      ref={chatContainerRef}
      className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 z-50 w-full sm:w-auto"
      aria-live="polite"
      aria-label={t('common.chat.title')}
    >
      {/* Chat Button / Minimized State */}
      <AnimatePresence>
        {(isMinimized || !isOpen) && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={toggleChat}
            className="fixed sm:relative bottom-4 right-4 sm:bottom-0 sm:right-0 bg-[#1857FE] text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-lg hover:bg-[#0d47e8] active:bg-[#0a3dd4] transition-colors cursor-pointer touch-manipulation z-50"
            aria-label={t('common.chat.openChat')}
            aria-expanded={isOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:w-[380px] h-[calc(100vh-5rem)] sm:h-[600px] max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden border border-gray-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-header-title"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1857FE] to-[#0d47e8] text-white p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      className="sm:w-5 sm:h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div 
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"
                    aria-label={t('common.chat.online')}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div 
                    id="chat-header-title"
                    className="font-semibold text-sm sm:text-base truncate"
                  >
                    {t('common.chat.assistant')}
                  </div>
                  {/* <div className="text-xs sm:text-sm text-white/80 truncate">
                    {t('common.chat.assistantName')}
                  </div> */}
                </div>
              </div>
              <button
                onClick={closeChat}
                className="text-white/80 hover:text-white active:text-white/90 transition-colors flex-shrink-0 ml-2 p-1 touch-manipulation"
                aria-label={t('common.chat.minimizeChat')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 space-y-3 sm:space-y-4 overscroll-behavior-contain">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                >
                  <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                    {message.role === 'assistant' && (
                      <div 
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1857FE]/20 flex items-center justify-center flex-shrink-0 mb-1"
                        aria-hidden="true"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          className="sm:w-4 sm:h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#1857FE"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 ${
                        message.role === 'user'
                          ? 'bg-gray-200 text-gray-900 rounded-br-none'
                          : 'bg-[#1857FE] text-white rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                        {message.content}
                      </p>
                      <p 
                        className={`text-xs mt-1.5 ${
                          message.role === 'user' ? 'text-gray-600' : 'text-white/70'
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div 
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mb-1"
                        aria-hidden="true"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          className="sm:w-4 sm:h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-end gap-2">
                    <div 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1857FE]/20 flex items-center justify-center flex-shrink-0 mb-1"
                      aria-hidden="true"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        className="sm:w-4 sm:h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#1857FE"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="bg-[#1857FE] text-white rounded-2xl rounded-bl-none px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-1">
                      <div className="flex gap-1">
                        <div 
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce" 
                          style={{ animationDelay: '0ms' }}
                          aria-hidden="true"
                        />
                        <div 
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce" 
                          style={{ animationDelay: '150ms' }}
                          aria-hidden="true"
                        />
                        <div 
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce" 
                          style={{ animationDelay: '300ms' }}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="sr-only">{t('common.chat.typing')}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} aria-live="polite" />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white p-3 sm:p-4 flex-shrink-0">
              <form onSubmit={sendMessage} className="flex items-end gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('common.chat.typeMessage')}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1857FE]/20 focus:border-[#1857FE] text-sm sm:text-base resize-none touch-manipulation"
                  disabled={isLoading}
                  aria-label={t('common.chat.typeMessage')}
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-[#1857FE] text-white rounded-full w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-[#0d47e8] active:bg-[#0a3dd4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer touch-manipulation flex-shrink-0"
                  aria-label={t('common.chat.send')}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <div 
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      className="sm:w-5 sm:h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                  <span className="sr-only">
                    {isLoading ? t('common.chat.sending') : t('common.chat.send')}
                  </span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatWidget
