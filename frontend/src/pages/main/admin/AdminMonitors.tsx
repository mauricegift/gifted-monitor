import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Search, Zap, Pause, Play, Trash2, AlertCircle, Pencil, ExternalLink, RefreshCw } from "lucide-react";
import { AppLayout } from "@/layouts";
import { StatusBadge } from "@/components/main";
import { Modal, ButtonWithLoader, InputWithoutIcon, InputCheck, Breadcrumb } from "@/components/ui";
import { timeAgo } from "@/helpers/formatDate";
import { INTERVAL_OPTIONS } from "@/helpers/intervals";
import type { PaginatedMonitors, Monitor } from "@/types";
import api from "@/config/api";

type EditForm = {
  name: string;
  url: string;
  path: string;
  method: string;
  body: string;
  intervalMins: number;
  notify_down: boolean;
  notify_up: boolean;
  is_active: boolean;
};

export default function AdminMonitors() {
  const qc = useQueryClient();
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");

  // Bulk selection
  const [selected, setSelected]     = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"pause" | "activate" | "delete" | null>(null);
  const [bulkPassword, setBulkPassword] = useState("");

  // Edit modal state
  const [editTarget, setEditTarget] = useState<Monitor | null>(null);
  const [editForm,   setEditForm]   = useState<EditForm>({
    name: "", url: "", path: "", method: "GET", body: "", intervalMins: 3,
    notify_down: true, notify_up: true, is_active: true,
  });

  const { data, isLoading, isError, isFetching, refetch } = useQuery<PaginatedMonitors>({
    queryKey: ["admin-monitors", search, page],
    queryFn: () => api.get(`/admin/monitors?search=${search}&page=${page}&limit=20`).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      api.put(`/admin/monitors/${id}`, body).then(r => r.data),
    onSuccess: () => { toast.success("Monitor updated"); qc.invalidateQueries({ queryKey: ["admin-monitors"] }); },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Update failed");
    },
  });

  const pingMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/monitors/${id}/ping`),
    onSuccess: () => toast.success("Ping triggered!"),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      api.delete(`/admin/monitors/${id}`, { data: { password } }),
    onSuccess: () => {
      toast.success("Monitor deleted");
      qc.invalidateQueries({ queryKey: ["admin-monitors"] });
      setDeleteId(null);
      setDeletePassword("");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Delete failed");
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (payload: object) => api.post("/admin/monitors/bulk", payload).then(r => r.data),
    onSuccess: (data) => {
      toast.success(`${data.success} monitor(s) updated`);
      qc.invalidateQueries({ queryKey: ["admin-monitors"] });
      setSelected([]);
      setBulkAction(null);
      setBulkPassword("");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Bulk action failed");
    },
  });

  const openEdit = (m: Monitor) => {
    setEditTarget(m);
    setEditForm({
      name: m.name || "",
      url: m.url || "",
      path: m.path || "",
      method: m.method || "GET",
      body: m.body || "",
      intervalMins: m.interval_mins || 3,
      notify_down: m.notify_down !== false,
      notify_up: m.notify_up !== false,
      is_active: m.is_active !== false,
    });
  };

  const handleEditSave = () => {
    if (!editTarget) return;
    updateMutation.mutate(
      { id: editTarget.id, ...editForm },
      { onSuccess: () => setEditTarget(null) }
    );
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
        <Breadcrumb crumbs={[{ label: "Admin", to: "/admin/dashboard" }, { label: "All Monitors" }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-outfit">All Monitors</h1>
            <p className="text-sm text-muted">{data?.total ?? 0} total monitors</p>
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
            placeholder="Search monitors, URLs, or user..."
            className="w-full pl-10 h-10 rounded-xl border border-line text-sm focus:border-main bg-background"
          />
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-secondary border border-line rounded-xl text-sm">
            <span className="text-muted">{selected.length} selected</span>
            <div className="ml-auto flex gap-2">
              <button onClick={() => setBulkAction("pause")} className="btn h-8 px-3 rounded-lg bg-foreground text-xs gap-1">
                <Pause size={12} /> Pause
              </button>
              <button onClick={() => setBulkAction("activate")} className="btn h-8 px-3 rounded-lg bg-foreground text-xs gap-1">
                <Play size={12} /> Activate
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
          <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-foreground rounded-xl animate-pulse" />)}</div>
        ) : isError ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>Failed to load monitors. You may not have admin access, or your session is stale — try logging out and back in.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.monitors.map((m: Monitor) => (
              <div
                key={m.id}
                className={`bg-background border rounded-xl p-4 flex items-center gap-3 group transition-colors ${selected.includes(m.id) ? "border-emerald-500 ring-1 ring-emerald-500/20" : "border-line"}`}
              >
                <div
                  className="shrink-0 cursor-pointer"
                  onClick={() => toggleSelect(m.id)}
                  title="Select"
                >
                  <InputCheck
                    checked={selected.includes(m.id)}
                    onChange={() => toggleSelect(m.id)}
                    size={18}
                    checkSize={12}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold truncate">{m.name}</span>
                    <StatusBadge status={m.last_status} size="sm" />
                  </div>
                  <p className="text-xs text-muted truncate">{m.url}{m.path || ""}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    {(m as unknown as { user_name?: string; user_username?: string; user_email?: string; user_id?: string }).user_name && (
                      <span className="text-[10px] font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full truncate max-w-[130px]">
                        @{(m as unknown as { user_username?: string; user_name?: string }).user_username || (m as unknown as { user_name?: string }).user_name}
                      </span>
                    )}
                    {(m as unknown as { user_email?: string }).user_email && (
                      <span className="text-[10px] text-muted truncate max-w-[160px]">
                        {(m as unknown as { user_email?: string }).user_email}
                      </span>
                    )}
                    <span className="text-[10px] text-muted ml-auto shrink-0">
                      {parseFloat(String(m.uptime_pct ?? 100)).toFixed(1)}% · {m.last_checked ? timeAgo(m.last_checked) : "Never"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Link to={`/admin/monitors/${m.id}`} title="View details" className="btn h-8 w-8 rounded-lg bg-foreground text-muted hover:text-emerald-500">
                    <ExternalLink size={13} />
                  </Link>
                  <button onClick={() => openEdit(m)} title="Edit" className="btn h-8 w-8 rounded-lg bg-foreground text-muted hover:text-main"><Pencil size={13} /></button>
                  <button onClick={() => pingMutation.mutate(m.id)} title="Ping" className="btn h-8 w-8 rounded-lg bg-foreground"><Zap size={13} /></button>
                  <button
                    onClick={() => updateMutation.mutate({ id: m.id, is_active: !m.is_active })}
                    title={m.is_active ? "Pause" : "Activate"}
                    className={`btn h-8 w-8 rounded-lg ${m.is_active ? "bg-foreground" : "bg-amber-100 dark:bg-amber-900/20 text-amber-600"}`}
                  >
                    {m.is_active ? <Pause size={13} /> : <Play size={13} />}
                  </button>
                  <button onClick={() => setDeleteId(m.id)} className="btn h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500"><Trash2 size={13} /></button>
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

      {/* Edit monitor modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit — ${editTarget?.name}`}>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <InputWithoutIcon
            label="Monitor name" type="text" value={editForm.name}
            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
          />
          <InputWithoutIcon
            label="URL (base)" type="url" value={editForm.url}
            onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))}
          />
          <InputWithoutIcon
            label="Path (optional)" type="text" placeholder="/health" value={editForm.path}
            onChange={e => setEditForm(f => ({ ...f, path: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Method</label>
              <select
                value={editForm.method}
                onChange={e => setEditForm(f => ({ ...f, method: e.target.value }))}
                className="w-full h-10 rounded-xl border border-line px-3 text-sm bg-background focus:border-main"
              >
                {["GET","HEAD","POST"].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Check interval</label>
              <select
                value={String(editForm.intervalMins)}
                onChange={e => setEditForm(f => ({ ...f, intervalMins: parseFloat(e.target.value) }))}
                className="w-full h-10 rounded-xl border border-line px-3 text-sm bg-background focus:border-main"
              >
                {INTERVAL_OPTIONS.map(o => (
                  <option key={o.value} value={String(o.value)}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {editForm.method === "POST" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted">Request body (JSON, optional)</label>
              <textarea
                rows={3}
                placeholder='{"key": "value"}'
                value={editForm.body}
                onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))}
                className="w-full rounded-xl border border-line px-3 py-2 text-sm bg-background focus:border-main resize-none font-mono"
              />
            </div>
          )}

          <div className="space-y-2 pt-1">
            {(["notify_down", "notify_up", "is_active"] as const).map(key => {
              const labels: Record<typeof key, string> = {
                notify_down: "Notify on down",
                notify_up:   "Notify on recovery",
                is_active:   "Monitor is active",
              };
              return (
                <label key={key} className="flex items-center gap-3 cursor-pointer text-sm">
                  <InputCheck
                    checked={editForm[key]}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.checked }))}
                    size={18}
                    checkSize={12}
                  />
                  {labels[key]}
                </label>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setEditTarget(null)} className="flex-1 h-10 rounded-xl btn bg-foreground text-sm">Cancel</button>
            <ButtonWithLoader
              onClick={handleEditSave}
              loading={updateMutation.isPending}
              initialText="Save changes"
              loadingText="Saving..."
              className="flex-1 h-10 rounded-xl btn-primary text-sm"
            />
          </div>
        </div>
      </Modal>

      {/* Delete monitor modal */}
      <Modal isOpen={!!deleteId} onClose={() => { setDeleteId(null); setDeletePassword(""); }} title="Delete monitor">
        <div className="space-y-4">
          <p className="text-sm text-muted">This will permanently delete this monitor. Enter your admin password to confirm.</p>
          <InputWithoutIcon type="password" label="Your password" placeholder="••••••••" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
          <div className="flex gap-3">
            <button onClick={() => { setDeleteId(null); setDeletePassword(""); }} className="flex-1 h-10 rounded-xl btn bg-foreground text-sm">Cancel</button>
            <ButtonWithLoader
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId, password: deletePassword })}
              loading={deleteMutation.isPending}
              initialText="Delete"
              loadingText="Deleting..."
              className="flex-1 h-10 rounded-xl btn bg-red-500 text-white text-sm"
            />
          </div>
        </div>
      </Modal>

      {/* Bulk action confirm modal */}
      <Modal
        isOpen={!!bulkAction}
        onClose={() => { setBulkAction(null); setBulkPassword(""); }}
        title={`${bulkAction === "delete" ? "Delete" : bulkAction === "pause" ? "Pause" : "Activate"} ${selected.length} monitor(s)?`}
      >
        <div className="space-y-4">
          {bulkAction === "delete" ? (
            <>
              <p className="text-sm text-muted">This cannot be undone. Enter your admin password to confirm.</p>
              <InputWithoutIcon
                type="password" label="Your password" placeholder="••••••••"
                value={bulkPassword} onChange={e => setBulkPassword(e.target.value)}
              />
            </>
          ) : (
            <p className="text-sm text-muted">
              {bulkAction === "pause" ? "Selected monitors will stop checking." : "Selected monitors will resume checking."}
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
    </AppLayout>
  );
}
