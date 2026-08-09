"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import { signupSchema, SignupInput } from "@/schemas/auth.schema";
import { loginStart, loginSuccess, loginFailure } from "@/store/slices/authSlice";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupInput) => {
    setServerError("");
    dispatch(loginStart());
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Signup failed");
      }
      dispatch(loginSuccess({ user: json.data.user, accessToken: json.data.accessToken }));
      localStorage.setItem("refreshToken", json.data.refreshToken);
      router.push("/");
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

        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Log in
          </Link>
        </p>

        {serverError && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
            <input
              type="text"
              {...register("name")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Jane Doe"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            <p className="mt-1 text-xs text-gray-400">
              At least 8 characters, one uppercase letter, one number
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}