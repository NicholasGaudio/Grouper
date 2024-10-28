'use client';

import React from 'react';
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
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
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-foreground mb-4">
              Grouper
            </h1>
          </div>
          <div className="flex gap-4 mt-8">
            <Link href="/register">
              <Button size="lg">
                Join Now
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Login
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}