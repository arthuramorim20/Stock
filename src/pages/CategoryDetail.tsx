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
      // Buscar o id da categoria pelo nome
      const { data: categoria, error: catError } = await supabase
        .from('categorias')
        .select('id')
        .eq('nome', decodedCategoryName)
        .single();

      if (catError || !categoria) {
        toast({
          title: "Error",
          description: "Categoria inválida.",
          variant: "destructive"
        });
        setIsLoading(false);
        setProducts([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('categoria_id', categoria.id);

        if (error) throw error;

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
          description: error instanceof Error ? error.message : JSON.stringify(error),
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
      // 1. Buscar o id da categoria atual
      const { data: oldCategory, error: oldCatError } = await supabase
        .from('categorias')
        .select('id')
        .eq('nome', decodedCategoryName)
        .single();

      if (oldCatError || !oldCategory) throw oldCatError || new Error("Categoria original não encontrada");

      // 2. Buscar o id da nova categoria
      const { data: newCategory, error: newCatError } = await supabase
        .from('categorias')
        .select('id')
        .eq('nome', editCategory.nome)
        .single();

      if (newCatError || !newCategory) throw newCatError || new Error("Nova categoria não encontrada");

      // 3. Atualizar os produtos para a nova categoria_id
      const { error } = await supabase
        .from('produtos')
        .update({ categoria_id: newCategory.id })
        .eq('categoria_id', oldCategory.id);

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
      // Buscar o id da categoria pelo nome
      const { data: categoria, error: catError } = await supabase
        .from('categorias')
        .select('id')
        .eq('nome', decodedCategoryName)
        .single();

      if (catError || !categoria) throw catError || new Error("Categoria inválida.");

      // Deletar produtos dessa categoria
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('categoria_id', categoria.id);

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
                  Editar categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar categoria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da categoria</Label>
                    <Input
                      id="nome"
                      value={editCategory.nome}
                      onChange={e => setEditCategory({ ...editCategory, nome: e.target.value })}
                      placeholder="Enter category name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição (Opcional)</Label>
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
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleEditCategory} disabled={isSubmitting}>
                    {isSubmitting ? "Atualizando..." : "Atualizar Categoria"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
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
                    {isDeleting ? "Deletando..." : "Deletar"}
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
              <CardTitle>Total do inventário</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalItems} unidades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valor Inventário</CardTitle>
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
              <Link to="/products/new">Adicionar novo produto</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetail;
