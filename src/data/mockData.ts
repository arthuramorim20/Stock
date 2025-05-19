
import { Category, DashboardStat, Product } from "../types";

export const mockProducts: Product[] = [
  {
    id: 1,
    nome: "Wireless Headphones",
    descricao: "Premium noise cancelling wireless headphones with long battery life",
    categoria: "Electronics",
    preco: 199.99,
    estoque: 45,
    stockLevel: "high",
    sku: "EL-WH-001",
    criado_em: "2023-03-15T10:30:00Z"
  },
  {
    id: 2,
    nome: "Smart Watch",
    descricao: "Fitness and health tracking smartwatch with heart rate monitor",
    categoria: "Electronics",
    preco: 249.99,
    estoque: 18,
    stockLevel: "medium",
    sku: "EL-SW-002",
    criado_em: "2023-02-10T09:45:00Z"
  },
  {
    id: 3,
    nome: "Cadeira Ergonômica",
    descricao: "Adjustable office chair with lumbar support",
    categoria: "Furniture",
    preco: 189.99,
    estoque: 7,
    stockLevel: "low",
    sku: "FU-OC-001",
    criado_em: "2023-01-25T13:15:00Z"
  },
  {
    id: 4,
    nome: "Mechanical Keyboard",
    descricao: "Mechanical gaming keyboard with RGB lighting",
    categoria: "Electronics",
    preco: 129.99,
    estoque: 0,
    stockLevel: "out",
    sku: "EL-KB-003",
    criado_em: "2023-03-05T15:20:00Z"
  },
  {
    id: 5,
    nome: "Standing Desk",
    descricao: "Adjustable height standing desk for home office",
    categoria: "Furniture",
    preco: 349.99,
    estoque: 12,
    stockLevel: "medium",
    sku: "FU-SD-002",
    criado_em: "2023-02-18T11:30:00Z"
  },
  {
    id: 6,
    nome: "Laptop Backpack",
    descricao: "Waterproof laptop backpack with USB charging port",
    categoria: "Accessories",
    preco: 59.99,
    estoque: 32,
    stockLevel: "high",
    sku: "AC-BP-001",
    criado_em: "2023-03-01T10:00:00Z"
  },
  {
    id: 7,
    nome: "Wireless Mouse",
    descricao: "Ergonomic wireless mouse with adjustable DPI",
    categoria: "Electronics",
    preco: 39.99,
    estoque: 8,
    stockLevel: "low",
    sku: "EL-WM-004",
    criado_em: "2023-03-12T16:45:00Z"
  },
  {
    id: 8,
    nome: "External SSD",
    descricao: "1TB portable external solid state drive",
    categoria: "Electronics",
    preco: 159.99,
    estoque: 15,
    stockLevel: "medium",
    sku: "EL-SSD-005",
    criado_em: "2023-02-28T09:15:00Z"
  }
];

export const mockCategories: Category[] = [
  {
    id: "1",
    nome: "Electronics",
    descricao: "Electronic devices and gadgets",
    productCount: 5
  },
  {
    id: "2",
    nome: "Furniture",
    descricao: "Office and home furniture",
    productCount: 2
  },
  {
    id: "3",
    nome: "Accessories",
    descricao: "Various accessories and add-ons",
    productCount: 1
  }
];

export const mockDashboardStats: DashboardStat = {
  totalProducts: mockProducts.length,
  lowStockProducts: mockProducts.filter(p => p.stockLevel === "low").length,
  outOfStockProducts: mockProducts.filter(p => p.stockLevel === "out").length,
  totalValue: mockProducts.reduce((sum, product) => sum + (product.preco * product.estoque), 0)
};
