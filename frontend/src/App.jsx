import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContractList from './pages/ContractList';
import ContractForm from './pages/ContractForm';
import ContractDetails from './pages/ContractDetails';
import Reports from './pages/Reports';
import AdminPanel from './pages/AdminPanel';

// Protected layout that mounts Sidebar, Header, and page content
const LayoutWrapper = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine page title based on path
  const getPageTitle = (path) => {
    if (path === '/') return 'System Overview Dashboard';
    if (path.startsWith('/contracts/new')) return 'Create Commercial Contract';
    if (path.startsWith('/contracts/edit/')) return 'Modify Contract details';
    if (path.startsWith('/contracts/')) return 'Contract Registry Details';
    if (path.startsWith('/contracts')) return 'Contracts Dashboard';
    if (path.startsWith('/reports')) return 'Reports & Analytics Console';
    if (path.startsWith('/admin')) return 'Administrative Configuration Panel';
    return 'Oxygen Sports Tracker';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Pane */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Toolbar */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          title={getPageTitle(location.pathname)} 
        />
        
        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};

// Route security guard checking if session is authenticated
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <LayoutWrapper>{children}</LayoutWrapper>;
};

// Public route block preventing logged-in users from seeing login portal
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public authentication portal */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />

          {/* Secure application routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/contracts" 
            element={
              <ProtectedRoute>
                <ContractList />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/contracts/new" 
            element={
              <ProtectedRoute>
                <ContractForm />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/contracts/edit/:id" 
            element={
              <ProtectedRoute>
                <ContractForm />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/contracts/:id" 
            element={
              <ProtectedRoute>
                <ContractDetails />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />

          {/* 404 Route redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
