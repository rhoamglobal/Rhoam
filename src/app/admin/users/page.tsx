"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminRoute from "@/components/auth/AdminRoute";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    setUsers(data || []);
  };

  return (
    <AdminRoute>
      <div className="p-6">

        <h1 className="text-4xl font-bold mb-8">
          Users
        </h1>

        <div className="bg-white rounded-3xl shadow">

          {users.map((user) => (
            <div
              key={user.id}
              className="
                p-5
                border-b
                flex
                justify-between
              "
            >
              <div>

                <p className="font-semibold">
                  {user.email}
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(
                    user.created_at
                  ).toLocaleDateString()}
                </p>

              </div>
            </div>
          ))}

        </div>
      </div>
    </AdminRoute>
  );
}