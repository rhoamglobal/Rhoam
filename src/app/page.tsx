"use client";

import { useState } from "react";
import MapClient from "@/components/MapClient";
import TopBar from "@/components/TopBar";
import Categories from "@/components/Categories";

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