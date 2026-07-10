"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

import {
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldOff,
  Eye,
  EyeOff,
  Home,
  Hotel,
  Power,
  PowerOff,
} from "lucide-react";

type Property = {
  id: number;
  title: string;
  price: number;
  image_url: string;
  is_verified: boolean;
  is_available: boolean;
  is_visible: boolean;
  is_active: boolean;
};

const PAGE_SIZE = 20;

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Dashboard summary counts — fetched separately (head-only count
  // queries) so they stay accurate for the whole table, not just
  // whatever page is currently loaded.
  const [counts, setCounts] = useState({
    total: 0,
    verified: 0,
    available: 0,
    visible: 0,
    hidden: 0,
    active: 0,
  });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { showToast } = useToast();

  const loadProperties = async () => {
    let query = supabase
      .from("properties")
      .select(
        `
          id,
          title,
          price,
          image_url,
          is_verified,
          is_available,
          is_visible,
          is_active
        `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (debouncedSearch) {
      query = query.ilike("title", `%${debouncedSearch}%`);
    }

    const { data, count } = await query;

    if (data) {
      setProperties(data);
      setTotalCount(count || 0);
    }
  };

  const loadCounts = async () => {
    const [total, verified, available, visible, active] =
      await Promise.all([
        supabase
          .from("properties")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", true),
        supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("is_available", true),
        supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("is_visible", true),
        supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
      ]);

    const totalPropCount = total.count || 0;
    const visibleCount = visible.count || 0;

    setCounts({
      total: totalPropCount,
      verified: verified.count || 0,
      available: available.count || 0,
      visible: visibleCount,
      hidden: totalPropCount - visibleCount,
      active: active.count || 0,
    });
  };

  // Reset to page 1 whenever the search term changes.
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadCounts();
  }, []);

  // STEP 1: open modal instead of deleting directly
  const requestDelete = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };
  const toggleVerification = async (
    id: number,
    currentState: boolean
  ) => {
    const { error } = await supabase
      .from("properties")
      .update({
        is_verified: !currentState,
      })
      .eq("id", id);
  
    if (error) {
      showToast("Failed to update verification", "error");
      return;
    }
  
    showToast(
      !currentState
        ? "Property verified"
        : "Verification removed",
      "success"
    );
  
    loadProperties();
    loadCounts();
  };

  const toggleAvailability = async (
    id: number,
    currentState: boolean
  ) => {
    const { error } = await supabase
      .from("properties")
      .update({
        is_available: !currentState,
      })
      .eq("id", id);
  
    if (error) {
      showToast("Failed to update availability", "error");
      return;
    }
  
    showToast(
      !currentState
        ? "Property marked Available"
        : "Property marked Unavailable",
      "success"
    );
  
    loadProperties();
    loadCounts();
  };
  
  const toggleVisibility = async (
    id: number,
    currentState: boolean
  ) => {
    const { error } = await supabase
      .from("properties")
      .update({
        is_visible: !currentState,
      })
      .eq("id", id);
  
    if (error) {
      showToast("Failed to update visibility", "error");
      return;
    }
  
    showToast(
      !currentState
        ? "Property is now Visible"
        : "Property Hidden",
      "success"
    );
  
    loadProperties();
    loadCounts();
  };

  // Controls whether the property appears on the map or in search at
  // all — separate from is_visible (which only toggles the "Available"
  // display badge shown on a listing that's still findable).
  const toggleActive = async (
    id: number,
    currentState: boolean
  ) => {
    const { error } = await supabase
      .from("properties")
      .update({
        is_active: !currentState,
      })
      .eq("id", id);

    if (error) {
      showToast("Failed to update listing status", "error");
      return;
    }

    showToast(
      !currentState
        ? "Property is now live on the map"
        : "Property removed from map & search",
      "success"
    );

    loadProperties();
    loadCounts();
  };

  // STEP 2: actual delete action
  const deleteProperty = async () => {
    if (!selectedId) return;

    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", selectedId);

    if (error) {
      showToast("Failed to delete property", "error");
      return;
    }

    showToast("Property deleted successfully", "success");

    loadProperties();
    loadCounts();

    setConfirmOpen(false);
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-6 pb-[80px]">

      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-4xl font-bold">Properties</h1>
          <p className="text-gray-500 mt-1">
            Manage all listings on Rhoam
          </p>
        </div>
        

        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border">
          {counts.total} Listings
        </div>


      </div>

      <div className="space-y-5">
      <div className="relative mt-6 mb-8">

    <Search
      size={18}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
    />

    <div className="pb-[20px]">
    <input
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
      placeholder="Search by property title..."
      className="
        w-full
        bg-white
        border
        border-gray-200
        rounded-2xl
        py-4
        pl-12
        pr-5
        shadow-sm
        focus:outline-none
        focus:ring-2
        focus:ring-[#ff5a5f]
        
      "
    />
    </div>
    
    
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-5 mb-10 ">

  <DashboardCard
    title="Listings"
    value={counts.total}
    color="bg-[#ff5a5f]"
    icon={<Home size={26} />}
  />

  <DashboardCard
    title="Verified"
    value={counts.verified}
    color="bg-emerald-500"
    icon={<ShieldCheck size={26} />}
  />

  <DashboardCard
    title="Visible"
    value={counts.visible}
    color="bg-sky-500"
    icon={<Eye size={26} />}
  />

  <DashboardCard
    title="Available"
    value={counts.available}
    color="bg-green-500"
    icon={<Home size={26} />}
  />

  <DashboardCard
    title="Hidden"
    value={counts.hidden}
    color="bg-gray-700"
    icon={<EyeOff size={26} />}
  />

  <DashboardCard
    title="Active"
    value={counts.active}
    color="bg-[#ff5a5f]"
    icon={<Power size={26} />}
  />

</div>

</div>
  {properties.map((property) => (

    
    <div
      key={property.id}
      className="bg-white rounded-3xl  shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition duration-300"
    >
      <div className="flex flex-col md:flex-row">

        

        {/* IMAGE */}

        <div className="relative w-full md:w-64 h-56 md:h-auto shrink-0">
          {property.image_url ? (
            <img
              src={property.image_url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* CONTENT */}

        <div className="flex-1 p-6">

          {/* TOP */}

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

            <div>
              <h2 className="text-2xl font-bold">
                {property.title}
              </h2>

              <p className="text-[#ff5a5f] text-xl font-semibold mt-2">
                ₦{property.price.toLocaleString()}
              </p>
            </div>

            

            {/* STATUS */}

            <div className="flex flex-wrap gap-2">

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  property.is_verified
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {property.is_verified
                  ? "Verified"
                  : "Unverified"}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  property.is_available
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {property.is_available
                  ? "Available"
                  : "Unavailable"}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  property.is_visible
                    ? "bg-sky-50 text-sky-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {property.is_visible
                  ? "Visible"
                  : "Hidden"}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  property.is_active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {property.is_active
                  ? "Active"
                  : "Inactive"}
              </span>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-3 mt-8">

            <Link
              href={`/admin/properties/${property.id}`}
              className="w-11 h-11 rounded-2xl bg-[#ff5a5f] text-white flex items-center justify-center hover:scale-105 transition"
              title="Edit Property"
            >
              <Pencil size={18} />
            </Link>

            <button
              onClick={() =>
                toggleActive(
                  property.id,
                  property.is_active
                )
              }
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                property.is_active
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-500"
              }`}
              title={
                property.is_active
                  ? "Take off map & search"
                  : "Put back on map & search"
              }
            >
              {property.is_active ? (
                <Power size={18} />
              ) : (
                <PowerOff size={18} />
              )}
            </button>

            <button
              onClick={() =>
                toggleVerification(
                  property.id,
                  property.is_verified
                )
              }
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                property.is_verified
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-gray-100 text-gray-600"
              }`}
              title={
                property.is_verified
                  ? "Remove Verification"
                  : "Verify Property"
              }
            >
              {property.is_verified ? (
                <ShieldOff size={18} />
              ) : (
                <ShieldCheck size={18} />
              )}
            </button>

            <button
              onClick={() =>
                toggleAvailability(
                  property.id,
                  property.is_available
                )
              }
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                property.is_available
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-green-50 text-green-600"
              }`}
              title={
                property.is_available
                  ? "Mark Unavailable"
                  : "Mark Available"
              }
            >
              {property.is_available ? (
                <Hotel size={18} />
              ) : (
                <Home size={18} />
              )}
            </button>

            <button
              onClick={() =>
                toggleVisibility(
                  property.id,
                  property.is_visible
                )
              }
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                property.is_visible
                  ? "bg-gray-100 text-gray-700"
                  : "bg-sky-50 text-sky-600"
              }`}
              title={
                property.is_visible
                  ? "Hide Property"
                  : "Show Property"
              }
            >
              {property.is_visible ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>

            <button
              onClick={() => requestDelete(property.id)}
              className="w-11 h-11 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition"
              title="Delete Property"
            >
              <Trash2 size={18} />
            </button>

          </div>

        </div>

      </div>
    </div>
  ))}
