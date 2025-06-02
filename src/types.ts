
export interface Product {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  estoque: number;
  stockLevel: 'low' | 'medium' | 'high' | 'out';
  sku: string;
  criado_em: string;
}

export interface Category {
  id: string;
  nome: string;
  descricao: string;
  productCount: number;
}

export interface DashboardStat {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
}

