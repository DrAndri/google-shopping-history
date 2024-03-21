import { Document } from 'mongodb';

export interface PriceResponse {
  sku: string;
  prices: Price[];
  salePrices: Price[];
}
export interface AutocompleteResponse {
  terms: string[];
}
export interface PricesRequest extends NextApiRequest {
  body: {
    skus: string[];
  };
}
export interface PricesResponse {
  prices: Price[];
  salePrices: Price[];
}

export interface Price {
  timestamp: number;
  price: number;
  sku?: string;
}

export interface RechartFormat {
  timestamp: number;
  price?: number;
  salePrice?: number;
}

export interface Env {
  MONGODB_URI: string;
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

export interface MongodbProductInfo extends MongodbDocument {
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
