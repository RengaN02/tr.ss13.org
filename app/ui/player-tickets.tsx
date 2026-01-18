'use client';

import { faClock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { useDebounce } from 'use-debounce';

import { TicketGroup } from '@/app/lib/definitions';
import fetcher from '@/app/lib/fetcher';
import { Navigation } from '@/app/ui/navigation';

type TicketResponse = {
  data: TicketGroup[];
  total_count: number;
}

const pageSizeOptions = [5, 10, 15, 20] as const;
type PageSizeOption = (typeof pageSizeOptions)[number];

export default function Tickets({ckey}: {ckey: string}) {

  const [page, setPage] = useState(1);
  const [debouncedPage] = useDebounce(page, 200);
  const [pageSize, setPageSize] = useState<PageSizeOption>(10);

  const [shownData, setShownData] = useState<TicketResponse | null>(null);

  const { data, error, isLoading } = useSWRImmutable<TicketResponse>(`/api/player/tickets?page=${debouncedPage}&fetch_size=${pageSize}`,
    fetcher
  );

  useSWRImmutable(`/api/player/tickets?page=${debouncedPage + 1}&fetch_size=${pageSize}`, fetcher);

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
    <div className="w-full flex-1 flex flex-col items-center gap-5 pt-8 px-4 sm:px-8 md:px-14 lg:px-[13.5rem] xl:px-[20rem] ultrawide:px-[30rem] huge:px-[40rem]">
      <div className="w-full flex flex-col items-center gap-5">
        <h1 className="text-center text-3xl font-bold mb-4 flex items-center gap-3">
          Ticketler
        </h1>

        <div className="w-full flex flex-col">
          {isLoading && !shownData && (
            <div className="py-20 flex flex-col items-center justify-center opacity-50">
							<Icon icon={faSpinner} size="3x" spin/>
              <span className="mt-4 text-lg">Ticketler yükleniyor...</span>
            </div>
          )}
          {shownData && (
            <div className="flex flex-col gap-6">
              {shownData.data.map((item) => (
                <Ticket key={`${item.round_id}-${item.ticket_id}`} ticket={item} currentCkey={ckey} />
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

function Ticket({ ticket, currentCkey }: { ticket: TicketGroup, currentCkey: string | null; }) {

  return (
    <div className="flex flex-col bg-black bg-opacity-20 rounded-md border border-gray-700 overflow-hidden">
      <div className="bg-gray-700 bg-opacity-30 px-4 py-2 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-4">
					<Link href={`/rounds/${ticket.round_id}`}><span className="font-bold text-blue-300">Round #{ticket.round_id}</span></Link>
          <span className="bg-gray-800 px-2 py-0.5 rounded text-xs text-gray-300 border border-gray-600">
            Ticket #{ticket.ticket_id}
          </span>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Icon icon={faClock} size="xs" />
          {new Date(ticket.logs[0].timestamp).toLocaleDateString()}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {ticket.logs.map((log, idx) => {
          const isMe = log.sender?.toLowerCase() === currentCkey?.toLowerCase();
          return (
            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] p-3 rounded-lg text-sm ${
                isMe ? 'bg-blue-900 bg-opacity-40 border border-blue-800 text-blue-50':'bg-orange-700 bg-opacity-20 border border-orange-800 text-orange-50'
              }`}>
                <div className="flex items-center gap-2 mb-1">
									<Link href={log.sender ? `/players/${log.sender}` : ''} >
                  <span className={`font-bold text-[11px] uppercase tracking-wider ${isMe ? 'text-blue-300' : 'text-orange-400'}`}>
                    {log.sender || 'SYSTEM'}
                  </span>
									</Link>
                  <span className="text-[10px] text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="whitespace-pre-wrap leading-relaxed">{log.message}</p>

                {log.action !== 'Reply' && log.action !== 'Ticket Opened' && (
                  <div className="mt-2 pt-1 border-t border-white border-opacity-10 text-[10px] italic opacity-60">
                    Action: {log.action}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
