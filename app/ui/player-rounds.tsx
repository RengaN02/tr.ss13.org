'use client';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { useDebounce } from 'use-debounce';

import { Manifest } from '@/app/lib/definitions';
import fetcher from '@/app/lib/fetcher';
import { playerSpriteImageLoader } from '@/app/lib/image-loader';
import { Navigation } from '@/app/ui/navigation';
import PlayerSprite from '@/app/ui/player-sprite';

type ManifestResponse = {
	data: Manifest[];
	total_count: number;
}

const pageSizeOptions = [10, 20, 30, 40] as const;
type PageSizeOption = (typeof pageSizeOptions)[number];


export default function PlayerRounds({ckey}: {ckey:string}) {
  const [page, setPage] = useState(1);
  const [debouncedPage] = useDebounce(page, 200);
  const [pageSize, setPageSize] = useState<PageSizeOption>(20);

  const [shownData, setShownData] = useState<ManifestResponse | null>(null);

  const { data, error, isLoading } = useSWRImmutable<ManifestResponse>(`/api/player/rounds?page=${debouncedPage}&fetch_size=${pageSize}`, fetcher);

  useSWRImmutable(`/api/player/rounds?page=${debouncedPage + 1}&fetch_size=${pageSize}`, fetcher);

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
    <div className="w-full flex-1 flex flex-col items-center gap-5 pt-8 max-w-5xl">
      <div className="w-full flex flex-col items-center gap-5">
        <h1 className="text-center text-3xl font-bold mb-4 flex items-center gap-3">
          Geçmiş Roundlar
        </h1>

        <div className="w-full flex flex-col">
          {isLoading && !shownData && (
            <div className="py-20 flex flex-col items-center justify-center opacity-50">
							<Icon icon={faSpinner} size="3x" spin/>
              <span className="mt-4 text-lg">Roundlar yükleniyor...</span>
            </div>
          )}
          {shownData && (
            <div className="grid md:grid-cols-2 gap-2">
              {shownData.data.map((item) => (
                <Round key={`${item.round_id}-${item.id}`} item={item} ckey={ckey}/>
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
    </div>
  );
}

function Round({ item, ckey }: { item: Manifest, ckey: string }) {
  const date = new Date(item.timestamp).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link
      href={`/rounds/${item.round_id}`}
      className="group flex items-center w-full bg-black/60 border border-white/5 hover:border-white/20 transition-all p-2 gap-3 sm:gap-4"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-950/80 border border-white/10 flex-shrink-0 flex items-center justify-center">
        <PlayerSprite
          imageSrc={`${ckey.toLowerCase()}/${item.character_name.replace(/[\\\n\t/?%*:|<>]|\.\./g, '').replaceAll(' ', '%20')}.png`}
          direction={0}
          scale={1.5}
					targetArea={1}
					job={item.job}
					loader={playerSpriteImageLoader}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-gray-100 font-bold truncate uppercase tracking-wide text-sm sm:text-base">
            {item.character_name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] sm:text-xs">
          <span className="text-blue-500/40 font-bold">#</span>
          <span className="text-gray-400 uppercase font-medium tracking-tight truncate">
            {item.job}
          </span>
          {item.latejoin && (
            <span className="xs:inline-block text-[9px] sm:text-[10px] text-blue-400 border border-white/10 px-1.5 py-0.5 font-mono bg-white/5">
              LATEJOIN
            </span>
          )}
					{item.special && item.special !== 'NONE' && (
            <span className="xs:inline-block text-[9px] sm:text-[10px] text-red-400 border border-white/10 px-1.5 py-0.5 font-mono bg-white/5">
              {item.special}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center shrink-0 sm:border-l border-white/10 sm:pl-6 pr-1 sm:pr-4 flex justify-center">
        <span className="text-[10px] sm:text-xs font-mono text-gray-400 group-hover:text-gray-100 transition-colors">
          <span className="hidden sm:inline">ROUND</span> #{item.round_id}
        </span>
        <span className="text-[9px] sm:text-[11px] font-mono text-gray-500 mt-0.5">
          {date}
        </span>
      </div>
    </Link>
  );
}
