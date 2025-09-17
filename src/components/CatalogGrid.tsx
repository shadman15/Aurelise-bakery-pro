import React from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
}

interface CatalogGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const CatalogGrid: React.FC<CatalogGridProps> = ({ products, onAddToCart }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {products.map((product) => (
      <div key={product.id} className="bg-white rounded shadow p-4 flex flex-col items-center">
        <div className="w-24 h-24 bg-gray-100 rounded mb-2 flex items-center justify-center">
          {product.image ? (
            <img src={product.image} alt={product.name} className="object-cover w-full h-full rounded" />
          ) : (
            <span className="text-gray-400 text-3xl">🍰</span>
          )}
        </div>
        <div className="font-semibold">{product.name}</div>
        <div className="text-primary font-bold mb-2">£{product.price.toFixed(2)}</div>
        <button
          className="bg-primary text-white px-4 py-1 rounded hover:bg-primary/90 transition"
          onClick={() => onAddToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    ))}
  </div>
);

export default CatalogGrid;