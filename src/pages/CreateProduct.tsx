
import Navbar from "@/components/Navbar";
import ProductForm from "@/components/ProductForm";

const CreateProduct = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6">
        <ProductForm />
      </div>
    </div>
  );
};

export default CreateProduct;
