
import { Category, DashboardStat, Product } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from '@/integrations/types';


// To fetch products from supabase, use an async function:
export async function fetchMockProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from('produtos').select('*');
    if (error) throw error;
    return data as Product[];
}

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

export async function fetchDashboardStats(): Promise<DashboardStat> {
    const { data: products, error } = await supabase
        .from("produtos")
        .select("*");

    if (error) throw error;

    return {
        totalProducts: products.length,
        lowStockProducts: products.filter((p: Tables<"produtos">) => (p.stockLevel === "low" || (p.estoque ?? 0) <= 5)).length,
        outOfStockProducts: products.filter((p: Tables<"produtos">) => p.stockLevel === "out" || (p.estoque ?? 0) === 0).length,
        totalValue: products.reduce((sum: number, product: Tables<"produtos">) => sum + ((product.preco ?? 0) * (product.estoque ?? 0)), 0)
    };
}
