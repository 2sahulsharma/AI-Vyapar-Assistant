export interface Product {
  id: string;
  name: string;
  price: number; // Selling Price
  costPrice: number; // Cost Price
  stock: number;
  imageUrl: string;
}

export interface Customer {
  id: string;
  name: string;
}

export interface InvoiceItem {
  productId: string;
  quantity: number;
  price: number; // Selling price at time of sale
  costPriceAtSale: number; // Cost price at time of sale for profit calculation
}

export interface Invoice {
  id: string;
  customerName: string;
  items: InvoiceItem[];
  total: number;
  date: string;
  status: 'Paid' | 'Due' | 'Overdue';
}

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  date: string;
}
