"use client";

import { useEffect, useState } from "react";
import { Loader2, Phone, MessageCircle, Link as LinkIcon, Check, X } from "lucide-react";

type PendingRequest = {
  id: number;
  createdAt: string;
  propertyId: string;
  propertyTitle: string;
  caretakerName: string | null;
  caretakerPhone: string | null;
  caretakerWhatsapp: string | null;
  statusUrl: string | null;
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AvailabilityRequestsPage() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/availability-requests");
      const json = await res.json();
      if (res.ok) {
        setRequests(json.requests);
      }
    } catch {
      // Leave list empty; the empty/error state below covers this.
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const resolve = async (id: number, isAvailable: boolean) => {
    setResolvingId(id);
    try {
      const res = await fetch(`/api/admin/availability-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setResolvingId(null);
    }
  };

  const copyLink = (id: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Availability Requests</h1>
        <p className="text-gray-500 mt-2">
          Students asking whether a listing is still available. Reach out on
          your own WhatsApp, then forward the confirmation link or resolve it
          here once they reply.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          Loading…
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center text-gray-400">
          Nothing pending — you're caught up.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <h2 className="font-bold text-lg">{r.propertyTitle}</h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Asked {timeAgo(r.createdAt)}
                  </p>

                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <p>
                      Caretaker:{" "}
                      <span className="font-medium">
                        {r.caretakerName || "(no name on file)"}
                      </span>
                    </p>
                    {r.caretakerPhone && (
                      <p className="flex items-center gap-1.5">
                        <Phone size={14} className="text-gray-400" />
                        {r.caretakerPhone}
                      </p>
                    )}
                    {r.caretakerWhatsapp && (
                      <p className="flex items-center gap-1.5">
                        <MessageCircle size={14} className="text-gray-400" />
                        {r.caretakerWhatsapp}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  {r.statusUrl && (
                    <button
                      onClick={() => copyLink(r.id, r.statusUrl!)}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition"
                    >
                      <LinkIcon size={13} />
                      {copiedId === r.id ? "Copied!" : "Copy confirmation link"}
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => resolve(r.id, true)}
                      disabled={resolvingId === r.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition disabled:opacity-50"
                    >
                      <Check size={14} />
                      Available
                    </button>
                    <button
                      onClick={() => resolve(r.id, false)}
                      disabled={resolvingId === r.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
                    >
                      <X size={14} />
                      Taken
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
