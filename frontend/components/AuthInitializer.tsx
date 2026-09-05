"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slices/authSlice";

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const rehydrateAuth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            dispatch(
              loginSuccess({
                user: json.data.user,
                accessToken: json.data.accessToken,
              })
            );
          }
        }
      } catch {
        // Silently fail if unauthenticated or offline
      }
    };
    rehydrateAuth();
  }, [dispatch]);

  return <>{children}</>;
}
