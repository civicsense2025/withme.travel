/**
 * Type definitions for @tremor/react
 * These are simplified type definitions for use until proper types are installed
 */

declare module '@tremor/react' {
  import { ReactNode, FC, ComponentProps } from 'react';

  export interface BaseChartProps {
    data: Record<string, any>[];
    index: string;
    categories: string[];
    colors?: string[];
    valueFormatter?: (value: number) => string;
    showAnimation?: boolean;
    animationDuration?: number;
    className?: string;
    yAxisWidth?: number;
    showLegend?: boolean;
    showGridLines?: boolean;
    autoMinValue?: boolean;
    minValue?: number;
    maxValue?: number;
    startEndOnly?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;
    enableLegendSlider?: boolean;
    onValueChange?: (value: any) => void;
    customTooltip?: FC<any>;
  }

  export interface BarChartProps extends BaseChartProps {
    layout?: 'vertical' | 'horizontal';
    stack?: boolean;
    relative?: boolean;
  }

  export interface LineChartProps extends BaseChartProps {
    connectNulls?: boolean;
    curveType?: 'linear' | 'natural' | 'monotone' | 'step';
    showMarkers?: boolean;
    showGradient?: boolean;
    enableLegendSlider?: boolean;
    intervalType?: 'preserveStart' | 'preserveEnd';
  }

  export interface AreaChartProps extends LineChartProps {
    stack?: boolean;
    relative?: boolean;
  }

  export interface DonutChartProps {
    data: Record<string, any>[];
    category: string;
    index: string;
    colors?: string[];
    valueFormatter?: (value: number) => string;
    variant?: 'pie' | 'donut';
    label?: string;
    showAnimation?: boolean;
    animationDuration?: number;
    className?: string;
    showLabel?: boolean;
    showTooltip?: boolean;
    customTooltip?: FC<any>;
    onValueChange?: (value: any) => void;
  }

  export interface BarListProps {
    data: {
      name: string;
      value: number;
      icon?: ReactNode;
      href?: string;
      target?: string;
      color?: string;
    }[];
    className?: string;
    valueFormatter?: (value: number) => string;
    color?: string;
    showAnimation?: boolean;
    animationDuration?: number;
    onValueChange?: (value: any) => void;
    customTooltip?: FC<any>;
  }

  export interface CardProps {
    children: ReactNode;
    className?: string;
    decoration?: 'top' | 'bottom' | 'left' | 'right' | 'none';
    decorationColor?: string;
    shadow?: boolean;
  }

  export interface TitleProps {
    children: ReactNode;
    className?: string;
  }

  export interface LegendProps {
    categories: string[];
    colors?: string[];
    className?: string;
    onClickLegendItem?: (category: string) => void;
  }

  export const BarChart: FC<BarChartProps>;
  export const LineChart: FC<LineChartProps>;
  export const AreaChart: FC<AreaChartProps>;
  export const DonutChart: FC<DonutChartProps>;
  export const BarList: FC<BarListProps>;
  export const Card: FC<CardProps>;
  export const Title: FC<TitleProps>;
  export const Legend: FC<LegendProps>;
}
