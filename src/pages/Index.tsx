
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import ProductCard from "@/components/ProductCard";
// import { mockDashboardStats, mockProducts } from "@/data/mockData";
import { Package, ShoppingCart, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SearchInput from "@/components/SearchInput";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type productProps = {
  id: number,
  nome: string,
  descricao: string,
  preco: number,
  categoria: string,
  sku: string,
  estoque: number,
  criado_em: string
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<productProps[]>([]);

  useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')

      if (error) throw error;

      setProducts(data)

      return data;
    },
    initialData: [],
  });

  const lowStockProducts = supabase.rpc('produtos_estoque_baixo', {
    limite_estoque: 2
  })

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <div className="container py-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your stock management dashboard</p>
          </div>
          <Button asChild>
            <Link to="/products/new">Add New Product</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value={mockDashboardStats.totalProducts}
            icon={<Package className="h-4 w-4" />}
          />
          <StatCard
            title="Low Stock Items"
            value={mockDashboardStats.lowStockProducts}
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <StatCard
            title="Out of Stock"
            value={mockDashboardStats.outOfStockProducts}
            icon={<ShoppingCart className="h-4 w-4" />}
          />
          <StatCard
            title="Total Inventory Value"
            value={`$${mockDashboardStats.totalValue.toFixed(2)}`}
            icon={<DollarSign className="h-4 w-4" />}
            trend={{ value: 12, isPositive: true }}
            description="from last month"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Produtos Recentes</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/products">Ver todos</Link>
                </Button>
              </div>
              <CardDescription>Produtos Adicionado Recentemente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map(product => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.nome}</p>
                      <p className="text-sm text-muted-foreground">{product.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${product.preco.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Qty: {product.estoque}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Products that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.nome}</p>
                        <p className="text-sm text-muted-foreground">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-inventory-low font-medium">
                          {product.stockLevel === "out" ? "Out of Stock" : `Only ${product.estoque} left`}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No low stock items</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>All Products</CardTitle>
                <CardDescription>Manage your inventory</CardDescription>
              </div>
              <SearchInput 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full sm:w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products
                .filter(product => 
                  product.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  product.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  product.sku.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id.toString()}
                    name={product.nome}
                    category={product.categoria}
                    price={product.preco}
                    stockLevel={"medium"}
                    quantity={product.estoque}
                  />
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
