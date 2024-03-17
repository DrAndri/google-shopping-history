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
  timestamp: string;
  price: number;
  sku?: string;
}

export interface RechartFormat {
  timestamp: number;
  price?: number;
  salePrice?: number;
}

export interface Env {
  INFLUX_DB_URL: string;
  INFLUX_DB_TOKEN: string;
  INFLUX_DB_ORG: string;
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
