"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminRoute from "@/components/auth/AdminRoute";
import { useToast } from "@/components/ToastProvider";
import { PROPERTY_CATEGORIES } from "@/lib/categories";


export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const [imageUrl, setImageUrl] = useState("");

  const [amenities, setAmenities] = useState("");
  const { showToast } = useToast();
  //add cover page and images
  const [coverImage, setCoverImage] = useState<File | null>(null);
  //add gallery images
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  //add cover page and images
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!active) return;

      if (error) {
        showToast(error.message);
        return;
      }

      setTitle(data.title || "");
      setDescription(data.description || "");
      setPrice(String(data.price || ""));
      setCategory(data.category || "");
      setImageUrl(data.image_url || "");
      setGalleryImages(data.images || []);

      setAmenities(
        Array.isArray(data.amenities)
          ? data.amenities.join(", ")
          : ""
      );

      setLoading(false);
    };

    fetchProperty();

    return () => {
      active = false;
    };
  }, [params.id, showToast]);
  const removeGalleryImage = (
    imageUrl: string
  ) => {
    setGalleryImages(
      galleryImages.filter(
        (img) => img !== imageUrl
      )
    );
  };

  const handleUpdate = async () => {
    setSaving(true);

    let updatedImageUrl = imageUrl;

    if (coverImage) {
      const fileName =
        Date.now() + "-" + coverImage.name;

      const { error: uploadError } =
        await supabase.storage
          .from("property-images")
          .upload(fileName, coverImage);

      if (uploadError) {
        alert(uploadError.message);
        setSaving(false);
        return;
      }

      const { data } = supabase.storage
        .from("property-images")
        .getPublicUrl(fileName);

      updatedImageUrl = data.publicUrl;
    }

    const uploadedGalleryUrls: string[] = [];

    for (const file of galleryFiles) {
      const fileName =
        Date.now() + "-" + file.name;

      const { error } =
        await supabase.storage
          .from("property-images")
          .upload(fileName, file);

      if (!error) {
        const { data } =
          supabase.storage
            .from("property-images")
            .getPublicUrl(fileName);

        uploadedGalleryUrls.push(
          data.publicUrl
        );
      }
    }

    const finalGallery = [
      ...galleryImages,
      ...uploadedGalleryUrls,
    ];
    

  
  

  
    const { error } = await supabase
      .from("properties")
      .update({
        title,
        description,
        price: Number(price),
        category,
      
        image_url: updatedImageUrl,
      
        images: finalGallery,
      
        amenities: amenities
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      })
      .eq("id", params.id);

    setSaving(false);

    if (error) {
        showToast(error.message);
      return;
    }

    showToast("Property updated successfully");

    router.push("/admin/properties");
  };

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-[#f8f8f8] p-6 pb-[60px]">

        <div className="max-w-3xl mx-auto">

          <h1 className="text-4xl font-bold mb-8">
            Edit Property
          </h1>

          <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5">

            <div>
              <label className="block mb-2 font-medium">
                Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-2xl p-4"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Description
              </label>

              <textarea
                rows={5}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                className="w-full border rounded-2xl p-4"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Price
              </label>

              <input
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className="w-full border rounded-2xl p-4"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-2xl p-4 bg-white"
              >
                <option value="">
                  Select Category
                </option>

                {PROPERTY_CATEGORIES.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Replace Cover Image
              </label>

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt=""
                  className="w-48 h-48 rounded-2xl object-cover mb-4"
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setCoverImage(e.target.files?.[0] || null)
                }
                className="w-full border rounded-2xl p-4"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Gallery Images
              </label>

              <input
                multiple
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setGalleryFiles(
                    Array.from(e.target.files || [])
                  )
                }
                className="w-full border rounded-2xl p-4"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {galleryImages.map((img, index) => (
                <div
                  key={index}
                  className="relative"
                >
                  <img
                    src={img}
                    alt=""
                    className="h-32 w-full rounded-2xl object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeGalleryImage(img)}
                    className="
                      absolute
                      top-2
                      right-2
                      bg-red-500
                      text-white
                      px-2
                      py-1
                      rounded-lg
                      text-sm
                    "
                  >
                    ✕
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageUrl(img)}
                    className="
                      absolute
                      bottom-2
                      left-2
                      bg-black/70
                      text-white
                      px-2
                      py-1
                      rounded-lg
                      text-xs
                    "
                  >
                    Set Cover
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Amenities
              </label>

              <input
                value={amenities}
                onChange={(e) =>
                  setAmenities(e.target.value)
                }
                placeholder="WiFi, Security, Water, Parking"
                className="w-full border rounded-2xl p-4"
              />
            </div>

            <button
              onClick={handleUpdate}
              disabled={saving}
              className="w-full bg-[#ff5a5f] text-white py-4 rounded-2xl font-semibold"
            >
              {saving ? "Saving..." : "Update Property"}
            </button>

          </div>
        </div>

      </div>
    </AdminRoute>
  );
}
