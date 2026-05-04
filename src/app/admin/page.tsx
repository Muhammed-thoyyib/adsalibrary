
"use client";

import { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  BookOpen, 
  Users, 
  ArrowLeftRight, 
  AlertCircle,
  Search,
  Trash2,
  CheckCircle2,
  Sparkles,
  Clock,
  UserPlus,
  Barcode,
  Eye,
  History as HistoryIcon,
  Calendar,
  HandHelping,
  Undo2,
  IndianRupee
} from 'lucide-react';
import { useCatalogify } from '@/hooks/use-catalogify';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { generateBookSummary } from '@/ai/flows/librarian-book-summary-generator';
import { useToast } from '@/hooks/use-toast';
import { Member, Transaction } from '@/lib/mock-data';

export default function AdminDashboard() {
  const { 
    books, 
    members, 
    transactions, 
    addBook, 
    deleteBook, 
    addMember, 
    deleteMember, 
    checkInBook,
    checkOutBook,
    calculateFine
  } = useCatalogify();
  
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const [checkingInTransaction, setCheckingInTransaction] = useState<Transaction | null>(null);

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    book_number: '',
    barcode: '',
    category: '',
    total_copies: 1,
    location: '',
    description: '',
    summary: '',
    keyThemes: [] as string[]
  });

  const [newMember, setNewMember] = useState({
    name: '',
    member_id: '',
    role: 'user' as 'user' | 'admin',
    status: 'active' as 'active' | 'suspended'
  });

  const [checkoutData, setCheckoutData] = useState({
    bookId: '',
    memberId: ''
  });

  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();

  const handleAiSummary = async () => {
    if (!newBook.title || !newBook.author || !newBook.description) {
      toast({
        title: "Missing Information",
        description: "Please provide title, author, and description to generate a summary.",
        variant: "destructive"
      });
      return;
    }
    setAiLoading(true);
    try {
      const result = await generateBookSummary({
        title: newBook.title,
        author: newBook.author,
        description: newBook.description
      });
      setNewBook(prev => ({
        ...prev,
        summary: result.summary,
        keyThemes: result.keyThemes
      }));
      toast({
        title: "AI Analysis Complete",
        description: "Successfully generated summary and themes.",
      });
    } catch (error) {
      toast({
        title: "AI Failed",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddBookSubmit = () => {
    if (!newBook.title || !newBook.barcode) {
      toast({ title: "Error", description: "Title and Barcode are required.", variant: "destructive" });
      return;
    }
    addBook({
      title: newBook.title,
      author: newBook.author,
      book_number: newBook.book_number,
      barcode: newBook.barcode,
      category: newBook.category || 'Fiction',
      total_copies: newBook.total_copies,
      available_copies: newBook.total_copies,
      location: newBook.location,
      summary: newBook.summary,
      keyThemes: newBook.keyThemes
    });
    setIsAddingBook(false);
    setNewBook({ title: '', author: '', book_number: '', barcode: '', category: '', total_copies: 1, location: '', description: '', summary: '', keyThemes: [] });
    toast({ title: "Book Added", description: "The book has been successfully added to the catalog." });
  };

  const handleAddMemberSubmit = () => {
    if (!newMember.name || !newMember.member_id) {
      toast({ title: "Error", description: "Name and Member ID are required.", variant: "destructive" });
      return;
    }
    addMember(newMember);
    setIsAddingMember(false);
    setNewMember({ name: '', member_id: '', role: 'user', status: 'active' });
    toast({ title: "Member Registered", description: `Member ${newMember.name} has been added to ADSALIBRARY.` });
  };

  const handleCheckoutSubmit = () => {
    if (!checkoutData.bookId || !checkoutData.memberId) {
      toast({ title: "Error", description: "Please select both a book and a member.", variant: "destructive" });
      return;
    }
    const success = checkOutBook(checkoutData.bookId, checkoutData.memberId);
    if (success) {
      toast({ title: "Success", description: "Book checked out successfully." });
      setIsCheckingOut(false);
      setCheckoutData({ bookId: '', memberId: '' });
    } else {
      toast({ title: "Error", description: "Could not check out book. Check availability.", variant: "destructive" });
    }
  };

  const handleCheckInConfirm = () => {
    if (!checkingInTransaction) return;
    checkInBook(checkingInTransaction.id);
    toast({ 
      title: "Book Checked In", 
      description: "The book has been marked as checked in." 
    });
    setCheckingInTransaction(null);
  };

  const initiateCheckIn = (transaction: Transaction) => {
    setCheckingInTransaction(transaction);
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) || 
    b.author.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
    b.barcode.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
    b.book_number.toLowerCase().includes(bookSearchQuery.toLowerCase())
  );

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || 
    m.member_id.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  const filteredTransactions = transactions.filter(t => {
    const book = books.find(b => b.id === t.book_id);
    const member = members.find(m => m.id === t.member_id);
    const query = historySearchQuery.toLowerCase();
    return (
      book?.title.toLowerCase().includes(query) ||
      member?.name.toLowerCase().includes(query) ||
      t.status.toLowerCase().includes(query)
    );
  });

  const activeTransactions = useMemo(() => {
    return transactions.filter(t => t.status === 'issued');
  }, [transactions]);

  const filteredActiveTransactions = useMemo(() => {
    return activeTransactions.filter(t => {
      const book = books.find(b => b.id === t.book_id);
      const member = members.find(m => m.id === t.member_id);
      const query = activeSearchQuery.toLowerCase();
      return (
        book?.title.toLowerCase().includes(query) ||
        member?.name.toLowerCase().includes(query) ||
        book?.barcode.toLowerCase().includes(query)
      );
    });
  }, [activeTransactions, activeSearchQuery, books, members]);

  const overdueTransactions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions.filter(t => t.status === 'issued' && new Date(t.due_date) < today);
  }, [transactions]);

  const overdueCount = overdueTransactions.length;

  const getMemberTransactions = (memberId: string) => {
    return transactions.filter(t => t.member_id === memberId);
  };

  return (
    <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-headline font-bold text-primary">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage ADSALIBRARY assets, members, and tracking.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog open={isCheckingOut} onOpenChange={setIsCheckingOut}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-accent text-accent hover:bg-accent/5">
                    <HandHelping className="mr-2 h-4 w-4" /> Check Out Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Check Out Book to Member</DialogTitle>
                    <DialogDescription>Search for a book and a member to record a new loan.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="checkout-book">Search Book</Label>
                      <Select value={checkoutData.bookId} onValueChange={(val) => setCheckoutData({...checkoutData, bookId: val})}>
                        <SelectTrigger id="checkout-book">
                          <SelectValue placeholder="Search by title or barcode" />
                        </SelectTrigger>
                        <SelectContent>
                          {books.map(book => (
                            <SelectItem key={book.id} value={book.id} disabled={book.available_copies <= 0}>
                              {book.title} ({book.barcode}) - {book.available_copies > 0 ? 'Available' : 'Out'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="checkout-member">Search Member</Label>
                      <Select value={checkoutData.memberId} onValueChange={(val) => setCheckoutData({...checkoutData, memberId: val})}>
                        <SelectTrigger id="checkout-member">
                          <SelectValue placeholder="Search by name or ID" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.filter(m => m.status === 'active').map(member => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({member.member_id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsCheckingOut(false)}>Cancel</Button>
                    <Button className="bg-accent text-accent-foreground" onClick={handleCheckoutSubmit}>Confirm Check Out</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                    <UserPlus className="mr-2 h-4 w-4" /> Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Register New Member</DialogTitle>
                    <DialogDescription>Create a new member profile using Name and Member ID.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="mem-name">Full Name</Label>
                      <Input 
                        id="mem-name" 
                        placeholder="e.g. John Doe"
                        value={newMember.name} 
                        onChange={e => setNewMember({...newMember, name: e.target.value})} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="mem-id">Member ID / Code</Label>
                      <Input 
                        id="mem-id" 
                        placeholder="e.g. LIB005" 
                        value={newMember.member_id} 
                        onChange={e => setNewMember({...newMember, member_id: e.target.value.toUpperCase()})} 
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsAddingMember(false)}>Cancel</Button>
                    <Button className="bg-primary text-white" onClick={handleAddMemberSubmit}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddingBook} onOpenChange={setIsAddingBook}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Add New Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Add Library Book</DialogTitle>
                    <DialogDescription>
                      Enter the book details for registration.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="author">Author</Label>
                        <Input id="author" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="book_number">Book Number</Label>
                        <Input id="book_number" value={newBook.book_number} onChange={e => setNewBook({...newBook, book_number: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="barcode">Barcode</Label>
                        <Input id="barcode" placeholder="e.g. ADS-B101" value={newBook.barcode} onChange={e => setNewBook({...newBook, barcode: e.target.value.toUpperCase()})} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="copies">Total Copies</Label>
                        <Input id="copies" type="number" value={newBook.total_copies} onChange={e => setNewBook({...newBook, total_copies: parseInt(e.target.value)})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location (Shelf)</Label>
                      <Input id="location" value={newBook.location} onChange={e => setNewBook({...newBook, location: e.target.value})} />
                    </div>
                    <div className="space-y-2 border-t pt-4">
                      <Label className="flex items-center gap-2 font-semibold">
                        AI Insight Tool <Sparkles className="h-4 w-4 text-accent" />
                      </Label>
                      <DialogDescription className="pb-2">Provide a short book description to generate a summary and themes automatically.</DialogDescription>
                      <textarea 
                        className="w-full min-h-[100px] p-3 text-sm border rounded-md focus:ring-2 focus:ring-primary/20 outline-none" 
                        placeholder="Enter book description/blurb here..."
                        value={newBook.description}
                        onChange={e => setNewBook({...newBook, description: e.target.value})}
                      />
                      <Button 
                        variant="outline" 
                        className="w-full border-accent text-accent hover:bg-accent/10"
                        onClick={handleAiSummary}
                        disabled={aiLoading}
                      >
                        {aiLoading ? "Generating..." : "Generate AI Insights"}
                      </Button>
                      {newBook.summary && (
                        <div className="mt-4 p-4 bg-accent/5 rounded-xl border border-accent/20">
                          <p className="text-xs font-bold uppercase text-accent mb-2 tracking-wider">Generated Summary</p>
                          <p className="text-sm leading-relaxed text-foreground/90">{newBook.summary}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsAddingBook(false)}>Cancel</Button>
                    <Button className="bg-primary text-primary-foreground" onClick={handleAddBookSubmit}>Save Book</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <Dialog open={!!checkingInTransaction} onOpenChange={(open) => !open && setCheckingInTransaction(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Undo2 className="h-5 w-5 text-accent" /> Confirm Check In
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to mark this book as checked in?
                </DialogDescription>
              </DialogHeader>
              {checkingInTransaction && (
                <div className="py-4 space-y-4">
                  <div className="p-3 bg-secondary/30 rounded-lg text-sm">
                    <p className="font-semibold">{books.find(b => b.id === checkingInTransaction.book_id)?.title}</p>
                    <p className="text-xs text-muted-foreground">Checked out to: {members.find(m => m.id === checkingInTransaction.member_id)?.name}</p>
                    {calculateFine(checkingInTransaction) > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-destructive font-bold">
                        <AlertCircle className="h-3 w-3" /> Fine: ₹{calculateFine(checkingInTransaction)}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="ghost" onClick={() => setCheckingInTransaction(null)}>Cancel</Button>
                <Button className="bg-primary text-white" onClick={handleCheckInConfirm}>Confirm Check In</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:border-primary/50 transition-colors shadow-sm">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Books</p>
                  <p className="text-2xl font-bold">{books.length}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:border-accent/50 transition-colors shadow-sm">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Members</p>
                  <p className="text-2xl font-bold">{members.length}</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-xl">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors shadow-sm">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Checked Out</p>
                  <p className="text-2xl font-bold">{activeTransactions.length}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl">
                  <ArrowLeftRight className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:border-destructive/50 transition-colors shadow-sm">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-destructive' : ''}`}>{overdueCount}</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="books" className="w-full">
            <TabsList className="mb-6 bg-secondary/50 p-1">
              <TabsTrigger value="books">Inventory</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="active">Checked Out</TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue {overdueCount > 0 && <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">{overdueCount}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="transactions">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="books">
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-headline text-xl">Book Inventory</CardTitle>
                    <CardDescription>Manage ADSALIBRARY's physical and digital collection.</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button onClick={() => setIsAddingBook(true)} variant="outline" size="sm" className="hidden md:flex border-primary text-primary hover:bg-primary/5">
                      <Plus className="h-4 w-4 mr-2" /> Add Book
                    </Button>
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search title, barcode, book number..." 
                        className="pl-9" 
                        value={bookSearchQuery}
                        onChange={e => setBookSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title & Barcode</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBooks.map(book => (
                        <TableRow key={book.id}>
                          <TableCell>
                            <div className="font-medium">{book.title}</div>
                            <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground uppercase">
                              <Barcode className="h-3 w-3" /> {book.barcode}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{book.author}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal">{book.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${book.available_copies > 0 ? 'bg-green-500' : 'bg-destructive'}`} />
                              <span className="text-sm">{book.available_copies} / {book.total_copies}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{book.location}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => deleteBook(book.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members">
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-headline text-xl">Member Directory</CardTitle>
                    <CardDescription>View and manage all registered library members.</CardDescription>
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search name or ID..." 
                      className="pl-9" 
                      value={memberSearchQuery}
                      onChange={e => setMemberSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Member ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map(member => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="font-medium">{member.name}</div>
                            {member.email && <div className="text-xs text-muted-foreground">{member.email}</div>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">{member.member_id}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-headline">Member Profile: {member.name}</DialogTitle>
                                  <DialogDescription>Viewing activity and status for {member.member_id}</DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                                  <div className="space-y-4">
                                    <div className="p-4 bg-secondary/30 rounded-xl border">
                                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Users className="h-4 w-4" /> Personal Information
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge>{member.status}</Badge></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">ID Code</span><span className="font-mono">{member.member_id}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="capitalize">{member.role}</span></div>
                                      </div>
                                    </div>

                                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <ArrowLeftRight className="h-4 w-4" /> Circulation Stats
                                      </h4>
                                      {(() => {
                                        const mTrans = getMemberTransactions(member.id);
                                        const totalFine = mTrans.reduce((sum, t) => sum + calculateFine(t), 0);
                                        return (
                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-white p-3 rounded-lg border text-center">
                                              <p className="text-xs text-muted-foreground">Active</p>
                                              <p className="text-xl font-bold">{mTrans.filter(t => t.status === 'issued').length}</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border text-center">
                                              <p className="text-xs text-muted-foreground">Fines</p>
                                              <p className="text-xl font-bold text-destructive">₹{totalFine}</p>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                      <HistoryIcon className="h-4 w-4" /> Activity History
                                    </h4>
                                    <div className="space-y-2">
                                      {getMemberTransactions(member.id).length > 0 ? (
                                        getMemberTransactions(member.id).map(t => {
                                          const book = books.find(b => b.id === t.book_id);
                                          const isOverdue = t.status === 'issued' && new Date(t.due_date) < new Date();
                                          const fine = calculateFine(t);
                                          
                                          return (
                                            <div key={t.id} className="flex items-start justify-between p-3 border rounded-lg text-sm bg-card hover:bg-accent/5 transition-colors">
                                              <div className="flex flex-col gap-1">
                                                <span className="font-medium">{book?.title || 'Unknown Book'}</span>
                                                <div className="flex flex-col text-[10px] text-muted-foreground space-y-0.5">
                                                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Checked Out: {t.issue_date}</span>
                                                  <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-bold' : ''}`}>
                                                    <Clock className="h-3 w-3" /> Due: {t.due_date}
                                                  </span>
                                                  {fine > 0 && <span className="text-destructive font-bold flex items-center gap-1"><IndianRupee className="h-2 w-2" /> Fine: ₹{fine}</span>}
                                                </div>
                                              </div>
                                              <div className="flex flex-col items-end gap-2">
                                                <Badge variant={t.status === 'returned' ? 'outline' : 'default'} className="text-[10px]">
                                                  {t.status === 'issued' ? 'checked out' : 'checked in'}
                                                </Badge>
                                                {t.status === 'issued' && (
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-7 text-xs text-accent flex items-center gap-1 hover:bg-accent/10"
                                                    onClick={() => initiateCheckIn(t)}
                                                  >
                                                    <Undo2 className="h-3 w-3" /> Process Check In
                                                  </Button>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })
                                      ) : (
                                        <p className="text-xs text-muted-foreground italic text-center py-8">No transaction history available.</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button variant="ghost" size="icon" onClick={() => deleteMember(member.id)} disabled={member.role === 'admin' && members.filter(m => m.role === 'admin').length <= 1}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="active">
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-headline text-xl">Currently Checked Out</CardTitle>
                    <CardDescription>All books currently in possession of members.</CardDescription>
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search title, member, barcode..." 
                      className="pl-9" 
                      value={activeSearchQuery}
                      onChange={e => setActiveSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book & Barcode</TableHead>
                        <TableHead>Checked Out To</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Fine</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredActiveTransactions.length > 0 ? (
                        filteredActiveTransactions.map(t => {
                          const book = books.find(b => b.id === t.book_id);
                          const member = members.find(m => m.id === t.member_id);
                          const isOverdue = new Date(t.due_date) < new Date();
                          const fine = calculateFine(t);
                          return (
                            <TableRow key={t.id}>
                              <TableCell>
                                <div className="font-medium">{book?.title || 'Unknown'}</div>
                                <div className="text-[10px] font-mono text-muted-foreground uppercase">{book?.barcode}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{member?.name || 'Unknown'}</div>
                                <div className="text-[10px] text-muted-foreground">{member?.member_id}</div>
                              </TableCell>
                              <TableCell className={`text-xs ${isOverdue ? 'text-destructive font-bold' : ''}`}>
                                {t.due_date}
                              </TableCell>
                              <TableCell className="text-xs">
                                {fine > 0 ? <span className="text-destructive font-bold">₹{fine}</span> : '₹0'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => initiateCheckIn(t)}
                                  className="border-accent text-accent hover:bg-accent/10"
                                >
                                  Check In
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                            No books currently checked out.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overdue">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-xl text-destructive">Overdue Books</CardTitle>
                  <CardDescription>Books past their 14-day limit. Fine: ₹5 for first week, increases by ₹5 every subsequent week.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book & Barcode</TableHead>
                        <TableHead>Checked Out To</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Fine</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overdueTransactions.length > 0 ? (
                        overdueTransactions.map(t => {
                          const book = books.find(b => b.id === t.book_id);
                          const member = members.find(m => m.id === t.member_id);
                          return (
                            <TableRow key={t.id} className="bg-destructive/5">
                              <TableCell>
                                <div className="font-medium">{book?.title || 'Unknown'}</div>
                                <div className="text-[10px] font-mono text-muted-foreground uppercase">{book?.barcode}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{member?.name || 'Unknown'}</div>
                                <div className="text-[10px] text-muted-foreground">{member?.member_id}</div>
                              </TableCell>
                              <TableCell className="text-destructive font-bold text-sm">
                                {t.due_date}
                              </TableCell>
                              <TableCell className="text-destructive font-bold text-sm">
                                ₹{calculateFine(t)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => initiateCheckIn(t)}
                                  className="flex items-center gap-1"
                                >
                                  <Undo2 className="h-3 w-3" /> Check In
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                            No overdue books found. Catalog is up to date!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-headline text-xl">Recent Activity</CardTitle>
                    <CardDescription>Real-time log of all book circulations at ADSALIBRARY.</CardDescription>
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search title, member, status..." 
                      className="pl-9" 
                      value={historySearchQuery}
                      onChange={e => setHistorySearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Fine</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map(t => {
                        const book = books.find(b => b.id === t.book_id);
                        const member = members.find(m => m.id === t.member_id);
                        const fine = calculateFine(t);
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium max-w-[200px] truncate">{book?.title || 'Unknown'}</TableCell>
                            <TableCell>{member?.name || 'Unknown'}</TableCell>
                            <TableCell>
                              <Badge variant={t.status === 'returned' ? 'outline' : 'default'} className="flex items-center gap-1 w-fit text-[10px] uppercase tracking-tighter">
                                {t.status === 'returned' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                {t.status === 'issued' ? 'checked out' : 'checked in'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {fine > 0 ? <span className="text-destructive font-bold">₹{fine}</span> : '₹0'}
                            </TableCell>
                            <TableCell className="text-right">
                              {t.status === 'issued' && (
                                <Button size="sm" onClick={() => initiateCheckIn(t)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                                  Check In
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {filteredTransactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                            No matching history found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
