import React, { useEffect } from "react";
import { useApp } from "../context/AppContext";

const NotificationContainer: React.FC = () => {
  const { state, removeNotification } = useApp();
  const { notifications } = state;

  // Filter only success notifications
  const successNotifications = notifications.filter(
    (notification) => notification.type === "success"
  );

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    successNotifications.forEach((notification) => {
      // Default duration is 4000ms (4 seconds) if not specified
      const duration = notification.duration || 4000;
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, duration);

      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [successNotifications, removeNotification]);

  if (successNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md w-full sm:w-auto">
      {successNotifications.map((notification) => (
        <div
          key={notification.id}
          className="w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out border-l-4 border-green-400"
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 break-words">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-500 break-words">
                  {notification.message}
                </p>
              </div>
              <div className="flex-shrink-0">
                <button
                  type="button"
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 p-1"
                  onClick={() => removeNotification(notification.id)}
                  aria-label="Close"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
