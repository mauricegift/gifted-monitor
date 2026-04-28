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
      {/* Blinking dot with ping ring for up/down */}
      <span className="relative inline-flex items-center justify-center w-1.5 h-1.5">
        {status !== "unknown" && (
          <span className={clsx(
            "absolute inline-flex w-full h-full rounded-full animate-ping opacity-75",
            status === "up"   && "bg-emerald-500",
            status === "down" && "bg-red-500",
          )} />
        )}
        <span className={clsx(
          "relative inline-flex w-1.5 h-1.5 rounded-full",
          status === "up"      && "bg-emerald-500",
          status === "down"    && "bg-red-500",
          status === "unknown" && "bg-gray-400",
        )} />
      </span>
      {labels[status]}
    </span>
  );
}
