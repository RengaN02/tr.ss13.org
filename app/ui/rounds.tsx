'use client';

import '../round-report.css';

import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { useDebounce } from 'use-debounce';

import { RoundData } from '@/app/lib/definitions';
import fetcher from '@/app/lib/fetcher';
import { relativeTime } from '@/app/lib/time';
import { Navigation } from '@/app/ui/navigation';

const pageSizeOptions = [20, 40, 80] as const;

type PageSizeOption = (typeof pageSizeOptions)[number];

export default function Rounds() {
	const inputRef = useRef<HTMLInputElement>(null);
	const timeoutRef = useRef(0);

	const [input, setInput] = useState('0');
	const [page, setPage] = useState(1);
	const [debouncedPage] = useDebounce(page, 200);
	const [pageSize, setPageSize] = useState<PageSizeOption>(40);
	const [pattern, setPattern] = useState<number[]>([]);

	const MAX = 2147483647;

	type Data = { data: RoundData[]; total_count: number; };

	const [shownData, setShownData] = useState<Data | null>(null);
	const { data, error, isLoading } = useSWRImmutable<Data>(`/api/rounds?page=${debouncedPage}&fetch_size=${pageSize}${Number(input) ? `&round_id=${input}` : ''}`, fetcher);

	useSWRImmutable(`/api/rounds?page=${debouncedPage + 1}&fetch_size=${pageSize}${Number(input) ? `&round_id=${input}` : ''}`, fetcher);

	const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
      let newValue = e.target.value;

      e.target.value = newValue.replaceAll(/[^0-9]/g, '');

      if (newValue !== '' && Number(newValue) > MAX) {
        newValue = String(MAX);
				e.target.value = newValue;
      }

      setInput(newValue);
		}, 500) as any as number;
	}, []);

	useEffect(() => {
		if (data) {
			setShownData(data);
		}
	}, [data]);

	const maxPage = useMemo(() => Math.ceil((shownData?.total_count ?? 1) / pageSize), [pageSize, shownData?.total_count]);

	useEffect(() => {
		if (page > maxPage) {
			setPage(maxPage);
		}
		if(!page && maxPage) {
			setPage(1);
		}
	}, [page, maxPage]);

	useEffect(() => {
		setTimeout(() => {
			inputRef.current?.focus();
		}, 1);
	}, []);


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


	useEffect(() => {
		const checkDevice = () => {
			const width = window.innerWidth;
			let visibleCount;

			if (width <= 550) {
				visibleCount = [1];
			} else if (width <= 880) {
				visibleCount = [2];
			} else if (width <= 1200) {
				visibleCount = [2,3];
			} else if (width <= 1366) {
				visibleCount = [3,4];
			} else if (width <= 1700) {
				visibleCount = [4,5];
			} else {
				visibleCount = [5,6];
			}
			setPattern(visibleCount);
		};

		checkDevice();

		window.addEventListener('resize', checkDevice);

		return () => {
			window.removeEventListener('resize', checkDevice);
		};
	}, []);

	const onNavNext = useCallback(() => {
		setPage((prev) => Math.min(prev + 1, maxPage));
	}, [maxPage]);

	const onNavPrevious = useCallback(() => {
		setPage((prev) => Math.max(prev - 1, 1));
	}, []);

	const onNavChange = useCallback((value: number) => {
		setPage(Math.min(Math.max(value, 1), maxPage));
	}, [maxPage]);

	return (
		<div className="w-full flex-1 flex-col md:flex-row">
			<div className="w-full flex justify-center">
				<div className="flex items-center px-3 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-[.25rem] text-center">
					<input className="h-full flex-1 bg-transparent outline-none" type="number" ref={inputRef} onChange={onChange} placeholder="Round ara"></input>
					<div className="w-5 flex justify-center"><Icon icon={isLoading ? faSpinner : faSearch} spin={isLoading} className={`${isLoading && 'opacity-50'} text-white align-middle`} /></div>
				</div>
			</div>
			<br/>
			<div className="w-full md:flex-1 bg-gray px-2 sm:px-4 rounded-xl">
				{isLoading && !shownData && !error && (
					<div className="w-full flex items-center justify-center">
						<div className="w-12 h-12 flex items-center justify-center opacity-50">
							<Icon icon={faSpinner} size="3x" spin />
						</div>
					</div>
				)}
<div className="w-full flex flex-col items-center">
	{shownData && (
    chunkPattern(shownData.data, pattern).map((row, rowIndex) => (
      <ul
        key={rowIndex}
        className="
          grid
          grid-flow-col auto-cols-auto
          gap-4 place-items-center mb-4
          sm:auto-cols-[minmax(0,1fr)]
          md:auto-cols-auto
        "
      >
        {row.map((item, index) => (
          <Round key={index} item={item} />
        ))}
      </ul>
    ))
	)}
</div>
				{error && (
					<div className="w-full flex items-center justify-center">
						<span className="text-red-500">An error has occurred: {error.message}</span>
					</div>
				)}
				<div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
					<div className="flex space-x-4" title="Sayfa boyutu">
						{pageSizeOptions.map(size => (
							<span
								key={size}
								className={`${size === pageSize && 'underline'} hover:underline cursor-pointer`}
								onClick={() => setPageSize(size)}
							>
								{size}
							</span>
						))}
					</div>
					<div className="flex items-center gap-2">
						{shownData && isLoading && (
							<span className="w-5 flex justify-center opacity-50">
								<Icon icon={faSpinner} spin />
							</span>
						)}
						<Navigation id="events-navigation" value={page} min={1} max={maxPage} onPrevious={onNavPrevious} onNext={onNavNext} onChange={onNavChange} />
					</div>
				</div>
			</div>
		</div>
	);
}

function Round({ item }: { item: RoundData }) {
	let round_duration = '0 dakika';
	if (item.start_datetime && (item.end_datetime || item.shutdown_datetime)) {
		round_duration = relativeTime(item.start_datetime, item.end_datetime || item.shutdown_datetime || undefined);
	}
	if (!item.station_name) item.station_name = 'Space Station 13';

	return (
<li className="flex justify-center items-center w-64 h-32 rounded-lg overflow-hidden bg-gray-700 bg-opacity-10 backdrop-blur-sm text-white shadow-md transition-all duration-200 hover:bg-opacity-15 hover:shadow-lg group">
  <Link href={`/rounds/${item.round_id}`} className="w-full">
    <div className="w-full p-3 sm:p-4 text-xs sm:text-sm flex flex-col items-center text-center">
      <div>
        <span className="mr-1 font-bold text-lg sm:text-xl group-hover:text-yellow-300">
          Round {item.round_id}
        </span>
      </div>
      <div>
        <span className="font-bold">Harita:</span> {item.map_name}
      </div>
      <div>
        <span className="font-bold">Süre:</span> {round_duration}
      </div>
      {item.station_name && (
        <div>
          <span className="font-bold">İstasyon:</span> {item.station_name}
        </div>
      )}
    </div>
  </Link>
</li>
	);
}

function chunkPattern<T>(array: T[], pattern: number[]): T[][] {
  const result: T[][] = [];
  let i = 0;
  let patternIndex = 0;

  while (i < array.length) {
    const size = pattern[patternIndex % pattern.length];
    result.push(array.slice(i, i + size));
    i += size;
    patternIndex++;
  }

  return result;
}
