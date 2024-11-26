<<<<<<< HEAD
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect, useRouter } from "next/navigation";
=======
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
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

const HomePage = () => {
<<<<<<< HEAD
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/groupswith/${user._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Error fetching groups user is in");
      }

      const filteredGroups = await response.json();
      setUserGroups(filteredGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
=======
  const [groupName, setGroupName] = useState('');
  const [currentId, setCurrentId] = useState('');
  const [userGroups, setUserGroups] = useState([]);

  const fetchUserGroups = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups`);
      const data = await response.json();
      
      const filteredGroups = data.groups.filter(group => 
        group.ids.includes(user._id)
      );
      
      console.log('Filtered Groups:', JSON.stringify(filteredGroups, null, 2));
      setUserGroups(filteredGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    fetchUserIntoLocalStorage();
=======
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
    fetchUserGroups();
  }, []);

  const handleSubmit = async () => {
    try {
<<<<<<< HEAD
      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;

      const ids = currentId
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id !== "");

=======
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      const ids = currentId
        .split(',')
        .map(id => id.trim())
        .filter(id => id !== '');
        
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
      if (currentUser?._id) {
        ids.push(currentUser._id);
      }

<<<<<<< HEAD
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
=======
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/group-add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          ids: ids
        })
      });

      setGroupName('');
      setCurrentId('');

      await fetchUserGroups();
      
    } catch (error) {
      console.error('Error creating group:', error);
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
<<<<<<< HEAD

      <div className="relative z-20 pt-16">
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-8">
=======
      
      <div className="relative z-20 pt-16">
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-8">
            
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
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
            <div className="mt-8 grid gap-4">
              <h2 className="text-2xl font-bold">Your Groups</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userGroups.map((group, index) => (
<<<<<<< HEAD
                  <Link
=======
                  <Link 
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
                    key={`${group.id}-${index}`}
                    href={`/home/${group.id}`}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <h3 className="font-semibold text-lg">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {group.ids.length} members
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default HomePage;
=======
export default HomePage;
>>>>>>> 543db4a274ae91dd9e49b4b0f2b6173d994ec4f2
