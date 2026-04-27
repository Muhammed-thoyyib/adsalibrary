
"use client";

import { Navbar } from '@/components/navbar';
import { useCatalogify } from '@/hooks/use-catalogify';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Book, Clock, History, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, transactions, books } = useCatalogify();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-headline font-bold">Access Denied</h2>
        <p className="text-muted-foreground">Please log in to view your dashboard.</p>
      </div>
    );
  }

  const myTransactions = transactions.filter(t => t.member_id === currentUser.id);
  const activeBorrowed = myTransactions.filter(t => t.status === 'issued');
  const pastBorrowed = myTransactions.filter(t => t.status === 'returned');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* User Profile Info */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-t-4 border-t-accent shadow-md">
              <CardContent className="pt-8 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-lg">
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-headline font-bold">{currentUser.name}</h2>
                <p className="text-muted-foreground text-sm mb-6">{currentUser.email}</p>
                <div className="w-full space-y-3 pt-6 border-t text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Member ID:</span>
                    <span className="font-medium">{currentUser.member_id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{currentUser.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0 h-5">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Book className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs opacity-80 uppercase font-semibold">Currently Borrowed</p>
                    <p className="text-2xl font-bold">{activeBorrowed.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-accent text-accent-foreground">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs opacity-80 uppercase font-semibold">Total Borrowed</p>
                    <p className="text-2xl font-bold">{myTransactions.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Borrowing History */}
          <div className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline">Current Borrowings</CardTitle>
                  <CardDescription>Books currently in your possession.</CardDescription>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {activeBorrowed.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book Title</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Fine (Est.)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeBorrowed.map(t => {
                        const book = books.find(b => b.id === t.book_id);
                        const isOverdue = new Date(t.due_date) < new Date();
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">{book?.title}</TableCell>
                            <TableCell>{t.issue_date}</TableCell>
                            <TableCell className={isOverdue ? 'text-destructive font-semibold' : ''}>
                              {t.due_date}
                              {isOverdue && <span className="ml-2 text-xs">(Overdue)</span>}
                            </TableCell>
                            <TableCell>₹0.00</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-10 text-center text-muted-foreground italic">
                    You haven&apos;t borrowed any books yet.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Borrowing History</CardTitle>
                <CardDescription>A record of your past library activity.</CardDescription>
              </CardHeader>
              <CardContent>
                {pastBorrowed.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book Title</TableHead>
                        <TableHead>Returned On</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastBorrowed.map(t => {
                        const book = books.find(b => b.id === t.book_id);
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium text-muted-foreground">{book?.title}</TableCell>
                            <TableCell className="text-muted-foreground">{t.return_date}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Returned</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-10 text-center text-muted-foreground italic">
                    No history found.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
