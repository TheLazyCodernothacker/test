import { useEffect } from "react";
import useSession from "./hooks/useSession";

export default function Dashboard() {
  useEffect(() => {
    const session = useSession().then((res) => {
      if (!res) {
        window.location.href = "/login";
      }
    });
  }, []);
  return <div>Dashboard</div>;
}
