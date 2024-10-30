'use client';

import React, { useState } from 'react';
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const HomePage = () => {
  const [groupName, setGroupName] = useState('');
  const [ids, setIds] = useState('');

  const handleSubmit = async () => {
    try {
      const idsArray = ids.split(',').map(id => id.trim());
      
      const response = await fetch('http://127.0.0.1:8000/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          ids: ids
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create group');
      }

      setGroupName('');
      setIds('');
      
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
      </div>

      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="relative z-20">
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-8">
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="lg" className="text-lg px-8 py-6">
                  Create Group
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>New Group</AlertDialogTitle>
                  <AlertDialogDescription>
                    Group stuff here
                  </AlertDialogDescription>
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
                    <div className="space-y-2">
                      <Label htmlFor="ids">IDs (TEMPORARY)</Label>
                      <Input
                        id="ids"
                        type="text"
                        placeholder="IDs (COMMA SEPARATED NO SPACES)"
                        value={ids}
                        onChange={(e) => setIds(e.target.value)}
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
        </main>
      </div>
    </div>
  );
};

export default HomePage;