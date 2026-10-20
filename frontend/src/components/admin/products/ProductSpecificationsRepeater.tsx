'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { SpecificationDto } from '@/types/admin';

interface ProductSpecificationsRepeaterProps {
  specifications: SpecificationDto[];
  onChange: (specs: SpecificationDto[]) => void;
  disabled?: boolean;
}

export function ProductSpecificationsRepeater({
  specifications,
  onChange,
  disabled = false,
}: ProductSpecificationsRepeaterProps) {
  const t = useTranslations('admin.products');

  const handleAdd = () => {
    const newSpec: SpecificationDto = {
      keyAr: '',
      keyEn: '',
      valueAr: '',
      valueEn: '',
      sortOrder: specifications.length,
    };
    onChange([...specifications, newSpec]);
  };

  const handleRemove = (index: number) => {
    const updated = specifications
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, sortOrder: idx }));
    onChange(updated);
  };

  const handleChange = (index: number, field: keyof SpecificationDto, val: string) => {
    const updated = specifications.map((spec, i) => {
      if (i === index) {
        return { ...spec, [field]: val };
      }
      return spec;
    });
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= specifications.length) return;

    const updated = [...specifications];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // re-index sortOrder
    const normalized = updated.map((item, idx) => ({ ...item, sortOrder: idx }));
    onChange(normalized);
  };

  return (
    <Card className="bg-card border-border shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border/50">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">
            {t('specifications.title', { defaultValue: 'Technical Specifications' })}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            {t('specifications.description', {
              defaultValue: 'Add bilingual key-value technical specifications (e.g. Screen, RAM, Battery)',
            })}
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={disabled}
          className="gap-1.5 text-xs font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('specifications.add', { defaultValue: 'Add Specification' })}
        </Button>
      </CardHeader>

      <CardContent className="pt-4">
        {specifications.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-lg bg-muted/20">
            <p className="text-sm text-muted-foreground">
              {t('specifications.empty', {
                defaultValue: 'No specifications added yet. Click "Add Specification" to add technical attributes.',
              })}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {specifications.map((spec, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 rounded-lg border border-border/70 bg-card hover:border-border transition-colors"
              >
                <div className="flex flex-col items-center gap-1 pt-1 text-muted-foreground/60">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-[10px] font-mono">{index + 1}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 flex-1">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      {t('specifications.keyAr', { defaultValue: 'Property (Arabic)' })}
                    </label>
                    <Input
                      dir="rtl"
                      placeholder="مثال: سعة التخزين"
                      value={spec.keyAr}
                      disabled={disabled}
                      onChange={(e) => handleChange(index, 'keyAr', e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      {t('specifications.valueAr', { defaultValue: 'Value (Arabic)' })}
                    </label>
                    <Input
                      dir="rtl"
                      placeholder="مثال: 256 جيجابايت"
                      value={spec.valueAr}
                      disabled={disabled}
                      onChange={(e) => handleChange(index, 'valueAr', e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      {t('specifications.keyEn', { defaultValue: 'Property (English)' })}
                    </label>
                    <Input
                      dir="ltr"
                      placeholder="e.g. Storage"
                      value={spec.keyEn}
                      disabled={disabled}
                      onChange={(e) => handleChange(index, 'keyEn', e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      {t('specifications.valueEn', { defaultValue: 'Value (English)' })}
                    </label>
                    <Input
                      dir="ltr"
                      placeholder="e.g. 256 GB"
                      value={spec.valueEn}
                      disabled={disabled}
                      onChange={(e) => handleChange(index, 'valueEn', e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    disabled={disabled || index === 0}
                    onClick={() => handleMove(index, 'up')}
                    title="Move Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    disabled={disabled || index === specifications.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    disabled={disabled}
                    onClick={() => handleRemove(index)}
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
