import { useCallback, useState } from 'react';
import { LineChart, Line, XAxis, Tooltip, CartesianGrid } from 'recharts';
import styles from '../styles/Home.module.css';
import { RechartFormat, SkuResponse } from '../types';

export default function Home() {
  const [prices, setPrices] = useState<RechartFormat[]>();
  const [loading, setLoading] = useState(false);
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    if (query.length) {
      fetch('/api/prices/' + query)
        .then((res) => res.json())
        .then((res: SkuResponse) => {
          setPrices(formatPricesForRechart(res));
          setLoading(false);
        });
    } else {
      setPrices([]);
    }
  }, []);

  const formatPricesForRechart = (res: SkuResponse) => {
    const prices: RechartFormat[] = res.prices.map((price) => {
      return {
        price: price.price,
        timestamp: new Date(price.timestamp).getTime(),
      };
    });
    const salePrices: RechartFormat[] = res.salePrices.map((price) => {
      return {
        salePrice: price.price,
        timestamp: new Date(price.timestamp).getTime(),
      };
    });
    return prices.concat(salePrices);
  };

  const getRandomColor = () => {
    return (
      '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')
    );
  };

  const getRechartLines = () => {
    if (!prices) return null;
    const entries = prices.map((option) => {
      const keys = Object.keys(option);
      return keys;
    });
    const flattened = entries.reduce((prev, current) => {
      prev = prev.concat(current);
      return prev;
    }, []);
    const filtered = flattened.filter((key) => key !== 'timestamp');
    const uniqueKeys = [...new Set(filtered)];
    return uniqueKeys.map((key) => {
      return (
        <Line
          key={key}
          type="stepAfter"
          stroke={getRandomColor()}
          dataKey={key}
        />
      );
    });
  };

  if (loading) {
    return <div>loading...</div>;
  }
  return (
    <div className={styles.container}>
      <input onChange={onChange} />
      {prices && prices.length > 0 && (
        <LineChart
          width={400}
          height={400}
          data={prices}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value, index) => {
              const date = new Date(value);
              return date.toLocaleDateString('is-IS', {
                // you can use undefined as first argument
                year: 'numeric',
                month: '2-digit',
              });
            }}
          />
          <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
          <CartesianGrid stroke="#f5f5f5" />
          {getRechartLines()}
        </LineChart>
      )}
    </div>
  );
}
