export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  barcode: string;
  category: string;
  total_copies: number;
  available_copies: number;
  location: string;
  summary?: string;
  keyThemes?: string[];
};

export type Member = {
  id: string;
  name: string;
  email: string;
  member_id: string;
  phone: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
};

export type Transaction = {
  id: string;
  book_id: string;
  member_id: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: 'issued' | 'returned';
};

export const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    barcode: 'ADS-B001',
    category: 'Fiction',
    total_copies: 5,
    available_copies: 3,
    location: 'Shelf A1',
    summary: 'A story of wealth, love, and the American Dream in the 1920s.',
    keyThemes: ['Wealth', 'American Dream', 'Love', 'Social Class']
  },
  {
    id: '2',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    barcode: 'ADS-B002',
    category: 'Technology',
    total_copies: 3,
    available_copies: 1,
    location: 'Shelf T4',
    summary: 'A handbook of agile software craftsmanship.',
    keyThemes: ['Software Engineering', 'Best Practices', 'Agile']
  },
  {
    id: '3',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    isbn: '978-0374275631',
    barcode: 'ADS-B003',
    category: 'Psychology',
    total_copies: 4,
    available_copies: 4,
    location: 'Shelf P2',
    summary: 'Exploring the two systems that drive the way we think.',
    keyThemes: ['Behavioral Economics', 'Decision Making', 'Cognition']
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    member_id: 'LIB001',
    phone: '555-0101',
    role: 'user',
    status: 'active'
  },
  {
    id: 'm2',
    name: 'Chief Librarian',
    email: 'mthoyyib40@gmail.com',
    member_id: 'ADM001',
    phone: '555-0202',
    role: 'admin',
    status: 'active'
  },
  {
    id: 'm3',
    name: 'Admin Assistant',
    email: 'admin@adsalibrary.com',
    member_id: 'ADM002',
    phone: '555-0303',
    role: 'admin',
    status: 'active'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    book_id: '1',
    member_id: 'm1',
    issue_date: '2023-10-01',
    due_date: '2023-10-15',
    status: 'issued'
  }
];
