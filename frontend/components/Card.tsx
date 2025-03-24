import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <View 
      className={`bg-white rounded-xl p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </View>
  );
} 