export default async function useSession() {
  const res = await fetch("/api/checkSession");

  const data = await res.json();
  return data;
}
