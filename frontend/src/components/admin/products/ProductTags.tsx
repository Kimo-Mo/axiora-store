import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, X } from 'lucide-react';
import type { LegacyProductTag } from '@/types/legacyCatalog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductTagsProps {
  tags: LegacyProductTag[];
  selectedTags: number[];
  newTagInput: string;
  setNewTagInput: (v: string) => void;
  addingTag: boolean;
  handleAddNewTag: () => void;
  toggleTag: (id: number) => void;
  onDeleteTag?: (tag: LegacyProductTag) => void;
  deletingTagId?: number | null;
}

export function ProductTags({
  tags,
  selectedTags,
  newTagInput,
  setNewTagInput,
  addingTag,
  handleAddNewTag,
  toggleTag,
  onDeleteTag,
  deletingTagId,
}: ProductTagsProps) {
  const [tagToDelete, setTagToDelete] = useState<LegacyProductTag | null>(null);

  const confirmDelete = () => {
    if (tagToDelete && onDeleteTag) {
      onDeleteTag(tagToDelete);
      setTagToDelete(null);
    }
  };

  return (
    <>
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTag())}
              placeholder="Type a tag name and press Enter…"
              className="bg-background border-border h-9 text-sm flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-border h-9 gap-1 shrink-0"
              onClick={handleAddNewTag}
              disabled={addingTag || !newTagInput.trim()}>
              {addingTag ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className={`flex items-center rounded-full text-xs border transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                  }`}>
                  <button
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className="px-3 py-1.5 focus:outline-none">
                    {tag.name}
                  </button>
                  {onDeleteTag && (
                    <button
                      type="button"
                      onClick={() => setTagToDelete(tag)}
                      disabled={deletingTagId === tag.id}
                      className={`pe-2 ps-1 py-1.5 focus:outline-none hover:text-destructive transition-colors disabled:opacity-50 ${selectedTags.includes(tag.id) ? 'text-primary-foreground hover:text-primary-foreground/75' : ''}`}>
                      {deletingTagId === tag.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {tags.length === 0 && (
            <p className="text-xs text-muted-foreground">No tags yet. Type above to create one.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!tagToDelete} onOpenChange={(open) => !open && setTagToDelete(null)}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the tag &quot;{tagToDelete?.name}&quot;? This action
              will remove it globally from all products.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setTagToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
