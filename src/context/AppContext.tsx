import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";

// State Types
export interface AppState {
  loading: boolean;
  error: string | null;
  user: User | null;
  notifications: Notification[];
  theme: "light" | "dark";
  language: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "user" | "admin" | "doctor";
  isVerified: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  timestamp: string;
}

// Action Types
export type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USER"; payload: User | null }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "CLEAR_NOTIFICATIONS" }
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "SET_LANGUAGE"; payload: string }
  | { type: "RESET_STATE" };

// Initial State
const initialState: AppState = {
  loading: false,
  error: null,
  user: null,
  notifications: [],
  theme: "light",
  language: "uz-cyrillic",
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_USER":
      return { ...state, user: action.payload };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };

    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };

    case "CLEAR_NOTIFICATIONS":
      return { ...state, notifications: [] };

    case "SET_THEME":
      return { ...state, theme: action.payload };

    case "SET_LANGUAGE":
      return { ...state, language: action.payload };

    case "RESET_STATE":
      return initialState;

    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUser: (user: User | null) => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (language: string) => void;
  resetState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  const setUser = (user: User | null) => {
    dispatch({ type: "SET_USER", payload: user });
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: "ADD_NOTIFICATION", payload: newNotification });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: "CLEAR_NOTIFICATIONS" });
  };

  const setTheme = (theme: "light" | "dark") => {
    dispatch({ type: "SET_THEME", payload: theme });
    localStorage.setItem("theme", theme);
  };

  const setLanguage = (language: string) => {
    dispatch({ type: "SET_LANGUAGE", payload: language });
    localStorage.setItem("language", language);
  };

  const resetState = () => {
    dispatch({ type: "RESET_STATE" });
  };

  const value: AppContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setUser,
    addNotification,
    removeNotification,
    clearNotifications,
    setTheme,
    setLanguage,
    resetState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to use the context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export default AppContext;
