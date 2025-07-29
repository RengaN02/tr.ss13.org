'use client';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import useSWRImmutable from 'swr/immutable';
import { useDebounce } from 'use-debounce';

import useResize from '@/app/hooks/useResize';
import { Citation, Death, OverviewData } from '@/app/lib/definitions';
import fetcher from '@/app/lib/fetcher';
import { minutesToHours } from '@/app/lib/time';
import { Navigation } from '@/app/ui/navigation';

export default function Statistics({ statistics }: { statistics: OverviewData[] }) {
	return (
		<div className="w-full flex-1 flex flex-col items-center gap-5 px-2 pt-8 sm:px-14 lg:px-[13.5rem]">
			<div className="w-full flex flex-col items-center gap-5">
				<span className="text-center text-3xl font-bold mb-4">Genel Bakış</span>
				<Overview overview={statistics}/>
			</div>
			<div className="w-full flex flex-col items-center gap-5">
				<span className="text-center text-3xl font-bold mb-4">Olaylar</span>
				<Events />
			</div>
		</div>
	);
}

const overviewCategories = {
	players: 'Oyuncular',
	duration: 'Round Süresi',
	tier: 'Tehdit',
	deaths: 'Ölümler',
	citations: 'Sabıkalar',
};

type OverviewCategory = keyof typeof overviewCategories;

