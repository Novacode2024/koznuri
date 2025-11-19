import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./context/AppContext";
import NotificationContainer from "./components/NotificationContainer";
import ErrorBoundary from "./components/ErrorBoundary";
import RouterLayout from "./layout/RouterLayout";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import DoctorDetail from "./pages/DoctorDetail";
import Texnalogy from "./pages/Texnalogy";
import NewsPage from "./pages/NewsPage";
import NewsDetail from "./pages/NewsDetail";
import Media from "./pages/Media";
import Servises from "./pages/Servises";
import ServiceDetail from "./pages/ServiceDetail";
import AboutPage from "./pages/AboutPage";
import UsageGuides from "./pages/UsageGuides";
import UsageGuideDetail from "./pages/UsageGuideDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ApplicationDetail from "./pages/ApplicationDetail";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RouterLayout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/doctors",
          element: <Doctors />,
        },
        {
          path: "/doctor/:uuid",
          element: <DoctorDetail />,
        },
        {
          path: "/technologies",
          element: <Texnalogy />,
        },
        {
          path: "/news",
          element: <NewsPage />,
        },
        {
          path: "/news/:id",
          element: <NewsDetail />,
        },
        {
          path: "/media",
          element: <Media />,
        },
        {
          path: "/services",
          element: <Servises />,
        },
        {
          path: "/service/:uuid",
          element: <ServiceDetail />,
        },
        {
          path: "/about",
          element: <AboutPage />,
        },
        {
          path: "/usage",
          element: <UsageGuides />,
        },
        {
          path: "/usage/:uuid",
          element: <UsageGuideDetail />,
        },
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/application/:id",
          element: <ApplicationDetail />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <RouterProvider router={router} />
          <NotificationContainer />
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
