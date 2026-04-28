"use client";

import { useState } from 'react';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Users, Clock, ArrowRight, Library } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-library');

  return (
    <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32 bg-primary">
          {heroImg && (
            <Image
              src={heroImg.imageUrl}
              alt="Library Hero"
              fill
              className="object-cover opacity-20 pointer-events-none"
              priority
              data-ai-hint="modern library"
            />
          )}
          <div className="container px-4 md:px-6 relative mx-auto text-center">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl text-white">
                Discover Your Next <span className="text-accent">Great Read</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-white/80 md:text-xl font-body">
                Search through thousands of titles, manage your borrowings, and explore a world of knowledge with ADSALIBRARY.
              </p>
              <div className="w-full max-w-2xl mt-8">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    className="w-full pl-12 pr-32 h-14 bg-white/95 border-none rounded-full shadow-lg text-lg focus-visible:ring-accent"
                    placeholder="Search by title, author, or ISBN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Link href={`/books?q=${encodeURIComponent(searchQuery)}`} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button className="rounded-full h-10 px-6 bg-accent text-accent-foreground hover:bg-accent/90">
                      Search
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center p-6 text-center space-y-4 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="p-3 bg-secondary rounded-full">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-semibold">Vast Collection</h3>
                <p className="text-muted-foreground">Access a diverse range of categories from classical literature to modern technology.</p>
              </div>
              <div className="flex flex-col items-center p-6 text-center space-y-4 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="p-3 bg-secondary rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-semibold">Community Driven</h3>
                <p className="text-muted-foreground">Manage your profile, join discussions, and recommend books to other members.</p>
              </div>
              <div className="flex flex-col items-center p-6 text-center space-y-4 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="p-3 bg-secondary rounded-full">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-headline font-semibold">24/7 Availability</h3>
                <p className="text-muted-foreground">Check real-time status of books and reserve your copies anytime, anywhere.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-20 bg-background border-t">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-headline font-bold">Popular Categories</h2>
              <Link href="/books" className="text-primary hover:underline flex items-center font-medium">
                View All Catalog <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Fiction', 'Technology', 'Psychology', 'History'].map((category) => (
                <Link key={category} href={`/books?category=${category}`} className="group relative overflow-hidden rounded-xl bg-card border shadow-sm aspect-[4/3] flex items-center justify-center transition-all hover:border-accent hover:shadow-md">
                  <span className="font-headline text-lg font-semibold group-hover:text-primary">{category}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-10 border-t bg-card">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <Library className="h-5 w-5 text-primary" />
              <span className="font-headline font-bold text-primary">ADSALIBRARY</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 ADSALIBRARY. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
