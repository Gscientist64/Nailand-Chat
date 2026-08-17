import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/AuthContext';
import { usersApi, communitiesApi } from '../lib/api';
import Avatar from './Avatar';
import { Check, Globe, Mail, Users, Pencil, X, MapPin, Camera, Loader2 } from 'lucide-react';
import { REGION_OPTIONS, NAILAND_REGIONS, normalizeRegion } from '../lib/regions';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [form, setForm] = useState({
    firstName: '',
    secondName: '',
    region: '',
    interests: '',
    avatarUrl: '',
  });

  useEffect(() => {
    communitiesApi.my().then((res) => {
      if (res.success && res.data) setMyCommunities(res.data);
    });
  }, []);

  // Sync form when user loads / editing starts
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        secondName: user.secondName || '',
        region: normalizeRegion(user.region, user.interests),
        interests: (user.interests || []).join(', '),
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  // Read + compress a selected image into a data-URL (real local upload)
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 300;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) { setUploadingAvatar(false); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setForm((prev) => ({ ...prev, avatarUrl: dataUrl }));
        } catch {
          // fallback: keep raw data URL
          setForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        }
        setUploadingAvatar(false);
      };
      img.onerror = () => setUploadingAvatar(false);
      img.src = reader.result as string;
    };
    reader.onerror = () => setUploadingAvatar(false);
    reader.readAsDataURL(file);
  };

  if (!user) {
    return (
      <div className="p-10 text-center text-stone-400 text-sm">Loading profile...</div>
    );
  }

  const fullName = `${user.firstName || ''} ${user.secondName || ''}`.trim() || 'Member';
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Member';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(false);
    const res = await usersApi.updateProfile({
      firstName: form.firstName.trim(),
      secondName: form.secondName.trim(),
      region: form.region.trim(),
      interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
      avatarUrl: form.avatarUrl.trim(),
    });
    setSaving(false);
    if (res.success && res.data) {
      updateUser({
        firstName: res.data.firstName,
        secondName: res.data.secondName,
        region: res.data.region,
        interests: res.data.interests || [],
        avatarUrl: res.data.avatarUrl,
      });
      setEditing(false);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 lg:p-10 text-left max-w-5xl mx-auto flex flex-col gap-8 bg-white font-sans" id="profile-page-root">

      {/* HEADER CARD */}
      <div className="bg-gradient-to-br from-amber-50 via-white to-white border border-amber-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden" id="profile-header-card">
        <div className="relative shrink-0">
          <Avatar
            name={fullName}
            src={user.avatarUrl}
            className="w-24 h-24 rounded-full border-2 border-amber-400 shadow-md"
            textClassName="text-3xl"
          />
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></span>
        </div>

        <div className="flex-1 min-w-0" id="profile-header-info">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">{fullName}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-600" /> {user.email}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" /> {user.region || 'Africa'}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-600" /> Member since {memberSince}
            </span>
          </div>

          {user.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {user.interests.map((it) => (
                <span key={it} className="px-2.5 py-1 bg-amber-100/70 text-amber-800 rounded-full text-[11px] font-semibold">
                  {it}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 transition cursor-pointer shrink-0"
          id="btn-edit-profile"
        >
          {editing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* EDIT FORM */}
      {editing && (
        <form onSubmit={handleSave} className="bg-white border border-[#EBEBEB] rounded-3xl p-6 md:p-8 flex flex-col gap-5" id="profile-edit-form">
          <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">Edit your profile</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">First name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-amber-400"
                placeholder="First name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Second name</label>
              <input
                value={form.secondName}
                onChange={(e) => setForm({ ...form, secondName: e.target.value })}
                className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-amber-400"
                placeholder="Second name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Region</label>
              <select
                value={normalizeRegion(form.region, (user.interests || []))}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-amber-400 cursor-pointer"
                id="profile-region-select"
              >
                {REGION_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <span className="text-[9px] text-stone-400 font-mono">One of the seven NaiLAND regions</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Profile Picture</label>
              <div className="flex items-center gap-3" id="avatar-upload-row">
                <Avatar
                  name={`${form.firstName || user?.firstName || ''} ${form.secondName || user?.secondName || ''}`.trim() || 'You'}
                  src={form.avatarUrl}
                  className="w-14 h-14 rounded-full border-2 border-amber-300 shrink-0"
                  textClassName="text-base"
                />
                <div className="flex flex-col gap-1.5 flex-1">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-full transition cursor-pointer"
                    id="btn-upload-avatar"
                  >
                    {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                    {uploadingAvatar ? 'Uploading...' : 'Upload Picture'}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    className="hidden"
                    id="avatar-file-input"
                  />
                  {form.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, avatarUrl: '' })}
                      className="text-[10px] text-stone-400 hover:text-rose-500 font-semibold text-left transition cursor-pointer"
                    >
                      Remove picture (use initials)
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Interests (comma separated)</label>
              <textarea
                value={form.interests}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                rows={2}
                className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-amber-400 resize-none"
                placeholder="e.g. Figma, UI/UX, React"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-stone-900 hover:bg-stone-700 text-white text-xs font-bold rounded-full transition cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {savedMsg && (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Profile updated successfully!
            </p>
          )}
        </form>
      )}

      {/* STATS + COMMUNITIES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="profile-stats-row">
        <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#FFB300]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-stone-900 leading-tight">{myCommunities.length}</span>
            <span className="text-[10.5px] text-stone-400 font-medium">Communities Joined</span>
          </div>
        </div>
        <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-[#FFB300]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-stone-900 leading-tight">{user.interests?.length || 0}</span>
            <span className="text-[10.5px] text-stone-400 font-medium">Interest Tags</span>
          </div>
        </div>
        <div className="bg-white border border-[#EBEBEB] rounded-2xl p-5 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-[#FFB300]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-stone-900 leading-tight">{user.region || '—'}</span>
            <span className="text-[10.5px] text-stone-400 font-medium">Region</span>
          </div>
        </div>
      </div>

      {/* JOINED COMMUNITIES */}
      <section className="flex flex-col gap-4" id="profile-communities-section">
        <h3 className="text-stone-900 font-semibold text-base tracking-tight">My Communities</h3>
        {myCommunities.length === 0 ? (
          <div className="bg-stone-50 border border-dashed border-stone-200 rounded-2xl p-10 text-center text-sm text-stone-400">
            You haven't joined any communities yet. Head to the Community page to explore!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {myCommunities.map((c) => (
              <div key={c.id} className="bg-white border border-[#EBEBEB] p-5 rounded-2xl flex items-center gap-3">
                <Avatar name={c.name} src={c.avatar} className="w-11 h-11 rounded-xl" textClassName="text-sm" />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm text-stone-900 truncate">{c.name}</span>
                  <span className="text-[11px] text-stone-400">{c.memberCount || 0} members</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
