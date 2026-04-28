import clsx from "clsx";

type Status = "up" | "down" | "unknown";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md";
}

const labels: Record<Status, string> = { up: "UP", down: "DOWN", unknown: "UNKNOWN" };

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 font-semibold rounded-full",
      size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
      status === "up"      && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      status === "down"    && "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      status === "unknown" && "bg-gray-100 dark:bg-gray-800 text-gray-500",
    )}>
      {/* Pulsing dot — large ring for up/down to be highly visible */}
      <span className="relative inline-flex items-center justify-center w-2.5 h-2.5">
        {status === "up" && (
          <span className="absolute inline-flex w-5 h-5 rounded-full animate-ping bg-emerald-400 opacity-50" />
        )}
        {status === "down" && (
          <span className="absolute inline-flex w-5 h-5 rounded-full animate-ping bg-red-400 opacity-50" />
        )}
        <span className={clsx(
          "relative inline-flex w-2 h-2 rounded-full",
          status === "up"      && "bg-emerald-500",
          status === "down"    && "bg-red-500",
          status === "unknown" && "bg-gray-400",
        )} />
      </span>
      {labels[status]}
    </span>
  );
}
