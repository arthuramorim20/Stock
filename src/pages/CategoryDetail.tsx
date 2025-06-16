import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import SearchInput from "@/components/SearchInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CategoryDetail = () => {
  const { id: categoryName } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [editCategory, setEditCategory] = useState({ nome: "", descricao: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const decodedCategoryName = categoryName ? decodeURIComponent(categoryName) : "";
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('categoria', decodedCategoryName);

        if (error) throw error;

        // Add computed stockLevel property
        const productsWithStockLevel = data.map(product => ({
          ...product,
          stockLevel: product.estoque === 0
            ? 'out'
            : product.estoque < 10
              ? 'low'
              : product.estoque < 50
                ? 'medium'
                : 'high'
        }));

        setProducts(productsWithStockLevel);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [decodedCategoryName]);

  // Get category stats
  const totalProducts = products.length;
  const totalItems = products.reduce((sum, product) => sum + product.estoque, 0);
  const totalValue = products.reduce((sum, product) => sum + (product.preco * product.estoque), 0);

  // Initialize edit form with current category data
  useEffect(() => {
    if (decodedCategoryName) {
      setEditCategory({
        nome: decodedCategoryName,
        descricao: `Category for ${decodedCategoryName} products`
      });
    }
  }, [decodedCategoryName]);

  const handleEditCategory = async () => {
    if (!editCategory.nome.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update all products in this category to the new category name
      const { error } = await supabase
        .from('produtos')
        .update({ categoria: editCategory.nome })
        .eq('categoria', decodedCategoryName);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category has been updated successfully."
      });

      // Navigate to the new category page if name changed
      if (editCategory.nome !== decodedCategoryName) {
        navigate(`/categories/${encodeURIComponent(editCategory.nome)}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update category",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    setIsDeleting(true);

    try {
      // Update all products in this category to have null category
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('categoria', decodedCategoryName)
      if (error) throw error;

      toast({
        title: "Success",
        description: "Category has been deleted successfully."
      });

      navigate('/categories');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive"
      });
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/categories">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar à Categorias
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{decodedCategoryName}</h1>
            <p className="text-muted-foreground">Category details and products</p>
          </div>

          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Category Name</Label>
                    <Input
                      id="nome"
                      value={editCategory.nome}
                      onChange={e => setEditCategory({ ...editCategory, nome: e.target.value })}
                      placeholder="Enter category name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Description (Optional)</Label>
                    <Textarea
                      id="descricao"
                      value={editCategory.descricao}
                      onChange={e => setEditCategory({ ...editCategory, descricao: e.target.value })}
                      placeholder="Descrição da categoria"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleEditCategory} disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Category"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete the category "{decodedCategoryName}". Products in this category will no longer be assigned to any category.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCategory}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalProducts}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalItems} unidades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R${totalValue.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex">
          <SearchInput
            placeholder="Search products in this category..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
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
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">
              {searchQuery ? "No products match your search" : "No products in this category"}
            </h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? "Try a different search term" : "Add products to this category to see them here"}
            </p>
            <Button className="mt-4" asChild>
              <Link to="/products/new">Add New Product</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetail;
