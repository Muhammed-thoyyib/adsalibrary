"use client";

import { useCallback } from 'react';
import { 
  useFirestore, 
  useAuth, 
  useUser, 
  useCollection, 
  useDoc, 
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking
} from '@/firebase';
import { 
  collection, 
  doc, 
  query, 
  where, 
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut,
  type User
} from 'firebase/auth';

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  location: string;
  summary?: string;
  keyThemes?: string[];
  createdAt?: any;
  updatedAt?: any;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  memberId: string;
  role: 'admin' | 'user';
  createdAt?: any;
  updatedAt?: any;
};

export type Transaction = {
  id: string;
  bookId: string;
  memberId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'issued' | 'returned';
};

const LOAN_DAYS = 14;

export function useCatalogify() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // Memoized Collections
  const booksQuery = useMemoFirebase(() => collection(firestore, 'books'), [firestore]);
  const { data: books, isLoading: isBooksLoading } = useCollection<Book>(booksQuery);

  const membersQuery = useMemoFirebase(() => collection(firestore, 'members'), [firestore]);
  const { data: members, isLoading: isMembersLoading } = useCollection<Member>(membersQuery);

  const transactionsQuery = useMemoFirebase(() => collection(firestore, 'transactions'), [firestore]);
  const { data: transactions, isLoading: isTransactionsLoading } = useCollection<Transaction>(transactionsQuery);

  // Current Member Data
  const memberRef = useMemoFirebase(() => user ? doc(firestore, 'members', user.uid) : null, [firestore, user]);
  const { data: currentMember } = useDoc<Member>(memberRef);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const logout = () => {
    signOut(auth);
  };

  const calculateFine = useCallback((transaction: Transaction | null): number => {
    if (!transaction || transaction.status === 'returned') return 0;
    
    const dueDate = new Date(transaction.dueDate);
    const today = new Date();
    
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      const weeksOverdue = Math.ceil(diffDays / 7);
      // Rs 5 for first week, increases by Rs 5 every subsequent week
      // (week1: 5, week2: 10, week3: 15...)
      return weeksOverdue * 5;
    }
    return 0;
  }, []);

  const addBook = (bookData: Omit<Book, 'id'>) => {
    const colRef = collection(firestore, 'books');
    const newDocRef = doc(colRef);
    const data = {
      ...bookData,
      id: newDocRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    setDocumentNonBlocking(newDocRef, data, { merge: true });
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    const docRef = doc(firestore, 'books', id);
    updateDocumentNonBlocking(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteBook = (id: string) => {
    const docRef = doc(firestore, 'books', id);
    deleteDocumentNonBlocking(docRef);
  };

  const addMember = (memberData: Omit<Member, 'id'>) => {
    const colRef = collection(firestore, 'members');
    const newDocRef = doc(colRef);
    const data = {
      ...memberData,
      id: newDocRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    setDocumentNonBlocking(newDocRef, data, { merge: true });
  };

  const deleteMember = (id: string) => {
    const docRef = doc(firestore, 'members', id);
    deleteDocumentNonBlocking(docRef);
  };

  const checkOutBook = (bookId: string, memberId: string) => {
    const book = books?.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) return false;

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + LOAN_DAYS);

    const colRef = collection(firestore, 'transactions');
    const transactionId = Math.random().toString(36).substring(7);
    const transactionData = {
      id: transactionId,
      bookId,
      memberId,
      issueDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'issued',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    setDocumentNonBlocking(doc(colRef, transactionId), transactionData, { merge: true });
    updateBook(bookId, { availableCopies: book.availableCopies - 1 });
    return true;
  };

  const checkInBook = (transactionId: string) => {
    const transaction = transactions?.find(t => t.id === transactionId);
    if (!transaction || transaction.status === 'returned') return;

    const returnDate = new Date().toISOString().split('T')[0];
    const docRef = doc(firestore, 'transactions', transactionId);
    
    updateDocumentNonBlocking(docRef, {
      status: 'returned',
      returnDate,
      updatedAt: serverTimestamp(),
    });

    const book = books?.find(b => b.id === transaction.bookId);
    if (book) {
      updateBook(book.id, { availableCopies: Math.min(book.availableCopies + 1, book.totalCopies) });
    }
  };

  return {
    books: books || [],
    members: members || [],
    transactions: transactions || [],
    currentUser: currentMember,
    isUserLoading,
    login,
    logout,
    addBook,
    updateBook,
    deleteBook,
    addMember,
    deleteMember,
    checkOutBook,
    checkInBook,
    calculateFine,
    isInitialLoading: isBooksLoading || isMembersLoading || isTransactionsLoading
  };
}
