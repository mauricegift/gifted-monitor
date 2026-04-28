import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Camera, X, ZoomIn, ZoomOut, Bell, Lock, Info, Mail, Loader2, Key, Plus, Trash2, Copy, Eye, EyeOff, AlertTriangle } from "lucide-react";
import Cropper from "react-easy-crop";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { AppLayout } from "@/layouts";
import { InputWithoutIcon, ButtonWithLoader, InputCheck, Breadcrumb } from "@/components/ui";
import { changePasswordSchema, type ChangePasswordForm } from "@/schemas";
import { useAuthStore } from "@/store";
import api from "@/config/api";
import getCroppedImg from "@/helpers/cropImage";
import { formatDate } from "@/helpers/formatDate";

const TABS = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security",      label: "Security",      icon: Lock },
  { id: "apikeys",       label: "API Keys",      icon: Key },
  { id: "account",       label: "Account",       icon: Info },
] as const;

type TabId = typeof TABS[number]["id"];

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used: string | null;
  is_active: boolean;
  created_at: string;
}

function ApiKeysTab() {
  const qc = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<{ key: string; name: string } | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: keys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ["apikeys"],
    queryFn: () => api.get("/apikeys").then(r => r.data),
  });

  const handleCreate = async () => {
    if (!newKeyName.trim()) { toast.error("Enter a name for the API key"); return; }
    setCreating(true);
    try {
      const res = await api.post("/apikeys", { name: newKeyName.trim() });
      setCreatedKey({ key: res.data.key, name: res.data.name });
      setNewKeyName("");
      setShowKey(true);
      qc.invalidateQueries({ queryKey: ["apikeys"] });
      toast.success("API key created — copy it now!");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || "Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/apikeys/${id}`);
      qc.invalidateQueries({ queryKey: ["apikeys"] });
      toast.success("API key deleted");
    } catch {
      toast.error("Failed to delete API key");
    } finally {
      setDeletingId(null);
    }
  };

  const copyKey = () => {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey.key).then(() => toast.success("Key copied!"));
  };

  return (
    <div className="bg-background border border-line rounded-xl p-5 space-y-5">
      <div>
        <h2 className="font-semibold text-sm">API Keys</h2>
        <p className="text-xs text-muted mt-0.5">
          Use API keys to access monitor operations programmatically.{" "}
          <a href="/docs" className="text-emerald-500 hover:underline">View API docs →</a>
        </p>
      </div>

      {/* New key created — show once */}
      {createdKey && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Copy your new key — it won't be shown again</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{createdKey.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-xs bg-background border border-line rounded-lg px-3 py-2 overflow-x-auto">
              {showKey ? createdKey.key : "•".repeat(32)}
            </div>
            <button
              onClick={() => setShowKey(s => !s)}
              className="btn h-9 w-9 rounded-lg bg-foreground text-muted hover:text-main shrink-0"
              title={showKey ? "Hide" : "Show"}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              onClick={copyKey}
              className="btn h-9 w-9 rounded-lg bg-emerald-500 text-white shrink-0"
              title="Copy key"
            >
              <Copy size={14} />
            </button>
          </div>
          <button
            onClick={() => { setCreatedKey(null); setShowKey(false); }}
            className="text-xs text-muted hover:text-main underline"
          >
            I've copied it, dismiss
          </button>
        </div>
      )}

      {/* Create new key */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted">Create a new key</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. My Server, CI Pipeline)"
            maxLength={100}
            onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
            className="flex-1 h-10 rounded-xl border border-line px-3 text-sm bg-background focus:border-emerald-500 outline-none transition-colors"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newKeyName.trim()}
            className="btn h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium gap-2 disabled:opacity-50 shrink-0"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Create
          </button>
        </div>
        <p className="text-xs text-muted">Maximum 10 keys per account</p>
      </div>

      {/* Key list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="h-14 bg-foreground rounded-xl animate-pulse" />)}
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-line rounded-xl">
            <Key size={24} className="text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No API keys yet</p>
          </div>
        ) : (
          keys.map(k => (
            <div key={k.id} className="flex items-center gap-3 p-3 border border-line rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{k.name}</p>
                <p className="text-xs text-muted font-mono">
                  {k.key_prefix}••••••••••••
                  <span className="ml-2 not-mono">
                    Created {formatDate(k.created_at)}
                    {k.last_used ? ` · Last used ${formatDate(k.last_used)}` : " · Never used"}
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleDelete(k.id)}
                disabled={deletingId === k.id}
                className="btn h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 shrink-0 disabled:opacity-50"
                title="Delete key"
              >
                {deletingId === k.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, setAuth, logout } = useAuthStore();
  const [tab, setTab] = useState<TabId>("profile");
  const [name, setName] = useState(user?.name || "");
  const [notifyDown, setNotifyDown] = useState(user?.notify_down ?? true);
  const [notifyUp,   setNotifyUp]   = useState(user?.notify_up   ?? true);

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeSent, setEmailChangeSent] = useState(false);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  const profileMutation = useMutation({
    mutationFn: (data: { name: string; avatar?: string }) =>
      api.put("/auth/profile", data).then(r => r.data),
    onSuccess: (data) => { setUser(data); toast.success("Profile updated"); },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Update failed");
    },
  });

  const notifMutation = useMutation({
    mutationFn: (prefs: { notify_down: boolean; notify_up: boolean }) =>
      api.post("/auth/notification-prefs", prefs).then(r => r.data),
    onSuccess: (data) => { setUser(data); toast.success("Notification preferences saved"); },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to save preferences");
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePassword = async (data: ChangePasswordForm) => {
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(res.data.message + " Please log in again.");
      logout();
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to change password");
    }
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail.trim()) { toast.error("Enter a new email address"); return; }
    setEmailChangeLoading(true);
    try {
      const res = await api.post("/auth/request-email-change", { newEmail: newEmail.trim() });
      toast.success(res.data.message);
      setEmailChangeSent(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to send confirmation");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropOpen,    setCropOpen]    = useState(false);
  const [rawImage,    setRawImage]    = useState<string | null>(null);
  const [crop,        setCrop]        = useState({ x: 0, y: 0 });
  const [zoom,        setZoom]        = useState(1);
  const [croppedArea, setCroppedArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [saving,      setSaving]      = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const url = URL.createObjectURL(file);
    setRawImage(url);
    setCropOpen(true);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropSave = async () => {
    if (!rawImage || !croppedArea) return;
    setSaving(true);
    try {
      const base64 = await getCroppedImg(rawImage, croppedArea);
      await profileMutation.mutateAsync({ name, avatar: base64 });
      setCropOpen(false);
      setRawImage(null);
    } catch {
      toast.error("Crop or upload failed, please try again");
    } finally {
      setSaving(false);
    }
  };

  const closeCropModal = () => {
    if (saving) return;
    setCropOpen(false);
    setRawImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // suppress unused warning — setAuth may be used later
  void setAuth;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <Breadcrumb crumbs={[{ label: "Profile" }]} />
        <div className="text-center">
          <h1 className="text-xl font-bold font-outfit">Profile</h1>
          <p className="text-sm text-muted">Manage your account settings</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-foreground rounded-xl p-1 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                  tab === t.id
                    ? "bg-background text-main shadow-sm"
                    : "text-muted hover:text-main"
                )}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab: Profile */}
        {tab === "profile" && (
          <div className="bg-background border border-line rounded-xl p-5 space-y-5">
            <div className="flex flex-col items-center gap-3 pb-4 border-b border-line">
              <div className="relative">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-2 border-line" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-foreground center text-3xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <label
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 center text-white cursor-pointer shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={13} />
                </label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
              </div>
              <div className="text-center">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-muted">@{user?.username}</p>
                {(user?.is_admin || user?.is_superadmin) && (
                  <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {user.is_superadmin ? "SUPERADMIN" : "ADMIN"}
                  </span>
                )}
              </div>
            </div>

            <InputWithoutIcon id="name" label="Full name" type="text" value={name} onChange={e => setName(e.target.value)} />

            <div className="space-y-0 text-sm">
              <div className="flex justify-between py-2.5 border-b border-line">
                <span className="text-muted">Email</span>
                <span className="font-medium text-main">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-muted">Username</span>
                <span className="font-medium text-main">@{user?.username}</span>
              </div>
            </div>

            {/* Change email section */}
            <div className="border-t border-line pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-muted" />
                <p className="text-sm font-medium">Change email address</p>
              </div>
              {emailChangeSent ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
                  A confirmation link was sent to <strong>{newEmail}</strong>. Click it to complete the change. Check your spam folder if needed.
                  <button onClick={() => { setEmailChangeSent(false); setNewEmail(""); }} className="block mt-2 text-xs underline text-muted hover:text-main">
                    Send to a different address
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="New email address"
                    className="flex-1 h-10 rounded-xl border border-line px-3 text-sm bg-background focus:border-main"
                    onKeyDown={e => { if (e.key === "Enter") handleRequestEmailChange(); }}
                  />
                  <button
                    onClick={handleRequestEmailChange}
                    disabled={emailChangeLoading || !newEmail.trim()}
                    className="btn btn-primary h-10 px-4 rounded-xl text-sm font-medium disabled:opacity-50 shrink-0 gap-2"
                  >
                    {emailChangeLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                    {emailChangeLoading ? "Sending…" : "Send link"}
                  </button>
                </div>
              )}
              <p className="text-xs text-muted">A confirmation link will be sent to the new address. Your current email stays active until confirmed.</p>
            </div>

            <ButtonWithLoader
              onClick={() => profileMutation.mutate({ name })}
              loading={profileMutation.isPending}
              initialText="Save changes"
              loadingText="Saving..."
              className="w-full h-10 rounded-xl btn-primary text-sm"
            />
          </div>
        )}

        {/* Tab: Notifications */}
        {tab === "notifications" && (
          <div className="bg-background border border-line rounded-xl p-5 space-y-5">
            <div>
              <h2 className="font-semibold text-sm">Email notifications</h2>
              <p className="text-xs text-muted mt-0.5">Global defaults — apply to all monitors unless individually overridden</p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <InputCheck checked={notifyDown} onChange={e => setNotifyDown(e.target.checked)} size={20} />
              <div>
                <p className="text-sm font-medium">Alert when site goes down</p>
                <p className="text-xs text-muted">Receive an email immediately when a monitor fails</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <InputCheck checked={notifyUp} onChange={e => setNotifyUp(e.target.checked)} size={20} />
              <div>
                <p className="text-sm font-medium">Alert when site recovers</p>
                <p className="text-xs text-muted">Receive an email when a monitor comes back online</p>
              </div>
            </label>
            <ButtonWithLoader
              onClick={() => notifMutation.mutate({ notify_down: notifyDown, notify_up: notifyUp })}
              loading={notifMutation.isPending}
              initialText="Save preferences"
              loadingText="Saving..."
              className="w-full h-10 rounded-xl btn-primary text-sm"
            />
          </div>
        )}

        {/* Tab: Security */}
        {tab === "security" && (
          <div className="bg-background border border-line rounded-xl p-5 space-y-4">
            <div>
              <h2 className="font-semibold text-sm">Change password</h2>
              <p className="text-xs text-muted mt-0.5">Use a strong, unique password</p>
            </div>
            <form onSubmit={handleSubmit(onChangePassword)} className="space-y-3">
              <InputWithoutIcon type="password" label="Current password" placeholder="••••••••" error={errors.currentPassword?.message} {...register("currentPassword")} />
              <InputWithoutIcon type="password" label="New password" placeholder="••••••••" error={errors.newPassword?.message} {...register("newPassword")} />
              <InputWithoutIcon type="password" label="Confirm new password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
              <ButtonWithLoader type="submit" loading={isSubmitting} initialText="Change password" loadingText="Changing..." className="w-full h-10 rounded-xl btn-primary text-sm" />
            </form>
          </div>
        )}

        {/* Tab: API Keys */}
        {tab === "apikeys" && <ApiKeysTab />}

        {/* Tab: Account */}
        {tab === "account" && (
          <div className="bg-background border border-line rounded-xl p-5 text-sm space-y-0">
            <h2 className="font-semibold text-sm mb-3">Account info</h2>
            <div className="flex justify-between py-3 border-b border-line">
              <span className="text-muted">Monitor limit</span>
              <span className="font-semibold text-main">
                {(user?.is_admin || user?.is_superadmin) ? "Unlimited" : (user?.monitor_limit ?? 20)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-line">
              <span className="text-muted">Account verified</span>
              <span className={`font-semibold ${user?.is_verified ? "text-emerald-500" : "text-red-500"}`}>
                {user?.is_verified ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-line">
              <span className="text-muted">Role</span>
              <span className="font-semibold text-main">
                {user?.is_superadmin ? "Super Admin" : user?.is_admin ? "Admin" : "User"}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-muted">Member since</span>
              <span className="font-semibold text-main">
                {user?.created_at ? formatDate(user.created_at) : "—"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Crop modal */}
      <AnimatePresence>
        {cropOpen && rawImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={closeCropModal}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-background rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Crop profile picture</h3>
                <button onClick={closeCropModal} className="text-muted hover:text-main transition-colors"><X size={18} /></button>
              </div>
              <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ height: 260 }}>
                <Cropper
                  image={rawImage} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
                  onCropChange={setCrop} onZoomChange={setZoom}
                  onCropComplete={(_: unknown, pixels: { x: number; y: number; width: number; height: number }) => setCroppedArea(pixels)}
                />
              </div>
              <div className="flex items-center gap-3">
                <ZoomOut size={16} className="text-muted shrink-0" />
                <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="flex-1 accent-emerald-500" />
                <ZoomIn size={16} className="text-muted shrink-0" />
              </div>
              <div className="flex gap-2">
                <button onClick={closeCropModal} disabled={saving} className="flex-1 h-10 rounded-xl border border-line text-sm font-medium disabled:opacity-50">Cancel</button>
                <button onClick={handleCropSave} disabled={saving} className="flex-1 h-10 rounded-xl btn-primary text-sm disabled:opacity-50">
                  {saving ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving…
                    </div>
                  ) : "Save picture"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
