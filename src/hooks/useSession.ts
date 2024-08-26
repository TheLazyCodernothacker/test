import { Session } from "inspector";
import { SessionType } from "types";

export default async function useSession(): Promise<SessionType> {
  const res = await fetch("/api/checkSession");

  const data = await res.json();
  return data;
}
