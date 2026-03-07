import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('useAuth must be used within the AuthProvider');
  }

  return authContext;
};


export const AuthProvider = ({ children }) => {
  
  // just a fake token for now to bypass the login screen
  const [token, setToken] = useState('local-session'); 
  const [loading, setLoading] = useState(false);


  // 1- login function
  const login = async (username, password) => {

    // TODO: make rust  check if the local password is correct
    setToken('local-session');

  };
  
  // 2- logout function
  const logout = async () => {
      setToken(null);
  };
  
  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};