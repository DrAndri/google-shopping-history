import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';
import {
  RechartFormat,
  PricesResponse,
  AutocompleteResponse,
  SelectValue,
} from '../types';
import PriceChart from '../components/PriceChart/PriceChart';
import { Flex, Layout } from 'antd';
import SkuSelector from '../components/SkuSelector/SkuSelector';

const { Header, Content } = Layout;

export default function Home() {
  const mainLayoutRef = useRef<HTMLElement | null>(null);
  const [prices, setPrices] = useState<RechartFormat[]>();
  const [loading, setLoading] = useState(false);
  const [mainLayoutDimensions, setMainLayoutDimensions] = useState<{
    offsetWidth: number;
    offsetHeight: number;
  }>({ offsetHeight: 0, offsetWidth: 0 });
  const [selectedSkus, setSelectedSkus] = useState<SelectValue[]>([]);

  useEffect(() => {
    const filtered = selectedSkus.map((sku) => sku.value);
    fetch('/api/prices', {
      method: 'POST',
      body: JSON.stringify({ skus: filtered }),
    })
      .then((res) => res.json())
      .then((res: PricesResponse) => {
        setPrices(formatPricesForRechart(res));
        setLoading(false);
      })
      .catch((error) => console.log(error));
  }, [selectedSkus]);

  useEffect(() => {
    const offsetWidth = mainLayoutRef.current
      ? mainLayoutRef.current.offsetWidth
      : 0;
    const offsetHeight = mainLayoutRef.current
      ? mainLayoutRef.current.offsetHeight
      : 0;
    setMainLayoutDimensions({ offsetWidth, offsetHeight });
  }, []);

  const formatPricesForRechart = (res: PricesResponse) => {
    const prices: RechartFormat[] = res.prices.map((price) => {
      const key = price.sku + ' - price';
      return {
        [key]: price.price,
        timestamp: price.timestamp,
      };
    });
    const salePrices: RechartFormat[] = res.salePrices.map((price) => {
      const key = price.sku + ' - salePrice';
      return {
        [key]: price.price,
        timestamp: price.timestamp,
      };
    });
    return prices.concat(...salePrices);
  };

  async function searchForSkusBeginningWith(
    term: string,
  ): Promise<SelectValue[]> {
    return fetch('/api/autocomplete/' + term)
      .then((res) => res.json())
      .then((res: AutocompleteResponse) => {
        console.log(res);

        return res.terms.map((term: string) => ({
          label: term,
          value: term,
        }));
      });
  }

  if (loading) {
    return <div>loading...</div>;
  }
  return (
    <div className={styles.container}>
      <Layout style={{ height: '100vh' }}>
        <Header>
          <SkuSelector
            mode="multiple"
            value={selectedSkus}
            placeholder="Leitaðu að vörunúmeri..."
            fetchOptions={searchForSkusBeginningWith}
            onChange={(newValue) => {
              setSelectedSkus(newValue as SelectValue[]);
            }}
            style={{ width: '100%' }}
          />
        </Header>
        <Layout style={{ height: '100vh' }} ref={mainLayoutRef}>
          <Content>
            <Flex
              justify="space-around"
              align="center"
              style={{ height: '100%' }}
            >
              {prices && prices.length > 0 && (
                <PriceChart
                  prices={prices}
                  width={mainLayoutDimensions.offsetWidth - 50}
                  height={mainLayoutDimensions.offsetHeight - 50}
                />
              )}
            </Flex>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
