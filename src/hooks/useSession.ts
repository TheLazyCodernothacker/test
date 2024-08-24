import { UserClientType } from "types";

export default async function useSession(): Promise<UserClientType> {
  const res = await fetch("/api/checkSession");

  const data = await res.json();
  return data;
}
