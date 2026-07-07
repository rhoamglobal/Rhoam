"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";
import { Search } from "lucide-react";

import {
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldOff,
  Eye,
  EyeOff,
  Home,
  Hotel,
} from "lucide-react";

type Property = {
  id: number;
  title: string;
  price: number;
  image_url: string;
  is_verified: boolean;
  is_available: boolean;
  is_visible: boolean;
};

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);

  // modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    let active = true;

    const loadInitialProperties = async () => {
      const { data } = await supabase
        .from("properties")
        .select(`
          id,
          title,
          price,
          image_url,
          is_verified,
          is_available,
          is_visible
        `)
        .order("created_at", { ascending: false });

      if (active && data) {
        setProperties(data);
      }
    };

    loadInitialProperties();

    return () => {
      active = false;
    };
  }, []);

  const loadProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select(`
        id,
        title,
        price,
        image_url,
        is_verified,
        is_available,
        is_visible
      `)
      .order("created_at", { ascending: false });

    if (data) {
      setProperties(data);
    }
  };

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

    setConfirmOpen(false);
    setSelectedId(null);
  };

  const [search, setSearch] = useState("");

  const filteredProperties = properties.filter((property) =>
    property.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const totalListings = properties.length;

  const verifiedCount = properties.filter(
    (p) => p.is_verified
  ).length;

  const availableCount = properties.filter(
    (p) => p.is_available
  ).length;

  const visibleCount = properties.filter(
    (p) => p.is_visible
  ).length;

  const hiddenCount = properties.filter(
    (p) => !p.is_visible
  ).length;

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
          {properties.length} Listings
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
    value={totalListings}
    color="bg-[#ff5a5f]"
    icon={<Home size={26} />}
  />

  <DashboardCard
    title="Verified"
    value={verifiedCount}
    color="bg-emerald-500"
    icon={<ShieldCheck size={26} />}
  />

  <DashboardCard
    title="Visible"
    value={visibleCount}
    color="bg-sky-500"
    icon={<Eye size={26} />}
  />

  <DashboardCard
    title="Available"
    value={availableCount}
    color="bg-green-500"
    icon={<Home size={26} />}
  />

  <DashboardCard
    title="Hidden"
    value={hiddenCount}
    color="bg-gray-700"
    icon={<EyeOff size={26} />}
  />

</div>

</div>
  {filteredProperties.map((property) => (

    
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
