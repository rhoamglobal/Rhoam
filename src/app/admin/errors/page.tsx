import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Monitor, Server } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminErrorsPage() {
  const { data: logs } = await supabaseAdmin
    .from("error_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Error Log
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Most recent 100 — server and client errors, newest first.
          </p>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border">
          {logs?.length || 0} logged
        </div>
      </div>

      {!logs || logs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400">
            No errors logged yet. That's a good sign.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      log.source === "server"
                        ? "bg-[#FF6B6B]/10 text-[#FF6B6B]"
                        : "bg-sky-50 text-sky-600"
                    }`}
                  >
                    {log.source === "server" ? (
                      <Server size={14} />
                    ) : (
                      <Monitor size={14} />
                    )}
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {log.source} · {log.route || "unknown route"}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {log.message}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>

              {log.context && (
                <pre className="mt-3 bg-gray-50 rounded-xl p-3 text-xs text-gray-500 overflow-x-auto">
                  {JSON.stringify(log.context, null, 2)}
                </pre>
              )}

              {log.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-400 cursor-pointer">
                    Stack trace
                  </summary>
                  <pre className="mt-2 bg-gray-50 rounded-xl p-3 text-xs text-gray-500 overflow-x-auto whitespace-pre-wrap">
                    {log.stack}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
