'use client';

import React, { useState } from 'react';
import { Edit3, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type EditableField = 'full_name' | 'username' | 'phone' | null;

interface EditableRowProps {
  label: string;
  icon: React.ReactNode;
  fieldKey: EditableField;
  value: string;
  disabled?: boolean;
  activeField: EditableField;
  onStartEdit: (key: EditableField, currentVal: string) => void;
  onSave: (key: EditableField) => void;
  onCancel: () => void;
}

export function EditableRow({
  label,
  icon,
  fieldKey,
  value,
  disabled,
  activeField,
  onStartEdit,
  onSave,
  onCancel,
}: EditableRowProps) {
  const isEditing = activeField === fieldKey;
  const [tempValue, setTempValue] = useState(value);

  const handleStart = () => {
    setTempValue(value);
    onStartEdit(fieldKey, value);
  };

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card/60 hover:bg-card transition-all duration-200">
      <div className="shrink-0 size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
        {isEditing ? (
          <Input
            autoFocus
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave(fieldKey);
              if (e.key === 'Escape') onCancel();
            }}
            className="h-8 text-sm bg-background"
            disabled={disabled}
          />
        ) : (
          <p className="text-sm font-medium text-foreground truncate">{value || '—'}</p>
        )}
      </div>

      {!disabled && (
        <div className="shrink-0 flex items-center gap-1">
          {isEditing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-success hover:text-success hover:bg-success/10"
                onClick={() => onSave(fieldKey)}>
                <Check size={15} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onCancel}>
                <X size={15} />
              </Button>
            </>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="size-8 md:opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
              onClick={handleStart}>
              <Edit3 size={15} />
            </Button>
          )}
        </div>
      )}

      {disabled && (
        <Badge variant="outline" className="text-xs shrink-0">
          locked
        </Badge>
      )}
    </div>
  );
}
