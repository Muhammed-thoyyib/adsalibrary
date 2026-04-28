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
  Barcode
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
} from "@/components/ui/dialog";

export default function CatalogPage() {
  const { books, currentUser, issueBook } = useCatalogify();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = Array.from(new Set(books.map(b => b.category)));

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.isbn.includes(searchQuery);
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

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar Filters */}
            <aside className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-headline font-semibold flex items-center gap-2">
                  <Search className="h-4 w-4" /> Search
                </h3>
                <Input 
                  placeholder="Title, author, barcode..." 
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
                          <DialogContent className="max-w-2xl p-0 overflow-hidden">
                            <DialogHeader className="bg-primary p-6">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-white border-white/40">{book.category}</Badge>
                                <Badge variant="outline" className="flex items-center gap-1 font-mono uppercase text-[10px] text-white/80 border-white/20"><Barcode className="h-3 w-3" /> {book.barcode}</Badge>
                              </div>
                              <DialogTitle className="text-3xl font-headline font-bold text-white">{book.title}</DialogTitle>
                              <p className="text-lg text-white/90 font-medium">By {book.author}</p>
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
                                      <p className="text-xs text-muted-foreground">ISBN</p>
                                      <p className="text-sm font-medium">{book.isbn}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-3 pt-4 border-t">
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