function Overview({ overview }: { overview: OverviewData[] }) {
	const [chartWidth, setChartWidth] = useState(800);
	const chartRef = useRef<HTMLDivElement>(null);

	const [selectedCategory, setSelectedCategory] = useState<OverviewCategory>('players');
	const [nightHours, setNightHours] = useState(false);

	const filtered = useMemo(() => overview.filter((round) => {
		if (!nightHours) {
			const time = new Date(`${round.time} GMT+0`);
			const hours = time.getUTCHours();
			// 12:00 - 00:00 GMT+3
			if (!(hours >= 9 && hours < 21)) return false;
		}

		return true;
	}).sort((a, b) => a.round_id - b.round_id), [overview, nightHours]);

	// workaround for line animation on category change otherwise it doesn't animate
	// might be related to https://github.com/recharts/recharts/issues/5114
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const animated = useMemo(() => Array.from(filtered), [filtered, selectedCategory]);

	useResize((entries) => {
		const { width } = entries[0].contentRect;
		setChartWidth(width);
	}, chartRef);

	return (
		<div className="w-full flex flex-col md:flex-row">
			<div className="max-md:w-full h-min flex flex-col">
				<div className="max-md:w-full h-min p-4 bg-gray-700 bg-opacity-10 rounded-xl">
					<h2 className="mb-4 text-white text-lg font-bold text-center md:text-base">Kategoriler</h2>
					<ul className="space-y-2 [&>li]:px-4 [&>li]:py-2">
						{Object.entries(overviewCategories).map(([category, name]) => (
							<li key={category} className={`${selectedCategory === category && 'bg-gray-500'} text-center cursor-pointer rounded-lg text-white hover:bg-gray-500 transition-colors text-nowrap`} onClick={() => setSelectedCategory(category as OverviewCategory)}>{name}</li>
						))}
					</ul>
				</div>
				<span className="py-2 text-center" title="00:00 ile 12:00 arası">
					<input type="checkbox" checked={nightHours} onChange={(e) => setNightHours(e.target.checked)} />
					&nbsp;Gece saatleri
				</span>
			</div>
			<div className="max-md:w-full md:flex-1 rounded-xl overflow-x-hidden">
				<div className="w-full flex justify-center">
					<ResponsiveContainer ref={chartRef} width="100%" height={400}>
						<LineChart width={chartWidth} height={400} data={animated} margin={{ top: 5, right: 50, left: 0, bottom: 5 }}>
							<XAxis dataKey="round_id" padding={{ left: 5, right: 5 }} />
							<YAxis padding={{ bottom: 5 }} allowDecimals={false} />
							<Tooltip
								cursor={{ opacity: 0.1 }}
								contentStyle={{ background: 'transparent', border: 'none' }}
								itemStyle={{ color: 'rgb(186 186 186)' }}
								content={<OverviewTooltip category={selectedCategory} />}
							/>
							<Line dataKey={selectedCategory} dot={false} type="monotone" />
							{selectedCategory === 'players' && (
								<Line dataKey="readied_players" dot={false} type="monotone" stroke="#fcdf76" />
							)}
							{selectedCategory === 'citations' && (
								<Line dataKey="crimes" dot={false} type="monotone" stroke="#fc7a76ff" />
							)}
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}

function OverviewTooltip({ active, payload, label, category }: TooltipProps<number, string> & { category: OverviewCategory; }) {
	var threat_tiers = ["Greenshift", "Düşük Kaos", "Düşük-Orta Kaos", "Orta-Yüksek Kaos", "Yüksek Kaos"]
	if (active && payload && payload.length) {
		switch (category) {
			case 'players':
				return (
					<div className="[&>p]:text-center [&>p]:text-gray-100 [&>p:last-child]:text-gray-400 [&>p:last-child]:text-sm">
						<p>Toplam: {payload[0].value} kişi</p>
						<p>Ready: {payload[1]?.value ?? '0'} kişi</p>
						<p>{`Round ${label}`}</p>
					</div>
				);
			case 'duration':
				return (
					<div className="[&>p]:text-center [&>p]:text-gray-100 [&>p:last-child]:text-gray-400 [&>p:last-child]:text-sm">
						<p>{minutesToHours(payload[0].value ?? 0)}</p>
						<p>{`Round ${label}`}</p>
					</div>
				);
			case 'tier':
				return (
					<div className="[&>p]:text-center [&>p]:text-gray-100 [&>p:last-child]:text-gray-400 [&>p:last-child]:text-sm">
						<p>{threat_tiers[payload[0].value]}</p>
						<p>{`Round ${label}`}</p>
					</div>
				);
			case 'deaths':
				return (
					<div className="[&>p]:text-center [&>p]:text-gray-100 [&>p:last-child]:text-gray-400 [&>p:last-child]:text-sm">
						<p>{`${payload[0].value} ölüm`}</p>
						<p>{`Round ${label}`}</p>
					</div>
				);
			case 'citations':
				return (
					<div className="[&>p]:text-center [&>p]:text-gray-100 [&>p:last-child]:text-gray-400 [&>p:last-child]:text-sm">
						<p>{`${payload[0].value} para cezası`}</p>
						<p>{`${payload[1].value} suç kaydı`}</p>
						<p>{`Round ${label}`}</p>
					</div>
				);
			default:
				return (
					<div className="[&>p]:text-center [&>p]:text-gray-100 [&>p:last-child]:text-gray-400 [&>p:last-child]:text-sm">
						<p>{payload[0].value}</p>
						<p>{`Round ${label}`}</p>
					</div>
				);
		}
	}

	return null;
}

const eventCategories = {
	deaths: 'Ölümler',
	crimes: "Suç Kayıtları",
	citations: 'Para Cezaları',
};

type EventCategory = keyof typeof eventCategories;

const pageSizeOptions = [10, 20, 30, 40] as const;

type PageSizeOption = (typeof pageSizeOptions)[number];

function Events() {
	const [selectedCategory, setSelectedCategory] = useState<EventCategory>('deaths');

	const [page, setPage] = useState(1);
	const [debouncedPage] = useDebounce(page, 200);
	const [pageSize, setPageSize] = useState<PageSizeOption>(20);

	type Data = { data: Death[] | Citation[]; total_count: number; };

	const [shownData, setShownData] = useState<Data | null>(null);

	const { data, error, isLoading } = useSWRImmutable<Data>(`/api/events/${selectedCategory}?page=${debouncedPage}&fetch_size=${pageSize}`, fetcher);

	useSWRImmutable(`/api/events/${selectedCategory}?page=${debouncedPage + 1}&fetch_size=${pageSize}`, fetcher);

	useEffect(() => {
		if (data) {
			setShownData(data);
		}
	}, [data])

	const maxPage = useMemo(() => Math.ceil((shownData?.total_count ?? 1) / pageSize), [pageSize, shownData?.total_count]);

	useEffect(() => {
		if (page > maxPage) {
			setPage(maxPage);
		}
	}, [page, maxPage]);

	const lastLength = useRef(0);

	useEffect(() => {
		if (shownData?.data.length) {
			if (lastLength.current !== 0) {
				setTimeout(() => {
					document.getElementById('events-navigation')?.scrollIntoView({
						block: 'end',
						inline: 'nearest',
						behavior: 'smooth',
					});
				}, 1);
			}
			lastLength.current = shownData.data.length;
		}
	}, [shownData?.data.length]);

	const onNext = useCallback(() => {
		setPage((prev) => Math.min(prev + 1, maxPage));
	}, [maxPage]);

	const onPrevious = useCallback(() => {
		setPage((prev) => Math.max(prev - 1, 1));
	}, []);

	const onChange = useCallback((value: number) => {
		setPage(Math.min(Math.max(value, 1), maxPage));
	}, [maxPage]);

	return (
		<div className="w-full flex flex-col md:flex-row md:space-x-4">
			<div className="max-md:w-full h-min p-4 mb-4 bg-gray-700 bg-opacity-10 rounded-xl">
				<h2 className="mb-4 text-white text-lg font-bold text-center md:text-base">Kategoriler</h2>
				<ul className="space-y-2 [&>li]:px-4 [&>li]:py-2">
					{Object.entries(eventCategories).map(([category, name]) => (
						<li key={category} className={`${selectedCategory === category && 'bg-gray-500'} text-center cursor-pointer rounded-lg text-white hover:bg-gray-500 transition-colors text-nowrap`} onClick={() => setSelectedCategory(category as EventCategory)}>{name}</li>
					))}
				</ul>
			</div>
			<div className="max-md:w-full md:flex-1 bg-gray px-4 rounded-xl">
				{isLoading && !shownData && !error && (
					<div className="w-full flex items-center justify-center">
						<div className="w-12 h-12 flex items-center justify-center opacity-50">
							<Icon icon={faSpinner} size="3x" spin />
						</div>
					</div>
				)}
				{shownData && (
					<ul>
						{shownData.data.map((item, index) => <Event key={index} item={item} />)}
					</ul>
				)}
				{error && (
					<div className="w-full flex items-center justify-center">
						<span className="text-red-500">An error has occurred: {error.message}</span>
					</div>
				)}
				<div className="flex justify-between items-center mt-4">
					<div className="ml-2 space-x-4" title="Sayfa boyutu">
						{pageSizeOptions.map(size => <span key={size} className={`${size === pageSize && 'underline'} hover:underline cursor-pointer`} onClick={() => setPageSize(size)}>{size}</span>)}
					</div>
					<div className="flex items-center gap-1">
						{shownData && isLoading && <span className="w-5 flex justify-center opacity-50"><Icon icon={faSpinner} spin /></span>}
						<Navigation id="events-navigation" value={page} min={1} max={maxPage} onPrevious={onPrevious} onNext={onNext} onChange={onChange} />
					</div>
				</div>
			</div>
		</div>
	);
}

function Event({ item }: { item: Death | Citation }) {
	if ('name' in item) {
		return (
			<li className="p-4 mb-4 bg-gray-600 bg-opacity-10 text-white rounded-lg">
				<div className="w-full flex flex-col">
					<div className="flex items-center justify-between gap-1">
						<div className="inline">
							<span className="mr-1 font-bold text-xl">{item.name}</span><span className="text-gray-400 text-sm">has died at <span className="text-gray-300">{item.pod}</span> as <span className="text-gray-300">{item.job}</span></span>
						</div>
						{item.last_words && <span className="text-gray-400 text-sm">&quot;{item.last_words}&quot;</span>}
					</div>
					<div className="w-full mt-2 flex justify-between">
						<div className="flex flex-wrap gap-2">
							<div className="border border-red-300 text-red-300 px-2 py-1 rounded-md text-xs">Round {item.round_id}</div>
							{item.suicide && <div className="border border-purple-300 text-purple-300 px-2 py-1 rounded-md text-xs">İntihar</div>}
						</div>
						<div className="flex items-center gap-2 [&>span]:text-sm">
							<span title="Brute" className="text-red-500">{item.bruteloss}</span>
							<span title="Burn" className="text-orange-500">{item.fireloss}</span>
							<span title="Oxygen" className="text-blue-500">{item.oxyloss}</span>
							<span title="Toxin" className="text-green-500">{item.toxloss}</span>
						</div>
					</div>
				</div>
			</li>
		);
	}

	if ('sender' in item) {
		var is_citation = (item.fine != null && item.fine > 0)
		return (
			<li className="p-4 mb-4 bg-gray-600 bg-opacity-10 text-white rounded-lg">
				<div className="w-full flex flex-col">
					<div className="flex items-center justify-between gap-1">
						<div className="inline">
							<span className="mr-1 font-bold text-xl">{item.recipient}</span><span className="text-gray-400 text-sm">{is_citation ? "fined":"ticketed"} by <span className="text-gray-300">{item.sender}</span> {is_citation && (<>for <span className="text-gray-300">{item.fine}cr</span></>)}</span>
						</div>
						<span className="text-gray-400 text-sm">{item.crime}</span>
					</div>
					{item.crime_desc != null && (
						<div className="w-full mt-2 flex">
							<div className="flex flex-wrap text-sm text-gray-100">
								{item.crime_desc}
							</div>
						</div>
					)}
					<div className="w-full mt-2 flex">
						<div className="flex flex-wrap">
							<div className="border border-red-300 text-red-300 px-2 py-1 rounded-md text-xs">Round {item.round_id}</div>
						</div>
					</div>
				</div>
			</li>
		);
	}

	return null;
}
