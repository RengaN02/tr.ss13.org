'use client';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef } from 'react';

import useServer from '@/app/hooks/useServer';
import { gameState, roundDuration } from '@/app/lib/conversion';
import type { ServerStatus } from '@/app/lib/definitions';

export default function ServerList() {
	const { servers, error, isLoading } = useServer();

	return (
		<div className="w-full flex-1 flex flex-col items-center gap-5 px-2 pt-8 pb-14 sm:px-14 sm:pt-20 lg:px-[13.5rem]">
			{isLoading && !servers && !error && (
				<ServerSkeleton />
			)}
			{servers?.map((status, index) => (
				<Server key={index} status={status} />
			))}
			{error && (
				<span className="text-red-500">An error has occurred: {error.message}</span>
			)}
		</div>
	);
}

type ServerProps = {
	status: ServerStatus;
};

function Server({ status }: ServerProps) {
	const durationRef = useRef<HTMLSpanElement>(null);
	const errorRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let duration = status.round_duration;

		const interval = setInterval(() => {
			duration += 1;
			if (durationRef.current) {
				durationRef.current.textContent = roundDuration(duration);
			}
		}, 1_000);

		return () => {
			clearInterval(interval);
		};
	}, [status.round_duration]);

	useEffect(() => {
		if (errorRef.current) {
			errorRef.current.innerHTML = status.err_str ?? '';
		}
	}, [status.err_str]);

	return (
		<div className="w-full flex flex-col p-4 bg-white shadow-slate-200 shadow-glow rounded-xl text-sm font-light text-gray-500 [&>span>span]:text-black">
			<div className="flex justify-between uppercase">
				<span className="text-xl font-extrabold">{status.name}</span>
				<span className={`${status.server_status ? 'bg-lime-400' : 'bg-red-400'} self-center px-2 rounded-xl text-white leading-7`}>{status.server_status ? 'Aktif' : 'Kapalı'}</span>
			</div>
			{status.server_status ? (
				<>
					<span>Map: <span>{status.map}</span></span>
					<span>Oyuncu sayısı: <span>{status.players}</span></span>
					<span>Round ID: <span>{status.round_id}</span></span>
					<span>Round durumu: <span>{gameState(status.gamestate)}</span></span>
					<span>Round süresi: <span ref={durationRef}>{roundDuration(status.round_duration)}</span></span>
					<a className="w-min px-2 py-1 mt-2 bg-green-400 hover:bg-green-500 rounded-xl text-white transition-colors" href={`byond://${status.connection_info}`}>Bağlan</a>
				</>
			) : (
				<div ref={errorRef}></div>
			)}
		</div>
	);
}

function ServerSkeleton() {
	return (
		<div className="w-full flex flex-col items-center p-4 text-sm">
			<span className="text-xl">&nbsp;</span>
			<span>&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;<br />&nbsp;</span>
			<span className="py-1 mt-2">&nbsp;</span>
			<div className="h-0 relative bottom-1/2 flex items-center">
				<div className="w-12 h-12 flex items-center justify-center opacity-50">
					<Icon icon={faSpinner} size="3x" spin/>
				</div>
			</div>
		</div>
	);
}
