
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StockBadge from "@/components/StockBadge";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  stockLevel: "low" | "medium" | "high" | "out";
  quantity: number;
}

const ProductCard = ({
  id,
  name,
  category,
  price,
  stockLevel,
  quantity,
}: ProductCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">{category}</p>
          </div>
          <StockBadge level={stockLevel} />
        </div>
        <div className="my-2">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Valor</span>
            <span className="font-medium">R${price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Quantidade</span>
            <span className="font-medium">{quantity}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4 flex gap-2">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to={`/products/${id}`}>Ver detalhes</Link>
        </Button>
        <Button asChild size="sm" className="w-full">
          <Link to={`/products/edit/${id}`}>Editar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
