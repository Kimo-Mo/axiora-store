import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LegacyProductCategory } from '@/types/legacyCatalog';
import type { StockMode } from './types';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full flex items-center justify-center border border-border rounded-md bg-muted/20">Loading Editor...</div>
});

interface ProductBasicInfoProps {
  name: string;
  setName: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  stockMode: StockMode;
  setStockMode: (v: StockMode) => void;
  manualFulfillmentTime: string;
  setManualFulfillmentTime: (v: string) => void;
  shortDescription: string;
  setShortDescription: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  isAvailable: boolean;
  setIsAvailable: (v: boolean) => void;
  isPopular: boolean;
  setIsPopular: (v: boolean) => void;
  isFeatured: boolean;
  setIsFeatured: (v: boolean) => void;
  help: string;
  setHelp: (v: string) => void;
  priceBeforeOffer: string;
  setPriceBeforeOffer: (v: string) => void;
  offerValue: string;
  setOfferValue: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  categories: LegacyProductCategory[];
  errors: Record<string, string>;
  clearError: (field: string) => void;
  isLoaded?: boolean;
}

export function ProductBasicInfo({
  name,
  setName,
  price,
  setPrice,
  stockMode,
  setStockMode,
  manualFulfillmentTime,
  setManualFulfillmentTime,
  shortDescription,
  setShortDescription,
  description,
  setDescription,
  isActive,
  setIsActive,
  isAvailable,
  setIsAvailable,
  isPopular,
  setIsPopular,
  isFeatured,
  setIsFeatured,
  help,
  setHelp,
  priceBeforeOffer,
  setPriceBeforeOffer,
  offerValue,
  setOfferValue,
  selectedCategory,
  setSelectedCategory,
  categories,
  errors,
  clearError,
  isLoaded = true,
}: ProductBasicInfoProps) {
  return (
    <Card className="bg-card border-border shadow-xs">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-semibold text-foreground">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="product-name" className="text-foreground text-sm">
            Product Name *
          </Label>
          <Input
            id="product-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError('name');
            }}
            placeholder="e.g. iPhone 15 Pro Max"
            className={`bg-background ${errors.name ? 'border-destructive focus-visible:ring-destructive' : 'border-border'}`}
          />
          {errors.name && <p className="text-xs text-destructive mt-0.5">{errors.name}</p>}
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="product-price" className="text-foreground text-sm">
              Current Price (EGP) *
            </Label>
            <Input
              id="product-price"
              type="number"
              min={0}
              step="any"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                clearError('price');
              }}
              placeholder="0.00"
              className={`bg-background ${errors.price ? 'border-destructive focus-visible:ring-destructive' : 'border-border'}`}
            />
            {errors.price && <p className="text-xs text-destructive mt-0.5">{errors.price}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-price-before" className="text-foreground text-sm">
              Price Before Offer (Optional)
            </Label>
            <Input
              id="product-price-before"
              type="number"
              min={0}
              step="any"
              value={priceBeforeOffer}
              onChange={(e) => {
                setPriceBeforeOffer(e.target.value);
                clearError('priceBeforeOffer');
              }}
              placeholder="0.00"
              className={`bg-background ${errors.priceBeforeOffer ? 'border-destructive focus-visible:ring-destructive' : 'border-border'}`}
            />
            {errors.priceBeforeOffer && (
              <p className="text-xs text-destructive mt-0.5">{errors.priceBeforeOffer}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-offer-val" className="text-foreground text-sm">
              Discount Percent (%) (Optional)
            </Label>
            <Input
              id="product-offer-val"
              type="number"
              min={0}
              max={100}
              step="any"
              value={offerValue}
              onChange={(e) => {
                setOfferValue(e.target.value);
                clearError('offerValue');
              }}
              placeholder="e.g. 15"
              className={`bg-background ${errors.offerValue ? 'border-destructive focus-visible:ring-destructive' : 'border-border'}`}
            />
            {errors.offerValue && (
              <p className="text-xs text-destructive mt-0.5">{errors.offerValue}</p>
            )}
          </div>
        </div>

        {/* Category & Stock Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="product-category" className="text-foreground text-sm">
              Category
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="product-category" className="bg-background border-border">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-stock-mode" className="text-foreground text-sm">
              Stock Mode *
            </Label>
            <Select
              value={stockMode}
              onValueChange={(val) => {
                setStockMode(val as StockMode);
                clearError('stockMode');
              }}
            >
              <SelectTrigger id="product-stock-mode" className="bg-background border-border">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="automatic">Automatic (in-stock tracking)</SelectItem>
                <SelectItem value="manual">Manual (fulfillment on order)</SelectItem>
              </SelectContent>
            </Select>
            {errors.stockMode && (
              <p className="text-xs text-destructive mt-0.5">{errors.stockMode}</p>
            )}
          </div>

          {stockMode === 'manual' && (
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="fulfillment-time" className="text-foreground text-sm">
                Fulfillment Time (minutes) *
              </Label>
              <Input
                id="fulfillment-time"
                type="number"
                min={1}
                value={manualFulfillmentTime}
                onChange={(e) => {
                  setManualFulfillmentTime(e.target.value);
                  clearError('manualFulfillmentTime');
                }}
                placeholder="e.g. 24"
                className={`bg-background ${errors.manualFulfillmentTime ? 'border-destructive focus-visible:ring-destructive' : 'border-border'}`}
              />
              {errors.manualFulfillmentTime && (
                <p className="text-xs text-destructive mt-0.5">{errors.manualFulfillmentTime}</p>
              )}
            </div>
          )}
        </div>

        {/* Short Description */}
        <div className="space-y-1.5">
          <Label htmlFor="short-desc" className="text-foreground text-sm">
            Short Description
          </Label>
          <Textarea
            id="short-desc"
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief product summary..."
            className="bg-background border-border resize-none"
          />
        </div>

        {/* Description Rich Text Editor */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-sm">Detailed Description</Label>
          <div className="quill-wrapper border border-border rounded-md overflow-hidden bg-background">
            {isLoaded ? (
              <ReactQuill
                theme="snow"
                value={description}
                onChange={setDescription}
                placeholder="Write full product specs and details..."
                className="text-foreground"
              />
            ) : (
              <div className="h-[200px] w-full flex items-center justify-center border border-border rounded-md bg-muted/20">
                Loading Editor...
              </div>
            )}
          </div>
        </div>

        {/* Help & Support Info */}
        <div className="space-y-1.5">
          <Label htmlFor="help-notes" className="text-foreground text-sm">
            Warranty & Delivery Notes (Optional)
          </Label>
          <Textarea
            id="help-notes"
            rows={2}
            value={help}
            onChange={(e) => setHelp(e.target.value)}
            placeholder="e.g. 1 year official local warranty included..."
            className="bg-background border-border resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
