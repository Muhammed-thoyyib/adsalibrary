"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCatalogify } from '@/hooks/use-catalogify';
import { Library, ShieldCheck, User, KeyRound, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const router = useRouter();
  const { login, currentUser } = useCatalogify();
  const { toast } = useToast();

  const handleLogin = async (role: 'admin' | 'user') => {
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter your email and password.",
        variant: "destructive"
      });
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Login Successful",
        description: `Welcome back!`,
      });
      // Navigation is handled by the useEffect or manually here
      router.push('/');
    } else {
      toast({
        title: "Authentication Failed",
        description: "Check your email and password.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-secondary rounded-full">
                <Library className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-headline font-bold">ADSALIBRARY Portal</CardTitle>
            <CardDescription>
              Sign in to access your library account
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
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="email@example.com" 
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                
                <TabsContent value="user">
                  <Button className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleLogin('user')}>
                    Sign in as Member
                  </Button>
                </TabsContent>

                <TabsContent value="admin">
                  <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleLogin('admin')}>
                    Sign in as Librarian
                  </Button>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-center text-xs text-muted-foreground">
              Please use the email and password provided by your library administrator.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
