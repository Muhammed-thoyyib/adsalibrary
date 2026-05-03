
"use client";

import { Header } from '@/components/header';
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
import { Book, Clock, History, AlertCircle, IndianRupee } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, transactions, books, calculateFine } = useCatalogify();

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-headline font-bold">Access Denied</h2>
          <p className="text-muted-foreground">Please log in to view your dashboard.</p>
        </main>
      </div>
    );
  }

  const myTransactions = transactions.filter(t => t.member_id === currentUser.id);
  const activeBorrowed = myTransactions.filter(t => t.status === 'issued');
  const pastBorrowed = myTransactions.filter(t => t.status === 'returned');
  
  const totalFine = myTransactions.reduce((sum, t) => sum + calculateFine(t), 0);

  return (
    <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
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
                  {currentUser.email && <p className="text-muted-foreground text-sm mb-6">{currentUser.email}</p>}
                  <div className="w-full space-y-3 pt-6 border-t text-left">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Member ID:</span>
                      <span className="font-medium">{currentUser.member_id}</span>
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
                      <p className="text-xs opacity-80 uppercase font-semibold">Borrowed</p>
                      <p className="text-2xl font-bold">{activeBorrowed.length}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className={totalFine > 0 ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <IndianRupee className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs opacity-80 uppercase font-semibold">Total Fines</p>
                      <p className="text-2xl font-bold">₹{totalFine}</p>
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
                    <CardDescription>14-day loan limit. Overdue fine: ₹5/week.</CardDescription>
                  </div>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {activeBorrowed.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Book Title</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Fine</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeBorrowed.map(t => {
                          const book = books.find(b => b.id === t.book_id);
                          const isOverdue = new Date(t.due_date) < new Date();
                          const fine = calculateFine(t);
                          return (
                            <TableRow key={t.id}>
                              <TableCell className="font-medium">{book?.title}</TableCell>
                              <TableCell className={isOverdue ? 'text-destructive font-semibold' : ''}>
                                {t.due_date}
                                {isOverdue && <span className="ml-2 text-xs">(Overdue)</span>}
                              </TableCell>
                              <TableCell className={fine > 0 ? 'text-destructive font-bold' : ''}>
                                ₹{fine}
                              </TableCell>
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
                  <CardTitle className="font-headline">Past Activity</CardTitle>
                  <CardDescription>A record of your returned books.</CardDescription>
                </CardHeader>
                <CardContent>
                  {pastBorrowed.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Book Title</TableHead>
                          <TableHead>Returned On</TableHead>
                          <TableHead>Fine Paid</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pastBorrowed.map(t => {
                          const book = books.find(b => b.id === t.book_id);
                          const fine = calculateFine(t);
                          return (
                            <TableRow key={t.id}>
                              <TableCell className="font-medium text-muted-foreground">{book?.title}</TableCell>
                              <TableCell className="text-muted-foreground">{t.return_date}</TableCell>
                              <TableCell className="text-muted-foreground">
                                ₹{fine}
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
        </div>
      </main>
    </div>
  );
}
