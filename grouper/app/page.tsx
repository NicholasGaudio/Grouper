<<<<<<< HEAD
"use client";

import React from "react";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { redirect, useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
  const REDIRECT_URI = "http://localhost:8000/auth/callback"; // Update this with your backend's redirect URI
  const SCOPES = [
    "email",
    "profile",
    "https://www.googleapis.com/auth/calendar.readonly",
  ].join(" ");

  const authorizeURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}&access_type=offline&prompt=consent`;

  const handleLogin = () => {
    window.location.href = authorizeURL; // Redirect to Google login
=======
'use client';

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/verify-token/${credentialResponse.credential}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Authentication failed");
      }

      const userData = await response.json();
      localStorage.setItem('user', JSON.stringify(userData));
      router.push("/home");
      
    } catch (error) {
      console.error("Error during authentication:", error);
      alert("Login failed. Please try again.");
    }
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
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

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-8 bg-transparent rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold text-center">Welcome to Grouper</h1>
          <div className="flex justify-center">
<<<<<<< HEAD
            <button onClick={handleLogin}>Login with Google</button>
=======
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.log('Login Failed');
                alert("Login failed. Please try again.");
              }}
            />
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
          </div>
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
