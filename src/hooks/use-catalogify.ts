"use client";

import { useState, useEffect } from 'react';
import { Book, Member, Transaction, INITIAL_BOOKS, INITIAL_MEMBERS, INITIAL_TRANSACTIONS } from '@/lib/mock-data';

export type LoginCredentials = {
  email?: string;
  password?: string;
  username?: string;
  name?: string;
  code?: string;
};

const LOAN_DAYS = 14; // 2 weeks
const FLAT_FINE = 5; // ₹5 flat fine

export function useCatalogify() {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('adsalibrary_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (role: 'admin' | 'user', creds: LoginCredentials) => {
    let user: Member | undefined;

    if (role === 'user') {
      user = members.find(m => 
        m.name.toLowerCase() === creds.name?.toLowerCase() && 
        m.member_id.toUpperCase() === creds.code?.toUpperCase() &&
        m.role === 'user'
      );
    } else {
      const ident = (creds.username || creds.email)?.toLowerCase();
      user = members.find(m => 
        (m.email?.toLowerCase() === ident || m.name.toLowerCase() === ident) && 
        m.role === 'admin' &&
        (m.password === undefined || m.password === creds.password)
      );
    }

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('adsalibrary_user', JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('adsalibrary_user');
  };

  const calculateFine = (transaction: Transaction): number => {
    const dueDate = new Date(transaction.due_date);
    const compareDate = transaction.status === 'returned' && transaction.return_date 
      ? new Date(transaction.return_date) 
      : new Date();
    
    // Normalize to midnight for fair comparison
    dueDate.setHours(0, 0, 0, 0);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate > dueDate) {
      return FLAT_FINE;
    }
    return 0;
  };

  const addBook = (book: Omit<Book, 'id'>) => {
    const newBook = { ...book, id: Math.random().toString() };
    setBooks(prev => [...prev, newBook]);
    return newBook;
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
  };

  const addMember = (member: Omit<Member, 'id'>) => {
    const newMember = { ...member, id: 'm' + Math.random().toString().slice(2, 6) };
    setMembers(prev => [...prev, newMember]);
    return newMember;
  };

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const issueBook = (bookId: string, memberId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.available_copies <= 0) return false;

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + LOAN_DAYS);

    const newTransaction: Transaction = {
      id: Math.random().toString(),
      book_id: bookId,
      member_id: memberId,
      issue_date: today.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      status: 'issued'
    };

    setTransactions(prev => [...prev, newTransaction]);
    updateBook(bookId, { available_copies: book.available_copies - 1 });
    return true;
  };

  const returnBook = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction || transaction.status === 'returned') return;

    const returnDate = new Date().toISOString().split('T')[0];
    
    setTransactions(prev => prev.map(t => 
      t.id === transactionId ? { ...t, status: 'returned', return_date: returnDate } : t
    ));

    const book = books.find(b => b.id === transaction.book_id);
    if (book) {
      updateBook(book.id, { available_copies: Math.min(book.available_copies + 1, book.total_copies) });
    }
  };

  return {
    books,
    members,
    transactions,
    currentUser,
    login,
    logout,
    addBook,
    updateBook,
    deleteBook,
    addMember,
    deleteMember,
    issueBook,
    returnBook,
    calculateFine,
  };
}
