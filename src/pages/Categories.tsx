import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search } from "lucide-react";

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newCategory, setNewCategory] = useState({ nome: "", descricao: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesData, setCategoriesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data: products, error } = await supabase
        .from("produtos")
        .select("categoria");

      if (error) throw error;

      // Count and group products by category
      const categoryCounts = {};
      products.forEach(product => {
        if (product.categoria) {
          categoryCounts[product.categoria] = (categoryCounts[product.categoria] || 0) + 1;
        }
      });

      // Format results
      const formattedCategories = Object.entries(categoryCounts).map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'), // generate id from name
        nome: name,
        productCount: count,
        descricao: `Collection of ${count} ${count === 1 ? 'product' : 'products'}`
      }));

      setCategoriesData(formattedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategory.nome.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a product with the new category (or update existing one)
      const { error } = await supabase
        .from("produtos")
        .insert({
          nome: `${newCategory.nome}`,
          sku: `CAT-${Date.now()}`,
          preco: 0,
          estoque: 0,
          categoria: newCategory.nome,
          descricao: newCategory.descricao || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "New category has been created successfully."
      });

      // Refetch categories
      fetchCategories();
      setNewCategory({ nome: "", descricao: "" });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create category",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categoriesData?.filter(category => 
    category.nome.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <div className="container py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Manage your product categories</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Category Name</Label>
                  <Input 
                    id="nome" 
                    value={newCategory.nome} 
                    onChange={e => setNewCategory({...newCategory, nome: e.target.value})} 
                    placeholder="Enter category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Description (Optional)</Label>
                  <Textarea 
                    id="descricao" 
                    value={newCategory.descricao} 
                    onChange={e => setNewCategory({...newCategory, descricao: e.target.value})} 
                    placeholder="Enter category description"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateCategory} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle>{category.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">{category.descricao}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-medium">
                      {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/categories/${encodeURIComponent(category.nome)}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No categories found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? "Try a different search term" : "Create your first category to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
