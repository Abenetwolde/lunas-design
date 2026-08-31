import React from 'react';
import { getProducts, getCategories } from '../../lib/supabase';
import { CatalogSection } from '../../components/CatalogSection';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ category?: string; sale?: string }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <CatalogSection
      initialProducts={products}
      categories={categories}
      initialCategorySlug={params.category}
      initialSaleOnly={params.sale === 'true'}
    />
  );
}
