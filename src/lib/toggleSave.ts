export const toggleSave = (id: string) => {
    const saved = JSON.parse(localStorage.getItem("saved") || "[]");
  
    let updated;
  
    if (saved.includes(id)) {
      updated = saved.filter((item: string) => item !== id);
    } else {
      updated = [...saved, id];
    }
  
    localStorage.setItem("saved", JSON.stringify(updated));
    return updated;
  };