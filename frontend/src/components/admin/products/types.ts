export type StockMode = 'automatic' | 'manual';

export interface AttributeRow {
  id?: number;
  name: string;
  value: string;
}

export interface ImageState {
  id?: number;
  url: string;
  file?: File;
  isMain: boolean;
}