</div>

      {/* PAGINATION */}
      {totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-8 bg-white rounded-2xl shadow-sm border p-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="
              flex items-center gap-1
              px-4 py-2 rounded-xl
              text-sm font-medium
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-gray-100
              transition
            "
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <p className="text-sm text-gray-500">
            Page {page + 1} of {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
          </p>

          <button
            onClick={() =>
              setPage((p) =>
                (p + 1) * PAGE_SIZE < totalCount ? p + 1 : p
              )
            }
            disabled={(page + 1) * PAGE_SIZE >= totalCount}
            className="
              flex items-center gap-1
              px-4 py-2 rounded-xl
              text-sm font-medium
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-gray-100
              transition
            "
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ✅ CONFIRM MODAL */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete property?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedId(null);
        }}
        onConfirm={deleteProperty}
      />

    </div>
  );

  function DashboardCard({
    title,
    value,
    color,
    icon,
  }: {
    title: string;
    value: number;
    color: string;
    icon: React.ReactNode;
  }) {
    return (
      <div
        className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border border-gray-100
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
      >
        {/* Decorative Glow */}
        <div
          className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${color} opacity-10 blur-3xl transition-opacity group-hover:opacity-20`}
        />
  
        <div className="relative flex items-start justify-between">
  
          <div>
  
            <p className="text-sm font-medium text-gray-500">
              {title}
            </p>
  
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
              {value}
            </h2>
  
          </div>
  
          <div
            className={`
              h-14
              w-14
              rounded-2xl
              ${color}
              flex
              items-center
              justify-center
              text-white
              shadow-lg
            `}
          >
            {icon}
          </div>
  
        </div>
  
        <div className="mt-6 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
  
          <div
            className={`${color} h-full rounded-full`}
            style={{
              width: `${Math.min(
                (value / Math.max(value, 1)) * 100,
                100
              )}%`,
            }}
          />
  
        </div>
  
      </div>
    );
  }
}
