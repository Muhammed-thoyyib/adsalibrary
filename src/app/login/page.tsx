"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCatalogify } from '@/hooks/use-catalogify';
import { Library, ShieldCheck, User, KeyRound, Mail, Info, UserPlus, Fingerprint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  const router = useRouter();
  const { login, register, currentUser, user, createMemberProfile } = useCatalogify();
  const { toast } = useToast();

  // Watch for successful auth to redirect or create profile
  useEffect(() => {
    if (user && activeTab === 'register' && name && memberId) {
      // Create Firestore profile for new user
      createMemberProfile(user.uid, {
        name,
        email: user.email!,
        memberId,
        role: 'user'
      });
      toast({ title: "Welcome!", description: "Account created successfully." });
      router.push('/books');
    } else if (user && currentUser) {
      router.push(currentUser.role === 'admin' ? '/admin' : '/books');
    }
  }, [user, currentUser, router, activeTab, name, memberId, createMemberProfile, toast]);

  const validateEmail = (email: string) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const handleLogin = () => {
    if (!email || !password) {
      toast({ title: "Missing fields", description: "Please enter email and password.", variant: "destructive" });
      return;
    }
    setIsAuthenticating(true);
    login(email, password);
    // Failure handling is centralized in the FirebaseErrorListener
    setTimeout(() => setIsAuthenticating(false), 2000);
  };

  const handleRegister = () => {
    if (!email || !password || !name || !memberId) {
      toast({ title: "Missing fields", description: "All fields are required for registration.", variant: "destructive" });
      return;
    }
    if (!validateEmail(email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setIsAuthenticating(true);
    register(email, password, name, memberId);
    setTimeout(() => setIsAuthenticating(false), 2000);
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
                Access or join our smart library management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login" className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4" /> Sign In
                  </TabsTrigger>
                  <TabsTrigger value="register" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Register
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
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
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90" 
                    onClick={handleLogin}
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? "Authenticating..." : "Sign In"}
                  </Button>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-name" placeholder="John Doe" className="pl-10" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-email" type="email" placeholder="john@example.com" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-id">Desired Member ID</Label>
                    <div className="relative">
                      <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-id" placeholder="LIB007" className="pl-10" value={memberId} onChange={e => setMemberId(e.target.value.toUpperCase())} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-pass">Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-pass" type="password" placeholder="Min 6 characters" className="pl-10" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90" 
                    onClick={handleRegister}
                    disabled={isAuthenticating}
                  >
                    {isAuthenticating ? "Creating Account..." : "Create Account"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t pt-4">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Accounts created via 'Register' are set as Members.</span>
              </div>
            </CardFooter>
          </Card>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-primary transition-colors">
                <Info className="mr-2 h-4 w-4" /> Looking for Demo Credentials?
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Quick Start Guide</h4>
                  <p className="text-xs text-muted-foreground">
                    Since this is a fresh setup, you can create these accounts via the <b>Register</b> tab to test functionality:
                  </p>
                </div>
                <div className="grid gap-2 text-[10px] font-mono">
                  <div className="p-2 bg-secondary/50 rounded flex flex-col gap-1">
                    <span className="font-bold text-primary">ADMIN ACCOUNT</span>
                    <span>Email: admin@adsalibrary.com</span>
                    <span>Pass: password123</span>
                    <span className="text-[9px] italic text-muted-foreground mt-1">*Register this, then add its UID to 'roles_admin' in Firebase Console.</span>
                  </div>
                  <div className="p-2 bg-secondary/50 rounded flex flex-col gap-1">
                    <span className="font-bold text-accent">MEMBER ACCOUNT</span>
                    <span>Email: user@adsalibrary.com</span>
                    <span>Pass: password123</span>
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
