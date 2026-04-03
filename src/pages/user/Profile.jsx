// Profile.jsx — combined file for brevity, split into individual files in your project
import { useState } from 'react';
import { User, Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/common/Loader';
import { getInitials } from '../../utils/helpers';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm]       = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    street:  user?.address?.street  || '',
    city:    user?.address?.city    || '',
    state:   user?.address?.state   || '',
    pincode: user?.address?.pincode || '',
  });
  const [saving, setSaving]     = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);
      const { data } = await api.put('/users/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      <h1 className="section-title mb-8">My Profile</h1>

      <div className="card p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt={user?.name}
                className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white"
                style={{ background: 'var(--accent-primary)' }}>
                {getInitials(user?.name)}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              style={{ background: 'var(--accent-primary)' }}>
              <Camera size={13} color="#fff" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </label>
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            <span className="badge badge-green mt-1">{user?.sellerStats?.totalSold || 0} items sold</span>
          </div>
        </div>

        <div className="divider" />

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
            <input value={form.name}    onChange={set('name')}    className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phone</label>
            <input value={form.phone}   onChange={set('phone')}   className="input" placeholder="+91 XXXXX XXXXX" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Street</label>
            <input value={form.street}  onChange={set('street')}  className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>City</label>
            <input value={form.city}    onChange={set('city')}    className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>State</label>
            <input value={form.state}   onChange={set('state')}   className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Pincode</label>
            <input value={form.pincode} onChange={set('pincode')} className="input" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
          {saving ? <Spinner size={16} /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
