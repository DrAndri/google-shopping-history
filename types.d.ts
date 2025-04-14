import { ObjectId } from 'mongodb';

export interface AutocompleteApiRequest extends NextApiRequest {
  body: AutocompleteApiRequestBody;
}
export interface AutocompleteApiRequestBody {
  stores: string[];
  term: string;
}
export interface PricesApiRequest extends NextApiRequest {
  body: PricesApiRequestBody;
}
export interface PricesApiRequestBody {
  stores: string[];
  skus: string[];
  start?: number;
  end?: number;
}
export interface AutocompleteResponse {
  terms: string[];
}
export interface PricesResponse {
  stores?: StorePricesResponse[];
}

export interface StorePricesResponse {
  id: string;
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
}

export interface SelectValue {
  key: string;
  label: ReactNode;
  value: string;
}

export type StorePrices = Map<string, SkuPrices>;
export type StoreMap = Map<string, StorePrices>;

export interface SkuPrices {
  prices: Price[];
  salePrices: Price[];
  lastPrice?: Price;
  lastSalePrice?: Price;
}

//START db types
export interface StoreConfig {
  name: string;
  apiEnabled: boolean;
}

export interface MongodbProductMetadata {
  sku: string;
  store_id: ObjectId;
  name?: string;
  brand?: string;
  ean?: string;
}

export interface MongodbProductPrice {
  sku: string;
  store_id: ObjectId;
  salePrice: boolean;
  price: number;
  start: number;
  end: number;
}

//END db types
