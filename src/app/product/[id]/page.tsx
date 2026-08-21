import React from 'react';
import { getProductBySlug, getProducts } from '../../../lib/supabase';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductBySlug(id);
  const allProducts = await getProducts();

  if (!product) {
    notFound();
  }

  const sameCategoryProducts = allProducts.filter(
    (p) =>
      p.id !== product.id &&
      (p.category.toLowerCase() === product.category.toLowerCase() ||
        p.category.toLowerCase().includes(product.category.toLowerCase()) ||
        product.category.toLowerCase().includes(p.category.toLowerCase()))
  );

  const otherProducts = allProducts.filter(
    (p) => p.id !== product.id && !sameCategoryProducts.some((scp) => scp.id === p.id)
  );

  const relatedProducts = [...sameCategoryProducts, ...otherProducts].slice(0, 4);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
