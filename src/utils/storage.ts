import { RawMaterial, MenuItem, Transaction, Purchase, Expense, User } from '../types';

const STORAGE_KEYS = {
  USERS: 'pos_users',
  RAW_MATERIALS: 'pos_raw_materials',
  MENU_ITEMS: 'pos_menu_items',
  TRANSACTIONS: 'pos_transactions',
  PURCHASES: 'pos_purchases',
  EXPENSES: 'pos_expenses',
  CURRENT_USER: 'pos_current_user'
};

export class StorageService {
  // Initialize with dummy data if storage is empty
  static initializeData() {
    if (!this.getUsers().length) {
      this.initializeDummyData();
    }
  }

  static initializeDummyData() {
    // Dummy users
    const users: User[] = [
      {
        id: '1',
        email: 'admin@kasir.com',
        password: 'admin123',
        name: 'Admin Kasir',
        role: 'admin'
      }
    ];

    // Dummy raw materials
    const rawMaterials: RawMaterial[] = [
      {
        id: '1',
        name: 'Tepung Terigu',
        unit: 'kg',
        stock: 50,
        minStock: 10,
        price: 12000,
        supplier: 'PT. Sumber Pangan'
      },
      {
        id: '2',
        name: 'Gula Pasir',
        unit: 'kg',
        stock: 25,
        minStock: 5,
        price: 15000,
        supplier: 'Toko Manis Jaya'
      },
      {
        id: '3',
        name: 'Telur Ayam',
        unit: 'butir',
        stock: 200,
        minStock: 50,
        price: 2500,
        supplier: 'Peternakan Sari'
      },
      {
        id: '4',
        name: 'Mentega',
        unit: 'kg',
        stock: 8,
        minStock: 2,
        price: 35000,
        supplier: 'Dairy Fresh'
      }
    ];

    // Dummy menu items
    const menuItems: MenuItem[] = [
      {
        id: '1',
        name: 'Kue Brownies',
        category: 'Kue',
        price: 25000,
        isActive: true,
        recipe: [
          { materialId: '1', quantity: 0.2 },
          { materialId: '2', quantity: 0.15 },
          { materialId: '3', quantity: 2 },
          { materialId: '4', quantity: 0.1 }
        ]
      },
      {
        id: '2',
        name: 'Roti Manis',
        category: 'Roti',
        price: 15000,
        isActive: true,
        recipe: [
          { materialId: '1', quantity: 0.3 },
          { materialId: '2', quantity: 0.05 },
          { materialId: '3', quantity: 1 },
          { materialId: '4', quantity: 0.05 }
        ]
      }
    ];

    // Initialize dummy transactions for today
    const today = new Date().toISOString().split('T')[0];
    const transactions: Transaction[] = [
      {
        id: '1',
        date: today,
        cashierName: 'Admin Kasir',
        paymentMethod: 'Tunai',
        total: 50000,
        items: [
          {
            menuId: '1',
            menuName: 'Kue Brownies',
            quantity: 2,
            price: 25000,
            subtotal: 50000
          }
        ]
      }
    ];

    this.setUsers(users);
    this.setRawMaterials(rawMaterials);
    this.setMenuItems(menuItems);
    this.setTransactions(transactions);
    this.setPurchases([]);
    this.setExpenses([]);
  }

  // Users
  static getUsers(): User[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  static setUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Raw Materials
  static getRawMaterials(): RawMaterial[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RAW_MATERIALS) || '[]');
  }

  static setRawMaterials(materials: RawMaterial[]): void {
    localStorage.setItem(STORAGE_KEYS.RAW_MATERIALS, JSON.stringify(materials));
  }

  // Menu Items
  static getMenuItems(): MenuItem[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MENU_ITEMS) || '[]');
  }

  static setMenuItems(items: MenuItem[]): void {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
  }

  // Transactions
  static getTransactions(): Transaction[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
  }

  static setTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  static addTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.setTransactions(transactions);
  }

  // Purchases
  static getPurchases(): Purchase[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PURCHASES) || '[]');
  }

  static setPurchases(purchases: Purchase[]): void {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }

  // Expenses
  static getExpenses(): Expense[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  }

  static setExpenses(expenses: Expense[]): void {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  // Update stock when transaction occurs
  static updateStockAfterSale(menuId: string, quantity: number): void {
    const menuItems = this.getMenuItems();
    const materials = this.getRawMaterials();
    
    const menu = menuItems.find(m => m.id === menuId);
    if (!menu) return;

    // Reduce raw material stock based on recipe
    menu.recipe.forEach(recipeItem => {
      const materialIndex = materials.findIndex(m => m.id === recipeItem.materialId);
      if (materialIndex !== -1) {
        materials[materialIndex].stock -= recipeItem.quantity * quantity;
      }
    });

    this.setRawMaterials(materials);
  }
}