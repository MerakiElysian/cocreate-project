"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, LoginInput } from "@/schemas/auth.schema";
import { loginStart, loginSuccess, loginFailure } from "@/store/slices/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError("");
    dispatch(loginStart());
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        let errorMsg = json.message || "Invalid email or password";
        if (json.details?.fieldErrors) {
          const firstField = Object.keys(json.details.fieldErrors)[0];
          if (firstField && json.details.fieldErrors[firstField]?.length > 0) {
            errorMsg = json.details.fieldErrors[firstField][0];
          }
        }
        throw new Error(errorMsg);
      }

      dispatch(loginSuccess({ user: json.data.user, accessToken: json.data.accessToken }));

      if (typeof window !== "undefined") {
        if (json.data.refreshToken) {
          localStorage.setItem("refreshToken", json.data.refreshToken);
        }
        if (json.data.accessToken) {
          localStorage.setItem("accessToken", json.data.accessToken);
        }
        if (json.data.user) {
          localStorage.setItem("user", JSON.stringify(json.data.user));
        }
      }

      router.push("/explore");
    } catch (err) {
      dispatch(loginFailure());
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-12">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-lg md:p-10">
        {/* Close / back to home */}
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </Link>

        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center space-x-2">
          <Image
            src="/Logo.png"
            alt="CoCreate Logo"
            width={36}
            height={36}
            priority
            className="rounded-lg"
          />
          <span className="text-xl font-bold text-gray-900">CoCreate</span>
        </Link>

        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Log in to CoCreate</h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          New here?{" "}
          <Link href="/signup" className="font-medium text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>

        {serverError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              autoComplete="email"
              {...register("email")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...register("password")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}