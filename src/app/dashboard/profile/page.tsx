'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Save, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

export default function ProfilePage() {
    const { toast } = useToast();
    const { user } = useUser();

    const handleSave = () => {
        // Placeholder for saving data to Firebase
        toast({
            title: 'Profile Saved!',
            description: 'Your information has been updated successfully.',
        });
    }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Manage your personal and academic information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/avatar/100/100"} alt="User avatar" data-ai-hint="user avatar" />
              <AvatarFallback>{user?.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Upload new picture
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={user?.displayName || "Anonymous User"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email || "No email provided"} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uid">User ID</Label>
              <Input id="uid" type="text" defaultValue={user?.uid} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College/University</Label>
              <Input id="college" placeholder="e.g., University of Technology" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills-domain">Skills Domain</Label>
              <Input id="skills-domain" placeholder="e.g., Software Engineering, Data Science" />
            </div>
            <div className="relative space-y-2">
              <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
              <Linkedin className="absolute left-3 top-9 h-5 w-5 text-muted-foreground" />
              <Input id="linkedin" type="url" placeholder="https://linkedin.com/in/your-profile" className="pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise-area">Expertise Area</Label>
            <Textarea id="expertise-area" placeholder="Add one or more areas of expertise, separated by commas (e.g., React, Python, Cloud Computing)" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary / Bio</Label>
            <Textarea id="summary" placeholder="Tell us a little about yourself..." />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
