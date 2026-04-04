import { lazy, Suspense } from 'react';
import ScrollToTop from './components/common/ScrollToTop';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider }        from './context/ThemeContext';
import { AuthProvider }         from './context/AuthContext';
import { CartProvider }         from './context/CartContext';
import { WishlistProvider }     from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider }         from './context/ChatContext';

import Navbar         from './components/common/Navbar';
import Footer         from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout    from './components/common/AdminLayout';
import { PageLoader } from './components/common/Loader';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const Home            = lazy(() => import('./pages/Home'));
const Browse          = lazy(() => import('./pages/shop/Browse'));
const ProductDetail   = lazy(() => import('./pages/shop/ProductDetail'));
const SearchResults   = lazy(() => import('./pages/shop/SearchResults'));
const Login           = lazy(() => import('./pages/auth/Login'));
const Register        = lazy(() => import('./pages/auth/Register'));
const Cart            = lazy(() => import('./pages/cart/Cart'));
const Checkout        = lazy(() => import('./pages/cart/Checkout'));
const Profile         = lazy(() => import('./pages/user/Profile'));
const Wishlist        = lazy(() => import('./pages/user/Wishlist'));
const MyOrders        = lazy(() => import('./pages/user/MyOrders'));
const OrderDetail     = lazy(() => import('./pages/user/OrderDetail'));
const Notifications   = lazy(() => import('./pages/user/Notifications'));
const SellerProfile   = lazy(() => import('./pages/user/SellerProfile'));
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'));
const ListProduct     = lazy(() => import('./pages/seller/ListProduct'));
const EditProduct     = lazy(() => import('./pages/seller/EditProduct'));
const MyListings      = lazy(() => import('./pages/seller/MyListings'));
const SellerOrders    = lazy(() => import('./pages/seller/SellerOrders'));
const ChatPage        = lazy(() => import('./pages/chat/ChatPage'));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts   = lazy(() => import('./pages/admin/AdminProducts'));
const AdminUsers      = lazy(() => import('./pages/admin/AdminUsers'));
const AdminOrders     = lazy(() => import('./pages/admin/AdminOrders'));
const AdminReports    = lazy(() => import('./pages/admin/AdminReports'));
const PrivacyPolicy     = lazy(() => import('./pages/PrivacyPolicy'));
const ReportFeedback  = lazy(() => import('./pages/ReportFeedback'));

