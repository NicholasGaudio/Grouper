"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Navbar } from "@/components/navbar";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const HomePage = () => {
  const [groupName, setGroupName] = useState("");
  const [currentId, setCurrentId] = useState("");
  const [userGroups, setUserGroups] = useState([]);

  const router = useRouter();

  const fetchUserIntoLocalStorage = async () => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("uid"); // Extract 'uid' from the query string

    if (uid) {
      // Store user data in localStorage
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${uid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        router.push("/home");
      }

      const userData = await response.json();
      localStorage.setItem("user", JSON.stringify(userData));
      console.log(userData);
    } else {
      router.push("/home");
    }
  };

  const fetchUserGroups = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${user._id}`);
      const data = await response.json();

      setUserGroups(data.groups);

    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };
  useEffect(() => {
    fetchUserIntoLocalStorage();
    fetchUserGroups();
  }, []);

  const handleSubmit = async () => {
    try {
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;

      const ids = currentId
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id !== "");

      if (currentUser?._id) {
        ids.push(currentUser._id);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/group-add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: groupName,
            ids: ids,
          }),
        }
      );

      setGroupName("");
      setCurrentId("");

      await fetchUserGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <div className="h-screen bg-background relative overflow-hidden">
      <Navbar />

      <div className="relative z-20 h-[calc(100vh-3.5rem)] mt-14">
        <ScrollArea className="h-full px-8 py-6">
          <div className="max-w-[100vw]">
            <div className="flex flex-wrap gap-8">
              {userGroups.map((group, index) => (
                <Link 
                  key={`${group.id}-${index}`}
                  href={`/home/${group.id}`}
                  className="group w-72"
                >
                  <div className="w-full mb-3">
                    <div className="aspect-square w-full border rounded-xl hover:bg-accent/50 transition-colors duration-200">
                    </div>

                    <div className="mt-3">
                      <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
                        {group.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {group.ids.length} {group.ids.length === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="fixed bottom-6 right-6 w-14 h-14 rounded-full group hover:w-auto hover:px-6 transition-all duration-200 overflow-hidden flex items-center justify-center"
                  size="icon"
                >
                  <Plus className="h-6 w-6 absolute group-hover:left-4 transition-all duration-200" />
                  <span className="invisible opacity-0 group-hover:visible group-hover:opacity-100 ml-6 transition-none group-hover:transition-opacity duration-200 whitespace-nowrap">
                    Create Group
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>New Group</AlertDialogTitle>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="groupName">Group Name</Label>
                      <Input
                        id="groupName"
                        type="text"
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    </div>
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>
                    Create
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default HomePage;