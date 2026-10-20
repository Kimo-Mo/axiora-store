import type { AdminCategoryDto } from '@/types/admin';

export interface FlattenedCategory {
  category: AdminCategoryDto;
  /** 0 for root categories, 1 for their children, and so on. */
  depth: number;
}

/**
 * `GET /admin/categories` returns a hierarchy (`children[]`), but dropdowns
 * render a flat option list. This walks the tree depth-first and keeps the
 * nesting depth so option rows can be indented. Order is stable: each subtree
 * appears in the sorted order the backend provides.
 */
export function flattenCategoryTree(categories: AdminCategoryDto[]): FlattenedCategory[] {
  const flat: FlattenedCategory[] = [];
  const visit = (nodes: AdminCategoryDto[], depth: number) => {
    for (const node of nodes) {
      flat.push({ category: node, depth });
      if (node.children?.length) visit(node.children, depth + 1);
    }
  };
  visit(categories, 0);
  return flat;
}
