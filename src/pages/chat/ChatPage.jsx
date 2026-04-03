import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Send, ArrowLeft, MessageCircle,
  Image as ImageIcon, X, Play, Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { chatService }  from '../../services/chatService';
import { useAuth }      from '../../context/AuthContext';
import { useChat }      from '../../context/ChatContext';
import { timeAgo, getInitials } from '../../utils/helpers';
import { Spinner }      from '../../components/common/Loader';
import api              from '../../services/api';
import NegotiateWidget  from '../../components/chat/NegotiateWidget';
import OfferCard        from '../../components/chat/OfferCard';

// Types that render as OfferCard instead of a text bubble
const OFFER_TYPES = new Set([
  'offer', 'counter_offer', 'offer_accepted', 'offer_declined',
]);

export default function ChatPage() {
  const { chatId: paramChatId } = useParams();
  const { user }                = useAuth();
  const { joinChat, leaveChat, sendMessage, markRead, onMessage } = useChat();
  const navigate                = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [chats, setChats]                   = useState([]);
  const [activeChatId, setActiveChatId]     = useState(paramChatId || null);
  const [activeProduct, setActiveProduct]   = useState(null);
  const [messages, setMessages]             = useState([]);
  const [text, setText]                     = useState('');
  const [loadingChats, setLoadingChats]     = useState(true);
  const [loadingMsgs, setLoadingMsgs]       = useState(false);
  const [sending, setSending]               = useState(false);
  const [mediaFile, setMediaFile]           = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showNegotiate, setShowNegotiate]   = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);
  const addedIds       = useRef(new Set());

  // ── Derived values ────────────────────────────────────────────────────────
  const activeChat  = chats.find((c) => c._id === activeChatId);
  const otherUser   = activeChat?.participants?.find((p) => p._id !== user?._id);
  // Use activeProduct (from messages API) or fall back to chat.productId
  const product     = activeProduct || activeChat?.productId;

  // isSeller: current user is the seller of the product in this chat
  const isSeller = (() => {
    if (!product || !user) return false;
    const sid = product.sellerId?._id?.toString() || product.sellerId?.toString();
    return sid === user._id?.toString();
  })();

  // ── Fetch chat list ───────────────────────────────────────────────────────
  useEffect(() => {
    chatService.getMyChats()
      .then(({ data }) => setChats(data.data.chats))
      .catch(() => {})
      .finally(() => setLoadingChats(false));
  }, []);

  // ── Load messages when active chat changes ────────────────────────────────
  useEffect(() => {
    if (!activeChatId) return;

    setLoadingMsgs(true);
    setMessages([]);
    setActiveProduct(null);
    setShowNegotiate(false);
    addedIds.current.clear();

    chatService.getMessages(activeChatId)
      .then(({ data }) => {
        const msgs = data.data.messages || [];
        msgs.forEach((m) => addedIds.current.add(m._id?.toString()));
        setMessages(msgs);
        // Backend now returns the product alongside messages
        if (data.data.product) setActiveProduct(data.data.product);
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));

    joinChat(activeChatId);
    markRead(activeChatId);
    window.history.replaceState(null, '', `/chat/${activeChatId}`);
    return () => leaveChat(activeChatId);
  }, [activeChatId]);

  // ── Incoming socket messages ──────────────────────────────────────────────
  useEffect(() => {
    if (!activeChatId) return;
    return onMessage(activeChatId, (msg) => {
      const id = msg._id?.toString();
      if (id && addedIds.current.has(id)) return;
      if (id) addedIds.current.add(id);
      setMessages((prev) => [...prev, msg]);
    });
  }, [activeChatId, onMessage]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Helpers to add a message without duplication ──────────────────────────
  const addMessage = useCallback((msg) => {
    const id = msg._id?.toString();
    if (!id) return;
    if (addedIds.current.has(id)) return;
    addedIds.current.add(id);
    setMessages((prev) => [...prev, msg]);
  }, []);

  // ── Send text / caption ───────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    if ((!text.trim() && !mediaFile) || !activeChatId || sending) return;

    if (mediaFile) {
      handleMediaSend();
      return;
    }

    const msgText = text.trim();
    setText('');
    setSending(true);
    sendMessage(activeChatId, msgText);
    setSending(false);
  }, [text, mediaFile, activeChatId, sending]);

  // ── Send media (image / video) ────────────────────────────────────────────
  const handleMediaSend = async () => {
    if (!mediaFile) return;
    setUploadingMedia(true);
    try {
      const fd = new FormData();
      fd.append('images', mediaFile.file);
      const { data } = await api.post('/chat/upload-media', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url     = data.data.url;
      const msgText = mediaFile.type === 'image' ? `[image]${url}` : `[video]${url}`;
      sendMessage(activeChatId, msgText);
      setMediaFile(null);
      setText('');
    } catch {
      sendMessage(activeChatId, `📎 ${mediaFile.file.name}`);
      setMediaFile(null);
    } finally {
      setUploadingMedia(false);
      setSending(false);
    }
  };

  // ── Send price offer (buyer → seller) ─────────────────────────────────────
  const handleSendOffer = async (offerPrice) => {
    try {
      const { data } = await api.post(`/chat/${activeChatId}/offer`, { offerPrice });
      addMessage(data.data.message);
      setShowNegotiate(false);
      toast.success('Offer sent! 💬');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send offer');
    }
  };

  // ── Pay after deal accepted — navigate to checkout with negotiated params ──
  // OfferCard already handles navigation directly, but this is kept as fallback
  const handlePay = (agreedPrice) => {
    if (!product?._id) { toast.error('Product info not found'); return; }
    navigate(
      `/checkout?negotiated=true&productId=${product._id}&price=${agreedPrice}&chatId=${activeChatId}`
    );
  };

  // ── File select for media ─────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isImage && !isVideo) {
      toast.error('Only images and videos are allowed');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File must be under 20 MB');
      return;
    }

    setMediaFile({
      file,
      preview: URL.createObjectURL(file),
      type:    isVideo ? 'video' : 'image',
    });
    e.target.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render one message ────────────────────────────────────────────────────
  const renderMessage = (msg) => {
    const senderId_str = msg.senderId?._id?.toString() || msg.senderId?.toString();
    const isMe         = senderId_str === user?._id?.toString();

    // Offer-type messages → OfferCard
    if (OFFER_TYPES.has(msg.type)) {
      return (
        <div
          key={msg._id}
          className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}
        >
          <OfferCard
            msg={msg}
            chatId={activeChatId}
            currentUserId={user?._id}
            isSeller={isSeller}
            product={product}
            onNewMessage={addMessage}
            onPay={handlePay}
          />
        </div>
      );
    }

    // Normal text / media bubble
    const content = msg.text || '';
    let bubble;

    if (content.startsWith('[image]')) {
      const url = content.replace('[image]', '');
      bubble = (
        <img
          src={url}
          alt="shared"
          className="max-w-[220px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(url, '_blank')}
        />
      );
    } else if (content.startsWith('[video]')) {
      const url = content.replace('[video]', '');
      bubble = (
        <video src={url} controls className="max-w-[220px] rounded-xl" style={{ maxHeight: 180 }} />
      );
    } else {
      bubble = <p className="text-sm leading-relaxed">{content}</p>;
    }

    return (
      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
        <div className="max-w-[75%]">
          <div
            className="px-4 py-2.5"
            style={{
              background:   isMe ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              color:        isMe ? '#fff' : 'var(--text-primary)',
              borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            }}
          >
            {bubble}
          </div>
          <p
            className={`text-[10px] mt-0.5 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}
            style={{ color: 'var(--text-muted)' }}
          >
            {timeAgo(msg.createdAt)}
          </p>
        </div>
      </div>
    );
  };

  // ── Chat list item ────────────────────────────────────────────────────────
  const renderChatItem = (chat) => {
    const other    = chat.participants?.find((p) => p._id !== user?._id);
    const isActive = chat._id === activeChatId;
    const lastMsg  = chat.lastMessage;

    let preview = lastMsg?.text || '';
    if (preview.startsWith('[image]'))        preview = '📷 Image';
    else if (preview.startsWith('[video]'))   preview = '🎥 Video';
    else if (lastMsg?.type === 'offer')       preview = '💬 Price offer';
    else if (lastMsg?.type === 'counter_offer')   preview = '↕️ Counter offer';
    else if (lastMsg?.type === 'offer_accepted')  preview = '✅ Deal agreed!';
    else if (lastMsg?.type === 'offer_declined')  preview = '❌ Offer declined';

    return (
      <button
        key={chat._id}
        onClick={() => setActiveChatId(chat._id)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
        style={{
          background: isActive
            ? 'color-mix(in srgb, var(--accent-primary) 8%, transparent)'
            : 'transparent',
        }}
      >
        {other?.avatar
          ? <img src={other.avatar} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt={other.name} />
          : <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'var(--accent-primary)' }}
            >
              {getInitials(other?.name)}
            </div>
        }
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline gap-2">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {other?.name || 'Unknown'}
            </p>
            <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              {chat.lastActivity ? timeAgo(chat.lastActivity) : ''}
            </span>
          </div>
          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
            {chat.productId?.title || ''}
          </p>
          {preview && (
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {preview}
            </p>
          )}
        </div>
        {chat.unreadCount > 0 && (
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ background: 'var(--accent-primary)' }}
          >
            {chat.unreadCount}
          </span>
        )}
      </button>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-64px)]" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Chat list sidebar ───────────────────────────────────────────────── */}
      <div
        className={`${activeChatId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r flex-shrink-0`}
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-syne font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4 gap-2">
              <MessageCircle size={40} className="opacity-20" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No conversations yet
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Start a chat from any product page
              </p>
            </div>
          ) : chats.map(renderChatItem)}
        </div>
      </div>

      {/* ── Chat window ─────────────────────────────────────────────────────── */}
      <div className={`${activeChatId ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0`}>

        {/* Empty state */}
        {!activeChatId && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
            <MessageCircle size={64} className="opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p className="font-syne font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              Select a conversation
            </p>
          </div>
        )}

        {activeChatId && (
          <>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
            >
              {/* Back button — mobile */}
              <button
                onClick={() => setActiveChatId(null)}
                className="md:hidden p-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ArrowLeft size={20} />
              </button>

              {/* Avatar */}
              {otherUser?.avatar
                ? <img src={otherUser.avatar} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt={otherUser.name} />
                : <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--accent-primary)' }}
                  >
                    {getInitials(otherUser?.name)}
                  </div>
              }

              {/* Name + product */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/seller/${otherUser?._id}`}
                  className="font-semibold text-sm hover:text-[var(--accent-primary)] transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {otherUser?.name || 'User'}
                </Link>
                {product && (
                  <Link
                    to={`/product/${product._id}`}
                    className="block text-xs truncate hover:text-[var(--accent-primary)] transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Re: {product.title} · ₹{(product.sellingPrice || product.price)?.toLocaleString('en-IN')}
                  </Link>
                )}
              </div>

              {/* Negotiate button — header, only for buyer */}
              {!isSeller && product && (
                <button
                  onClick={() => setShowNegotiate((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all"
                  style={{
                    background: showNegotiate
                      ? 'var(--accent-primary)'
                      : 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
                    color:  showNegotiate ? '#fff' : 'var(--accent-primary)',
                    border: '1px solid color-mix(in srgb, var(--accent-primary) 35%, transparent)',
                  }}
                >
                  <Tag size={12} />
                  {showNegotiate ? 'Cancel' : 'Negotiate'}
                </button>
              )}
            </div>

            {/* ── Messages ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {loadingMsgs ? (
                <div className="flex justify-center py-10"><Spinner /></div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    No messages yet — say hello! 👋
                  </p>
                  {!isSeller && product && (
                    <button
                      onClick={() => setShowNegotiate(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                      style={{
                        background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)',
                        color:  'var(--accent-primary)',
                        border: '1px solid color-mix(in srgb, var(--accent-primary) 25%, transparent)',
                      }}
                    >
                      <Tag size={14} /> Make an offer
                    </button>
                  )}
                </div>
              ) : (
                messages.map(renderMessage)
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Media preview ──────────────────────────────────────────── */}
            {mediaFile && (
              <div className="px-4 pb-2 flex items-center gap-3 flex-shrink-0">
                <div
                  className="relative rounded-xl overflow-hidden flex-shrink-0"
                  style={{ width: 72, height: 72, background: 'var(--bg-elevated)' }}
                >
                  {mediaFile.type === 'image'
                    ? <img src={mediaFile.preview} className="w-full h-full object-cover" alt="preview" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Play size={24} style={{ color: 'var(--text-secondary)' }} />
                      </div>
                  }
                  <button
                    onClick={() => setMediaFile(null)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.6)' }}
                  >
                    <X size={10} color="#fff" />
                  </button>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {mediaFile.file.name} · ready to send
                </p>
              </div>
            )}

            {/* ── Input bar (+ negotiate widget slides above) ─────────────── */}
            <div
              className="border-t flex-shrink-0"
              style={{ borderColor: 'var(--border)', position: 'relative' }}
            >
              {/* Negotiate widget — slides up above input bar, buyer only */}
              {showNegotiate && !isSeller && product && (
                <NegotiateWidget
                  product={product}
                  onSend={handleSendOffer}
                  onClose={() => setShowNegotiate(false)}
                />
              )}

              <div className="p-3 flex items-end gap-2">

                {/* Media upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl transition-colors hover:bg-[var(--bg-elevated)] flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  title="Send image or video"
                >
                  <ImageIcon size={20} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Negotiate icon — always visible for buyer */}
                {!isSeller && product && (
                  <button
                    onClick={() => setShowNegotiate((v) => !v)}
                    className="p-2.5 rounded-xl transition-all flex-shrink-0"
                    style={{
                      color: showNegotiate ? 'var(--accent-primary)' : 'var(--text-muted)',
                      background: showNegotiate
                        ? 'color-mix(in srgb, var(--accent-primary) 12%, transparent)'
                        : 'transparent',
                    }}
                    title="Negotiate price"
                  >
                    <Tag size={20} />
                  </button>
                )}

                {/* Text input */}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={mediaFile ? 'Add a caption…' : 'Type a message…'}
                  rows={1}
                  className="input flex-1 resize-none py-2.5"
                  style={{ minHeight: 44, maxHeight: 120 }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />

                {/* Send */}
                <button
                  onClick={handleSend}
                  disabled={(!text.trim() && !mediaFile) || uploadingMedia}
                  className="p-2.5 rounded-xl flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: 'var(--accent-primary)', color: '#fff' }}
                >
                  {uploadingMedia ? <Spinner size={18} /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}