import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/auth/Login'));
const BookingList = lazy(() => import('./pages/bookings/BookingList'));
const BookingInvoice = lazy(() => import('./pages/bookings/BookingInvoice'));


const MenuPlanner = lazy(() => import('./pages/catering/MenuPlanner'));
const OneDishCheck = lazy(() => import('./pages/catering/OneDishCheck'));
const Inventory = lazy(() => import('./pages/rentals/Inventory'));
const DamageReport = lazy(() => import('./pages/rentals/DamageReport'));
const MaintenanceTracker = lazy(() => import('./pages/rentals/MaintenanceTracker'));
const VendorSourcing = lazy(() => import('./pages/rentals/VendorSourcing'));
const VehicleFleet = lazy(() => import('./pages/vehicles/VehicleFleet'));
const DriverAssignment = lazy(() => import('./pages/vehicles/DriverAssignment'));
const AccessControl = lazy(() => import('./pages/admin/AccessControl'));
const HallList = lazy(() => import('./pages/halls/HallList'));

// Layout with sidebar and navbar
const Layout = ({ children, sidebarOpen, onToggleSidebar, isMobile }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-background)', position: 'relative' }}>
      <Sidebar isOpen={sidebarOpen} onToggle={onToggleSidebar} isMobile={isMobile} />
      {isMobile && sidebarOpen && <div className="mobile-backdrop" onClick={onToggleSidebar} />}
      <div style={{ 
        flex: 1, 
        marginLeft: isMobile ? '0' : (sidebarOpen ? '240px' : '70px'),
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        overflow: 'hidden',
      }}>
        <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={onToggleSidebar} isMobile={isMobile} />
        <main className="p-6 bg-background" style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  
  const toggleSidebar = () => setSidebarOpen((prevOpen) => !prevOpen);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
      <Router>
        <Suspense fallback={
          <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-light)', fontWeight: 600 }}>
            Loading page...
          </div>
        }>
        <Routes>
{/* Public routes */}
          <Route path="/login" element={<Login />} />
          
{/* Admin only route */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/access-control" element={
              <Layout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile}>
                <AccessControl />
              </Layout>
            } />
          </Route>
          
          {/* Protected routes with layout */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'vendor', 'customer']} />}>
            <Route path="/" element={
              <Layout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile}>
                <Dashboard />
              </Layout>
            } />
          </Route>
          
          {/* Authenticated routes for all roles */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'vendor', 'customer']} />}>
            <Route path="/bookings" element={
              <Layout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile}>
                <BookingList />
              </Layout>
            } />
            <Route path="/bookings/:id/invoice" element={
              <Layout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile}>
                <BookingInvoice />
              </Layout>
            } />

            
            <Route path="/catering/menu" element={
              <Layout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile}>
                <MenuPlanner />
              </Layout>
            } />
            <Route path="/catering/one-dish" element={
              <Layout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile}>
                <OneDishCheck />
              </Layout>
            } />
            
            <Route path="/rentals/inventory" element={
              <Layout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile}>
                <Inventory />
              </Layout>
            } />
            <Route path="/rentals/damage-report" element={
              <Layout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile}>
                <DamageReport />
              </Layout>
            } />
            <Route path="/rentals/maintenance" element={
              <Layout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile}>
                <MaintenanceTracker />
              </Layout>
            } />
            <Route path="/rentals/vendors" element={
              <Layout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile}>
                <VendorSourcing />
              </Layout>
            } />
            
            <Route path="/vehicles/fleet" element={
              <Layout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile}>
                <VehicleFleet />
              </Layout>
            } />
            <Route path="/vehicles/drivers" element={
              <Layout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile}>
                <DriverAssignment />
              </Layout>
            } />

            <Route path="/halls" element={
              <Layout sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} isMobile={isMobile}>
                <div className="p-8">
                  <HallList />
                </div>
              </Layout>
            } />
          </Route>
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
        </Suspense>
      </Router>
  );
}

export default App;
