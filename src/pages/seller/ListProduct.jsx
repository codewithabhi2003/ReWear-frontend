import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import { Spinner } from '../../components/common/Loader';

const CONDITION_DESCRIPTIONS = {
  'Brand New with Tags': 'Never worn, original tags still attached',
  'Like New':            'Worn 1–2 times, no visible signs of wear',
  'Good':                'Gently used, minor signs of wear',
  'Fair':                'Visible wear, clearly described',
};

export default function ListProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', brand: '', category: '', gender: '', size: '',
    condition: '', color: '', originalPrice: '', sellingPrice: '',
    description: '', tags: '',
  });
  const [images, setImages]   = useState([]);        // File objects
  const [previews, setPreviews] = useState([]);      // Object URLs
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onDrop = useCallback((accepted) => {
    const remaining = 5 - images.length;
    const newFiles = accepted.slice(0, remaining);
    setImages((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 5,
    disabled: images.length >= 5,
  });

  const removeImage = (i) => {
    URL.revokeObjectURL(previews[i]);
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) { toast.error('Add at least one photo'); return; }
    if (!form.condition)      { toast.error('Select a condition'); return; }
    if (!form.description || form.description.length < 50) {
      toast.error('Description must be at least 50 characters'); return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      images.forEach((img) => fd.append('images', img));
      await productService.create(fd);
      toast.success('Listing submitted for review! 🎉');
      navigate('/seller/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      <h1 className="section-title mb-2">List an Item</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        Fill in the details — our team will review and approve within 24 hours.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div className="card p-5">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Photos ({images.length}/5) *
          </label>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                  style={{ border: i === 0 ? '2px solid var(--accent-primary)' : '1px solid var(--border)' }}>
                  <img src={src} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute bottom-0 inset-x-0 text-center text-[8px] font-bold text-white py-0.5"
                      style={{ background: 'var(--accent-primary)' }}>MAIN</div>
                  )}
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.7)' }}>
                    <X size={10} color="#fff" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Dropzone */}
          {images.length < 5 && (
            <div {...getRootProps()}
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
              style={{
                borderColor: isDragActive ? 'var(--accent-primary)' : 'var(--border)',
                background:  isDragActive ? 'color-mix(in srgb, var(--accent-primary) 5%, transparent)' : 'transparent',
              }}>
              <input {...getInputProps()} />
              <Image size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {isDragActive ? 'Drop photos here…' : 'Drag & drop photos or click to browse'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>JPG, PNG, WEBP · Max 5MB each</p>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Item Details
          </label>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title *</label>
            <input value={form.title} onChange={set('title')} className="input" placeholder="e.g. Nike Air Max 90 White Sneakers" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Brand *</label>
              <input value={form.brand} onChange={set('brand')} className="input" placeholder="Nike, Zara, H&M…" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category *</label>
              <select value={form.category} onChange={set('category')} className="input" required>
                <option value="">Select</option>
                {['Tops','Bottoms','Dresses','Outerwear','Footwear','Accessories','Ethnic','Activewear'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Gender *</label>
              <select value={form.gender} onChange={set('gender')} className="input" required>
                <option value="">Select</option>
                {['men','women','unisex','kids'].map((g) => (
                  <option key={g} value={g} className="capitalize">{g.charAt(0).toUpperCase()+g.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Size *</label>
              <input value={form.size} onChange={set('size')} className="input" placeholder="S, M, L, 42, 32x30…" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Color</label>
              <input value={form.color} onChange={set('color')} className="input" placeholder="White, Black, Navy…" />
            </div>
          </div>
        </div>

        {/* Condition */}
        <div className="card p-5">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Condition *
          </label>
          <div className="space-y-2">
            {Object.entries(CONDITION_DESCRIPTIONS).map(([cond, desc]) => (
              <label key={cond}
                className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all"
                style={{
                  background: form.condition === cond ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)' : 'var(--bg-input)',
                  border:     `1px solid ${form.condition === cond ? 'var(--accent-primary)' : 'transparent'}`,
                }}>
                <input type="radio" name="condition" value={cond}
                  checked={form.condition === cond}
                  onChange={set('condition')}
                  className="mt-0.5 accent-[var(--accent-primary)]" />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{cond}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-5 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Pricing
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Original Price (₹)</label>
              <input type="number" value={form.originalPrice} onChange={set('originalPrice')} className="input" placeholder="What you paid" min="0" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Selling Price (₹) *</label>
              <input type="number" value={form.sellingPrice} onChange={set('sellingPrice')} className="input" placeholder="Your asking price" min="1" required />
            </div>
          </div>
          {form.originalPrice && form.sellingPrice && Number(form.originalPrice) > Number(form.sellingPrice) && (
            <p className="text-xs" style={{ color: 'var(--accent-green)' }}>
              🎉 {Math.round(((form.originalPrice - form.sellingPrice) / form.originalPrice) * 100)}% off original price — buyers love a deal!
            </p>
          )}
        </div>

        {/* Description + Tags */}
        <div className="card p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Description * <span style={{ color: 'var(--text-muted)' }}>({form.description.length}/50 min)</span>
            </label>
            <textarea value={form.description} onChange={set('description')} className="input resize-none" rows={4}
              placeholder="Describe the item honestly — sizing notes, any flaws, why you're selling it…" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tags (comma-separated)</label>
            <input value={form.tags} onChange={set('tags')} className="input"
              placeholder="sneakers, casual, summer, oversized…" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full text-base py-4">
          {loading ? <><Spinner size={18} /> Uploading & Submitting…</> : <><Upload size={18} /> Submit for Review</>}
        </button>
      </form>
    </div>
  );
}
