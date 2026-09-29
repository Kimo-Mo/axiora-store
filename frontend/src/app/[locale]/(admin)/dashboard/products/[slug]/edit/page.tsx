'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';

import type { StockMode, AttributeRow, ImageState } from '@/components/admin/products/types';
import { ProductBasicInfo } from '@/components/admin/products/ProductBasicInfo';
import { ProductImages } from '@/components/admin/products/ProductImages';
import { ProductTags } from '@/components/admin/products/ProductTags';
import { ProductAttributes } from '@/components/admin/products/ProductAttributes';

import { useCategoriesQuery } from '@/hooks/admin/useCategoriesQuery';
import { useTagsQuery } from '@/hooks/admin/useTagsQuery';
import { useProductDetailQuery } from '@/hooks/admin/useProductDetailQuery';
import { useUpdateProductMutation } from '@/hooks/admin/useUpdateProductMutation';
import { useCreateTagMutation, useDeleteTagMutation } from '@/hooks/admin/useTagMutations';
import type { ProductTag } from '@/types/catalog';

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const imagesRef = useRef<ImageState[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stockMode, setStockMode] = useState<StockMode>('automatic');
  const [manualFulfillmentTime, setManualFulfillmentTime] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [help, setHelp] = useState('');
  const [priceBeforeOffer, setPriceBeforeOffer] = useState('');
  const [offerValue, setOfferValue] = useState('');



  // Collections
  const [images, setImages] = useState<ImageState[]>([]);
  const [deletedImages, setDeletedImages] = useState<number[]>([]);
  const [attributes, setAttributes] = useState<AttributeRow[]>([]);
  const [deletedAttributes, setDeletedAttributes] = useState<number[]>([]);

  const [codesText, setCodesText] = useState('');

  // Categories & Tags
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const isHydrated = useRef(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isProductLoaded, setIsProductLoaded] = useState(false);

  useEffect(() => {
    if (priceBeforeOffer) {
      const basePrice = parseFloat(priceBeforeOffer);
      if (!isNaN(basePrice)) {
        if (offerValue) {
          const discount = parseFloat(offerValue);
          if (!isNaN(discount)) {
            const finalPrice = basePrice - (basePrice * (discount / 100));
            setPrice(finalPrice.toFixed(2));
          } else {
            setPrice(basePrice.toFixed(2));
          }
        } else {
          setPrice(basePrice.toFixed(2));
        }
      } else if (isProductLoaded) {
        setPrice('');
      }
    } else if (isProductLoaded) {
      setPrice('');
    }
  }, [priceBeforeOffer, offerValue, isProductLoaded]);

  const clearError = (field: string) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  // Queries & Mutations
  const categoriesQuery = useCategoriesQuery();
  const tagsQuery = useTagsQuery();
  const productQuery = useProductDetailQuery(slug);
  const updateMutation = useUpdateProductMutation();
  const createTagMutation = useCreateTagMutation();
  const deleteTagMutation = useDeleteTagMutation();

  const allCategories = categoriesQuery.data ?? [];
  const allTags = tagsQuery.data ?? [];

  // Data hydration
  useEffect(() => {
    if (!productQuery.data || isHydrated.current) return;
    isHydrated.current = true;

    const data = productQuery.data;

    const nextImages: ImageState[] = data.images?.length
      ? data.images.map((img) => ({ id: img.id, url: img.image, isMain: img.is_main }))
      : data.main_image && typeof data.main_image === 'object'
        ? [{ id: data.main_image.id, url: data.main_image.image, isMain: data.main_image.is_main }]
        : [];

    const nextAttributes: AttributeRow[] = (data.attributes ?? []).map((attr) => ({
      id: attr.id,
      name: attr.name,
      value: attr.value,
    }));

    const dataWithCategory = data as unknown as { category?: { id: number } };
    const nextCategory = dataWithCategory.category
      ? String(dataWithCategory.category.id)
      : data.categories?.length
        ? String(data.categories[0].id)
        : '';

    startTransition(() => {
      setName(data.name || '');
      setPrice(data.price ? String(Number(data.price).toFixed(2)) : '');
      setStockMode((data.stock_mode as StockMode) || 'automatic');
      setManualFulfillmentTime(
        data.manual_fulfillment_time ? String(data.manual_fulfillment_time) : ''
      );
      setShortDescription(data.short_description || '');
      setDescription(data.description || '');
      setIsActive(data.is_active ?? true);
      setIsAvailable(data.is_available ?? true);
      setIsPopular(data.is_popular ?? false);
      setIsFeatured(data.is_featured ?? false);
      setHelp(data.help || '');
      setPriceBeforeOffer(data.price_before_offer ? String(Number(data.price_before_offer).toFixed(2)) : '');
      setOfferValue(data.offer_value ? String(Number(data.offer_value).toFixed(2)) : '');
      setImages(nextImages);
      setAttributes(nextAttributes);
      setSelectedCategory(nextCategory);
      setSelectedTags(data.tags?.map((t) => t.id) ?? []);
      // Must be set LAST in the same batch so Quill mounts with the correct description
      setIsProductLoaded(true);
    });

    // isDirty reset still needs the timeout since it runs after the above batch
    setTimeout(() => setIsDirty(false), 0);
  }, [productQuery.data]);

  // Track unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const markDirty = () => !isDirty && setIsDirty(true);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        if (img.file && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, []);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file), // for preview
      isMain: false, // default to false
    }));

    setImages((prev) => {
      const combined = [...prev, ...newImages];
      if (combined.length > 0 && !combined.some((img) => img.isMain)) {
        combined[0].isMain = true;
      }
      return combined;
    });
    markDirty();
    e.target.value = '';
  };

  const setMainImage = (index: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isMain: i === index })));
    markDirty();
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const removedImg = prev[index];
      if (removedImg.id) {
        setDeletedImages((d) => [...d, removedImg.id as number]);
      } else if (removedImg.url.startsWith('blob:')) {
        URL.revokeObjectURL(removedImg.url);
      }
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.isMain)) {
        next[0].isMain = true;
      }
      return next;
    });
    markDirty();
  };

  const addAttribute = () => {
    setAttributes((prev) => [...prev, { name: '', value: '' }]);
    markDirty();
  };

  const removeAttribute = (i: number) => {
    setAttributes((prev) => {
      const removedAttr = prev[i];
      if (removedAttr.id) {
        setDeletedAttributes((d) => [...d, removedAttr.id as number]);
      }
      return prev.filter((_, idx) => idx !== i);
    });
    markDirty();
  };

  const updateAttribute = (i: number, field: keyof AttributeRow, value: string) => {
    setAttributes((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
    markDirty();
  };

  const toggleTag = (id: number) => {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
    markDirty();
  };

  const handleAddNewTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    const existing = allTags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      setSelectedTags((prev) => (prev.includes(existing.id) ? prev : [...prev, existing.id]));
      setNewTagInput('');
      markDirty();
      return;
    }
    createTagMutation.mutate(trimmed, {
      onSuccess: (newTag: ProductTag) => {
        setSelectedTags((prev) => [...prev, newTag.id]);
        setNewTagInput('');
        markDirty();
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Product name is required.';
    if (!priceBeforeOffer || parseFloat(priceBeforeOffer) <= 0 || !/^\d+(\.\d{1,2})?$/.test(priceBeforeOffer))
      newErrors.priceBeforeOffer = 'Price before offer is required, must be > 0, and max 2 decimal places.';
    if (!selectedCategory) newErrors.category = 'Category is required.';
    if (!stockMode) newErrors.stockMode = 'Stock mode is required.';
    if (stockMode === 'manual' && !manualFulfillmentTime)
      newErrors.manualFulfillmentTime = 'Fulfillment time is required for manual mode.';
    if (stockMode === 'manual' && manualFulfillmentTime && parseInt(manualFulfillmentTime) <= 0)
      newErrors.manualFulfillmentTime = 'Fulfillment time must be greater than 0.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors before submitting.');
      return;
    }
    setErrors({});

    const formData = new FormData();
    formData.append('name', name);
    formData.append('product_type', 'digital');
    formData.append('stock_mode', stockMode);
    if (price) formData.append('price', price);

    if (stockMode === 'manual' && manualFulfillmentTime) {
      formData.append('manual_fulfillment_time', manualFulfillmentTime);
    } else if (stockMode === 'automatic') {
      formData.append('manual_fulfillment_time', '0');
    }

    formData.append('short_description', shortDescription);
    formData.append('description', description);
    
    if (help) formData.append('help', help);
    else formData.append('help', ''); // Clear if empty
    
    if (priceBeforeOffer) formData.append('price_before_offer', priceBeforeOffer);
    else formData.append('price_before_offer', '');

    if (offerValue) formData.append('offer_value', offerValue);
    else formData.append('offer_value', '');
    
    formData.append('is_active', isActive ? 'true' : 'false');
    formData.append('is_available', isAvailable ? 'true' : 'false');
    formData.append('is_popular', isPopular ? 'true' : 'false');
    formData.append('is_featured', isFeatured ? 'true' : 'false');

    if (selectedCategory) formData.append('category', selectedCategory);
    selectedTags.forEach((id) => formData.append('tags', String(id)));

    images.forEach((img, i) => {
      if (img.id) formData.append(`images[${i}][id]`, String(img.id));
      if (img.file) formData.append(`images[${i}][image]`, img.file);
      formData.append(`images[${i}][is_main]`, String(img.isMain));
    });
    if (deletedImages.length > 0) {
      formData.append('deleted_images', JSON.stringify(deletedImages));
    }

    attributes.forEach((attr, i) => {
      if (attr.id) formData.append(`attributes[${i}][id]`, String(attr.id));
      formData.append(`attributes[${i}][name]`, attr.name);
      formData.append(`attributes[${i}][value]`, attr.value);
    });
    if (deletedAttributes.length > 0) {
      formData.append('deleted_attributes', JSON.stringify(deletedAttributes));
    }

    if (codesText.trim()) {
      const codeArray = codesText
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean);
      if (codeArray.length > 0) {
        formData.append('codes', JSON.stringify(codeArray));
      }
    }

    updateMutation.mutate(
      { slug, formData },
      {
        onSuccess: () => {
          setIsDirty(false); // Clear before routing to prevent warning
          setCodesText('');
          images.forEach((img) => {
            if (img.file && img.url.startsWith('blob:')) URL.revokeObjectURL(img.url);
          });
          
          router.push('/dashboard/products');
        },
      }
    );
  };

  if (productQuery.isPending) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Card>
          <CardContent className="h-100 flex items-center justify-center text-muted-foreground">
            Loading product details...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (productQuery.isError) {
    return (
      <div className="text-center py-16 space-y-4 max-w-4xl mx-auto">
        <p className="text-destructive font-medium">Failed to load product. It may not exist.</p>
        <Link href="/dashboard/products">
          <Button variant="outline">← Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Product</h1>
            <p className="text-muted-foreground mt-1 text-sm font-mono">{slug}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" onChange={() => markDirty()}>
        <ProductBasicInfo
          name={name}
          setName={setName}
          price={price}
          setPrice={setPrice}
          stockMode={stockMode}
          setStockMode={setStockMode}
          manualFulfillmentTime={manualFulfillmentTime}
          setManualFulfillmentTime={setManualFulfillmentTime}
          shortDescription={shortDescription}
          setShortDescription={setShortDescription}
          description={description}
          setDescription={setDescription}
          isActive={isActive}
          setIsActive={setIsActive}
          isAvailable={isAvailable}
          setIsAvailable={setIsAvailable}
          isPopular={isPopular}
          setIsPopular={setIsPopular}
          isFeatured={isFeatured}
          setIsFeatured={setIsFeatured}
          help={help}
          setHelp={setHelp}
          priceBeforeOffer={priceBeforeOffer}
          setPriceBeforeOffer={setPriceBeforeOffer}
          offerValue={offerValue}
          setOfferValue={setOfferValue}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={allCategories}
          errors={errors}
          clearError={clearError}
          isLoaded={isProductLoaded}
        />

        <ProductImages
          images={images}
          handleImageAdd={handleImageAdd}
          setMainImage={setMainImage}
          removeImage={removeImage}
          isEditMode
        />

        <ProductTags
          tags={allTags}
          selectedTags={selectedTags}
          newTagInput={newTagInput}
          setNewTagInput={setNewTagInput}
          addingTag={createTagMutation.isPending}
          handleAddNewTag={handleAddNewTag}
          toggleTag={toggleTag}
          onDeleteTag={(tag) =>
            deleteTagMutation.mutate(tag.slug, {
              onSuccess: () => setSelectedTags((prev) => prev.filter((t) => t !== tag.id)),
            })
          }
          deletingTagId={
            deleteTagMutation.isPending && typeof deleteTagMutation.variables === 'string'
              ? (allTags.find((t) => t.slug === deleteTagMutation.variables)?.id ?? null)
              : null
          }
        />

        <ProductAttributes
          attributes={attributes}
          addAttribute={addAttribute}
          updateAttribute={updateAttribute}
          removeAttribute={removeAttribute}
        />

        {stockMode === 'automatic' && (
          <div className="space-y-1.5 p-4 rounded-lg border border-border bg-muted/10 mb-6">
            <label htmlFor="newCodesText" className="text-sm font-medium text-foreground">
              Bulk Add Codes{' '}
              <span className="text-muted-foreground font-normal">(one per line)</span>
            </label>
            <textarea
              id="newCodesText"
              value={codesText}
              onChange={(e) => setCodesText(e.target.value)}
              placeholder={'CODE-AAAA-1111\nCODE-BBBB-2222\nCODE-CCCC-3333'}
              rows={6}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              {codesText.split('\n').filter((c) => c.trim()).length} code(s) entered
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end pb-8">
          <Link href="/dashboard/products">
            <Button
              type="button"
              variant="outline"
              className="border-border"
              disabled={updateMutation.isPending}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-primary hover:bg-primary-hover text-primary-foreground min-w-32 gap-2">
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
