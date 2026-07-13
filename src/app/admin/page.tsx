"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RecentProperty = {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
};

type AdminStats = {
  propertyCount: number;
  userCount: number;
  savedCount: number;
  recentProperties: RecentProperty[];
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    propertyCount: 0,
    userCount: 0,
    savedCount: 0,
    recentProperties: [],
  });

  useEffect(() => {
    fetch("/admin/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-6">
  
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Rhoam Dashboard
          </h1>
  
          <p className="text-gray-500 mt-2">
            Platform overview and analytics
          </p>
        </div>
  
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
  
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">
              Total Properties
            </p>
  
            <h2 className="text-4xl font-bold mt-2 text-[#ff5a5f]">
              {stats.propertyCount}
            </h2>
          </div>
  
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">
              Registered Users
            </p>
  
            <h2 className="text-4xl font-bold mt-2">
              {stats.userCount}
            </h2>
          </div>
  
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">
              Saved Properties
            </p>
  
            <h2 className="text-4xl font-bold mt-2">
              {stats.savedCount}
            </h2>
          </div>
  
        </div>
  
        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
  
          <h2 className="font-bold text-xl mb-4">
            Quick Actions
          </h2>
  
          <div className="flex flex-wrap gap-3">
  
            <Link
              href="/admin/add-property"
              className="px-5 py-3 rounded-2xl bg-[#ff5a5f] text-white font-medium"
            >
              Add Property
            </Link>
  
            <Link
              href="/admin/properties"
              className="px-5 py-3 rounded-2xl bg-gray-100 font-medium"
            >
              Manage Properties
            </Link>

            <Link
              href="/admin/errors"
              className="px-5 py-3 rounded-2xl bg-gray-100 font-medium"
            >
              Error Log
            </Link>
  
          </div>
  
        </div>
  
        {/* Recent Properties */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
  
          <div className="flex justify-between items-center mb-5">
  
            <h2 className="font-bold text-xl">
              Recent Listings
            </h2>
  
            <span className="text-sm text-gray-500">
              Latest 5 properties
            </span>
  
          </div>
  
          <div className="space-y-4">
  
            {stats.recentProperties?.length === 0 ? (
              <p className="text-gray-400">
                No properties yet
              </p>
            ) : (
              stats.recentProperties?.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50"
                >
  
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100" />
                  )}
  
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {property.title}
                    </h3>
  
                    <p className="text-sm text-gray-500">
                      ₦{property.price?.toLocaleString()}
                    </p>
                  </div>
  
                </div>
              ))
            )}
  
          </div>
  
        </div>
  
      </div>
  );
}
