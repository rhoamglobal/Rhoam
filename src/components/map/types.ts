// Shared shape for anywhere the map gets told to fly somewhere — search
// suggestions (school/location/property), and list view's "See all"
// tiles. zoom is optional: defaults to the tight property-level zoom in
// FlyToProperty, but "See all" on a school/location shelf passes a
// wider zoom explicitly so more of the area (and more property pins)
// stay in view after the flight.
export type FlyTarget = {
  latitude: number;
  longitude: number;
  zoom?: number;
};

// Wider than the tight zoom=18 used when flying to a single selected
// property/search result — both "See all" (ListView) and selecting a
// school/location chip (page.tsx) want to show the whole area's
// properties at once, not zoom in on one point. Shared here so the two
// call sites can't drift apart.
export const SCHOOL_SEE_ALL_ZOOM = 15;
export const LOCATION_SEE_ALL_ZOOM = 16.5;

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
    verified_at?: string | null;
    verified_by?: string | null;
    last_confirmed_at?: string | null;
    multiple_units_available?: boolean;
    address: string;

    is_available: boolean;
    is_visible: boolean;
    is_active: boolean;

    room_count?: number | null;
    occupants_per_room?: number | null;
    bathroom_count?: number | null;
  };