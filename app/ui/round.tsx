'use client';

import '@/app/styles/round-report.css';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { Line, Tooltip as ChartTooltip, type TooltipContentProps,XAxis, YAxis } from 'recharts';

import { departmentColors, jobDepartments, threatTiers } from '@/app/lib/constants';
import { capitalize } from '@/app/lib/conversion';
import { ExtendedRoundData, RoundData } from '@/app/lib/definitions';
import { pictureImageLoader } from '@/app/lib/image-loader';
import { relativeTime } from '@/app/lib/time';
import Carousel from '@/app/ui/carousel';
import { LineChart } from '@/app/ui/chart';
import Tooltip from '@/app/ui/tooltip';

type RoundProps = {
	round: ExtendedRoundData;
	roundReport: string | null;
	github: string | undefined;
};

export default function Round({ round, roundReport, github }: RoundProps) {
	let roundDuration = '0 dakika 0 saniye';

	if (round.start_datetime && (round.end_datetime || round.shutdown_datetime)) {
		roundDuration = relativeTime(round.start_datetime, round.end_datetime || round.shutdown_datetime || undefined);
	}

	const stationName = round.station_name || 'Space Station 13';

	useEffect(() => {
		document.getElementById('navigation')?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	return (
		<div className="w-full max-w-full flex-1 flex flex-col items-center gap-5">
			{/* Round */}
			<div className="flex flex-col items-center gap-3 [&>span>span:first-child]:font-bold text-center">
				<span className="text-5xl font-bold">Round {round.round_id}</span>
				<span><span>Harita:</span> {round.map_name}</span>
				<span><span>Süre:</span> {roundDuration}</span>
				<span><span>İstasyon:</span> {stationName}</span>
				<span><span>Açılış Tarihi:</span> <span title={`${relativeTime(round.initialize_datetime)} önce`}>{round.initialize_datetime}</span></span>
				{round.start_datetime && (
					<span><span>Başlangıç Tarihi:</span> <span title={`${relativeTime(round.start_datetime)} önce`}>{round.start_datetime}</span></span>
				)}
				{round.end_datetime && (
					<span><span>Bitiş Tarihi:</span> <span title={`${relativeTime(round.end_datetime)} önce`}>{round.end_datetime}</span></span>
				)}
				{round.shutdown_datetime && (
					<span><span>Kapanış Tarihi:</span> <span title={`${relativeTime(round.shutdown_datetime)} önce`}>{round.shutdown_datetime}</span></span>
				)}
				{round.roundend_stats && (
					<span><span>İstasyon Bütünlüğü:</span> %{round.roundend_stats.station_integrity}</span>
				)}
				{round.dynamic_tier && (
					<span><span>Tehlike Seviyesi:</span> {threatTiers[round.dynamic_tier]}</span>
				)}
				{round.storyteller && (
					<span><span>Storyteller:</span> {capitalize(round.storyteller)}</span>
				)}
				{round.shuttle_name && (
					<span><span>Shuttle:</span> {capitalize(round.shuttle_name)}</span>
				)}
				{round.nukedisk && (round.nukedisk.x || round.nukedisk.holder) && (
					<span><span>Nuke Disk Konumu:</span>
					{' '}
					{round.nukedisk.holder}
					{(round.nukedisk.x && !round.nukedisk.holder) && ` X: ${round.nukedisk.x} Y: ${round.nukedisk.y} Z: ${round.nukedisk.z}`}</span>
				)}
				{round.commit_hash && github && (
					<span><span>Sürüm:</span> <Link className="text-blue-500 hover:text-blue-400" prefetch={false} href={`${github}/commit/${round.commit_hash}`}>{round.commit_hash.slice(0, 7)}</Link></span>
				)}
			</div>
			{/* Players */}
			{round.roundend_stats && (
				<Players antagonists={round.antagonists} stats={round.roundend_stats}/>
			)}
			{/* Population */}
			{round.population && (
				<Population population={round.population}/>
			)}
			{/* Logs */}
			{round.log_files.length > 0 && (
				<Logs logs={round.log_files}/>
			)}
			{/* Pictures */}
			{round.round_pictures.length > 0 && (
				<Pictures pictures={round.round_pictures}/>
			)}
			{/* Round Report */}
			{roundReport && (
				<RoundEndReport data={roundReport}></RoundEndReport>
			)}
		</div>
	);
}

type PlayersProps = {
	antagonists: ExtendedRoundData['antagonists'];
	stats: NonNullable<ExtendedRoundData['roundend_stats']>;
};

function Players({ antagonists, stats }: PlayersProps) {
	const sortedLiving = [...sortByJob(stats.living.humans), ...stats.living.silicons, ...stats.living.others];

	return (
		<div className="flex flex-col items-center gap-5">
			{/* Players */}
			<div className="flex flex-col items-center gap-3">
				<span className="text-center text-3xl font-bold">Oyuncular</span>
				<div className="flex flex-wrap justify-center gap-2 px-2 py-6 sm:px-14 md:px-18 xl:px-60">
					{sortedLiving.map(({ name, ckey: key, job, species, module }, index) => {
						const department = job ? jobDepartments[job] : '';
						const colorStyle = { '--color': departmentColors[department] ?? '#c5c5c5' } as React.CSSProperties;

						const antagonist = antagonists.filter(player => player.key === key && player.name === name);

						const ckey = key && key.toLowerCase().replace(/[^a-z0-9-_]/g, ''); // ckey in roundend log is infact not ckey

						return (
							<Tooltip key={index} content={
								<div className="flex flex-col gap-1 items-center min-w-64 max-w-96 w-max px-3 py-2 backdrop-blur-[12px] border border-gray-700 rounded-md shadow-lg text-sm text-white">
									<span className="font-bold text-lg flex flex-col items-center">
										{name}
										{key && <span className="font-normal text-sm text-gray-400">{key}</span>}
									</span>
									{job && <span className="text-[--color]" style={colorStyle}>{job}{module && ` (${module})`}</span>}
									{species && <span>{species}</span>}
									{antagonist.length > 0 && (
										<>
											<span className="font-bold text-[17px] text-red-500">Antagonist</span>
											{antagonist.map(({ antagonist_name }, index) => (
												<span key={index} className="font-medium text-white">{antagonist_name}</span>
											))}
										</>
									)}
								</div>
							}>
								<Link href={ckey && `/players/${ckey}` || '#'} className="text-center border px-2 py-1 rounded-[.25rem] text-[--color] border-[--color] hover:bg-[--color] hover:text-black transition-colors cursor-pointer" style={colorStyle}>{name}</Link>
							</Tooltip>
						);
					})}
				</div>
			</div>
			{/* Ghosts */}
			<div className="flex flex-col items-center gap-3">
				<span className="text-center text-3xl font-bold">İzleyiciler</span>
				<div className="flex flex-wrap justify-center gap-2 px-2 py-6 sm:px-14 md:px-18 xl:px-60">
					{stats.ghosts.map(({ ckey: key }, index) => {
							const ckey = key && key.toLowerCase().replace(/[^a-z0-9-_]/g, ''); // ckey in roundend log is infact not ckey

							return (
								<Link key={index} href={ckey && `/players/${ckey}` || '#'} className="border px-2 py-1 rounded-[.25rem] text-slate-400 border-slate-400 hover:bg-slate-400 hover:text-black transition-colors cursor-pointer">{ckey}</Link>
							);
					})}
				</div>
			</div>
		</div>
	);
}


type PopulationProps = {
	population: RoundData['population'];
};

function Population({ population }: PopulationProps) {
	return (
		<div className="w-full flex flex-col items-center gap-3 sm:px-14 lg:px-48">
			<span className="text-center text-3xl font-bold">Popülasyon</span>
			<LineChart data={population} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} containerStyle={{ position: 'relative', left: -22 }}>
				<XAxis dataKey="0" tick={false} padding={{ left: 5, right: 5 }} />
				<YAxis padding={{ bottom: 5 }} domain={[0, 80]}  />
				<ChartTooltip cursor={{ opacity: 0.1 }} content={PopulationChartTooltip} contentStyle={{ background: 'transparent', border: 'none' }} itemStyle={{ color: 'rgb(100 116 139)' }} />
				<Line type="monotone" dataKey="1" unit=" kişi" dot={false} />
			</LineChart>
		</div>
	);
}

function PopulationChartTooltip({ active, payload, label }: TooltipContentProps<number, string>) {
	if (active && payload && payload.length) {
				return (
					<div className="[&>p]:text-center [&>p]:text-gray-100 [&>p:last-child]:text-gray-400 [&>p:last-child]:text-sm">
						<p>{`${payload[0].value} kişi`}</p>
						<p>{label}</p>
					</div>
				);
		}
}

type LogsProps = {
	logs: ExtendedRoundData['log_files'];
};

function Logs({ logs }: LogsProps) {
	return (
		<div className="flex flex-col items-center gap-3">
			<span className="text-center text-3xl font-bold">Loglar</span>
			<div className="flex flex-wrap justify-center gap-2 px-2 py-6 sm:px-14 md:px-18 xl:px-60">
				{logs.map(({ name, src }, index) => (
					<Link key={index} href={src || '#'} prefetch={false} className={`border ${src ? 'border-green-500 text-green-500 hover:bg-green-500' : 'border-gray-400 text-gray-400 hover:bg-gray-400 cursor-not-allowed'} hover:text-black px-2 py-1 rounded-[.25rem] text-sm transition-colors`}>{name}</Link>
				))}
			</div>
		</div>
	);
}

type PicturesProps = {
	pictures: NonNullable<ExtendedRoundData['round_pictures']>;
};

function Pictures({ pictures }: PicturesProps) {
	return (
		<div className="flex flex-col items-center gap-3 max-w-full">
			<span className="text-center text-3xl font-bold">Fotoğraflar</span>
			<div className="w-full px-2 py-6 sm:px-14 md:px-18 xl:px-60">
				<Carousel
					gap={12}
					itemSize={192}
					breakpoints={{
						mobileSmall: 3,
						mobile: 4,
						tabletSmall: 5,
						tablet: 8,
						desktop: 10,
						largeDesktop: 12,
					}}
				>
					{pictures.map(({ name, id, caption, desc, src }, index) => (
						<Tooltip key={index} content={
							<div className="flex flex-col gap-3 items-center min-w-64 max-w-96 w-max px-3 py-2 backdrop-blur-[12px] border border-gray-700 rounded-md shadow-lg">
								<span className="font-bold">{name}</span>
								{id && <div className="text-sm text-gray-400">{id}</div>}
								{caption}
								{desc && <div dangerouslySetInnerHTML={{ __html: desc }}/>}
							</div>
						}>
							<div className="bg-black bg-opacity-30 rounded-md p-2 flex flex-col gap-2 items-center shadow-sm hover:shadow-md transition max-w-[45vw] sm:max-w-[192px]">
								<Image
									src={src}
									loader={pictureImageLoader}
									alt={name ?? ''}
									width={192}
									height={192}
									className="object-cover rounded-md pixelated w-full h-auto select-none"
									draggable={false}
								/>
								<span className="text-[10px] sm:text-sm text-center">{id}</span>
							</div>
						</Tooltip>
					))}
				</Carousel>
			</div>
		</div>
	);
}

function RoundEndReport({ data }: { data: string }) {
	return (
		<div className="flex flex-col items-center gap-3 md:px-24 lg:px-48 xl:px-96">
			<span className="text-center text-3xl font-bold">Round Raporu</span>
			<div dangerouslySetInnerHTML={{ __html: data.replaceAll('&nbsp;&nbsp;', '&nbsp;') }}/>
		</div>
	);
}

function sortByJob<T extends { job?: string | null }>(arr: T[]) {
  const jobOrder = Object.keys(jobDepartments)
    .reduce((prev, job, index) => {
      prev[job] = index;
      return prev;
    }, {} as Record<string, number>);

  const knowns: T[] = [];
  const unknowns: T[] = [];

  for (const item of arr) {
    if (item.job && jobOrder[item.job] !== undefined) {
      knowns.push(item);
    } else {
      unknowns.push(item);
    }
  }

  knowns.sort((a, b) => {
    return jobOrder[a.job!] - jobOrder[b.job!];
  });

  const unknownGroups: Record<string, T[]> = {};

	for (const unknown of unknowns) {
    const key = unknown.job ?? 'No Job';
		if (!unknownGroups[key]) unknownGroups[key] = [];
    unknownGroups[key].push(unknown);
  }

  const groupedUnknowns = Object.values(unknownGroups).flat();

  return [...knowns, ...groupedUnknowns];
}
