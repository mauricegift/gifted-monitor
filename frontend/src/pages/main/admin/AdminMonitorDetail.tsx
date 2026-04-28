import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Zap, Pause, Play, Trash2, Edit2, X, RefreshCw, User2, Mail } from "lucide-react";
import { AppLayout } from "@/layouts";
import { StatusBadge, UptimeBar } from "@/components/main";
import { Modal, ButtonWithLoader, InputWithoutIcon, SelectWithoutIcon, InputCheck, Breadcrumb } from "@/components/ui";
import { formatDate, timeAgo } from "@/helpers/formatDate";
import { INTERVAL_OPTIONS, formatInterval } from "@/helpers/intervals";
import type { Monitor } from "@/types";
import api from "@/config/api";

type EditData = {
  name: string;
  url: string;
  path: string;
  method: Monitor["method"];
  body: string;
  intervalMins: number;
  is_active: boolean;
  notify_down: boolean;
  notify_up: boolean;
};

type AdminMonitor = Monitor & {
  user_name?: string;
  user_username?: string;
  user_email?: string;
};

export default function AdminMonitorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<EditData>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const { data: monitor, isLoading, isFetching } = useQuery<AdminMonitor>({
    queryKey: ["admin-monitor", id],
    queryFn: () => api.get(`/admin/monitors/${id}`).then(r => r.data),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const pingMutation = useMutation({
    mutationFn: () => api.post(`/admin/monitors/${id}/ping`),
    onSuccess: () => { toast.success("Ping triggered!"); qc.invalidateQueries({ queryKey: ["admin-monitor", id] }); },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<EditData>) => api.put(`/admin/monitors/${id}`, data).then(r => r.data),
    onSuccess: () => {
      toast.success("Monitor updated");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["admin-monitor", id] });
      qc.invalidateQueries({ queryKey: ["admin-monitors"] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Update failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/admin/monitors/${id}`, { data: { password: deletePassword } }),
    onSuccess: () => {
      toast.success("Monitor deleted");
      qc.invalidateQueries({ queryKey: ["admin-monitors"] });
      navigate("/admin/monitors");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Delete failed");
    },
  });

  const toggleActive = () => {
    if (!monitor) return;
    updateMutation.mutate({ is_active: !monitor.is_active });
  };

  const startEdit = () => {
    if (!monitor) return;
    setEditData({
      name: monitor.name,
      url: monitor.url,
      path: monitor.path || "",
      method: monitor.method,
      body: monitor.body || "",
      intervalMins: monitor.interval_mins,
      notify_down: monitor.notify_down,
      notify_up: monitor.notify_up,
    });
    setEditing(true);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-foreground rounded" />
          <div className="h-32 bg-foreground rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!monitor) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-muted">Monitor not found</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <Breadcrumb crumbs={[
          { label: "Admin", to: "/admin/dashboard" },
          { label: "All Monitors", to: "/admin/monitors" },
          { label: monitor.name },
        ]} />

        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/monitors")} className="btn h-9 w-9 rounded-xl bg-foreground">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold font-outfit truncate">{monitor.name}</h1>
            <p className="text-xs text-muted truncate">{monitor.url}{monitor.path || ""}</p>
          </div>
          <StatusBadge status={monitor.last_status} />
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ["admin-monitor", id] })}
            disabled={isFetching}
            className="btn h-9 w-9 rounded-xl bg-foreground text-muted hover:text-main transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Owner info */}
        {(monitor.user_username || monitor.user_email) && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">Monitor Owner</p>
            <div className="flex flex-wrap gap-4">
              {monitor.user_username && (
                <div className="flex items-center gap-2 text-sm">
                  <User2 size={14} className="text-blue-500 shrink-0" />
                  <span className="font-medium">@{monitor.user_username}</span>
                  {monitor.user_name && <span className="text-muted">({monitor.user_name})</span>}
                </div>
              )}
              {monitor.user_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} className="text-blue-500 shrink-0" />
                  <span className="text-muted">{monitor.user_email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Uptime", value: `${parseFloat(String(monitor.uptime_pct ?? 100)).toFixed(1)}%` },
            { label: "Response time", value: monitor.last_response_time ? `${monitor.last_response_time}ms` : "—" },
            { label: "Interval", value: formatInterval(monitor.interval_mins) },
            { label: "Last checked", value: monitor.last_checked ? timeAgo(monitor.last_checked) : "Never" },
          ].map(s => (
            <div key={s.label} className="bg-background border border-line rounded-xl p-4">
              <p className="text-lg font-bold font-outfit">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {monitor.history && monitor.history.length > 0 && (
          <div className="bg-background border border-line rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-3">Check history (last {monitor.history.length})</h2>
            <UptimeBar history={monitor.history} maxBars={60} />
            <div className="flex items-center gap-4 mt-2 text-xs text-muted">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> Up</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Down</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-line inline-block" /> No data</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button onClick={() => pingMutation.mutate()} disabled={pingMutation.isPending} className="btn h-9 px-4 rounded-xl bg-foreground text-sm gap-2">
            <Zap size={15} /> Ping now
          </button>
          <button onClick={toggleActive} disabled={updateMutation.isPending} className="btn h-9 px-4 rounded-xl bg-foreground text-sm gap-2">
            {monitor.is_active ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Activate</>}
          </button>
          <button onClick={startEdit} className="btn h-9 px-4 rounded-xl bg-foreground text-sm gap-2">
            <Edit2 size={15} /> Edit
          </button>
          <button onClick={() => setDeleteOpen(true)} className="btn h-9 px-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 text-sm gap-2">
            <Trash2 size={15} /> Delete
          </button>
        </div>

        <div className="bg-background border border-line rounded-xl p-4">
          <h2 className="text-sm font-semibold mb-3">Details</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: "Method", value: monitor.method },
              { label: "Full URL", value: monitor.url + (monitor.path || "") },
              { label: "Notify on down", value: monitor.notify_down ? "Yes" : "No" },
              { label: "Notify on recovery", value: monitor.notify_up ? "Yes" : "No" },
              { label: "Monitor ID", value: String(monitor.id) },
              { label: "Created", value: formatDate(monitor.created_at) },
            ].map(d => (
              <div key={d.label} className="flex justify-between gap-4">
                <span className="text-muted">{d.label}</span>
                <span className="font-medium truncate text-right max-w-[60%]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit monitor">
        <div className="space-y-3">
          {[
            { label: "Name", key: "name" as keyof typeof editData, type: "text" },
            { label: "URL", key: "url" as keyof typeof editData, type: "url" },
            { label: "Path (optional)", key: "path" as keyof typeof editData, type: "text" },
          ].map(f => (
            <InputWithoutIcon
              key={String(f.key)}
              label={f.label}
              type={f.type}
              value={String(editData[f.key] ?? "")}
              onChange={e => setEditData((d: Partial<EditData>) => ({ ...d, [f.key]: e.target.value }))}
            />
          ))}
          <div className="grid grid-cols-2 gap-3">
            <SelectWithoutIcon
              label="Method"
              options={[
                { label: "GET",  value: "GET"  },
                { label: "HEAD", value: "HEAD" },
                { label: "POST", value: "POST" },
              ]}
              value={String(editData.method ?? "GET")}
              onChange={e => setEditData((d: Partial<EditData>) => ({ ...d, method: e.target.value as Monitor["method"] }))}
            />
            <SelectWithoutIcon
              label="Check interval"
              options={INTERVAL_OPTIONS.map(o => ({ value: String(o.value), label: o.label }))}
              value={String(editData.intervalMins)}
              onChange={e => setEditData((d: Partial<EditData>) => ({ ...d, intervalMins: parseFloat(e.target.value) }))}
            />
          </div>
          {editData.method === "POST" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted">Request body (JSON, optional)</label>
              <textarea
                rows={3}
                placeholder='{"key": "value"}'
                value={String(editData.body ?? "")}
                onChange={e => setEditData((d: Partial<EditData>) => ({ ...d, body: e.target.value }))}
                className="w-full rounded-xl border border-line px-3 py-2 text-sm bg-background focus:border-main resize-none font-mono"
              />
            </div>
          )}
          <div className="bg-secondary rounded-xl p-3 space-y-2.5">
            <p className="text-xs font-semibold text-muted">Notifications</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <InputCheck
                checked={!!editData.notify_down}
                onChange={e => setEditData((d: Partial<EditData>) => ({ ...d, notify_down: e.target.checked }))}
                size={18}
              />
              <div>
                <p className="text-sm font-medium">Alert when site goes down</p>
                <p className="text-xs text-muted">Send email when status changes to down</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <InputCheck
                checked={!!editData.notify_up}
                onChange={e => setEditData((d: Partial<EditData>) => ({ ...d, notify_up: e.target.checked }))}
                size={18}
              />
              <div>
                <p className="text-sm font-medium">Alert when site recovers</p>
                <p className="text-xs text-muted">Send email when site comes back online</p>
              </div>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setEditing(false)} className="flex-1 h-10 rounded-xl btn bg-foreground text-sm"><X size={15} /> Cancel</button>
            <ButtonWithLoader
              onClick={() => updateMutation.mutate(editData)}
              loading={updateMutation.isPending}
              initialText="Save changes"
              loadingText="Saving..."
              className="flex-1 h-10 rounded-xl btn btn-primary text-sm"
            />
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => { setDeleteOpen(false); setDeletePassword(""); }} title="Delete monitor">
        <div className="space-y-4">
          <p className="text-sm text-muted">This will permanently delete <strong>{monitor.name}</strong> and all its check history. Enter your admin password to confirm.</p>
          <InputWithoutIcon type="password" label="Your password" placeholder="••••••••" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} />
          <div className="flex gap-3">
            <button onClick={() => { setDeleteOpen(false); setDeletePassword(""); }} className="flex-1 h-10 rounded-xl btn bg-foreground text-sm">Cancel</button>
            <ButtonWithLoader
              onClick={() => deleteMutation.mutate()}
              loading={deleteMutation.isPending}
              initialText="Delete"
              loadingText="Deleting..."
              className="flex-1 h-10 rounded-xl btn bg-red-500 text-white text-sm"
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
