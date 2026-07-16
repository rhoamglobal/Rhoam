"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";
import { PROPERTY_CATEGORIES } from "@/lib/categories";
import { compressImage } from "@/lib/compressImage";
import { validateImageFile, validateImageFiles } from "@/lib/validateImageFile";
import { schools } from "@/lib/schools";

export default function AddPropertyPage() {
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const [category, setCategory] = useState("");

  const [description, setDescription] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [landlordPhone, setLandlordPhone] = useState("");
  const [landlordWhatsapp, setLandlordWhatsapp] = useState("");
  const [caretakerName, setCaretakerName] = useState("");
  const [caretakerPhone, setCaretakerPhone] = useState("");
  const [caretakerWhatsapp, setCaretakerWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [schoolTag, setSchoolTag] = useState("");
  const [location, setLocation] = useState("");

  const [roomCount, setRoomCount] = useState("");
  const [occupantsPerRoom, setOccupantsPerRoom] = useState("");

  const [amenities, setAmenities] = useState("");

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);


  

  //drag and drop images
  const [image, setImage] = useState<File | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
  
    let imageUrl = "";
  
    if (image) {
      const fileName = `properties/${Date.now()}.webp`;
  
      // Compress image before uploading
    const compressed = await compressImage(image);

    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(fileName, compressed);

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
    const galleryUrls: string[] = [];

    for (const file of galleryFiles) {
      const fileName = `properties/${Date.now()}-${file.name}`;

      const compressed = await compressImage(file);

      const { error } = await supabase.storage
        .from("property-images")
        .upload(fileName, compressed);

      if (!error) {
        const { data } = supabase.storage
          .from("property-images")
          .getPublicUrl(fileName);

        galleryUrls.push(data.publicUrl);
      }
    }
    
  
    const { error } = await supabase
      .from("properties")
      .insert([
        {
          title,
          description,
          address,
        
          category,
          school_tag: schoolTag,
          location,
        
          price: Number(price),
        
          room_count: Number(roomCount),
          occupants_per_room: Number(
            occupantsPerRoom
          ),
        
          latitude: Number(latitude),
          longitude: Number(longitude),
        
          landlord_phone: landlordPhone,
          landlord_whatsapp: landlordWhatsapp || null,
          caretaker_name: caretakerName || null,
          caretaker_phone: caretakerPhone || null,
          caretaker_whatsapp: caretakerWhatsapp || null,
        
          image_url: imageUrl,
        
          images: [
            imageUrl,
            ...galleryUrls,
          ],
        
          amenities: amenities
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
        }
        ]);

    setLoading(false);
  
    if (error) {
      showToast(error.message);
      return;
    }
  
    showToast("Property added successfully!");
    
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-6 pb-[65px]">

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

        <div className="grid grid-cols-2 gap-4">

        <input
          type="number"
          placeholder="Rooms"
          value={roomCount}
          onChange={(e) =>
            setRoomCount(e.target.value)
          }
          className="border p-4 rounded-2xl"
        />

        <input
          type="number"
          placeholder="Occupants / Room"
          value={occupantsPerRoom}
          onChange={(e) =>
            setOccupantsPerRoom(
              e.target.value
            )
          }
          className="border p-4 rounded-2xl"
        />

        </div>

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

        <select
          value={schoolTag}
          onChange={(e) =>
            setSchoolTag(e.target.value)
          }
          className="w-full border rounded-2xl p-4 bg-white"
        >
          <option value="">
            Select School
          </option>

          {schools.map((school) => (
            <option
              key={school.key}
              value={school.name}
            >
              {school.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Location"
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
          className="w-full border p-4 rounded-2xl"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-4 rounded-2xl h-32"
        />

        <textarea
          placeholder="Address"
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
          className="w-full border p-4 rounded-2xl h-24"
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


<label > image cover</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              const file = e.target.files[0];
              const error = validateImageFile(file);

              if (error) {
                showToast(error, "error");
                e.target.value = "";
                return;
              }

              setImage(file);
            }
          }}
          className="w-full border p-4 rounded-2xl"
        />

        <label > image gallery</label>
        <input
          multiple
          type="file"
          accept="image/*"
          onChange={(e) => {
            const { valid, errors } = validateImageFiles(
              Array.from(e.target.files || [])
            );

            if (errors.length) {
              showToast(errors.join(" "), "error");
            }

            setGalleryFiles(valid);
          }}
          className="w-full border p-4 rounded-2xl"
        />

        <input
          placeholder="WiFi, Security, Water..."
          value={amenities}
          onChange={(e) =>
            setAmenities(e.target.value)
          }
          className="w-full border p-4 rounded-2xl"
        />

        <input
          placeholder="Landlord Phone"
          value={landlordPhone}
          onChange={(e) => setLandlordPhone(e.target.value)}
          className="w-full border p-4 rounded-2xl"
        />

        <input
          placeholder="Landlord WhatsApp (e.g. 2348012345678)"
          value={landlordWhatsapp}
          onChange={(e) => setLandlordWhatsapp(e.target.value)}
          className="w-full border p-4 rounded-2xl"
        />

        <p className="text-sm text-gray-400 pt-2">
          Caretaker (optional)
        </p>

        <input
          placeholder="Caretaker Name"
          value={caretakerName}
          onChange={(e) => setCaretakerName(e.target.value)}
          className="w-full border p-4 rounded-2xl"
        />

        <input
          placeholder="Caretaker Phone"
          value={caretakerPhone}
          onChange={(e) => setCaretakerPhone(e.target.value)}
          className="w-full border p-4 rounded-2xl"
        />

        <input
          placeholder="Caretaker WhatsApp (e.g. 2348012345678)"
          value={caretakerWhatsapp}
          onChange={(e) => setCaretakerWhatsapp(e.target.value)}
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