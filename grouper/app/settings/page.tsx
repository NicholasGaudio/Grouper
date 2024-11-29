'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ProfilePicture } from "@/components/profile-picture";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setUsername(userData.username);
      setProfilePicture(userData.profile_picture);
    }
  }, []);

  const isValidImageUrl = (url: string): Promise<boolean> => {
    if (!url?.startsWith('http')) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const updateUsername = async () => {
    if (!user || !username.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user._id}/update-username?username=${encodeURIComponent(username)}`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert("Username already taken");
        return;
      }

      const updatedUser = { ...user, username };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      alert("Username updated successfully!");
    } 
    finally {
      setLoading(false);
    }
  };

  const updateProfilePicture = async () => {
    if (!user || !profilePicture.trim()) return;
    
    setLoading(true);
    try {
      const isValid = await isValidImageUrl(profilePicture);
      if (!isValid) {
        alert("Please enter a valid image URL");
        setProfilePicture("");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user._id}/update-profile-picture?profile_picture=${encodeURIComponent(profilePicture)}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        alert("Failed to update profile picture");
        setProfilePicture("");
        return;
      }

      const updatedUser = { ...user, profile_picture: profilePicture };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      alert("Profile picture updated successfully!");
    } catch (error) {
      alert("Failed to update profile picture");
      setProfilePicture("");
    } finally {
      setLoading(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user._id}/update-profile-picture?profile_picture=`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        alert("Failed to remove profile picture");
        return;
      }

      const updatedUser = { ...user, profile_picture: "" };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfilePicture("");
      
      alert("Profile picture removed successfully!");
    } catch (error) {
      alert("Failed to remove profile picture");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      <div className="pt-16 p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20">
                  <ProfilePicture
                    src={user.profile_picture}
                    alt={user.username}
                    size={80}
                    className="w-full h-full rounded-full overflow-hidden border"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="profile_picture">Profile Picture URL</Label>
                  <Input
                    id="profile_picture"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                    placeholder="Enter profile picture URL"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={updateProfilePicture}
                      disabled={loading || profilePicture === user.profile_picture}
                    >
                      Update Profile Picture
                    </Button>
                    <Button 
                      onClick={removeProfilePicture}
                      disabled={loading || !user.profile_picture}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      Remove Picture
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
              <Button 
                onClick={updateUsername}
                disabled={loading || username === user.username}
              >
                Update Username
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}