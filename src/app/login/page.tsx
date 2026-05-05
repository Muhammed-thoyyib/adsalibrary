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
import { Library, ShieldCheck, User, KeyRound, Mail, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useCatalogify();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleLogin = async (role: 'admin' | 'user') => {
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both your email address and password.",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    
    if (success) {
      toast({
        title: "Welcome Back",
        description: `Successfully signed in as ${role === 'admin' ? 'Librarian' : 'Member'}.`,
      });
      router.push(role === 'admin' ? '/admin' : '/books');
    } else {
      toast({
        title: "Authentication Failed",
        description: "Invalid credentials. Please check your email and password.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md space-y-4">
          <Card className="shadow-xl border-t-4 border-t-primary">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-secondary rounded-full">
                  <Library className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-headline font-bold">ADSALIBRARY Portal</CardTitle>
              <CardDescription>
                Sign in with your email to manage your library account
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
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="your@email.com" 
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
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
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <TabsContent value="user">
                    <Button 
                      className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90" 
                      onClick={() => handleLogin('user')}
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign in as Member"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="admin">
                    <Button 
                      className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90" 
                      onClick={() => handleLogin('admin')}
                      disabled={isLoading}
                    >
                      {isLoading ? "Authenticating..." : "Sign in as Librarian"}
                    </Button>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t pt-4">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Forgot password? Contact library support.</span>
              </div>
            </CardFooter>
          </Card>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-primary transition-colors">
                <Info className="mr-2 h-4 w-4" /> Need help signing in?
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Access Guide</h4>
                  <p className="text-sm text-muted-foreground">
                    Use your registered email and the password provided by your library administrator.
                  </p>
                </div>
                <div className="grid gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                    <span className="font-semibold">Format:</span>
                    <span className="font-mono italic">user@domain.com</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}