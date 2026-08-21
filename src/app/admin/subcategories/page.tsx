import React from 'react';
import { getProducts, getCategories, getOrders, getSubcategories } from '../../../lib/supabase';
import AdminClient from '../AdminClient';

export default async function AdminSubcategoriesPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const orders = await getOrders();
  const subcategories = await getSubcategories();

  return (
    <AdminClient
      initialProducts={products}
      initialCategories={categories}
      initialSubcategories={subcategories}
      initialOrders={orders}
      initialTab="subcategories"
    />
  );
}
