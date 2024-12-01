'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from "@/components/navbar";
import { Trash2, UserPlus, LogOut, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ProfilePicture } from "@/components/profile-picture";
import AlgTable from "@/components/algorithm-table";

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState(null);
  const [inviteId, setInviteId] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${user._id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }

        const data = await response.json();
        if (!data.groups) {
          throw new Error('No groups data received');
        }

        const foundGroup = data.groups.find(g => g.id === params.id);
        if (foundGroup) {
          setGroup(foundGroup);
          setIsCreator(foundGroup.members?.[0]?.id === user._id);
          setEditName(foundGroup.name || '');
        }
      } catch (error) {
        console.error('Error fetching group:', error);
      }
    };
    fetchGroup();
  }, [params.id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/groups/${params.id}`,
        {
          method: 'DELETE',
        }
      );

      router.push('/home');
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleInvite = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/group-invite`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteId,
          group_name: group.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.detail === "User not found") {
          alert(`No user found with email ${inviteId}`);
          return;
        }
        if (data.detail === "User is already in this group") {
          alert(`${inviteId} is already a member of ${group.name}`);
          return;
        }
        if (data.detail === "User already invited") {
          alert(`${inviteId} already has a pending invite to ${group.name}`);
          return;
        }
        throw new Error(data.detail || 'Failed to invite user');
      }

      alert(`Successfully invited ${inviteId} to ${group.name}`);
      setInviteId('');
      const closeButton = document.querySelector('[data-button="close"]');
      if (closeButton instanceof HTMLElement) {
        closeButton.click();
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      alert(error.message || 'Failed to invite user');
    }
  };

  const handleEdit = async () => {
    try {
      if (!editName.trim()) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/groups/${params.id}/update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editName.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update group');
      }

      setGroup(prev => ({ ...prev, name: editName.trim() }));
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleLeave = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/groups/${params.id}/leave?user_id=${user._id}`,
        {
          method: 'PUT',
        }
      );

      router.push('/home');
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  if (!group) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      
      <div className="pt-16 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">{group.name}</h1>
            
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="[&_svg]:text-blue-500">
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Invite User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Enter the user's email to invite them.
                    </AlertDialogDescription>
                    <div className="mt-4 space-y-4">
                      <Input
                        placeholder="user@example.com"
                        value={inviteId}
                        onChange={(e) => setInviteId(e.target.value)}
                      />
                    </div>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-button="close">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleInvite}>
                      Invite
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {isCreator && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="[&_svg]:text-yellow-500"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Edit Group</AlertDialogTitle>
                      <AlertDialogDescription>
                        Change the name of the group.
                      </AlertDialogDescription>
                      <div className="mt-4 space-y-4">
                        <Input
                          placeholder="Group Name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setEditName(group?.name || '')}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleEdit}
                        disabled={!editName.trim() || editName === group?.name}
                      >
                        Save Changes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {isCreator && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 [&_svg]:text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Group</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this group?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-button="close">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {!isCreator && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="[&_svg]:text-orange-500"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave Group</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to leave this group? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-button="close">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleLeave}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Leave
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Members</h2>
            <div className="grid gap-2">
              {group.members?.map((member) => (
                <div 
                  key={member.id} 
                  className="p-4 border rounded-lg flex items-center gap-4"
                >
                  <div className="relative w-[60px] h-[60px]">
                    <ProfilePicture
                      src={member.profile_picture}
                      alt={member.username}
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{member.username}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Group Availability</h2>
            <div className="border rounded-lg p-4">
              <AlgTable groupId={params.id as string} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}