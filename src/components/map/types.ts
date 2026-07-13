export type Property = {
    id: string;
    title: string;
    price: number;
    latitude: number;
    longitude: number;
    category: string;
    image_url: string;
    images?: string[];
    description?: string;
    amenities?: string[];
    lat?: number;
    lng?: number;
    image?: string;
    landlord_phone?: string;
    landlord_whatsapp?: string;
    caretaker_name?: string;
    caretaker_phone?: string;
    caretaker_whatsapp?: string;
    school_tag: string;
    location: string;
    is_verified?: boolean;
    address: string;

    is_available: boolean;
    is_visible: boolean;
    is_active: boolean;

    room_count?: number;
    occupants_per_room?: number;
    bathroom_count?: number;
  };