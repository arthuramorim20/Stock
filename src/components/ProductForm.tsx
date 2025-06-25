import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

interface ProductFormProps {
  productId?: string;
  isEdit?: boolean;
}

const ProductForm = ({ productId, isEdit = false }: ProductFormProps) => {
  const navigate = useNavigate();
  
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
  const [categories, setCategories] = useState<{ id: number; nome: string }[]>([]);

  // Buscar categorias da tabela 'categorias'
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categorias')
          .select('id, nome')
          .order('nome', { ascending: true });

        if (error) throw error;

        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Buscar dados do produto se for edição
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .eq('id', parseInt(productId))
          .single();

        if (error) throw error;

        setFormData({
          nome: data.nome,
          sku: data.sku,
          descricao: data.descricao || "",
          preco: data.preco.toString(),
          estoque: data.estoque?.toString() || "0",
          categoria: data.categoria_id ? data.categoria_id.toString() : "",
        });
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to load product data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isEdit) {
      fetchProduct();
    }
  }, [productId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        nome: formData.nome,
        sku: formData.sku,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco),
        estoque: parseInt(formData.estoque),
        categoria_id: formData.categoria ? parseInt(formData.categoria) : null,
      };

      if (isEdit && productId) {
        const { error } = await supabase
          .from('produtos')
          .update(productData)
          .eq('id', parseInt(productId))
          .select();
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Produto foi criado com sucesso."
        });
        navigate(`/products/${productId}`);
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert([productData])
          .select();
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Product has been created successfully."
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} product: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, categoria: value }));
  };

  if (isEdit && isLoading) {
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
          <Link to={isEdit && productId ? `/` : "/"}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Package className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{isEdit ? "Editar produto" : "Criar novo produto"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do produto *</Label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU/Código *</Label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preco">Preço *</Label>
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
            <Label htmlFor="estoque">Quantidade</Label>
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
            <Label htmlFor="categoria">Categoria</Label>
            <Select 
              value={formData.categoria} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.nome}
                  </SelectItem>
                ))}
                {/* Remova a opção de adicionar nova categoria aqui, se não for implementar */}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
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
