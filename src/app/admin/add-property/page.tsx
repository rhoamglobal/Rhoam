"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";

export default function AddPropertyPage() {
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const [category, setCategory] = useState("");

  const [description, setDescription] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [imageUrl, setImageUrl] = useState("");

  //drag and drop images
  const [image, setImage] = useState<File | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
  
    let imageUrl = "";
  
    if (image) {
      const fileName = `${Date.now()}-${image.name}`;
  
      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(fileName, image);

  
      if (uploadError) {
        showToast(uploadError.message);
        setLoading(false);
        return;
      }
  
      const { data } = supabase.storage
        .from("property-images")
        .getPublicUrl(fileName);
  
      imageUrl = data.publicUrl;
    }
  
    const { error } = await supabase
      .from("properties")
      .insert([
        {
          title,
          description,
          category,
          price: Number(price),
  
          latitude: Number(latitude),
          longitude: Number(longitude),
  
          image_url: imageUrl,
          images: [imageUrl],
  
          amenities: [],
        },
      ]);

    setLoading(false);
  
    if (error) {
      showToast(error.message);
      return;
    }
  
    showToast("Property added successfully!");
    
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-6">

      <h1 className="text-3xl font-bold text-[#ff5a5f] mb-8">
        Add Property
      </h1>

      <div className="bg-white rounded-3xl p-6 shadow space-y-4">

        <input
          placeholder="Property Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-4 rounded-2xl"
        />

        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border p-4 rounded-2xl"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded-2xl p-4 bg-white"
        >
          <option value="">Select Category</option>

          <option value="Hostel">
            Hostel
          </option>

          <option value="Apartment">
            Apartment
          </option>

          <option value="Self Contain">
            Self Contain
          </option>

          <option value="Lodge">
            Lodge
          </option>

          <option value="Flat">
            Flat
          </option>

          <option value="Room">
            Room
          </option>
        </select>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-4 rounded-2xl h-32"
        />

        <input
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="w-full border p-4 rounded-2xl"
        />

        <input
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="w-full border p-4 rounded-2xl"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setImage(e.target.files[0]);
            }
          }}
          className="w-full border p-4 rounded-2xl"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#ff5a5f] text-white p-4 rounded-2xl font-bold"
        >
          {loading ? "Publishing..." : "Publish Property"}
        </button>

      </div>

    </div>
  );
}