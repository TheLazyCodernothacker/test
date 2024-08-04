export default async function useSession() {
  const res = await fetch("/api/checkSession", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: localStorage.getItem("id") || "none",
    }),
  });
  const data = await res.json();
  return data.message === "Session found";
}
