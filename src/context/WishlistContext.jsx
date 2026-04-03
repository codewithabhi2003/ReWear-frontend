import { createContext, useContext, useReducer, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'SET':    return { ...state, items: action.payload, loading: false };
    case 'LOADING':return { ...state, loading: action.payload };
    default:       return state;
  }
}

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [], loading: false });

  const fetchWishlist = useCallback(async () => {
    try {
      dispatch({ type: 'LOADING', payload: true });
      const { data } = await api.get('/wishlist');
      dispatch({ type: 'SET', payload: data.data.products });
    } catch {
      dispatch({ type: 'LOADING', payload: false });
    }
  }, []);

  const toggle = useCallback(async (productId) => {
    try {
      const { data } = await api.post(`/wishlist/toggle/${productId}`);
      await fetchWishlist();
      toast.success(data.message, { icon: data.data.action === 'added' ? '❤️' : '🤍' });
      return data.data.action;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wishlist update failed');
    }
  }, [fetchWishlist]);

  const isWishlisted = useCallback(
    (productId) => state.items.some((p) => (p._id || p) === productId),
    [state.items]
  );

  return (
    <WishlistContext.Provider
      value={{
        items: state.items,
        loading: state.loading,
        fetchWishlist,
        toggle,
        isWishlisted,
        count: state.items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
  return ctx;
};
