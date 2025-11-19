import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner'
import { applicationService } from '../services/applicationService'
import type { ApplicationDetailResponse, Bill } from '../types/Application'
import { useApp } from '../context/AppContext'
import PaymentModal from '../components/PaymentModal'
import { paymentService } from '../services/paymentService'

// Icons
const UserIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

const PaymentIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

const CloseIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { addNotification } = useApp()
  const [data, setData] = useState<ApplicationDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<Bill | null>(null)

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) {
        setError(t('dashboard.applications.error') || 'Ariza ID topilmadi')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await applicationService.getApplicationById(id)
        setData(response)
      } catch (err) {
        const message = (err as { message?: string })?.message || t('dashboard.applications.error') || 'Arizani yuklashda xatolik yuz berdi'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [id, t])

  const handleClose = useCallback(() => {
    navigate('/dashboard')
  }, [navigate])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [handleClose])

  const handleBillClick = (bill: Bill) => {
    setSelectedBill(bill)
  }

  const handlePayBill = (bill: Bill) => {
    // Open payment modal instead of directly opening URL
    // Close bill detail modal first
    setSelectedBill(null)
    // Then open payment modal
    setSelectedBillForPayment(bill)
    setIsPaymentModalOpen(true)
  }

  const handlePaymePayment = async () => {
    if (!selectedBillForPayment || !data) {
      addNotification({
        type: 'error',
        title: t('common.error') || 'Xatolik',
        message: t('dashboard.payments.paymentError') || 'To\'lov ma\'lumotlari topilmadi',
      })
      return
    }

    try {
      setIsPaymentModalOpen(false)
      
      const response = await paymentService.createPaymePayment(
        data.appointment.uuid || data.appointment.id || '',
        selectedBillForPayment.amount
      )

      if (response.payment_link) {
        window.open(response.payment_link, '_blank', 'noopener,noreferrer')
        addNotification({
          type: 'success',
          title: t('common.success') || 'Muvaffaqiyatli',
          message: t('dashboard.payments.paymentLinkOpened') || 'To\'lov havolasi ochildi',
        })
      } else {
        addNotification({
          type: 'error',
          title: t('common.error') || 'Xatolik',
          message: t('dashboard.payments.noPaymentUrl') || 'To\'lov havolasi mavjud emas',
        })
      }
    } catch (err) {
      const apiError = err as { status?: number; message?: string }
      
      addNotification({
        type: 'error',
        title: t('common.error') || 'Xatolik',
        message: apiError.message || t('dashboard.payments.paymentError') || 'To\'lov havolasini ochishda xatolik',
      })
    }
  }

  const handleClickPayment = async () => {
    if (!selectedBillForPayment || !data) {
      addNotification({
        type: 'error',
        title: t('common.error') || 'Xatolik',
        message: t('dashboard.payments.paymentError') || 'To\'lov ma\'lumotlari topilmadi',
      })
      return
    }

    try {
      setIsPaymentModalOpen(false)
      
      const response = await paymentService.createClickPayment(
        data.appointment.uuid || data.appointment.id || '',
        selectedBillForPayment.amount
      )

      if (response.click_link?.payment_url) {
        window.open(response.click_link.payment_url, '_blank', 'noopener,noreferrer')
        addNotification({
          type: 'success',
          title: t('common.success') || 'Muvaffaqiyatli',
          message: t('dashboard.payments.paymentLinkOpened') || 'To\'lov havolasi ochildi',
        })
      } else {
        addNotification({
          type: 'error',
          title: t('common.error') || 'Xatolik',
          message: t('dashboard.payments.noPaymentUrl') || 'To\'lov havolasi mavjud emas',
        })
      }
    } catch (err) {
      const apiError = err as { status?: number; message?: string }
      
      addNotification({
        type: 'error',
        title: t('common.error') || 'Xatolik',
        message: apiError.message || t('dashboard.payments.paymentError') || 'To\'lov havolasini ochishda xatolik',
      })
    }
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
        return t('dashboard.status.pending') || 'Kutilmoqda'
      case 'approved':
        return t('dashboard.status.approved') || 'Tasdiqlangan'
      case 'rejected':
        return t('dashboard.status.rejected') || 'Rad etilgan'
      case 'completed':
        return t('dashboard.status.completed') || 'Yakunlangan'
      case 'cancelled':
        return t('dashboard.status.cancelled') || 'Bekor qilingan'
      case 'paid':
        return t('dashboard.status.paid') || 'To\'langan'
      case 'failed':
        return t('dashboard.status.failed') || 'Xatolik'
      case 'refunded':
        return t('dashboard.status.refunded') || 'Qaytarilgan'
      default:
        return status || t('dashboard.status.unknown') || 'Noma\'lum'
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text={t('dashboard.applications.loading') || 'Yuklanmoqda...'} />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          className="relative z-10 bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || t('dashboard.applications.error') || 'Ariza topilmadi'}</p>
          <button
              onClick={handleClose}
              className="px-4 py-2 bg-[#1857FE] text-white rounded-md hover:bg-[#0d47e8] transition-colors"
          >
              {t('dashboard.applications.backToDashboard') || 'Dashboardga qaytish'}
          </button>
        </div>
        </motion.div>
      </div>
    )
  }

  const { appointment, bills } = data
  const fullName = [appointment.first_name, appointment.last_name].filter(Boolean).join(' ') || appointment.client_name || t('dashboard.applications.application') || 'Ariza'
  const appointmentDate = appointment.date || appointment.appointment_date
  const appointmentTime = appointment.start_time || appointment.end_time 
    ? `${appointment.start_time || ''}${appointment.start_time && appointment.end_time ? ' - ' : ''}${appointment.end_time || ''}` 
    : appointment.appointment_time

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
          aria-label={t('common.close')}
        />

        <motion.div
          className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col my-8"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t('dashboard.applications.application') || 'Ariza batafsil'}
              </h1>
              {appointment.is_active !== undefined && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.is_active ? 'approved' : 'cancelled')}`}>
                  {appointment.is_active ? t('dashboard.status.approved') || 'Faol' : t('dashboard.status.cancelled') || 'Nofaol'}
                </span>
              )}
              {appointment.status && appointment.is_active === undefined && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                  {getStatusText(appointment.status)}
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
              aria-label={t('common.close')}
            >
              <CloseIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Appointment Information */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('dashboard.applications.appointmentInfo') || 'Ariza ma\'lumotlari'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs sm:text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span>{t('dashboard.applications.fullName') || 'To\'liq ism'}</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-base sm:text-lg">{fullName}</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs sm:text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{t('dashboard.applications.phone') || 'Telefon'}</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-base sm:text-lg">{appointment.phone || appointment.client_phone || '—'}</div>
        </div>

                {appointmentDate && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs sm:text-sm text-gray-500 mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{t('dashboard.applications.date') || 'Sana'}</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-base sm:text-lg">
                      {new Date(appointmentDate).toLocaleDateString('uz-UZ')}
                      {appointmentTime && `, ${appointmentTime}`}
                    </div>
            </div>
                )}

                {appointment.created_at && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs sm:text-sm text-gray-500 mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{t('dashboard.applications.createdAt') || 'Yaratilgan sana'}</span>
            </div>
                    <div className="font-semibold text-gray-900 text-base sm:text-lg">
                      {new Date(appointment.created_at).toLocaleDateString('uz-UZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
            </div>
                  </div>
                )}
          </div>

              {appointment.message && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{t('dashboard.applications.message') || 'Xabar'}</h3>
                  <p className="text-gray-700">{appointment.message}</p>
                </div>
              )}
            </div>

            {/* Bills Section */}
            {bills && bills.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PaymentIcon className="w-5 h-5" />
                  <span>{t('dashboard.payments.title') || 'To\'lovlar'}</span>
                  <span className="text-sm font-normal text-gray-500">({bills.length})</span>
                </h2>
                <div className="space-y-3">
                  {bills.map((bill) => (
                    <div
                      key={bill.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-[#1857FE] hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                              {t('dashboard.payments.bill') || 'To\'lov'} #{bill.id}
                            </h3>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(bill.status)}`}>
                              {getStatusText(bill.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <PaymentIcon className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {bill.amount} {t('common.currency') || 'so\'m'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {bill.bill_url && (
                            <button
                              onClick={() => handlePayBill(bill)}
                              className="px-4 py-2 bg-[#1857FE] hover:bg-[#0d47e8] text-white rounded-lg transition-colors text-sm font-medium"
                            >
                              {t('dashboard.payments.pay') || 'To\'lash'}
                            </button>
                          )}
                          <button
                            onClick={() => handleBillClick(bill)}
                            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                          >
                            {t('dashboard.payments.details') || 'Batafsil'}
                          </button>
            </div>
          </div>
        </div>
                  ))}
                </div>
              </div>
            )}

            {(!bills || bills.length === 0) && (
              <div className="mt-6 pt-6 border-t border-gray-200 text-center py-8">
                <PaymentIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('dashboard.payments.noBills') || 'To\'lovlar mavjud emas'}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              {t('common.close') || 'Yopish'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-[#1857FE] hover:bg-[#0d47e8] text-white rounded-lg transition-colors text-sm font-medium"
            >
              {t('dashboard.applications.backToDashboard') || 'Dashboardga qaytish'}
            </button>
          </div>
        </motion.div>

        {/* Bill Detail Modal */}
        <AnimatePresence>
          {selectedBill && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 bg-black/50"
                onClick={() => setSelectedBill(null)}
              />
              <motion.div
                className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('dashboard.payments.billDetails') || 'To\'lov batafsil'}
                  </h3>
                  <button
                    onClick={() => setSelectedBill(null)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">{t('dashboard.payments.billId') || 'To\'lov ID'}</p>
                    <p className="font-medium text-gray-900">#{selectedBill.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('dashboard.payments.amount') || 'Summa'}</p>
                    <p className="font-medium text-gray-900">
                      {selectedBill.amount} {t('common.currency') || 'so\'m'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('dashboard.payments.status') || 'Holat'}</p>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedBill.status)}`}>
                      {getStatusText(selectedBill.status)}
                    </span>
                  </div>
                  {selectedBill.bill_url && (
                    <div className="pt-3 border-t">
                      <button
                        onClick={() => handlePayBill(selectedBill)}
                        className="w-full px-4 py-2 bg-[#1857FE] hover:bg-[#0d47e8] text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        {t('dashboard.payments.pay') || 'To\'lash'}
                      </button>
          </div>
        )}
          </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false)
            setSelectedBillForPayment(null)
          }}
          onPaymeClick={handlePaymePayment}
          onClickClick={handleClickPayment}
          appointment={data?.appointment?.uuid || data?.appointment?.id || ''}
          amount={selectedBillForPayment?.amount || ''}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export default ApplicationDetail
