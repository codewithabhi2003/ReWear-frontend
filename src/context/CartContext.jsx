import { createContext, useContext, useReducer, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const initialState = { items: [], loading: false };

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':    return { ...state, items: action.payload, loading: false };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'CLEAR':       return { ...state, items: [] };
    default:            return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const fetchCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data } = await api.get('/cart');
      dispatch({ type: 'SET_CART', payload: data.data.items });
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addToCart = useCallback(async (productId) => {
    try {
      await api.post('/cart/add', { productId });
      await fetchCart();
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      dispatch({
        type: 'SET_CART',
        payload: state.items.filter((i) => i.productId?._id !== productId),
      });
      toast.success('Removed from cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove item');
    }
  }, [state.items]);

  const clearCart = useCallback(async () => {
    try {
      await api.delete('/cart/clear');
      dispatch({ type: 'CLEAR' });
    } catch { /* silent */ }
  }, []);

  return (
    <CartContext.Provider
      value={{
        items:         state.items,
        loading:       state.loading,
        cartCount:     state.items.length,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
