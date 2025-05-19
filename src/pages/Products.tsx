import { useState } from "react";
import Navbar from "@/components/Navbar";
import { mockCategories, mockProducts } from "@/data/mockData";
import ProductCard from "@/components/ProductCard";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  const filteredProducts = mockProducts.filter(product => {
    // Search filter
    const matchesSearch =
      product.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory ? product.categoria === selectedCategory : true;

    // Stock level filter
    const matchesStockLevel = stockFilter ? product.stockLevel === stockFilter : true;

    return matchesSearch && matchesCategory && matchesStockLevel;
  });

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your product inventory</p>
          </div>
          <Button asChild>
            <Link to="/products/new">Add New Product</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SearchInput
            placeholder="Search products..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full"
          />

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {mockCategories.map(category => (
                <SelectItem key={category.id} value={category.nome}>
                  {category.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by stock level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Stock Levels</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="medium">Medium Stock</SelectItem>
              <SelectItem value="high">High Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                id={product.id.toString()}
                name={product.nome}
                category={product.categoria}
                price={product.preco}
                stockLevel={product.stockLevel}
                quantity={product.estoque}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-xl text-muted-foreground mb-4">No products match your search criteria</p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setSelectedCategory("");
              setStockFilter("");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;