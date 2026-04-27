
"use client";

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  BookOpen, 
  Users, 
  ArrowLeftRight, 
  AlertCircle,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
  Clock
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
import { generateBookSummary } from '@/ai/flows/librarian-book-summary-generator';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { books, members, transactions, addBook, deleteBook, issueBook, returnBook } = useCatalogify();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    total_copies: 1,
    location: '',
    description: '' // Temporary field for AI summary generation
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
    addBook({
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn,
      category: newBook.category || 'Fiction',
      total_copies: newBook.total_copies,
      available_copies: newBook.total_copies,
      location: newBook.location,
      summary: (newBook as any).summary,
      keyThemes: (newBook as any).keyThemes
    });
    setIsAddingBook(false);
    setNewBook({ title: '', author: '', isbn: '', category: '', total_copies: 1, location: '', description: '' });
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage library assets, members, and tracking.</p>
          </div>
          <Dialog open={isAddingBook} onOpenChange={setIsAddingBook}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> Add New Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-headline">Add Library Book</DialogTitle>
                <DialogDescription>
                  Enter the book details. Use our AI assistant to enrich your catalog.
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
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input id="isbn" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="copies">Total Copies</Label>
                    <Input id="copies" type="number" value={newBook.total_copies} onChange={e => setNewBook({...newBook, total_copies: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Shelf)</Label>
                    <Input id="location" value={newBook.location} onChange={e => setNewBook({...newBook, location: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2 border-t pt-4">
                  <Label className="flex items-center gap-2">
                    AI Insight Tool <Sparkles className="h-4 w-4 text-accent" />
                  </Label>
                  <DialogDescription className="pb-2">Provide a short book description to generate a summary and themes automatically.</DialogDescription>
                  <textarea 
                    className="w-full min-h-[100px] p-3 text-sm border rounded-md" 
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
                  {(newBook as any).summary && (
                    <div className="mt-4 p-3 bg-accent/5 rounded-md border border-accent/20">
                      <p className="text-xs font-semibold uppercase text-accent mb-1">Generated Summary</p>
                      <p className="text-sm">{(newBook as any).summary}</p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingBook(false)}>Cancel</Button>
                <Button className="bg-primary text-primary-foreground" onClick={handleAddBookSubmit}>Save Book</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Books</p>
                <p className="text-2xl font-bold">{books.length}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Members</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
              <div className="p-2 bg-accent/10 rounded-lg">
                <Users className="h-6 w-6 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issued Books</p>
                <p className="text-2xl font-bold">{transactions.filter(t => t.status === 'issued').length}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <ArrowLeftRight className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">2</p>
              </div>
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="books" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="books">Book Inventory</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="transactions">Issue/Return History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="books">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline">Books Catalog</CardTitle>
                  <CardDescription>Manage all physical and digital library copies.</CardDescription>
                </div>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search books..." 
                    className="pl-9" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title & Author</TableHead>
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
                          <div className="text-xs text-muted-foreground">{book.author}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{book.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${book.available_copies > 0 ? 'bg-green-500' : 'bg-destructive'}`} />
                            {book.available_copies} / {book.total_copies}
                          </div>
                        </TableCell>
                        <TableCell>{book.location}</TableCell>
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
              <CardHeader>
                <CardTitle className="font-headline">Library Members</CardTitle>
                <CardDescription>View and manage registered members and their roles.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member Name</TableHead>
                      <TableHead>Member ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map(member => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </TableCell>
                        <TableCell>{member.member_id}</TableCell>
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
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Recent Transactions</CardTitle>
                <CardDescription>Track all book issue and return events.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map(t => {
                      const book = books.find(b => b.id === t.book_id);
                      const member = members.find(m => m.id === t.member_id);
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{book?.title || 'Unknown'}</TableCell>
                          <TableCell>{member?.name || 'Unknown'}</TableCell>
                          <TableCell>{t.issue_date}</TableCell>
                          <TableCell>{t.due_date}</TableCell>
                          <TableCell>
                            <Badge variant={t.status === 'returned' ? 'outline' : 'default'} className="flex items-center gap-1 w-fit">
                              {t.status === 'returned' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                              {t.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {t.status === 'issued' && (
                              <Button size="sm" onClick={() => returnBook(t.id)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                                Return
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
