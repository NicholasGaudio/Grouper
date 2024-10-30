"use client";

import React from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { GoogleLogin } from "@react-oauth/google";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function login() {
  const router = useRouter();

  const handleGoogleLogin = async (credentialResponse: any) => {
    const id_token = credentialResponse.credential;
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/verify-token/${id_token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Response will contain json for username, email, new_user, etc.
      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      router.push("/home"); // temporary until we find out our structure
    } catch (error) {
      console.error("Error during authentication:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background/90 dark:bg-background/90 z-10" />
        <Image
          src="/background.gif"
          alt="Background Animation"
          fill
          className="object-cover opacity-100 dark:opacity-70 transition-opacity duration-300"
          priority
          quality={100}
        />
      </div>

      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="relative z-20">
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground">
                Welcome Back
              </h1>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button size="lg" className="w-full">
                Sign in
              </Button>

              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    console.log("Login Failed");
                  }}
                  useOneTap={false}
                  width="600"
                  theme="outline"
                  size="large"
                  shape="rectangular"
                />
              </div>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <Link href="/register" className="font-medium hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
