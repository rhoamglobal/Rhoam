"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";
import { PROPERTY_CATEGORIES } from "@/lib/categories";
import { schools } from "@/lib/schools";


export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [schoolTag, setSchoolTag] = useState("");
  const [location, setLocation] = useState(""); 

  const [imageUrl, setImageUrl] = useState("");

  // room count
  const [roomCount, setRoomCount] = useState("");
  const [occupantsPerRoom, setOccupantsPerRoom] = useState("");

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
      setAddress(data.address || "");
      setPrice(String(data.price || ""));
      setCategory(data.category || "");
      setSchoolTag(data.school_tag || "");
      setLocation(data.location || "");
      setImageUrl(data.image_url || "");
      setGalleryImages(data.images || []);
      setRoomCount(String(data.room_count || ""));
      setOccupantsPerRoom(String(data.occupants_per_room || ""));

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
        address,
        price: Number(price),
        category,
        school_tag: schoolTag,
        location,
      
        image_url: updatedImageUrl,
      
        images: finalGallery,
        room_count: Number(roomCount),
        occupants_per_room: Number(occupantsPerRoom),
      
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
    <div className="min-h-screen bg-[#f8f8f8] pb-30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">

        {/* HEADER */}
        <div className="mb-6 sticky top-0 z-20 bg-[#f8f8f8]/90 backdrop-blur-md py-3">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
            Edit Property
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Update listing details, media and amenities
          </p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">

          <div className="p-4 sm:p-6 space-y-6">

            {/* BASIC DETAILS */}
            <div className="space-y-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Basic Info
              </h2>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-[#ff5a5f]"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Description
                </label>

                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-[#ff5a5f]"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Address
                </label>

                <textarea
                  rows={5}
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  className="w-full border border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-[#ff5a5f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Price
                  </label>

                  <input
                    type="number"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value)
                    }
                    className="w-full border border-gray-200 rounded-2xl p-4"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium">
                      Number of Rooms
                    </label>

                    <input
                      type="number"
                      value={roomCount}
                      onChange={(e) =>
                        setRoomCount(e.target.value)
                      }
                      className="w-full border rounded-2xl p-4"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium">
                      Occupants Per Room
                    </label>

                    <input
                      type="number"
                      value={occupantsPerRoom}
                      onChange={(e) =>
                        setOccupantsPerRoom(e.target.value)
                      }
                      className="w-full border rounded-2xl p-4"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    className="w-full border border-gray-200 rounded-2xl p-4 bg-white"
                  >
                    <option value="">Select Category</option>

                    {PROPERTY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* LOCATION */}
            <div className="space-y-5 border-t pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Location
              </h2>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  School Tag
                </label>

                <select
                  value={schoolTag}
                  onChange={(e) =>
                    setSchoolTag(e.target.value)
                  }
                  className="w-full border border-gray-200 rounded-2xl p-4 bg-white"
                >
                  <option value="">Select School</option>

                  {schools.map((school) => (
                    <option
                      key={school.key}
                      value={school.name}
                    >
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Location
                </label>

                <input
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  placeholder="Agbani, Independence Layout..."
                  className="w-full border border-gray-200 rounded-2xl p-4"
                />
              </div>
            </div>

            {/* MEDIA */}
            <div className="space-y-5 border-t pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Media
              </h2>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Cover Image
                </label>

                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-56 sm:h-72 rounded-3xl object-cover mb-4"
                  />
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCoverImage(
                      e.target.files?.[0] || null
                    )
                  }
                  className="w-full border border-dashed border-gray-300 rounded-2xl p-4"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
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
                  className="w-full border border-dashed border-gray-300 rounded-2xl p-4"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {galleryImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative"
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-28 sm:h-32 w-full rounded-2xl object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeGalleryImage(img)
                      }
                      className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full text-sm"
                    >
                      ✕
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageUrl(img)}
                      className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-lg text-[10px]"
                    >
                      Set Cover
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AMENITIES */}
            <div className="space-y-5 border-t pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Amenities
              </h2>

              <input
                value={amenities}
                onChange={(e) =>
                  setAmenities(e.target.value)
                }
                placeholder="WiFi, Security, Water, Parking"
                className="w-full border border-gray-200 rounded-2xl p-4"
              />
            </div>
          </div>
        </div>

        {/* STICKY SAVE BUTTON */}
        <div className="fixed bottom-13 left-0 w-full   p-4 z-30">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="w-full bg-[#ff5a5f] text-white py-4 rounded-2xl font-semibold shadow-lg"
            >
              {saving ? "Saving..." : "Update Property"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
