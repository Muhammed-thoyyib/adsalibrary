"use client";

import { useState, useEffect } from 'react';
import { Book, Member, Transaction, INITIAL_BOOKS, INITIAL_MEMBERS, INITIAL_TRANSACTIONS } from '@/lib/mock-data';

export function useCatalogify() {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('bibliohub_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, role: 'admin' | 'user') => {
    const user = members.find(m => m.email === email && m.role === role) || {
      id: Math.random().toString(),
      name: email.split('@')[0],
      email,
      role,
      member_id: role === 'admin' ? 'ADM999' : 'LIB999',
      phone: 'N/A',
      status: 'active'
    } as Member;
    
    setCurrentUser(user);
    localStorage.setItem('bibliohub_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bibliohub_user');
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

  const issueBook = (bookId: string, memberId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.available_copies <= 0) return false;

    const newTransaction: Transaction = {
      id: Math.random().toString(),
      book_id: bookId,
      member_id: memberId,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'issued'
    };

    setTransactions(prev => [...prev, newTransaction]);
    updateBook(bookId, { available_copies: book.available_copies - 1 });
    return true;
  };

  const returnBook = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction || transaction.status === 'returned') return;

    setTransactions(prev => prev.map(t => 
      t.id === transactionId ? { ...t, status: 'returned', return_date: new Date().toISOString().split('T')[0] } : t
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
    issueBook,
    returnBook,
    setMembers
  };
}
