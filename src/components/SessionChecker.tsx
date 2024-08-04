import { useEffect } from "react";

export default function SessionChecker() {
  async function checkSession() {
    const res = await fetch("/api/checksession");
    const data = await res.json();
    if (data.message !== "Session found") {
      alert("Session invalid");
      window.location.href = "/login";
    }
  }
  useEffect(() => {
    checkSession;
  }, []);

  return <></>;
}
