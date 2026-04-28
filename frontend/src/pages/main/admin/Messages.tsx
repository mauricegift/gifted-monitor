import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, MailOpen, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, MessageCircle, Reply } from "lucide-react";
import { AppLayout } from "@/layouts";
import { Modal, ButtonWithLoader, Breadcrumb } from "@/components/ui";
import { formatDate } from "@/helpers/formatDate";
import type { PaginatedMessages, ContactMessage } from "@/types";
import api from "@/config/api";

export default function Messages() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const { data, isLoading, isError, isFetching, refetch } = useQuery<PaginatedMessages>({
    queryKey: ["admin-messages", page],
    queryFn: () => api.get(`/admin/contact?page=${page}`).then(r => r.data),
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/contact/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/contact/${id}`),
    onSuccess: () => {
      toast.success("Message deleted");
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
      setSelected(null);
    },
  });

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.is_read) readMutation.mutate(msg.id);
  };

  const totalPages = data ? Math.ceil(data.total / 10) : 1;

  return (
    <AppLayout>
      <div className="space-y-5">
        <Breadcrumb crumbs={[{ label: "Admin", to: "/admin/dashboard" }, { label: "Contact Messages" }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-outfit">Contact Messages</h1>
            <p className="text-sm text-muted">
              {data?.total ?? 0} total messages
              {data?.unread ? <span className="ml-2 text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{data.unread} unread</span> : null}
            </p>
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

        {isLoading ? (
          <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-foreground rounded-xl animate-pulse" />)}</div>
        ) : isError ? (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>Failed to load messages. You may not have admin access, or your session is stale — try logging out and back in.</span>
          </div>
        ) : data?.messages.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-line rounded-xl">
            <Mail size={32} className="text-muted mx-auto mb-3" />
            <p className="text-muted text-sm">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.messages.map((msg: ContactMessage) => (
              <div
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`bg-background border rounded-xl p-4 cursor-pointer hover:border-main/30 transition-all flex items-center gap-3 ${!msg.is_read ? "border-primary/40 bg-primary/5" : "border-line"}`}
              >
                <div className="shrink-0 text-muted">
                  {msg.is_read ? <MailOpen size={18} /> : <Mail size={18} className="text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${!msg.is_read ? "font-semibold" : "font-medium"}`}>{msg.subject}</p>
                    <span className="text-xs text-muted shrink-0">{formatDate(msg.created_at)}</span>
                  </div>
                  <p className="text-xs text-muted truncate">
                    {msg.name}
                    {msg.email ? ` · ${msg.email}` : ""}
                    {msg.whatsapp ? ` · 📱 ${msg.whatsapp}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p-1)} className="btn h-8 w-8 rounded-lg bg-foreground disabled:opacity-40"><ChevronLeft size={16} /></button>
            <span className="text-sm text-muted">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p+1)} className="btn h-8 w-8 rounded-lg bg-foreground disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.subject}>
        {selected && (
          <div className="space-y-4">
            <div className="bg-secondary rounded-xl p-3 space-y-1.5 text-sm">
              {[
                { label: "From", value: selected.name },
                { label: "Email", value: selected.email || "—" },
                selected.whatsapp ? { label: "WhatsApp", value: selected.whatsapp } : null,
                { label: "Date", value: formatDate(selected.created_at) },
              ].filter(Boolean).map(d => (
                <div key={d!.label} className="flex gap-2">
                  <span className="text-muted w-20 shrink-0">{d!.label}</span>
                  <span className="font-medium break-all">{d!.value}</span>
                </div>
              ))}
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap bg-secondary rounded-xl p-3">{selected.message}</div>

            {/* Reply actions */}
            <div className="flex flex-wrap gap-2">
              {selected.email && (
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="flex-1 btn h-9 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-sm gap-2 min-w-[140px] hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Reply size={14} /> Reply via Email
                </a>
              )}
              {selected.whatsapp && (
                <a
                  href={`https://wa.me/${selected.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${selected.name}, regarding your message: "${selected.subject}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn h-9 px-4 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 text-sm gap-2 min-w-[140px] hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <MessageCircle size={14} /> Reply via WhatsApp
                </a>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 h-10 rounded-xl btn bg-foreground text-sm">Close</button>
              <ButtonWithLoader
                onClick={() => deleteMutation.mutate(selected.id)}
                loading={deleteMutation.isPending}
                initialText="Delete"
                loadingText="Deleting..."
                className="h-10 px-5 rounded-xl btn bg-red-50 dark:bg-red-950/20 text-red-500 text-sm"
              />
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
