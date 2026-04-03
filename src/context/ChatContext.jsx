import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io }          from 'socket.io-client';
import { useAuth }     from './AuthContext';
import { useNotifications } from './NotificationContext';
import api             from '../services/api';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { isAuth, token } = useAuth();
  const { addNotification } = useNotifications();
  const socketRef = useRef(null);

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isConnected,    setIsConnected]    = useState(false);

  // Per-chat message listeners registered by ChatPage
  const messageListeners = useRef(new Map());

  const onMessage = useCallback((chatId, handler) => {
    messageListeners.current.set(chatId, handler);
    return () => messageListeners.current.delete(chatId);
  }, []);

  // ── Fetch real unread count from server ─────────────────────────────────
  const fetchUnreadCount = useCallback(() => {
    if (!isAuth) return;
    api.get('/chat/my-chats')
      .then(({ data }) => {
        const total = (data.data?.chats || []).reduce(
          (sum, c) => sum + (c.unreadCount || 0), 0
        );
        setUnreadMessages(total);
      })
      .catch(() => {});
  }, [isAuth]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // ── Socket setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuth || !token) {
      socketRef.current?.disconnect();
      setIsConnected(false);
      return;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth:       { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 Socket connected');
    });

    socket.on('disconnect', () => setIsConnected(false));

    // Route message to the open chat window if it is listening
    socket.on('receive_message', (message) => {
      const handler = messageListeners.current.get(message.chatId);
      if (handler) handler(message);
    });

    // Increment badge for any new message (text OR offer/counter/accepted etc.)
    socket.on('new_message_notification', () => {
      setUnreadMessages((prev) => prev + 1);
    });

    // Real-time bell notification
    socket.on('new_notification', (notif) => {
      addNotification(notif);
    });

    return () => { socket.disconnect(); };
  }, [isAuth, token, addNotification]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const joinChat  = useCallback((chatId) => socketRef.current?.emit('join_chat',  chatId), []);
  const leaveChat = useCallback((chatId) => socketRef.current?.emit('leave_chat', chatId), []);

  const sendMessage = useCallback((chatId, text) => {
    socketRef.current?.emit('send_message', { chatId, text });
  }, []);

  // When user opens a chat — re-fetch real count so badge is accurate
  const markRead = useCallback((chatId) => {
    socketRef.current?.emit('mark_read', { chatId });
    // Small delay then re-fetch real unread count
    setTimeout(fetchUnreadCount, 400);
  }, [fetchUnreadCount]);

  const emitTyping     = useCallback((chatId) => socketRef.current?.emit('typing',      { chatId }), []);
  const emitStopTyping = useCallback((chatId) => socketRef.current?.emit('stop_typing', { chatId }), []);

  return (
    <ChatContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      unreadMessages,
      setUnreadMessages,
      joinChat,
      leaveChat,
      sendMessage,
      markRead,
      emitTyping,
      emitStopTyping,
      onMessage,
      fetchUnreadCount,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be inside ChatProvider');
  return ctx;
};