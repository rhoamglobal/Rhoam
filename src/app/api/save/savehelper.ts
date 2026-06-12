export async function fetchSaved(userId: string) {
    const res = await fetch(
      `/api/saved?userId=${userId}`
    );
    return res.json();
  }