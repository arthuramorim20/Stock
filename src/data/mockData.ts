
import { Category, DashboardStat, Product } from "../types";
import { supabase } from "@/integrations/supabase/client";

export const { data: produtos, error } = await supabase
    .from('produtos')
    .select('*');

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
