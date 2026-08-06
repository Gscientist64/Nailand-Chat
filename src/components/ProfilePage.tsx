import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { usersApi, communitiesApi } from '../lib/api';
import Avatar from './Avatar';
import { Check, Globe, Mail, Users, Pencil, X, MapPin } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

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
        region: user.region || '',
        interests: (user.interests || []).join(', '),
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

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
              <input
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-amber-400"
                placeholder="e.g. Africa, Europe"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Avatar URL (optional)</label>
              <input
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                className="w-full bg-[#FAFAFA] border border-stone-200 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-amber-400"
                placeholder="https://..."
              />
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
