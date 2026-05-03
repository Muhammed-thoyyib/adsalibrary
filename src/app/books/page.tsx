"use client";

import { useState } from 'react';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Grid2X2, 
  List, 
  MapPin, 
  BookOpen, 
  Tag, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  Barcode,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { useCatalogify } from '@/hooks/use-catalogify';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { generateBookSummary } from '@/ai/flows/librarian-book-summary-generator';
import { useToast } from '@/hooks/use-toast';

export default function CatalogPage() {
  const { books, currentUser, issueBook, addBook } = useCatalogify();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();

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

  const categories = Array.from(new Set(books.map(b => b.category)));

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.book_number.includes(searchQuery);
    const matchesCategory = selectedCategory ? book.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleIssue = (bookId: string) => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    issueBook(bookId, currentUser.id);
  };

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

  return (
    <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-headline font-bold mb-2">Library Catalog</h1>
              <p className="text-muted-foreground">Discover and borrow from our curated collection.</p>
            </div>
            <div className="flex items-center gap-4">
              {currentUser?.role === 'admin' && (
                <Dialog open={isAddingBook} onOpenChange={setIsAddingBook}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                      <Plus className="mr-2 h-4 w-4" /> Add Book
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-headline text-2xl">Add Library Book</DialogTitle>
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
              )}
              <div className="flex items-center gap-2">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'outline'} 
                  size="icon" 
                  onClick={() => setViewMode('grid')}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'} 
                  size="icon" 
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar Filters */}
            <aside className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-headline font-semibold flex items-center gap-2">
                  <Search className="h-4 w-4" /> Search
                </h3>
                <Input 
                  placeholder="Title, author, barcode, book number..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-headline font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Categories
                </h3>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  <Button 
                    variant={selectedCategory === '' ? 'secondary' : 'ghost'} 
                    className="justify-start font-normal h-8"
                    onClick={() => setSelectedCategory('')}
                  >
                    All Categories
                  </Button>
                  {categories.map(cat => (
                    <Button 
                      key={cat} 
                      variant={selectedCategory === cat ? 'secondary' : 'ghost'} 
                      className="justify-start font-normal h-8"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Catalog Grid/List */}
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground">
                Showing {filteredBooks.length} books
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredBooks.map(book => (
                    <Card key={book.id} className="flex flex-col h-full group hover:shadow-lg transition-all duration-300 border-t-4 border-t-transparent hover:border-t-accent">
                      <CardHeader className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <Badge variant="secondary" className="mb-2">{book.category}</Badge>
                          {book.available_copies > 0 ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Available</Badge>
                          ) : (
                            <Badge variant="destructive">Issued</Badge>
                          )}
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <h3 className="text-xl font-headline font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer">{book.title}</h3>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
                            <div className="absolute left-6 top-6 z-10">
                              <DialogClose asChild>
                                <Button variant="ghost" size="sm" className="h-8 gap-1.5 font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
                                  <ArrowLeft className="h-4 w-4" /> Back
                                </Button>
                              </DialogClose>
                            </div>
                            <DialogHeader className="p-6 pt-16 border-b bg-white">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{book.category}</Badge>
                                <Badge variant="outline" className="flex items-center gap-1 font-mono uppercase text-[10px] text-muted-foreground border-muted/30"><Barcode className="h-3 w-3" /> {book.barcode}</Badge>
                              </div>
                              <DialogTitle className="text-3xl font-headline font-bold text-primary">{book.title}</DialogTitle>
                              <p className="text-lg text-muted-foreground font-medium">By {book.author}</p>
                            </DialogHeader>
                            <div className="p-6">
                              <div className="grid gap-6 py-4">
                                {book.summary ? (
                                  <div className="space-y-4">
                                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                      <h4 className="flex items-center gap-2 font-headline font-semibold text-primary mb-2">
                                        <Sparkles className="h-4 w-4" /> AI Summary
                                      </h4>
                                      <p className="text-sm leading-relaxed">{book.summary}</p>
                                    </div>
                                    {book.keyThemes && (
                                      <div className="flex flex-wrap gap-2">
                                        {book.keyThemes.map(theme => (
                                          <Badge key={theme} variant="secondary" className="bg-accent/10 text-accent-foreground">{theme}</Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground italic">No detailed summary available for this book yet.</p>
                                )}
                                <div className="grid grid-cols-3 gap-4 border-t pt-4">
                                  <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">Location</p>
                                      <p className="text-sm font-medium">{book.location}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">Available</p>
                                      <p className="text-sm font-medium">{book.available_copies} of {book.total_copies}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Tag className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">Book Number</p>
                                      <p className="text-sm font-medium">{book.book_number}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-3 pt-4 border-t">
                                <DialogClose asChild>
                                  <Button variant="ghost">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog
                                  </Button>
                                </DialogClose>
                                <Button 
                                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                                  disabled={book.available_copies <= 0}
                                  onClick={() => handleIssue(book.id)}
                                >
                                  Issue Now
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <p className="text-sm text-muted-foreground font-medium">By {book.author}</p>
                      </CardHeader>
                      <CardContent className="px-6 flex-1 text-sm text-muted-foreground line-clamp-3">
                        {book.summary || "Explore the details of this masterpiece through our digital catalog."}
                      </CardContent>
                      <CardFooter className="p-6 border-t flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-medium uppercase font-mono text-muted-foreground">
                          <Barcode className="h-3 w-3" /> {book.barcode}
                        </div>
                        <Button 
                          size="sm" 
                          variant={book.available_copies > 0 ? 'default' : 'outline'}
                          className={book.available_copies > 0 ? "bg-primary" : ""}
                          disabled={book.available_copies <= 0}
                          onClick={() => handleIssue(book.id)}
                        >
                          {book.available_copies > 0 ? "Borrow" : "Unavailable"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredBooks.map(book => (
                    <Card key={book.id} className="group hover:border-accent">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="h-12 w-12 bg-secondary rounded flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-headline font-semibold group-hover:text-primary transition-colors">{book.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{book.author}</span>
                              <span>•</span>
                              <span>{book.category}</span>
                              <span>•</span>
                              <span className="font-mono uppercase flex items-center gap-0.5"><Barcode className="h-3 w-3" /> {book.barcode}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs text-muted-foreground">Status</span>
                            <span className={book.available_copies > 0 ? 'text-green-600 text-sm font-medium' : 'text-destructive text-sm font-medium'}>
                              {book.available_copies > 0 ? 'Available' : 'Issued'}
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            disabled={book.available_copies <= 0}
                            onClick={() => handleIssue(book.id)}
                          >
                            Borrow
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {filteredBooks.length === 0 && (
                <div className="py-20 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-headline font-semibold">No books found</h3>
                  <p className="text-muted-foreground">Try adjusting your search filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
