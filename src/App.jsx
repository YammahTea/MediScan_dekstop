import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from "./context/AuthProvider";

// Pages
import LoginScreen from "./pages/LoginScreen";
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Tools from './pages/Tools'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/*note: the auth provider needs to be created first  and covers the other components */}
        {/* so in short, you cannot use the data from a Provider in the same component that creates it */}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

// The inner components
function AppRoutes() {
  const { token, loading } = useAuth();
  
  // while checking the cookie (TO DO: add a loading animation)
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <Routes>
      {/* LOGIN ROUTE: If already logged in, goes to /upload */}
      <Route
        path="/login"
        element={!token ? <LoginScreen /> : <Navigate to="/upload" replace />}
      />
      
      {/* UPLOAD ROUTE: If NOT logged in, goes back to /login */}
      <Route
        path="/upload"
        element={token ? <Upload /> : <Navigate to="/login" replace />}
      />
      
      {/* PROFILE ROUTE: If NOT logged in, goes back to /login */}
      <Route
        path="/profile"
        element={token ? <Profile /> : <Navigate to="/login" replace />}
      />
      
      <Route
        path="/tools"
        element={token ? <Tools /> : <Navigate to="/login" replace />}
      />
      
      {/* Any route: redirects based on auth status */}
      <Route
        path="*"
        element={<Navigate to={token ? "/upload" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;