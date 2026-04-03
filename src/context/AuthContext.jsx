import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const initialState = {
  user:    null,
  token:   localStorage.getItem('rewear-token') || null,
  loading: true,   // true until we verify the stored token
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false };
    case 'LOGOUT':
      return { user: null, token: null, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verify stored token on app load
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('rewear-token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        dispatch({ type: 'SET_USER', payload: data.data.user });
      } catch {
        localStorage.removeItem('rewear-token');
        dispatch({ type: 'LOGOUT' });
      }
    };
    verifyToken();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { token, user } = data.data;
    localStorage.setItem('rewear-token', token);
    dispatch({ type: 'LOGIN', payload: { user, token } });
    return user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    const { token, user } = data.data;
    localStorage.setItem('rewear-token', token);
    dispatch({ type: 'LOGIN', payload: { user, token } });
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rewear-token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user:      state.user,
        token:     state.token,
        loading:   state.loading,
        isAuth:    !!state.user,
        isAdmin:   state.user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
