import React from 'react';
import { getProducts, getCategories, getOrders } from '../../../lib/supabase';
import AdminClient from '../AdminClient';

export default async function AdminProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const orders = await getOrders();

  return (
    <AdminClient
      initialProducts={products}
      initialCategories={categories}
      initialOrders={orders}
      initialTab="products"
    />
  );
}
