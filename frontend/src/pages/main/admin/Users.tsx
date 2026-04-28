import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Shield, ShieldOff, Trash2, UserCheck, UserX, AlertCircle, Pencil, Monitor, KeyRound, Pause, Play, RefreshCw, Camera, X, ZoomIn, ZoomOut, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Cropper from "react-easy-crop";
import { AppLayout } from "@/layouts";
import { Modal, ButtonWithLoader, InputWithoutIcon, InputCheck, Breadcrumb } from "@/components/ui";
import { StatusBadge } from "@/components/main";
import { formatDate } from "@/helpers/formatDate";
import type { User, PaginatedUsers } from "@/types";
import api from "@/config/api";
import getCroppedImg from "@/helpers/cropImage";

interface UserMonitor {
  id: string;
  name: string;
  url: string;
  last_status: string | null;
  is_active: boolean;
  uptime_pct: string | number | null;
}

export default function AdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(1);
  const [deleteTarget, setDeleteTarget]   = useState<User | null>(null);
  const [deletePassword, setDeletePassword] = useState("");

  // Bulk selection
  const [selected, setSelected]       = useState<string[]>([]);
  const [bulkAction, setBulkAction]   = useState<"disable" | "enable" | "delete" | null>(null);
  const [bulkPassword, setBulkPassword] = useState("");

  // Edit modal state
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm]     = useState({ name: "", email: "", username: "", monitor_limit: 20 });

  // Avatar crop state for edit
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropOpen,    setCropOpen]    = useState(false);
  const [rawImage,    setRawImage]    = useState<string | null>(null);
  const [crop,        setCrop]        = useState({ x: 0, y: 0 });
  const [zoom,        setZoom]        = useState(1);
  const [croppedArea, setCroppedArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [cropSaving,  setCropSaving]  = useState(false);
  const [editAvatar,  setEditAvatar]  = useState<string | null | undefined>(undefined);

  // Reset password modal state
  const [resetPwUser, setResetPwUser]   = useState<User | null>(null);
  const [newPassword, setNewPassword]   = useState("");

  // Monitors modal state
  const [monitorsUser, setMonitorsUser] = useState<User | null>(null);

  const { data, isLoading, isError, isFetching, refetch } = useQuery<PaginatedUsers>({
    queryKey: ["admin-users", search, page],
    queryFn: () => api.get(`/admin/users?search=${search}&page=${page}&limit=20`).then(r => r.data),
  });

  const { data: userMonitorsData, isLoading: monitorsLoading } = useQuery<{ monitors: UserMonitor[] }>({
    queryKey: ["admin-user-monitors", monitorsUser?.id],
    queryFn: () => api.get(`/admin/users/${monitorsUser!.id}/monitors`).then(r => r.data),
    enabled: !!monitorsUser,
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      api.patch(`/admin/users/${id}`, body).then(r => r.data),
    onSuccess: () => { toast.success("User updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Update failed");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      api.post(`/admin/users/${id}/reset-password`, { newPassword }).then(r => r.data),
    onSuccess: () => {
      toast.success("Password reset successfully");
      setResetPwUser(null);
      setNewPassword("");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to reset password");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      api.delete(`/admin/users/${id}`, { data: { password } }),
    onSuccess: () => {
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteTarget(null);
      setDeletePassword("");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Delete failed");
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (payload: object) => api.post("/admin/users/bulk", payload).then(r => r.data),
    onSuccess: (data) => {
      toast.success(`${data.success} user(s) updated`);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setSelected([]);
      setBulkAction(null);
      setBulkPassword("");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Bulk action failed");
    },
  });

  const openEdit = (user: User) => {
    setEditTarget(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      username: user.username || "",
      monitor_limit: user.monitor_limit ?? 20,
    });
    setEditAvatar(user.avatar);
  };

  const handleEditSave = () => {
    if (!editTarget) return;
    const payload: Record<string, unknown> = { id: editTarget.id, ...editForm };
    if (editAvatar !== undefined) payload.avatar = editAvatar;
    patchMutation.mutate(payload, { onSuccess: () => setEditTarget(null) });
  };

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
    setCropSaving(true);
    try {
      const base64 = await getCroppedImg(rawImage, croppedArea);
      setEditAvatar(base64);
      setCropOpen(false);
      setRawImage(null);
      toast.success("Avatar ready — save changes to apply");
    } catch {
      toast.error("Crop failed, please try again");
    } finally {
      setCropSaving(false);
    }
  };

  const closeCropModal = () => {
    if (cropSaving) return;
    setCropOpen(false);
    setRawImage(null);
  };

  const toggleSelect = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const executeBulk = () => {
    if (!bulkAction) return;
    const payload: Record<string, unknown> = { action: bulkAction, ids: selected };
    if (bulkAction === "delete") payload.password = bulkPassword;
    bulkMutation.mutate(payload);
  };

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <AppLayout>
      <div className="space-y-5">
        <Breadcrumb crumbs={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Users" }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-outfit">Users</h1>
            <p className="text-sm text-muted">{data?.total ?? 0} total users</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn h-9 w-9 rounded-xl bg-foreground text-muted hover:text-main transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); setSelected([]); }}
            placeholder="Search by name, email, or username..."
            className="w-full pl-10 h-10 rounded-xl border border-line text-sm focus:border-main bg-background"
          />
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-secondary border border-line rounded-xl text-sm">
            <span className="text-muted">{selected.length} selected</span>
            <div className="ml-auto flex gap-2">
              <button onClick={() => setBulkAction("enable")} className="btn h-8 px-3 rounded-lg bg-foreground text-xs gap-1">
                <Play size={12} /> Enable
              </button>
              <button onClick={() => setBulkAction("disable")} className="btn h-8 px-3 rounded-lg bg-foreground text-xs gap-1">
                <Pause size={12} /> Disable
              </button>
              <button onClick={() => setBulkAction("delete")} className="btn h-8 px-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 text-xs gap-1">
                <Trash2 size={12} /> Delete
              </button>
              <button onClick={() => setSelected([])} className="btn h-8 px-3 rounded-lg bg-foreground text-xs text-muted">
                Clear
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-foreground rounded-xl animate-pulse" />)}</div>
        ) : isError ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>Failed to load users. You may not have admin access, or your session is stale — try logging out and back in.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.users.map((user: User) => (
              <div
                key={user.id}
                className={`bg-background border rounded-xl p-4 flex items-center gap-4 group transition-colors ${selected.includes(user.id) ? "border-emerald-500 ring-1 ring-emerald-500/20" : "border-line"}`}
              >
                <div className="shrink-0 cursor-pointer" onClick={() => toggleSelect(user.id)}>
                  <InputCheck
                    checked={selected.includes(user.id)}
                    onChange={() => toggleSelect(user.id)}
                    size={18}
                    checkSize={12}
                  />
                </div>
                <div className="w-10 h-10 rounded-full bg-foreground center font-bold text-sm shrink-0 overflow-hidden">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    : user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    {user.is_admin     && <Shield size={12} className="text-blue-500 shrink-0" />}
                    {user.is_disabled  && <UserX  size={12} className="text-red-500  shrink-0" />}
                    {user.is_superadmin && (
                      <span className="text-[9px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full">SA</span>
                    )}
                    <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full ml-auto shrink-0">
                      {user.monitor_count ?? 0} monitor{(user.monitor_count ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate">@{user.username} · {user.email}</p>
                  <p className="text-xs text-muted">
                    Limit: {(user.is_admin || user.is_superadmin) ? "∞" : (user.monitor_limit ?? 20)} · Joined {formatDate(user.created_at)}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                  <button onClick={() => openEdit(user)} title="Edit user" className="btn h-8 w-8 rounded-lg bg-foreground text-muted hover:text-main">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => { setResetPwUser(user); setNewPassword(""); }} title="Reset password" className="btn h-8 w-8 rounded-lg bg-foreground text-muted hover:text-amber-500">
                    <KeyRound size={13} />
                  </button>
                  <button onClick={() => setMonitorsUser(user)} title="View monitors" className="btn h-8 w-8 rounded-lg bg-foreground text-muted hover:text-main">
                    <Monitor size={13} />
                  </button>
                  <button
                    onClick={() => patchMutation.mutate({ id: user.id, is_admin: !user.is_admin })}
                    title={user.is_admin ? "Remove admin" : "Make admin"}
                    className={`btn h-8 w-8 rounded-lg ${user.is_admin ? "bg-blue-100 dark:bg-blue-900/30 text-blue-500" : "bg-foreground text-muted hover:text-main"}`}
                  >
                    {user.is_admin ? <ShieldOff size={14} /> : <Shield size={14} />}
                  </button>
                  <button
                    onClick={() => patchMutation.mutate({ id: user.id, is_disabled: !user.is_disabled })}
                    title={user.is_disabled ? "Enable account" : "Disable account"}
                    className={`btn h-8 w-8 rounded-lg ${user.is_disabled ? "bg-red-100 dark:bg-red-900/30 text-red-500" : "bg-foreground text-muted"}`}
                  >
                    {user.is_disabled ? <UserCheck size={14} /> : <UserX size={14} />}
                  </button>
                  <button onClick={() => setDeleteTarget(user)} className="btn h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p-1)} className="btn h-8 px-3 rounded-lg bg-foreground text-sm disabled:opacity-40">Prev</button>
            <span className="text-sm text-muted">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)} className="btn h-8 px-3 rounded-lg bg-foreground text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>

      {/* Edit user modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name}`}>
        <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-4">
          {/* Avatar section */}
          <div className="flex flex-col items-center gap-2 pb-3 border-b border-line">
            <div className="relative">
              {editAvatar ? (
                <img src={editAvatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-line" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-foreground center text-2xl font-bold">
                  {editTarget?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 center text-white cursor-pointer shadow-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={11} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} />
            </div>
            {editAvatar && (
              <button type="button" onClick={() => setEditAvatar(null)} className="text-xs text-red-500 hover:text-red-600 transition-colors">
                Remove avatar
              </button>
            )}
            <p className="text-xs text-muted">Click camera icon to upload &amp; crop</p>
          </div>

          <InputWithoutIcon
            label="Full name" type="text" value={editForm.name}
            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
          />
          <InputWithoutIcon
            label="Email" type="email" value={editForm.email}
            onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
          />
          <InputWithoutIcon
            label="Username" type="text" value={editForm.username}
            onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
          />
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Monitor limit</label>
            <input
              type="number" min={0} max={999}
              value={editForm.monitor_limit}
              onChange={e => setEditForm(f => ({ ...f, monitor_limit: parseInt(e.target.value) || 0 }))}
              className="w-full h-10 rounded-xl border border-line px-3 text-sm bg-background focus:border-main"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setEditTarget(null)} className="flex-1 h-10 rounded-xl btn bg-foreground text-sm">Cancel</button>
            <ButtonWithLoader
              onClick={handleEditSave}
              loading={patchMutation.isPending}
              initialText="Save changes"
              loadingText="Saving..."
              className="flex-1 h-10 rounded-xl btn-primary text-sm"
            />
          </div>
        </div>
      </Modal>

      {/* User monitors modal */}
      <Modal isOpen={!!monitorsUser} onClose={() => setMonitorsUser(null)} title={`Monitors — ${monitorsUser?.name}`}>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {monitorsLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-foreground rounded-xl animate-pulse" />)}</div>
          ) : !userMonitorsData?.monitors?.length ? (
            <div className="text-center py-10 text-muted text-sm">No monitors yet</div>
          ) : (
            userMonitorsData.monitors.map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-foreground rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{m.name}</p>
                  <p className="text-xs text-muted truncate">{m.url}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={(m.last_status as "up" | "down" | "unknown") ?? "unknown"} size="sm" />
                  <span className="text-xs text-muted">{parseFloat(String(m.uptime_pct ?? 100)).toFixed(1)}%</span>
                  {!m.is_active && <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-900/20 text-amber-600 px-1.5 py-0.5 rounded-full">PAUSED</span>}
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open site"
                    className="btn h-7 w-7 rounded-lg bg-background text-muted hover:text-emerald-500 transition-colors shrink-0"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink size={12} />
                  </a>
                  <Link
                    to={`/admin/monitors/${m.id}`}
                    title="View details"
                    onClick={() => setMonitorsUser(null)}
                    className="btn h-7 w-7 rounded-lg bg-background text-muted hover:text-main transition-colors shrink-0"
                  >
                    <Monitor size={12} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Reset password modal */}
      <Modal isOpen={!!resetPwUser} onClose={() => { setResetPwUser(null); setNewPassword(""); }} title={`Reset password — ${resetPwUser?.name}`}>
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Set a new password for <strong>{resetPwUser?.name}</strong>. They should change it after logging in.
          </p>
          <InputWithoutIcon
            type="password"
            label="New password"
            placeholder="Min. 8 characters"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <div className="flex gap-3">
            <button onClick={() => { setResetPwUser(null); setNewPassword(""); }} className="flex-1 h-10 rounded-xl btn bg-foreground text-sm">Cancel</button>
            <ButtonWithLoader
              onClick={() => resetPwUser && resetPasswordMutation.mutate({ id: resetPwUser.id, newPassword })}
              loading={resetPasswordMutation.isPending}
              initialText="Reset password"
              loadingText="Resetting..."
              className="flex-1 h-10 rounded-xl btn-primary text-sm"
            />
          </div>
        </div>
      </Modal>

      {/* Delete user modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => { setDeleteTarget(null); setDeletePassword(""); }} title="Delete user">
        <div className="space-y-4">
          <p className="text-sm text-muted">Delete <strong>{deleteTarget?.name}</strong>? This is irreversible. Enter your admin password.</p>
          <InputWithoutIcon type="password" label="Your password" placeholder="••••••••" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
          <div className="flex gap-3">
            <button onClick={() => { setDeleteTarget(null); setDeletePassword(""); }} className="flex-1 h-10 rounded-xl btn bg-foreground text-sm">Cancel</button>
            <ButtonWithLoader
              onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id, password: deletePassword })}
              loading={deleteMutation.isPending}
              initialText="Delete user"
              loadingText="Deleting..."
              className="flex-1 h-10 rounded-xl btn bg-red-500 text-white text-sm"
            />
          </div>
        </div>
      </Modal>

      {/* Bulk action confirm modal */}
      <Modal isOpen={!!bulkAction} onClose={() => { setBulkAction(null); setBulkPassword(""); }}
        title={`${bulkAction === "delete" ? "Delete" : bulkAction === "disable" ? "Disable" : "Enable"} ${selected.length} user(s)?`}
      >
        <div className="space-y-4">
          {bulkAction === "delete" ? (
            <>
              <p className="text-sm text-muted">Superadmin accounts are protected and will be skipped. Enter your admin password to confirm.</p>
              <InputWithoutIcon
                type="password" label="Your password" placeholder="••••••••"
                value={bulkPassword} onChange={e => setBulkPassword(e.target.value)}
              />
            </>
          ) : (
            <p className="text-sm text-muted">
              {bulkAction === "disable" ? "Selected accounts will be prevented from logging in." : "Selected accounts will be re-enabled and can log in again."}
            </p>
          )}
          <div className="flex gap-3">
            <button onClick={() => { setBulkAction(null); setBulkPassword(""); }} className="flex-1 h-10 rounded-xl btn bg-foreground text-sm">Cancel</button>
            <ButtonWithLoader
              onClick={executeBulk}
              loading={bulkMutation.isPending}
              initialText="Confirm"
              loadingText="Processing..."
              className={`flex-1 h-10 rounded-xl btn text-sm ${bulkAction === "delete" ? "bg-red-500 text-white" : "btn-primary"}`}
            />
          </div>
        </div>
      </Modal>

      {/* Avatar crop modal */}
      {cropOpen && rawImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={closeCropModal}>
          <div className="bg-background rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-4" onClick={e => e.stopPropagation()}>
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
              <button onClick={closeCropModal} disabled={cropSaving} className="flex-1 h-10 rounded-xl border border-line text-sm font-medium disabled:opacity-50">Cancel</button>
              <button onClick={handleCropSave} disabled={cropSaving} className="flex-1 h-10 rounded-xl btn-primary text-sm disabled:opacity-50">
                {cropSaving ? (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </div>
                ) : "Use picture"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
