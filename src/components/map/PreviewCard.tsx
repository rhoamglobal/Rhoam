"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Property } from "./types";

export default function PreviewCard({
  property,
}: {
  property: Property | null;
}) {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      {property && (
        <motion.div
          key={property.id}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="preview-card"
        >
          <img src={property.image_url} alt={property.title} />
          <div className="info">
            <h3>{property.title}</h3>

            <h2 color="coral">{property.category}</h2>
            <p>₦{property.price.toLocaleString()}</p>
            <button
              onClick={() => router.push(`/property/${property.id}`)}
            >
              View details
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}