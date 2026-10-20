'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AdminCategoryDto } from '@/types/admin';

interface CategoryTreeProps {
  categories: AdminCategoryDto[];
  onAddChild: (parent: AdminCategoryDto) => void;
  onEdit: (category: AdminCategoryDto) => void;
  onDelete: (category: AdminCategoryDto) => void;
}

interface TreeNodeProps {
  category: AdminCategoryDto;
  level: number;
  onAddChild: (parent: AdminCategoryDto) => void;
  onEdit: (category: AdminCategoryDto) => void;
  onDelete: (category: AdminCategoryDto) => void;
}

function TreeNode({ category, level, onAddChild, onEdit, onDelete }: TreeNodeProps) {
  const t = useTranslations('admin.categories');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const hasChildren = Boolean(category.children && category.children.length > 0);
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:border-border hover:bg-muted/20 transition-colors bg-card ${
          level > 0 ? 'ms-4 sm:ms-6 border-s-2 border-s-primary/40' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}

          {category.image ? (
            <div className="relative h-8 w-8 rounded-md overflow-hidden border border-border/80 shrink-0 bg-muted/30">
              <Image
                src={category.image}
                alt={category.nameEn}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {expanded && hasChildren ? (
                <FolderOpen className="h-4 w-4" />
              ) : (
                <Folder className="h-4 w-4" />
              )}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground truncate">
                {isAr ? category.nameAr : category.nameEn}
              </span>
              <span className="text-xs text-muted-foreground">
                ({isAr ? category.nameEn : category.nameAr})
              </span>
              <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 text-muted-foreground">
                /{category.slug}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="secondary"
            className="text-[11px] gap-1 px-2 py-0.5 bg-muted/50 border-border/60"
          >
            <Package className="h-3 w-3 text-muted-foreground" />
            <span>
              {category.productCount}{' '}
              {t('productCount', { defaultValue: 'products' })}
            </span>
          </Badge>

          {category.isActive ? (
            <Badge
              variant="secondary"
              className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            >
              {t('status.active', { defaultValue: 'Active' })}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
              {t('status.inactive', { defaultValue: 'Inactive' })}
            </Badge>
          )}

          <div className="flex items-center gap-0.5 ms-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary hover:bg-primary/10"
              onClick={() => onAddChild(category)}
              title={t('actions.addChild', { defaultValue: 'Add Subcategory' })}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(category)}
              title={t('actions.edit', { defaultValue: 'Edit Category' })}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(category)}
              title={t('actions.delete', { defaultValue: 'Delete Category' })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="space-y-1">
          {category.children!.map((child) => (
            <TreeNode
              key={child.id}
              category={child}
              level={level + 1}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({
  categories,
  onAddChild,
  onEdit,
  onDelete,
}: CategoryTreeProps) {
  const t = useTranslations('admin.categories');

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card">
        <Folder className="h-10 w-10 text-muted-foreground/60 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-foreground">
          {t('tree.emptyTitle', { defaultValue: 'No categories created' })}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          {t('tree.emptySubtitle', {
            defaultValue: 'Create root categories to structure your physical electronics store catalog.',
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((rootCategory) => (
        <TreeNode
          key={rootCategory.id}
          category={rootCategory}
          level={0}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
