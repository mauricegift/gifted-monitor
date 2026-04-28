import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppLayout } from "@/layouts";
import { InputWithoutIcon, SelectWithoutIcon, ButtonWithLoader, InputCheck, GobackButton, Breadcrumb } from "@/components/ui";
import { createMonitorSchema, type CreateMonitorForm } from "@/schemas";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/config/api";
import { INTERVAL_OPTIONS } from "@/helpers/intervals";

export default function CreateMonitor() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm<CreateMonitorForm>({
    resolver: zodResolver(createMonitorSchema),
    defaultValues: { method: "GET", intervalMins: 3, notify_down: true, notify_up: true },
  });

  const method = watch("method");

  const onSubmit = async (data: CreateMonitorForm) => {
    try {
      await api.post("/monitors", data);
      toast.success("Monitor created! We'll start checking it shortly.");
      qc.invalidateQueries({ queryKey: ["monitors"] });
      navigate("/monitors");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to create monitor");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <Breadcrumb crumbs={[{ label: "Monitors", to: "/monitors" }, { label: "New Monitor" }]} />
        <div className="flex items-center gap-3">
          <GobackButton />
          <div>
            <h1 className="text-xl font-bold font-outfit">Add monitor</h1>
            <p className="text-sm text-muted">Configure what to monitor and how often</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputWithoutIcon
            id="name"
            label="Monitor name"
            type="text"
            placeholder="My website"
            error={errors.name?.message}
            {...register("name")}
          />

          <InputWithoutIcon
            id="url"
            label="URL"
            type="url"
            placeholder="https://example.com"
            error={errors.url?.message}
            {...register("url")}
          />

          <InputWithoutIcon
            id="path"
            label="Path (optional)"
            type="text"
            placeholder="/api/health"
            error={errors.path?.message}
            {...register("path")}
          />

          <div className="grid grid-cols-2 gap-3">
            <SelectWithoutIcon
              id="method"
              label="Method"
              options={[
                { label: "GET", value: "GET" },
                { label: "HEAD", value: "HEAD" },
                { label: "POST", value: "POST" },
              ]}
              error={errors.method?.message}
              {...register("method")}
            />
            <SelectWithoutIcon
              id="intervalMins"
              label="Check interval"
              options={INTERVAL_OPTIONS.map(o => ({ value: String(o.value), label: o.label }))}
              error={errors.intervalMins?.message}
              {...register("intervalMins", { valueAsNumber: true })}
            />
          </div>

          {method === "POST" && (
            <div className="space-y-2">
              <label className="text-sm text-muted font-medium">Request body (JSON)</label>
              <textarea
                {...register("body")}
                placeholder='{"key": "value"}'
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm border border-line focus:border-main bg-background resize-none font-mono"
              />
            </div>
          )}

          <div className="bg-secondary rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium">Notifications</p>
            <Controller
              name="notify_down"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer">
                  <InputCheck checked={!!field.value} onChange={e => field.onChange(e.target.checked)} size={20} />
                  <div>
                    <p className="text-sm font-medium">Alert when site goes down</p>
                    <p className="text-xs text-muted">Send email alert when status changes to down</p>
                  </div>
                </label>
              )}
            />
            <Controller
              name="notify_up"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer">
                  <InputCheck checked={!!field.value} onChange={e => field.onChange(e.target.checked)} size={20} />
                  <div>
                    <p className="text-sm font-medium">Alert when site recovers</p>
                    <p className="text-xs text-muted">Send email alert when site comes back online</p>
                  </div>
                </label>
              )}
            />
          </div>

          <ButtonWithLoader
            type="submit"
            loading={isSubmitting}
            initialText="Create monitor"
            loadingText="Creating..."
            className="w-full h-11 rounded-xl btn-primary text-sm"
          />
        </form>
      </div>
    </AppLayout>
  );
}
