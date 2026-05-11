export const getSaved = (): string[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem("rhoam_saved");
    return data ? JSON.parse(data) : [];
  };
  
  export const isSaved = (id: string) => {
    return getSaved().includes(id);
  };
  
  export const toggleSaved = (id: string) => {
    const saved = getSaved();
  
    if (saved.includes(id)) {
      const updated = saved.filter((x) => x !== id);
      localStorage.setItem("rhoam_saved", JSON.stringify(updated));
      return false;
    } else {
      const updated = [...saved, id];
      localStorage.setItem("rhoam_saved", JSON.stringify(updated));
      return true;
    }
  };