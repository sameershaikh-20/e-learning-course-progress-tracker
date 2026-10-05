import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('elearning_user')); } catch { return null; } });
  const signIn = ({ user: nextUser, token }) => { localStorage.setItem('elearning_user', JSON.stringify(nextUser)); localStorage.setItem('elearning_token', token); setUser(nextUser); };
  const signOut = () => { localStorage.removeItem('elearning_user'); localStorage.removeItem('elearning_token'); setUser(null); };
  const value = useMemo(() => ({ user, signIn, signOut }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
