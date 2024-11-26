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
          setIsCreator(foundGroup.ids[0] === user._id);
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
                        Placeholder.
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
              {group.ids.map((id: string) => (
                <div key={id} className="p-2 border rounded">
                  {id}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
