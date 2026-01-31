'use client';

import { faCalendarAlt, faClock, faExclamationTriangle, faLayerGroup, faSpinner, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { useDebounce } from 'use-debounce';

import type { Message as MessageType } from '@/app/lib/definitions';
import fetcher from '@/app/lib/fetcher';
import { Navigation } from '@/app/ui/navigation';

type MessageResponse = {
	data: MessageType[];
	total_count: number;
}

const pageSizeOptions = [5, 10, 15, 20] as const;
type PageSizeOption = (typeof pageSizeOptions)[number];

export default function AdminRemarks() {
	return (
		<div className="w-full flex-1 flex flex-col items-center gap-5 px-2 pt-8 sm:px-14 lg:px-[13.5rem]">
			<Messages/>
			<Notes/>
		</div>
	);
}

function Messages() {
	const [page, setPage] = useState(1);
	const [debouncedPage] = useDebounce(page, 200);
	const [pageSize, setPageSize] = useState<PageSizeOption>(10);

	const [shownData, setShownData] = useState<MessageResponse | null>(null);

	const { data, error, isLoading } = useSWRImmutable<MessageResponse>(`/api/player/messages?page=${debouncedPage}&fetch_size=${pageSize}`, fetcher);

	useSWRImmutable(`/api/player/messages?page=${debouncedPage + 1}&fetch_size=${pageSize}`, fetcher);

	useEffect(() => {
		if (data) {
			setShownData(data);
		}
	}, [data]);

	const maxPage = useMemo(() => Math.ceil((shownData?.total_count ?? 1) / pageSize), [pageSize, shownData?.total_count]);

	useEffect(() => {
		if (page > maxPage && maxPage > 0) {
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
						behavior: 'smooth',
					});
				}, 50);
			}
			lastLength.current = shownData.data.length;
		}
	}, [shownData?.data.length]);

	const onNext = useCallback(() => setPage((p) => Math.min(p + 1, maxPage)), [maxPage]);
	const onPrevious = useCallback(() => setPage((p) => Math.max(p - 1, 1)), []);
	const onChange = useCallback((value: number) => setPage(Math.min(Math.max(value, 1), maxPage)), [maxPage]);

	return (
		<div className="w-full flex flex-col items-center gap-5">
			<span className="text-center text-3xl font-bold mb-4 flex items-center gap-3">Mesajlar</span>
			<div className="w-full flex flex-col">
				{isLoading && !shownData && (
					<div className="py-20 flex flex-col items-center justify-center opacity-50">
						<Icon icon={faSpinner} size="3x" spin/>
						<span className="mt-4 text-lg">Mesajlar yükleniyor...</span>
					</div>
				)}
				{shownData && (
					<div className="flex flex-col gap-6">
						{shownData.data.map((item, index) => (
							<Message key={index} item={item}/>
						))}
					</div>
				)}
				{error && (
					<div className="w-full p-10 text-center text-red-400">
						Bir hata oluştu: {error.message}
					</div>
				)}
				<div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-700">
					<div className="flex items-center gap-3 text-sm text-gray-400">
						<span>Sayfa Boyutu:</span>
						{pageSizeOptions.map(size => (
							<button
								key={size}
								onClick={() => setPageSize(size)}
								className={`px-2 py-1 rounded ${size === pageSize ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
							>
								{size}
							</button>
						))}
					</div>
					<div className="flex items-center gap-3">
						{shownData && isLoading && <Icon icon={faSpinner} size="3x" spin/>}
						<Navigation
							id="events-navigation"
							value={page}
							min={1}
							max={maxPage}
							onPrevious={onPrevious}
							onNext={onNext}
							onChange={onChange}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function Notes() {
	const [page, setPage] = useState(1);
	const [debouncedPage] = useDebounce(page, 200);
	const [pageSize, setPageSize] = useState<PageSizeOption>(10);

	const [shownData, setShownData] = useState<MessageResponse | null>(null);

	const { data, error, isLoading } = useSWRImmutable<MessageResponse>(`/api/player/notes?page=${debouncedPage}&fetch_size=${pageSize}`,
		fetcher
	);

	useSWRImmutable(`/api/player/notes?page=${debouncedPage + 1}&fetch_size=${pageSize}`, fetcher);

	useEffect(() => {
		if (data) setShownData(data);
	}, [data]);

	const maxPage = useMemo(() =>
		Math.ceil((shownData?.total_count ?? 1) / pageSize),
		[pageSize, shownData?.total_count]
	);

	useEffect(() => {
		if (page > maxPage && maxPage > 0) setPage(maxPage);
	}, [page, maxPage]);

	const lastLength = useRef(0);

	useEffect(() => {
		if (shownData?.data.length) {
			if (lastLength.current !== 0) {
				setTimeout(() => {
					document.getElementById('events-navigation')?.scrollIntoView({
						block: 'end',
						behavior: 'smooth',
					});
				}, 50);
			}
			lastLength.current = shownData.data.length;
		}
	}, [shownData?.data.length]);

	const onNext = useCallback(() => setPage((p) => Math.min(p + 1, maxPage)), [maxPage]);
	const onPrevious = useCallback(() => setPage((p) => Math.max(p - 1, 1)), []);
	const onChange = useCallback((value: number) => setPage(Math.min(Math.max(value, 1), maxPage)), [maxPage]);

	return (
		<div className="w-full flex flex-col items-center gap-5">
			<h1 className="text-center text-3xl font-bold mb-4 flex items-center gap-3">
				Notlar
			</h1>

			<div className="w-full flex flex-col">
				{isLoading && !shownData && (
					<div className="py-20 flex flex-col items-center justify-center opacity-50">
						<Icon icon={faSpinner} size="3x" spin/>
						<span className="mt-4 text-lg">Notlar yükleniyor...</span>
					</div>
				)}
				{shownData && (
					<div className="flex flex-col gap-6">
						{shownData.data.map((item, index) => (
							<Message key={index} item={item}/>
						))}
					</div>
				)}
				{error && (
					<div className="w-full p-10 text-center text-red-400">
						Bir hata oluştu: {error.message}
					</div>
				)}
				<div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-700">
					<div className="flex items-center gap-3 text-sm text-gray-400">
						<span>Sayfa Boyutu:</span>
						{pageSizeOptions.map(size => (
							<button
								key={size}
								onClick={() => setPageSize(size)}
								className={`px-2 py-1 rounded ${size === pageSize ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
							>
								{size}
							</button>
						))}
					</div>
					<div className="flex items-center gap-3">
						{shownData && isLoading && <Icon icon={faSpinner} size="3x" spin/>}
						<Navigation
							id="events-navigation"
							value={page}
							min={1}
							max={maxPage}
							onPrevious={onPrevious}
							onNext={onNext}
							onChange={onChange}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function Message({ item }: { item: MessageType }) {
	const severityStyles: Record<string, string> = {
    none: 'border-l-gray-500',
    minor: 'border-l-blue-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-orange-500 ',
  };

  const currentSeverity = item.severity ? String(item.severity).toLowerCase() : 'none';

  const activeStyle = severityStyles[currentSeverity];

  return (
    <div className={`flex flex-col gap-3 p-5 pb-3 bg-white/5 border-l-4 rounded-r-md transition-hover hover:bg-white/10 ${activeStyle}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-wider font-semibold opacity-80">
        <div className="flex items-center gap-2">
          <Icon icon={faUserShield} className="text-blue-400" />
          <span>Admin: <span className="text-white">{item.adminckey}</span></span>
        </div>

        <div className="flex items-center gap-2">
          <Icon icon={faCalendarAlt} />
          <span>{new Date(item.timestamp).toLocaleDateString('tr-TR')} - {item.days_passed} gün önce</span>
        </div>
      </div>

      <div className="text-sm leading-relaxed text-gray-200 break-words whitespace-pre-wrap italic bg-black/20 p-3 rounded">
        {item.text}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 border-t border-white/5 pt-2">
        {item.server && (
          <div className="flex items-center gap-1">
            <span className="font-bold">Server:</span> {item.server}
          </div>
        )}

        {item.round_id && (
          <Link href={`/rounds/${item.round_id}`} className="flex items-center gap-1">
            <Icon icon={faLayerGroup} size="xs" />
            <span className="font-bold">Round:</span> #{item.round_id}
          </Link>
        )}

        {item.playtime !== null && (
          <div className="flex items-center gap-1">
            <Icon icon={faClock} size="xs" />
            <span>Playtime: {Math.floor(item.playtime / 60)}s</span>
          </div>
        )}

        {item.severity && (
          <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded bg-white/5">
            <Icon icon={faExclamationTriangle} size="xs" />
            <span className="uppercase">{item.severity}</span>
          </div>
        )}
      </div>

    </div>
  );
}
