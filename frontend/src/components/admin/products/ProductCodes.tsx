import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProductCodesProps {
  codesText: string;
  setCodesText: (v: string) => void;
  errors: Record<string, string>;
  clearError: (field: string) => void;
  isEditMode?: boolean;
}

export function ProductCodes({
  codesText,
  setCodesText,
  errors,
  clearError,
  isEditMode = false,
}: ProductCodesProps) {
  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground text-base">
          {isEditMode ? 'Add More Fulfillment Codes' : 'Fulfillment Codes *'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="codes-input" className="text-foreground text-sm">
          {isEditMode ? 'Paste new codes ' : 'Paste codes '}
          <span className="text-muted-foreground font-normal">
            (one per line)
          </span>
        </Label>
        <Textarea
          id="codes-input"
          value={codesText}
          onChange={(e) => {
            setCodesText(e.target.value);
            clearError('codes');
          }}
          placeholder={'CODE-AAAA-1111\nCODE-BBBB-2222\nCODE-CCCC-3333'}
          rows={6}
          className={`bg-background resize-none font-mono text-sm ${errors.codes ? 'border-destructive focus-visible:ring-destructive' : 'border-border'}`}
        />
        {errors.codes && <p className="text-xs text-destructive">{errors.codes}</p>}
        <p className="text-xs text-muted-foreground">
          {codesText.split('\n').filter((c) => c.trim()).length} code(s) entered
        </p>
      </CardContent>
    </Card>
  );
}
