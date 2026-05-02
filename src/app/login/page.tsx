
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
import { Library, ShieldCheck, User, KeyRound, Fingerprint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberCode, setMemberCode] = useState('');
  
  const router = useRouter();
  const { login } = useCatalogify();
  const { toast } = useToast();

  const handleLogin = (role: 'admin' | 'user') => {
    let success = false;
    
    if (role === 'user') {
      success = login('user', { name: memberName, code: memberCode });
    } else {
      success = login('admin', { username, password });
    }
    
    if (success) {
      router.push(role === 'admin' ? '/admin' : '/profile');
      toast({
        title: "Login Successful",
        description: `Welcome back, ${role === 'admin' ? 'Librarian' : memberName}!`,
      });
    } else {
      toast({
        title: "Authentication Failed",
        description: role === 'user' 
          ? "Check Name/Code. (Try: Alice Johnson / LIB001)"
          : "Invalid credentials. (Try: mthoyyib40@gmail.com)",
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
              
              <TabsContent value="user" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="memberName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="memberName" 
                      placeholder="e.g. Alice Johnson" 
                      className="pl-10"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberCode">Member Code</Label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="memberCode" 
                      placeholder="e.g. LIB001" 
                      className="pl-10"
                      value={memberCode}
                      onChange={(e) => setMemberCode(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleLogin('user')}>
                  Sign in as Member
                </Button>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username (Email)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="username" 
                      type="text" 
                      placeholder="mthoyyib40@gmail.com" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
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
                <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleLogin('admin')}>
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
                  Credentials
                </span>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Member: Alice Johnson / LIB001<br/>
              Librarian: mthoyyib40@gmail.com
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
