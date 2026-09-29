import { Metadata } from 'next';
import { catalogService } from '@/services/catalog.service';
import { ProductDetailClient } from '@/components/features/product/ProductDetailClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    if (!slug) throw new Error('No slug provided');
    const product = await catalogService.publicProductDetail(slug);
    return {
      title: `${product.name} | Axiora Store`,
      description: product.short_description || `Buy ${product.name} at the best price on Axiora Store.`,
      openGraph: {
        title: `${product.name} | Axiora Store`,
        description: product.short_description || `Buy ${product.name} at the best price on Axiora Store.`,
        url: `https://axiora-store.com/product/${slug}`,
        images:
          product.images &&
          product.images.filter((image) => image.is_main).map((image) => image.image),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      title: 'Product Not Found | Axiora Store',
      description: 'The requested product could not be found.',
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
