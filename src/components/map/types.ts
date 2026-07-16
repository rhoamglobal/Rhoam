export type Property = {
    id: string;
    title: string;
    price: number;
    latitude: number;
    longitude: number;
    category: string;
    image_url: string;
    images?: string[] | null;
    description?: string | null;
    amenities?: string[] | null;
    lat?: number;
    lng?: number;
    image?: string;
    landlord_phone?: string | null;
    landlord_whatsapp?: string | null;
    caretaker_name?: string | null;
    caretaker_phone?: string | null;
    caretaker_whatsapp?: string | null;
    school_tag: string;
    location: string;
    is_verified?: boolean;
    address: string;

    is_available: boolean;
    is_visible: boolean;
    is_active: boolean;

    room_count?: number | null;
    occupants_per_room?: number | null;
    bathroom_count?: number | null;
  };