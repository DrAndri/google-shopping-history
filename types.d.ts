import { Document } from 'mongodb';
export interface AutocompleteResponse {
  terms: string[];
}
export interface PricesRequest extends NextApiRequest {
  body: {
    skus: string[];
  };
}
export interface PricesResponse {
  stores?: StorePricesResponse[];
}

export interface StorePricesResponse {
  name: string;
  skus: SkuPricesResponse[];
}

export interface SkuPricesResponse {
  sku: string;
  prices: Price[];
  salePrices?: Price[];
}

export interface Price {
  start: number;
  end: number;
  price: number;
}

export interface RechartFormat {
  timestamp: number;
  [key: string]: number;
}

export interface PriceChartProps {
  prices: RechartFormat[];
  width: number;
  height: number;
}

export interface SelectValue {
  key: string;
  label: ReactNode;
  value: string | number;
}

export interface MongodbProductMetadata extends Document {
  sku: string;
  store: string;
}

export interface MongodbProductPrice extends Document {
  sku: string;
  store: string;
  salePrice: boolean;
  price: number;
  start: number;
  end: number;
}

export interface StoreConfig {
  name: string;
}

type StorePrices = Map<string, SkuPrices>;
type StoreMap = Map<string, StorePrices>;

export interface SkuPrices {
  prices: Price[];
  salePrices: Price[];
  lastPrice?: Price;
  lastSalePrice?: Price;
}
