'use client';

import { useState, useEffect } from 'react';
import { Check, X, Mail, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Invite {
  id: string;
  group_name: string;
  group_id: string;
}

export function InvitesMenu() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user._id);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchInvites = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invites/${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Invite fetch error:', errorData);
          throw new Error(errorData.detail || 'Failed to fetch invites');
        }
        const data = await response.json();
        setInvites(data.invites || []);
      } catch (error) {
        console.error('Error fetching invites:', error);
      }
    };

    fetchInvites();
    const interval = setInterval(fetchInvites, 10000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const handleAccept = async (inviteId: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invites/${inviteId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to accept invite');
      }

      const updatedInvites = invites.filter(invite => invite.id !== inviteId);
      setInvites(updatedInvites);

      const groupsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups`);
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.groups = groupsData.groups;
          localStorage.setItem('user', JSON.stringify(user));
        }
        window.location.reload();
      }

    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  };

  const handleDecline = async (inviteId: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invites/${inviteId}/decline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to decline invite');
      }

      const updatedInvites = invites.filter(invite => invite.id !== inviteId);
      setInvites(updatedInvites);

    } catch (error) {
      console.error('Error declining invite:', error);
    }
  };
  if (!userId) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {invites.length > 0 ? (
            <Mail className="h-5 w-5" />
          ) : (
            <MailOpen className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {invites.length === 0 ? (
          <DropdownMenuItem disabled>
            No pending invites
          </DropdownMenuItem>
        ) : (
          invites.map((invite) => (
            <DropdownMenuItem key={invite.id} className="p-2">
              <div className="flex items-center justify-between w-full gap-2">
                <span className="font-medium truncate">{invite.group_name}</span>
                <div className="flex gap-1 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600"
                    onClick={() => handleAccept(invite.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600"
                    onClick={() => handleDecline(invite.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 