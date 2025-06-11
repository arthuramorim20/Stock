import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import StockBadge from "@/components/StockBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('id', parseInt(id || "0"))
          .single();
        
        if (error) throw error;
        setProduct(data);
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!id || isDeleting) return;
    
    setIsDeleting(true);
    try {
      // Call the delete_product stored procedure
      const { error } = await supabase
        .rpc('delete_product', {
          p_id: parseInt(id)
        });
      
      if (error) throw error;
      
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted."
      });
      setIsDialogOpen(false);
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Produto não encontrado</h2>
            <p className="text-muted-foreground mt-2">
              {error ? `Error: ${error.message}` : "The requested product could not be found."}
            </p>
            <Button asChild className="mt-4">
              <Link to="/">Voltar</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stock level based on quantity
  const stockLevel = product.estoque === 0 
    ? 'out' 
    : product.estoque < 10 
      ? 'low' 
      : product.estoque < 50 
        ? 'medium' 
        : 'high';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Link>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-4 items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{product.nome}</h1>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">SKU: {product.sku}</span>
              <span>•</span>
              <span className="text-muted-foreground">Categoria: {product.categoria}</span>
              <StockBadge level={stockLevel} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/products/edit/${id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                    This will permanently delete the product "{product.nome}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Preço</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R${product.preco.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{product.estoque} Unidades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Valor total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R${(product.preco * product.estoque).toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="history">Histórico de estoque</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{product.descricao || "Sem descrição."}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Stock history will be implemented in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetail;
