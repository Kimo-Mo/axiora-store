'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';

import type { StockMode, AttributeRow, ImageState } from '@/components/admin/products/types';
import { ProductBasicInfo } from '@/components/admin/products/ProductBasicInfo';
import { ProductImages } from '@/components/admin/products/ProductImages';
import { ProductTags } from '@/components/admin/products/ProductTags';
import { ProductAttributes } from '@/components/admin/products/ProductAttributes';
import { ProductCodes } from '@/components/admin/products/ProductCodes';

import { useCategoriesQuery } from '@/hooks/admin/useCategoriesQuery';
import { useTagsQuery } from '@/hooks/admin/useTagsQuery';
import { useCreateTagMutation, useDeleteTagMutation } from '@/hooks/admin/useTagMutations';
import { useCreateProductMutation } from '@/hooks/admin/useCreateProductMutation';
import type { ProductTag } from '@/types/catalog';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminProductCreatePage() {
  const router = useRouter();
  const imagesRef = useRef<ImageState[]>([]);
  const queryClient = useQueryClient();

  // Basic fields
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
      } else {
        setPrice('');
      }
    } else {
      setPrice('');
    }
  }, [priceBeforeOffer, offerValue]);

  // Images
  const [images, setImages] = useState<ImageState[]>([]);

  // Attributes
  const [attributes, setAttributes] = useState<AttributeRow[]>([]);

  // Product codes
  const [codesText, setCodesText] = useState('');

  // Categories & Tags
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const categoriesQuery = useCategoriesQuery();
  const tagsQuery = useTagsQuery();
  const createMutation = useCreateProductMutation();
  const createTagMutation = useCreateTagMutation();
  const deleteTagMutation = useDeleteTagMutation();

  const categories = categoriesQuery.data ?? [];
  const tags = tagsQuery.data ?? [];

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (name || price || shortDescription || images.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [name, price, shortDescription, images]);

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
    const acceptedFiles = files.filter((file) => file.type.startsWith('image/'));
    const rejectedCount = files.length - acceptedFiles.length;
    if (rejectedCount > 0) {
      setErrors((prev) => ({ ...prev, images: 'Only image files are allowed.' }));
      toast.error('Some selected files are not valid images.');
    }
    if (acceptedFiles.length === 0) {
      e.target.value = '';
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.images;
      return next;
    });
    setImages((prev) => [
      ...prev,
      ...acceptedFiles.map((file, i) => ({
        file,
        url: URL.createObjectURL(file),
        isMain: prev.length === 0 && i === 0,
      })),
    ]);
    e.target.value = '';
  };

  const setMainImage = (index: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, isMain: i === index })));
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed?.file && removed.url.startsWith('blob:')) {
        URL.revokeObjectURL(removed.url);
      }
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.isMain)) {
        next[0].isMain = true;
      }
      return next;
    });
  };

  const addAttribute = () => setAttributes((prev) => [...prev, { name: '', value: '' }]);
  const removeAttribute = (i: number) =>
    setAttributes((prev) => prev.filter((_, idx) => idx !== i));
  const updateAttribute = (i: number, field: keyof AttributeRow, value: string) => {
    setAttributes((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
  };

  const toggleTag = (id: number) => {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleAddNewTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    const existing = tags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      setSelectedTags((prev) => (prev.includes(existing.id) ? prev : [...prev, existing.id]));
      setNewTagInput('');
      return;
    }
    createTagMutation.mutate(trimmed, {
      onSuccess: (newTag: ProductTag) => {
        setSelectedTags((prev) => [...prev, newTag.id]);
        setNewTagInput('');
      }
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
    if (stockMode === 'automatic' && !codesText.trim())
      newErrors.codes = 'At least one fulfillment code is required for automatic delivery.';
    if (images.length === 0) newErrors.images = 'Please upload at least one product image.';

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
    if (stockMode === 'manual' && manualFulfillmentTime)
      formData.append('manual_fulfillment_time', manualFulfillmentTime);
    if (shortDescription) formData.append('short_description', shortDescription);
    if (description) formData.append('description', description);
    if (help) formData.append('help', help);
    if (priceBeforeOffer) formData.append('price_before_offer', priceBeforeOffer);
    if (offerValue) formData.append('offer_value', offerValue);
    
    formData.append('is_active', isActive ? 'true' : 'false');
    formData.append('is_available', isAvailable ? 'true' : 'false');
    formData.append('is_popular', isPopular ? 'true' : 'false');
    formData.append('is_featured', isFeatured ? 'true' : 'false');

    if (selectedCategory) formData.append('category', selectedCategory);
    selectedTags.forEach((id) => formData.append('tags', String(id)));

    images.forEach((img, i) => {
      if (img.file) formData.append(`images[${i}][image]`, img.file);
      formData.append(`images[${i}][is_main]`, String(img.isMain));
    });

    attributes.forEach((attr, i) => {
      formData.append(`attributes[${i}][name]`, attr.name);
      formData.append(`attributes[${i}][value]`, attr.value);
    });

    if (codesText.trim()) {
      const codeArray = codesText
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean);
      formData.append('codes', JSON.stringify(codeArray));
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        images.forEach(img => {
          if (img.file && img.url.startsWith('blob:')) URL.revokeObjectURL(img.url);
        });
        queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
        router.push('/dashboard/products');
      }
    });
  };

  const submitting = createMutation.isPending;

  return (
    <div className="space-y-8 w-full">
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Product</h1>
          <p className="text-muted-foreground mt-1">Add a new digital product to the catalog.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
          categories={categories}
          errors={errors}
          clearError={clearError}
        />

        <ProductImages
          images={images}
          handleImageAdd={handleImageAdd}
          setMainImage={setMainImage}
          removeImage={removeImage}
          imageError={errors.images}
        />

        <ProductTags
          tags={tags}
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
              ? tags.find((t) => t.slug === deleteTagMutation.variables)?.id ?? null
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
          <ProductCodes
            codesText={codesText}
            setCodesText={setCodesText}
            errors={errors}
            clearError={clearError}
          />
        )}

        <div className="flex gap-3 justify-end pb-8">
          <Link href="/dashboard/products">
            <Button type="button" variant="outline" className="border-border" disabled={submitting}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary-hover text-primary-foreground min-w-32"
            disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              'Create Product'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
