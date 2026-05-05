import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { AnimatePresence } from 'framer-motion'
import RequireRole from './RequireRole'
import { roles } from '../constants/roles'
import authService from '../services/authService'
import { loginSuccess, logout } from '../store/userSlice'
import { initNotifications, teardownNotifications } from '../store/notificationActions'
import { SidebarProvider } from '../contexts/SidebarContext'
import PageLoader from '../components/commons/PageLoader'

// Lazy imports
const VerifyEmail = lazy(() => import('../pages/Auth/VerifyEmail'))
const Register = lazy(() => import('../pages/Auth/Register'))
const Login = lazy(() => import('../pages/Auth/Login'))
const CompanyCreate = lazy(() => import('../pages/Auth/RequestNewComany'))
const AdditionalInformation = lazy(() => import('../pages/Auth/AdditionalInformation'))
const Home = lazy(() => import('../pages/public/Home'))
const Jobs = lazy(() => import('../pages/public/Jobs'))
const Companies = lazy(() => import('../pages/public/Companies'))
const SavedJobs = lazy(() => import('../pages/public/SavedJobs'))
const Profile = lazy(() => import('../pages/public/Profile'))
const MyResumes = lazy(() => import('../pages/public/MyResumes'))
const ApplicationHistory = lazy(() => import('../pages/public/ApplicationHistory'))
const CompanyDetail = lazy(() => import('../pages/public/CompanyDetail'))
const JobDetail = lazy(() => import('../pages/public/JobDetail'))
const AdminLayout = lazy(() => import('../components/layout/AdminLayout'))
const Dashboard = lazy(() => import('../pages/Admin/Dashboard'))
const Job = lazy(() => import('../pages/Admin/Job/Jobs'))
const JobForm = lazy(() => import('../pages/Admin/Job/JobForm'))
const Categories = lazy(() => import('../pages/Admin/Category/categories'))
const Users = lazy(() => import('../pages/Admin/User/Users'))
const UserForm = lazy(() => import('../pages/Admin/User/UserForm'))
const AdminCompanies = lazy(() => import('../pages/Admin/Company/Companies'))
const CompanyForm = lazy(() => import('../pages/Admin/Company/CompanyForm'))
const HRDashboard = lazy(() => import('../pages/HR/HRDashboard'))

const CompanyAdminDashboard = lazy(() => import('../pages/CompanyAdmin/CompanyAdminDashboard'))
const CompanyProfile = lazy(() => import('../pages/CompanyAdmin/CompanyProfile'))
const TeamManagement = lazy(() => import('../pages/CompanyAdmin/TeamManagement'))
const Invitations = lazy(() => import('../pages/CompanyAdmin/Invitations'))
const HRCandidates = lazy(() => import('../pages/HR/HRCandidates'))

function ProtectedRoute({ children }) {
  const user = useSelector((s) => s.user.userInfo);
  const loc = useLocation();
  const dispatch = useDispatch();
  const [initializing, setInitializing] = React.useState(true); 

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (user !== undefined) {
        if (mounted) setInitializing(false);
        return;
      }

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
  }, [user, dispatch]);

  React.useEffect(() => {
    if (user === undefined) return;
    if (user) {
      dispatch(initNotifications());
    } else {
      dispatch(teardownNotifications());
    }
  }, [user, dispatch]);

  if (initializing || user === undefined) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.isEmailVerified === false && loc.pathname !== "/verify") {
    return <Navigate to="/verify" replace state={{ email: user.email, skipCooldown: false }} />;
  }

  if (!user.phoneNumber && loc.pathname !== "/additional-information") {
    return <Navigate to="/additional-information" replace />;
  }

  if (user?.phoneNumber && loc.pathname === "/additional-information") {
    if (user.roleId === roles.COMPANY_ADMIN) {
      return <Navigate to="/create-company" replace />;
    }
    if (user.roleId === roles.HR) {
      return user.companyId
        ? <Navigate to="/hr/dashboard" replace />
        : <Navigate to="/create-company" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

function RootRedirect() {
  const user = useSelector((s) => s.user.userInfo);

  if (user === undefined) {
    return null;
  }

  if (user) {
    if (user.roleId === roles.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.roleId === roles.COMPANY_ADMIN) {
      return <Navigate to="/company-admin/dashboard" replace />;
    }
    if (user.roleId === roles.HR) {
      return user.companyId
        ? <Navigate to="/hr/dashboard" replace />
        : <Navigate to="/create-company" replace />;
    }
  }

  return <Home />;
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
              <RequireRole roles={[roles.HR,roles.COMPANY_ADMIN]} fallback="/">
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
          <Route path="/" element={<RootRedirect />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/my-resumes" element={<ProtectedRoute><MyResumes /></ProtectedRoute>} />
          <Route path="/saved-jobs" element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
          <Route path="/application-history" element={<ProtectedRoute><ApplicationHistory /></ProtectedRoute>} />
          <Route 
            path="/company-admin"
            element={
              <ProtectedRoute>
                <RequireRole roles={[roles.COMPANY_ADMIN]} fallback="/">
                  <SidebarProvider>
                    <AdminLayout />
                  </SidebarProvider>
                </RequireRole>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CompanyAdminDashboard />} />
            <Route path="company-profile" element={<CompanyProfile />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="invitations" element={<Invitations />} />
            <Route path="jobs" element={<Job />} />
            <Route path="jobs/new" element={<JobForm />} />
            <Route path="jobs/:id" element={<JobForm />} />
            <Route path="jobs/:id/edit" element={<JobForm />} />
            <Route path="candidates" element={<HRCandidates />} />
          </Route>
          <Route
            path="/hr"
            element={
              <ProtectedRoute>
                <RequireRole roles={[roles.HR, roles.COMPANY_ADMIN]} fallback="/">
                  <SidebarProvider>
                    <AdminLayout />
                  </SidebarProvider>
                </RequireRole>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<HRDashboard />} />
            <Route path="jobs" element={<Job />} />
            <Route path="jobs/new" element={<JobForm />} />
            <Route path="jobs/:id" element={<JobForm />} />
            <Route path="jobs/:id/edit" element={<JobForm />} />
            <Route path="candidates" element={<HRCandidates />} />
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
            <Route path='companies' element={<AdminCompanies />}/>
            <Route path='companies/new' element={<CompanyForm />}/>
            <Route path='companies/:id' element={<CompanyForm />}/>
            <Route path='companies/:id/edit' element={<CompanyForm />}/>
            <Route path='companies/requests/:id' element={<CompanyForm isRequest={true} />}/>
            <Route path='companies/requests/:id/edit' element={<CompanyForm isRequest={true} />}/>
            <Route path='jobs' element={<Job />}/>
            <Route path='jobs/new' element={<JobForm />}/>
            <Route path='jobs/:id' element={<JobForm />}/>
            <Route path='jobs/:id/edit' element={<JobForm />}/>
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
