
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCatalogify } from '@/hooks/use-catalogify';
import { Library, ShieldCheck, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login } = useCatalogify();
  const { toast } = useToast();

  const handleLogin = (role: 'admin' | 'user') => {
    const loginEmail = email || (role === 'admin' ? 'admin@adsalibrary.com' : 'user@example.com');
    const success = login(loginEmail, role);
    
    if (success) {
      router.push(role === 'admin' ? '/admin' : '/profile');
    } else {
      toast({
        title: "Access Denied",
        description: role === 'admin' 
          ? "Librarian access is restricted to the master account (admin@adsalibrary.com)." 
          : "Login failed. Please check your credentials.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-secondary rounded-full">
                <Library className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-headline">Welcome back</CardTitle>
            <CardDescription>
              Sign in to manage your library resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="user" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Member
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Librarian
                </TabsTrigger>
              </TabsList>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {/* Hint for librarian login */}
                  <TabsContent value="admin">
                    <p className="text-[10px] text-muted-foreground mt-1 italic">
                      Librarian master account: admin@adsalibrary.com
                    </p>
                  </TabsContent>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button variant="link" className="p-0 h-auto text-xs font-medium text-primary">
                      Forgot password?
                    </Button>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="user" className="mt-6">
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleLogin('user')}>
                  Sign in as Member
                </Button>
              </TabsContent>
              <TabsContent value="admin" className="mt-6">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleLogin('admin')}>
                  Sign in as Librarian
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">Google</Button>
              <Button variant="outline" className="w-full">Github</Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Button variant="link" className="p-0 h-auto text-primary font-medium">
                Sign up
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
