"use client";

import { useState } from "react";
import TopBar from "@/components/TopBar";
import Categories from "@/components/map/CategoryBar";
import dynamic from "next/dynamic";
const MapClient = dynamic(() => import("@/components/map/MapClient"), {
  ssr: false,
});

export default function Page() {
  const [category, setCategory] = useState("All");

  return (
    <div className="relative h-screen w-screen">
      <TopBar />
      <Categories active={category} setActive={setCategory} />
      <MapClient category={category} />
    </div>
  );
}