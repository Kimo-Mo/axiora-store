import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import type { AttributeRow } from './types';

interface ProductAttributesProps {
  attributes: AttributeRow[];
  addAttribute: () => void;
  updateAttribute: (index: number, field: keyof AttributeRow, value: string) => void;
  removeAttribute: (index: number) => void;
}

export function ProductAttributes({
  attributes,
  addAttribute,
  updateAttribute,
  removeAttribute,
}: ProductAttributesProps) {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-base">Attributes</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border gap-1"
            onClick={addAttribute}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {attributes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No attributes added yet. Click &quot;Add&quot; to add product specs.
          </p>
        ) : (
          <div className="space-y-3">
            {attributes.map((attr, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  value={attr.name}
                  onChange={(e) => updateAttribute(i, 'name', e.target.value)}
                  placeholder="Name (e.g. Platform)"
                  className="bg-background border-border flex-1"
                />
                <Input
                  value={attr.value}
                  onChange={(e) => updateAttribute(i, 'value', e.target.value)}
                  placeholder="Value (e.g. PC, Xbox)"
                  className="bg-background border-border flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => removeAttribute(i)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
