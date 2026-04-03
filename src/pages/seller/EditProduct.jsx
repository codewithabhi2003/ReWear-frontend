import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import { Spinner, PageLoader } from '../../components/common/Loader';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    productService.getById(id)
      .then(({ data }) => {
        const p = data.data.product;
        setForm({
          title: p.title, brand: p.brand, category: p.category, gender: p.gender,
          size: p.size, condition: p.condition, color: p.color || '',
          originalPrice: p.originalPrice || '', sellingPrice: p.sellingPrice,
          description: p.description || '', tags: p.tags?.join(', ') || '',
        });
      })
      .catch(() => { toast.error('Product not found'); navigate('/seller/listings'); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!form) return null;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      await productService.update(id, fd);
      toast.success('Listing updated — resubmitted for review');
      navigate('/seller/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      <h1 className="section-title mb-8">Edit Listing</h1>
      <form onSubmit={handleSave} className="space-y-4">
        {[
          { k: 'title', label: 'Title', type: 'text' },
          { k: 'brand', label: 'Brand', type: 'text' },
          { k: 'color', label: 'Color', type: 'text' },
          { k: 'size',  label: 'Size',  type: 'text' },
          { k: 'originalPrice', label: 'Original Price (₹)', type: 'number' },
          { k: 'sellingPrice',  label: 'Selling Price (₹)',  type: 'number' },
        ].map(({ k, label, type }) => (
          <div key={k}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
            <input type={type} value={form[k]} onChange={set(k)} className="input" />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
          <textarea value={form.description} onChange={set('description')} className="input resize-none" rows={4} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tags</label>
          <input value={form.tags} onChange={set('tags')} className="input" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <Spinner size={16} /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
