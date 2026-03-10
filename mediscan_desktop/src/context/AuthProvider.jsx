import { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('useAuth must be used within the AuthProvider');
  }

  return authContext;
};


export const AuthProvider = ({ children }) => {
  
  const [token, setToken] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);


  // to check if the app is already setup when it first loads
  useEffect(() => {
    const checkVaultStatus = async () => {
      try {
        const isSet = await invoke('is_password_set');
        setHasPassword(isSet);

      } catch (err) {
        console.error("Failed to check vault status:", err);

      } finally {
        setLoading(false);
      }
    };
    checkVaultStatus();
  }, []);
  

  // for first time login
  const setupVault = async (password) => {
    try {
      
      await invoke('set_first_password', { password });
      setHasPassword(true);
      setToken('local-session'); // to instantly log the user in after setting up password

      return { success: true };

    } catch (err) {
      return { success: false, error: err };
    }
  };

  // FUNCTION FOR: Login
  const login = async (password) => {
    try {
      const isValid = await invoke('verify_password', { password });

      if (isValid) {
        setToken('local-session');
        return { success: true };

      } else {
        return { success: false, error: "Incorrect master password." };
      }

    } catch (err) {
      return { success: false, error: err };
    }
  };

  // FUNCTION FOR: logout
  const logout = async () => {
    setToken(null);
  };
  
  

  return (
    <AuthContext.Provider value={{ token, hasPassword, login, setupVault, logout, loading }}>
        {!loading && children}
    </AuthContext.Provider>
  );
};