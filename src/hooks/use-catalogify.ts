'use client';

import { useCallback } from 'react';
import { 
  useFirestore, 
  useAuth, 
  useUser, 
  useCollection, 
  useDoc, 
  useMemoFirebase,
  updateDocumentNonBlocking,
  setDocumentNonBlocking,
  deleteDocumentNonBlocking
} from '@/firebase';
import { 
  collection, 
  doc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut 
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

  // 1. Check Admin status via roles_admin collection
  const adminRoleRef = useMemoFirebase(() => user ? doc(firestore, 'roles_admin', user.uid) : null, [firestore, user]);
  const { data: adminRoleDoc } = useDoc(adminRoleRef);
  const isAdmin = !!adminRoleDoc;

  // 2. Public Catalog
  const booksQuery = useMemoFirebase(() => collection(firestore, 'books'), [firestore]);
  const { data: books, isLoading: isBooksLoading } = useCollection<Book>(booksQuery);

  // 3. Current Member Profile
  const memberRef = useMemoFirebase(() => user ? doc(firestore, 'members', user.uid) : null, [firestore, user]);
  const { data: currentMember, isLoading: isCurrentMemberLoading } = useDoc<Member>(memberRef);

  // 4. Admin-Only Collections (Deferred until isAdmin is confirmed)
  const allMembersQuery = useMemoFirebase(() => isAdmin ? collection(firestore, 'members') : null, [firestore, isAdmin]);
  const { data: allMembers } = useCollection<Member>(allMembersQuery);

  const allTransactionsQuery = useMemoFirebase(() => isAdmin ? collection(firestore, 'transactions') : null, [firestore, isAdmin]);
  const { data: allTransactions } = useCollection<Transaction>(allTransactionsQuery);

  // 5. Member-Specific Transactions (QAP)
  const userTransactionsQuery = useMemoFirebase(() => {
    if (!user || isAdmin) return null;
    return query(collection(firestore, 'transactions'), where('memberId', '==', user.uid));
  }, [firestore, user, isAdmin]);
  const { data: userTransactions } = useCollection<Transaction>(userTransactionsQuery);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => signOut(auth);

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
      return weeksOverdue * 5;
    }
    return 0;
  }, []);

  const addBook = (bookData: Omit<Book, 'id' | 'availableCopies'>) => {
    const colRef = collection(firestore, 'books');
    const newDocRef = doc(colRef);
    const data = {
      ...bookData,
      id: newDocRef.id,
      availableCopies: bookData.totalCopies,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    setDocumentNonBlocking(newDocRef, data, { merge: true });
  };

  const checkOutBook = (bookId: string, memberId: string) => {
    const book = books?.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) return false;

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + LOAN_DAYS);

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

    setDocumentNonBlocking(doc(firestore, 'transactions', transactionId), transactionData, { merge: true });
    updateDocumentNonBlocking(doc(firestore, 'books', bookId), {
      availableCopies: book.availableCopies - 1,
      updatedAt: serverTimestamp(),
    });
    return true;
  };

  const checkInBook = (transactionId: string) => {
    const transaction = (allTransactions || userTransactions)?.find(t => t.id === transactionId);
    if (!transaction || transaction.status === 'returned') return;

    updateDocumentNonBlocking(doc(firestore, 'transactions', transactionId), {
      status: 'returned',
      returnDate: new Date().toISOString().split('T')[0],
      updatedAt: serverTimestamp(),
    });

    const book = books?.find(b => b.id === transaction.bookId);
    if (book) {
      updateDocumentNonBlocking(doc(firestore, 'books', book.id), {
        availableCopies: Math.min(book.availableCopies + 1, book.totalCopies),
        updatedAt: serverTimestamp(),
      });
    }
  };

  return {
    books: books || [],
    members: allMembers || [],
    transactions: isAdmin ? (allTransactions || []) : (userTransactions || []),
    currentUser: currentMember,
    isUserLoading,
    isAdmin,
    login,
    logout,
    addBook,
    deleteBook: (id: string) => deleteDocumentNonBlocking(doc(firestore, 'books', id)),
    addMember: (data: any) => setDocumentNonBlocking(doc(collection(firestore, 'members')), data, { merge: true }),
    deleteMember: (id: string) => deleteDocumentNonBlocking(doc(firestore, 'members', id)),
    checkOutBook,
    checkInBook,
    calculateFine,
    isInitialLoading: isBooksLoading || isCurrentMemberLoading
  };
}
