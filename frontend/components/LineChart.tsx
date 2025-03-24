import { View } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';

interface LineChartProps {
  data: number[];
  color?: string;
}

export function LineChart({ data, color = '#2563eb' }: LineChartProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  // Normalize data to fit in view
  const normalizedData = data.map(value => 
    range === 0 ? 0.5 : (value - min) / range
  );

  // Create SVG path
  const width = 100;
  const height = 50;
  const points = normalizedData.map((value, index) => 
    `${(index / (data.length - 1)) * width},${(1 - value) * height}`
  );
  const pathData = `M ${points.join(' L ')}`;

  return (
    <View className="w-full h-full">
      <Svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <Path
          d={pathData}
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
        {normalizedData.map((value, index) => (
          <Circle
            key={index}
            cx={(index / (data.length - 1)) * width}
            cy={(1 - value) * height}
            r="2"
            fill={color}
          />
        ))}
      </Svg>
    </View>
  );
} 