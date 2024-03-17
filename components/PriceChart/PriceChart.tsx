import { CartesianGrid, Line, LineChart, Tooltip, XAxis } from 'recharts';
import { PriceChartProps } from '../../types';

export default function PriceChart({ prices, width, height }: PriceChartProps) {
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
    console.log(entries);
    const flattened = entries.reduce((prev, current) => {
      prev = prev.concat(current);
      return prev;
    }, []);
    const filtered = flattened.filter((key) => key !== 'timestamp');
    const uniqueKeys = [...new Set(filtered)];
    console.log(uniqueKeys);
    return uniqueKeys.map((key) => {
      console.log(key);
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

  return (
    <LineChart
      width={width}
      height={height}
      data={prices}
      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
    >
      <XAxis
        dataKey="timestamp"
        type="number"
        domain={['dataMin', 'dataMax']}
        tickCount={10}
        tickFormatter={(value) => {
          console.log(value);
          const date = new Date(value);
          return date.toLocaleDateString('is-IS', {
            year: 'numeric',
            month: '2-digit',
          });
        }}
      />
      <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
      <CartesianGrid stroke="#f5f5f5" />
      {getRechartLines()}
    </LineChart>
  );
}
