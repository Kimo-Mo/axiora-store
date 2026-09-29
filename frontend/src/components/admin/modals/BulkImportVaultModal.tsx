import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export function BulkImportVaultModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-border text-foreground hover:bg-muted">
          <Upload className="mr-2 h-4 w-4" /> Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-106.25 bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>Bulk Import Vault Items</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Upload a CSV to bulk import items into the vault.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Upload area placeholder.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
