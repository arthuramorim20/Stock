
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
  const queryClient = useQueryClient();
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', parseInt(id || "0"))
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', parseInt(id || "0"));
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted."
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate();
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
            <h2 className="text-2xl font-bold">Product Not Found</h2>
            <p className="text-muted-foreground mt-2">
              {error ? `Error: ${error.message}` : "The requested product could not be found."}
            </p>
            <Button asChild className="mt-4">
              <Link to="/products">Back to Products</Link>
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
            <Link to="/products">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-4 items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{product.nome}</h1>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">SKU: {product.sku}</span>
              <span>•</span>
              <span className="text-muted-foreground">Category: {product.categoria}</span>
              <StockBadge level={stockLevel} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/products/edit/${id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the product "{product.nome}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${product.preco.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{product.estoque} units</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${(product.preco * product.estoque).toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">Stock History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{product.descricao || "No description available."}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock History</CardTitle>
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
