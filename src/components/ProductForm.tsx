
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Package } from "lucide-react";
import { Link } from "react-router-dom";
// import { supabase } from '../integrations/supabase/'

interface ProductFormProps {
  productId?: string;
  isEdit?: boolean;
}

const ProductForm = ({ productId, isEdit = false }: ProductFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    nome: "",
    sku: "",
    descricao: "",
    preco: "",
    estoque: "",
    categoria: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('categoria')
        .not('categoria', 'is', null)
        .order('categoria', { ascending: true });
      
      if (error) throw error;
      
      const uniqueCategories = [...new Set(data.map(item => item.categoria))].filter(Boolean);
      
      return uniqueCategories;
    },
    initialData: [],
  });

  // If editing, fetch existing product data
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', parseInt(productId))
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  useEffect(() => {
    if (productData) {
      setFormData({
        nome: productData.nome,
        sku: productData.sku,
        descricao: productData.descricao || "",
        preco: productData.preco.toString(),
        estoque: productData.estoque?.toString() || "0",
        categoria: productData.categoria || "",
      });
    }
  }, [productData]);

  type ProductInsert = {
    nome: string;
    sku: string;
    descricao?: string | null;
    preco: number;
    estoque?: number;
    categoria?: string | null;
  };

  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductInsert) => {
      const { data, error } = await supabase
        .from('produtos')
        .insert([productData])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product has been created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create product: ${error.message}`,
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, productData }: { id: string, productData: unknown }) => {
      const { data, error } = await supabase
        .from('produtos')
        .update(productData)
        .eq('id', parseInt(id))
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      navigate(`/products/${productId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update product: ${error.message}`,
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, categoria: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.nome || !formData.sku || !formData.preco) {
        throw new Error("Name, SKU and Price are required fields.");
      }

      // Convert types
      const productData = {
        nome: formData.nome,
        sku: formData.sku,
        descricao: formData.descricao || null,
        preco: parseFloat(formData.preco),
        estoque: parseInt(formData.estoque) || 0,
        categoria: formData.categoria || null,
      };

      if (isEdit && productId) {
        updateProductMutation.mutate({ id: productId, productData });
      } else {
        createProductMutation.mutate(productData);
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: error instanceof Error ? error.message : "Please check your form inputs.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to={isEdit && productId ? `/products/${productId}` : "/"}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Package className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{isEdit ? "Edit Product" : "Create New Product"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Product Name *</Label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU/Code *</Label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preco">Price *</Label>
            <Input
              id="preco"
              name="preco"
              type="number"
              min="0"
              step="0.01"
              value={formData.preco}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estoque">Quantity</Label>
            <Input
              id="estoque"
              name="estoque"
              type="number"
              min="0"
              value={formData.estoque}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Category</Label>
            <Select 
              value={formData.categoria} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category, index) => (
                  <SelectItem key={index} value={category}>
                    {category}
                  </SelectItem>
                ))}
                <SelectItem value="new">+ Add New Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Description</Label>
          <Textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            rows={5}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">●</span>
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEdit ? "Update Product" : "Create Product"
            )}
          </Button>
          <Button variant="outline" type="button" asChild>
            <Link to={isEdit && productId ? `/products/${productId}` : "/"}>
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
