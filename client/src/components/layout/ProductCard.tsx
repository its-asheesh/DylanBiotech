import React from 'react';
import type { Product } from '../../types/product.d.ts';

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition duration-300">
      <img
        src={`http://localhost:5000/${product.image}`}
        alt={product.name}
        className="w-full h-48 object-cover mb-3 rounded"
      />
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="text-sm text-gray-500">{product.brand}</p>
      <p className="text-green-700 font-bold">₹{product.price}</p>
    </div>
  );
};

export default ProductCard;
