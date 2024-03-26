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
  stores?: StoreResponse[]
}

export interface StoreResponse {
  name: string;
  skus: SkuResponse[];
}

export interface SkuResponse {
  sku: string;
  prices: Price[];
  salePrices?: Price[];
}

export interface Price {
  timestamp: number;
  price: number;
}

export interface PriceArray {
  sku: string;
  salePrice: boolean;
  prices: Price[];
}

type PriceMap = Record<string, Price>;

type PricesMap = Record<string, Price[]>;

export interface RechartFormat {
  timestamp: number;
  price?: number;
  salePrice?: number;
}

export interface PriceChartProps {
  prices: RechartFormat[];
  width: number;
  height: number;
}

export interface SelectValue {
  key?: string | undefined;
  label: ReactNode;
  value: string | number;
}

export interface MongodbDocument extends Document {
  sku: string;
  store: string;
}

export interface MongodbProductMetadata extends MongodbDocument {
  sku: string;
  salePriceLastSeen: number | undefined;
  lastSeen: number;
}

export interface MongodbProductPrice extends MongodbDocument {
  sku: string;
  sale_price: boolean;
  price: number;
  timestamp: number;
}

export interface StoreConfig {
  name: string;
}

type StorePrices = Map<string, SkuPrices>;
type StoreMap = Map<string, StorePrices>;

export interface SkuPrices {
  lastPrice: Price | undefined;
  lastSalePrice: Price | undefined;
  prices: Price[];
  salePrices: Price[];
}