// ── Layout wrapper ────────────────────────────────────────────────────────────
function AppLayout({ children, hideFooter = false }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <main className="flex-1 pt-16">
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <WishlistProvider>
                <ChatProvider>

                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 3500,
                      style: {
                        background: 'var(--bg-elevated)',
                        color:      'var(--text-primary)',
                        border:     '1px solid var(--border)',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize:   '14px',
                      },
                      success: { iconTheme: { primary: 'var(--accent-green)', secondary: '#fff' } },
                      error:   { iconTheme: { primary: 'var(--accent-red)',   secondary: '#fff' } },
                    }}
                  />

                  <Routes>
                    {/* ── Public ────────────────────────────────────────── */}
                    <Route path="/" element={<AppLayout><Home /></AppLayout>} />
                    <Route path="/privacy-policy" element={<AppLayout><Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense></AppLayout>} />
                    <Route path="/report" element={<AppLayout><Suspense fallback={<PageLoader />}><ReportFeedback /></Suspense></AppLayout>} />
                    <Route path="/browse" element={<AppLayout><Browse /></AppLayout>} />
                    <Route path="/browse/search" element={<AppLayout><SearchResults /></AppLayout>} />
                    <Route path="/product/:id" element={<AppLayout><ProductDetail /></AppLayout>} />
                    <Route path="/seller/:id" element={<AppLayout><SellerProfile /></AppLayout>} />

                    {/* ── Auth ──────────────────────────────────────────── */}
                    <Route path="/auth/login" element={
                      <Suspense fallback={<PageLoader />}><Login /></Suspense>
                    } />
                    <Route path="/auth/register" element={
                      <Suspense fallback={<PageLoader />}><Register /></Suspense>
                    } />

                    {/* ── User (protected) ──────────────────────────────── */}
                    <Route path="/cart" element={
                      <AppLayout><ProtectedRoute><Cart /></ProtectedRoute></AppLayout>
                    } />
                    <Route path="/checkout" element={
                      <AppLayout hideFooter><ProtectedRoute><Checkout /></ProtectedRoute></AppLayout>
                    } />
                    <Route path="/profile" element={
                      <AppLayout><ProtectedRoute><Profile /></ProtectedRoute></AppLayout>
                    } />
                    <Route path="/wishlist" element={
                      <AppLayout><ProtectedRoute><Wishlist /></ProtectedRoute></AppLayout>
                    } />

                    {/* ── Orders — :id MUST come before /orders ─────────── */}
                    <Route path="/orders/:id" element={
                      <AppLayout><ProtectedRoute><OrderDetail /></ProtectedRoute></AppLayout>
                    } />
                    <Route path="/orders" element={
                      <AppLayout><ProtectedRoute><MyOrders /></ProtectedRoute></AppLayout>
                    } />

                    <Route path="/notifications" element={
                      <AppLayout><ProtectedRoute><Notifications /></ProtectedRoute></AppLayout>
                    } />
                    <Route path="/chat" element={
                      <AppLayout hideFooter><ProtectedRoute><ChatPage /></ProtectedRoute></AppLayout>
                    } />
                    <Route path="/chat/:chatId" element={
                      <AppLayout hideFooter><ProtectedRoute><ChatPage /></ProtectedRoute></AppLayout>
                    } />

                    {/* ── Seller (protected) ────────────────────────────── */}
                    <Route path="/seller/dashboard" element={
                      <AppLayout><ProtectedRoute><SellerDashboard /></ProtectedRoute></AppLayout>
                    } />
                    <Route path="/seller/list-product" element={
                      <AppLayout><ProtectedRoute><ListProduct /></ProtectedRoute></AppLayout>
                    } />
                    <Route path="/seller/edit/:id" element={
                      <AppLayout><ProtectedRoute><EditProduct /></ProtectedRoute></AppLayout>
                    } />
                    <Route path="/seller/listings" element={
                      <AppLayout><ProtectedRoute><MyListings /></ProtectedRoute></AppLayout>
                    } />
                    <Route path="/seller/orders" element={
                      <AppLayout><ProtectedRoute><SellerOrders /></ProtectedRoute></AppLayout>
                    } />

                    {/* ── Admin (protected + adminOnly) ─────────────────── */}
                    <Route path="/admin" element={
                      <AppLayout hideFooter>
                        <ProtectedRoute adminOnly>
                          <AdminLayout><AdminDashboard /></AdminLayout>
                        </ProtectedRoute>
                      </AppLayout>
                    } />
                    <Route path="/admin/products" element={
                      <AppLayout hideFooter>
                        <ProtectedRoute adminOnly>
                          <AdminLayout><AdminProducts /></AdminLayout>
                        </ProtectedRoute>
                      </AppLayout>
                    } />
                    <Route path="/admin/users" element={
                      <AppLayout hideFooter>
                        <ProtectedRoute adminOnly>
                          <AdminLayout><AdminUsers /></AdminLayout>
                        </ProtectedRoute>
                      </AppLayout>
                    } />
                    <Route path="/admin/orders" element={
                      <AppLayout hideFooter>
                        <ProtectedRoute adminOnly>
                          <AdminLayout><AdminOrders /></AdminLayout>
                        </ProtectedRoute>
                      </AppLayout>
                    } />
                    <Route path="/admin/reports" element={
                      <AppLayout hideFooter>
                        <ProtectedRoute adminOnly>
                          <AdminLayout><Suspense fallback={<PageLoader />}><AdminReports /></Suspense></AdminLayout>
                        </ProtectedRoute>
                      </AppLayout>
                    } />

                    {/* ── 404 ───────────────────────────────────────────── */}
                    <Route path="*" element={
                      <AppLayout>
                        <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
                          <h1 className="text-7xl font-bold font-syne" style={{ color: 'var(--accent-primary)' }}>404</h1>
                          <p className="mt-4 text-xl font-syne" style={{ color: 'var(--text-primary)' }}>Page not found</p>
                          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            The page you're looking for doesn't exist.
                          </p>
                          <a href="/" className="btn-primary mt-6">Go Home</a>
                        </div>
                      </AppLayout>
                    } />
                  </Routes>

                </ChatProvider>
              </WishlistProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}