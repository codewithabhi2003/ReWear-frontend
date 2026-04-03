import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ className = '', compact = false }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
    if (compact) setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <Search
        size={16}
        className="absolute left-3 pointer-events-none"
        style={{ color: 'var(--text-muted)' }}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search brands, styles, items…"
        className="input pl-9 pr-8 text-sm"
        style={{ minWidth: compact ? 200 : 300 }}
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-3"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
}
