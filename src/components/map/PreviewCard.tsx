"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Property } from "./types";
import { useEffect, useState } from "react";
import { isSaved, toggleSaved } from "@/lib/saved";
import { Heart } from "lucide-react";

export default function PreviewCard({
  property,
  isStatic = false,
}: {
  property: Property | null;
  isStatic?: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (property) {
      setSaved(isSaved(property.id));
    }
  }, [property]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!property) return;
    const state = toggleSaved(property.id);
    setSaved(state);
  };

  const content = property && (
    <div
      className={`
        bg-white rounded-[20px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)]
        border border-gray-100 flex flex-col w-full max-w-sm mx-auto
      `}
      onClick={() => router.push(`/property/${property.id}`)}
    >
      <div className="relative aspect-[16/9] w-full">
        <img
          src={property.image_url}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md transition-transform active:scale-90"
        >
          <Heart
            size={20}
            className={`transition-colors ${saved ? "fill-[#FF5A5F] text-[#FF5A5F]" : "text-gray-600"}`}
          />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-gray-900 truncate flex-1">
            {property.title}
          </h3>
          <span className="text-[#FF5A5F] font-semibold text-sm ml-2 shrink-0">
            {property.category}
          </span>
        </div>

        <p className="font-bold text-gray-900">
          ₦{property.price.toLocaleString()} <span className="font-normal text-gray-500 text-sm">/ year</span>
        </p>

        <button
          className="mt-3 w-full bg-[#FF5A5F] text-white font-bold py-3 rounded-xl transition-transform active:scale-[0.98] shadow-lg shadow-rhoam-primary/20"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/property/${property.id}`);
          }}
        >
          View details
        </button>
      </div>
    </div>
  );

  if (isStatic) return content;

  return (
    <AnimatePresence>
      {property && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-x-0 bottom-24 z-[1001] px-4 pointer-events-none"
        >
          <div className="pointer-events-auto">
            {content}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
