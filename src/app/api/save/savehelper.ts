export async function fetchSaved() {
  const res = await fetch("/api/saved");
  return res.json();
}
