"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  email: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,email,created_at")
        .order("created_at", {
          ascending: false,
        });

      if (active) {
        setUsers(data || []);
      }
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  return (
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
  );
}
