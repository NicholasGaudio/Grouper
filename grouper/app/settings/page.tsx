'use client';

import { Navbar } from "@/components/navbar";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      <div className="pt-16 p-8">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
    </div>
  );
} 