import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import ProductGrid from '../../components/product/ProductGrid';
import { Search } from 'lucide-react';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);

  useEffect(() => {
    if (!q) { setLoading(false); return; }
    setLoading(true);
    productService.search({ q })
      .then(({ data }) => {
        setProducts(data.data.products);
        setTotal(data.data.pagination.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="page-container">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Search size={20} style={{ color: 'var(--accent-primary)' }} />
          <h1 className="section-title">Search Results</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {loading ? 'Searching…' : `${total} results for "${q}"`}
        </p>
      </div>
      <ProductGrid
        products={products}
        loading={loading}
        emptyMessage={`No results for "${q}". Try a different keyword.`}
      />
      <div className="mt-8 text-center">
        <Link to="/browse" className="btn-secondary">Browse All Products</Link>
      </div>
    </div>
  );
}
