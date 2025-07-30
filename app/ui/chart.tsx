import { useEffect, useRef, useState } from 'react';
import { BarChart as Bar, LineChart as Line,ResponsiveContainer } from 'recharts';

import useResize from '@/app/hooks/useResize';

type ChartContainerProps = {
	children: React.ReactNode,
	height?: number,
	setWidth?: React.Dispatch<React.SetStateAction<number>>
} & React.HTMLAttributes<HTMLDivElement>;

function ChartContainer({ children, height, setWidth, ...props }: ChartContainerProps) {
	const [chartWidth, setChartWidth] = useState(0);
	const chartRef = useRef<HTMLDivElement>(null);

	useResize((entries) => {
		const { width } = entries[0].contentRect;
		setChartWidth(width);
	}, chartRef);

	useEffect(() => {
		if (setWidth) {
			setWidth(chartWidth);
		}
	}, [chartWidth, setWidth]);

	return (
		<ResponsiveContainer ref={chartRef} width="100%" height={height} {...props}>
			{chartWidth ? <>{children}</> : <></>}
		</ResponsiveContainer>
	);
}

type LineChartProps = {	children?: React.ReactNode;
	height?: number;
	containerStyle?: React.CSSProperties;
} & Omit<React.ComponentProps<typeof Line>, 'width' | 'height'>;

export function LineChart({ height = 400, children, containerStyle, ...props }: LineChartProps) {
	const [chartWidth, setChartWidth] = useState(0);

	return (
		<ChartContainer height={height} setWidth={setChartWidth} style={containerStyle}>
			<Line width={chartWidth} height={height} {...props}>{children}</Line>
		</ChartContainer>
	);
}

type BarChartProps = {
	height?: number;
	containerStyle?: React.CSSProperties;
} & Omit<React.ComponentProps<typeof Bar>, 'width' | 'height'>;

export function BarChart({ height = 400, children, containerStyle, ...props }: BarChartProps) {
	const [chartWidth, setChartWidth] = useState(0);

	return (
		<ChartContainer height={height} setWidth={setChartWidth} style={containerStyle}>
			<Bar width={chartWidth} height={height} {...props}>{children}</Bar>
		</ChartContainer>
	);
}
