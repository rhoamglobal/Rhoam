"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";
import Link from "next/link";

type Property = {
  id: number;
  title: string;
  price: number;
  image_url: string;
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
        .select("id,title,price,image_url")
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
      .select("id,title,price,image_url")
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

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-6">

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

      <div className="space-y-4">

        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
          >

            <div className="flex">

              {property.image_url ? (
                <img
                  src={property.image_url}
                  alt={property.title}
                  className="w-40 h-40 object-cover"
                />
              ) : (
                <div className="w-40 h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}

              <div className="flex-1 p-5">

                <div className="flex items-start justify-between">

                  <div>
                    <h2 className="font-bold text-xl">
                      {property.title}
                    </h2>

                    <p className="text-[#ff5a5f] font-semibold mt-1">
                      ₦{property.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </div>

                </div>

                <div className="flex gap-3 mt-6">

                <Link
                  href={`/admin/properties/${property.id}`}
                  className="px-5 py-2 rounded-xl bg-[#ff5a5f] text-white font-medium hover:opacity-90"
                >
                  Edit
                </Link>

                  {/* UPDATED DELETE BUTTON */}
                  <button
                    onClick={() => requestDelete(property.id)}
                    className="px-5 py-2 rounded-xl bg-red-50 text-red-500 font-medium hover:bg-red-100"
                  >
                    Delete
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
}
