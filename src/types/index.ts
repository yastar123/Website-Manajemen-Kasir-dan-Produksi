export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  price: number;
  supplier: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  recipe: Recipe[];
  isActive: boolean;
}

export interface Recipe {
  materialId: string;
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: TransactionItem[];
  total: number;
  paymentMethod: string;
  cashierName: string;
}

export interface TransactionItem {
  menuId: string;
  menuName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  date: string;
  materialId: string;
  materialName: string;
  quantity: number;
  price: number;
  total: number;
  supplier: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

export interface DashboardStats {
  todaySales: number;
  totalTransactions: number;
  bestSelling: MenuItem | null;
  lowStockItems: RawMaterial[];
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
}