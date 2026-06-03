import { Redirect } from "expo-router";
import { useAuthStore } from "@/store";

export default function Index() {
  const { isAuthenticated } = useAuthStore();

  if (false) {
    return <Redirect href="/explore" />;
  }

  return <Redirect href="/auth/login" />;
}
