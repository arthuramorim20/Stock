
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6">
        <ProductForm productId={id} isEdit={true} />
      </div>
    </div>
  );
};

export default EditProduct;
