const KEY = "rhoam_saved";

export const getSaved = (): string[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

export const isSaved = (id: string) => {
  return getSaved().includes(id);
};

export const toggleSaved = (id: string) => {
  const saved = getSaved();

  let updated: string[];

  if (saved.includes(id)) {
    updated = saved.filter((x) => x !== id);
  } else {
    updated = [...saved, id];
  }

  localStorage.setItem(KEY, JSON.stringify(updated));
  return !saved.includes(id);
};