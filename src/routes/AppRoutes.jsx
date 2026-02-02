import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { AnimatePresence } from 'framer-motion'
import RequireRole from './RequireRole'
import { roles } from '../constants/roles'
import authService from '../services/authService'
import { loginSuccess, logout } from '../store/userSlice'
import { SidebarProvider } from '../contexts/SidebarContext'
import PageLoader from '../components/commons/PageLoader'

// Lazy imports
const VerifyEmail = lazy(() => import('../pages/Auth/VerifyEmail'))
const Register = lazy(() => import('../pages/Auth/Register'))
const Login = lazy(() => import('../pages/Auth/Login'))
const CompanyCreate = lazy(() => import('../pages/Auth/RequestNewComany'))
const AdditionalInformation = lazy(() => import('../pages/Auth/AdditionalInformation'))
const Home = lazy(() => import('../pages/Home'))
const AdminLayout = lazy(() => import('../components/layout/AdminLayout'))
const Dashboard = lazy(() => import('../pages/Admin/Dashboard'))
const Job = lazy(() => import('../pages/Admin/Job/Jobs'))
const Categories = lazy(() => import('../pages/Admin/Category/categories'))
const Users = lazy(() => import('../pages/Admin/User/Users'))
const UserForm = lazy(() => import('../pages/Admin/User/AdminForm'))

function ProtectedRoute({ children }) {
  const user = useSelector((s) => s.user.userInfo);
  const loc = useLocation();
  const dispatch = useDispatch();
  const [initializing, setInitializing] = React.useState(false);
  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (initializing) return;
      if (user !== undefined) return;
      setInitializing(true);
      try {
        const u = await authService.getCurrentUser();
        if (mounted) {
          dispatch(loginSuccess({ user: u || null }));
        }
      } catch {
        if (mounted) {
          dispatch(logout());
        }
      } finally {
        if (mounted) setInitializing(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [user, initializing, dispatch]);

  if (user===undefined) {
    return <div className="min-h-screen bg-white" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.emailVerified === false && loc.pathname !== "/verify") {
    return <Navigate to="/verify" replace state={{ email: user.email, skipCooldown: false }} />;
  }

  if (!user.phoneNumber && loc.pathname !== "/additional-information") {
    return <Navigate to="/additional-information" replace />;
  }

  if (user?.phoneNumber && loc.pathname === "/additional-information") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-company" element={
            <ProtectedRoute>
              <RequireRole roles={[roles.HR,roles.ADMIN_COMPANY]} fallback="/">
                <CompanyCreate />
              </RequireRole>
            </ProtectedRoute>
          } />
          <Route
            path="/additional-information"
            element={
              <ProtectedRoute>
                  <AdditionalInformation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route element={
            <ProtectedRoute>
              <RequireRole roles={[roles.ADMIN_COMPANY, roles.ADMIN]} fallback="/">
                <SidebarProvider>
                  <AdminLayout />
                </SidebarProvider>
              </RequireRole>
            </ProtectedRoute>
          }>
            <Route
              path="/company-admin/dashboard"
              element={<Dashboard />}
            />
          </Route>
          <Route
            path="/hr"
            element={
              <ProtectedRoute>
                <RequireRole roles={[roles.HR]} fallback="/">
                  <SidebarProvider>
                    <AdminLayout />
                  </SidebarProvider>
                </RequireRole>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="jobs" element={<Job />} />
          </Route>
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RequireRole roles={[roles.ADMIN]} fallback="/">
                  <SidebarProvider>
                    <AdminLayout />
                  </SidebarProvider>
                </RequireRole>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path='dashboard' element={<Dashboard />}/>
            <Route path='categories' element={<Categories />}/>
            <Route path='users' element={<Users />}/>
            <Route path='users/new' element={<UserForm />}/>
            <Route path='users/:id' element={<UserForm />}/>
            <Route path='users/:id/edit' element={<UserForm />}/>
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function AppRoutes(){
  return (
    <Router>
        <AnimatedRoutes />
    </Router>
  )
}
