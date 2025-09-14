'use client';

import '../round-report.css';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import { Line, Tooltip as ChartTooltip, TooltipProps, XAxis, YAxis } from 'recharts';

import { departmentColors, jobDepartments, threatTiers } from '@/app/lib/constants';
import { RoundData } from '@/app/lib/definitions';
import { pictureLogLoader } from '@/app/lib/image-loader';
import { relativeTime } from '@/app/lib/time';
import { LineChart } from '@/app/ui/chart';
import ScrollableObjects from '@/app/ui/scrollable-objects';
import Tooltip from '@/app/ui/tooltip';


type NonNullableRoundData = NonNullable<RoundData>;

type RoundProps = {
	round: NonNullableRoundData;
	round_report: string | null;
	github_url: string | undefined;
};

export default function Round({ round, round_report, github_url }: RoundProps) {
	let round_duration = '0 dakika 0 saniye';
	if (round.start_datetime && (round.end_datetime || round.shutdown_datetime)) {
		round_duration = relativeTime(round.start_datetime, round.end_datetime || round.shutdown_datetime || undefined);
	}
	if (!round.station_name) round.station_name = 'Space Station 13';

	return (
		<div className='w-full max-w-full flex-1 flex flex-col grid'>
			<div className='col-span-2 flex flex-col gap-6'>
				<div className="max-w-full flex flex-col items-center gap-3">
					<span className="max-w-full text-center text-5xl font-bold overflow-hidden text-ellipsis">Round {round.round_id}</span>
					<span><span className="font-bold">Harita:</span> {round.map_name}</span>
					<span><span className="font-bold">Süre:</span> {round_duration}</span>
					<span><span className="font-bold">İstasyon:</span> {round.station_name}</span>
					{round.commit_hash && github_url && (
						<span><span className="font-bold">Version:</span> <Link className="text-blue-500 hover:text-blue-400" href={`${github_url}/commit/${round.commit_hash}`}>Commit</Link></span>
					)}
					<span><span className="font-bold">Açılma Tarihi:</span> {round.initialize_datetime}</span>
					{round.start_datetime && (
						<span><span className="font-bold">Başlama Tarihi:</span> {round.start_datetime}</span>
					)}
					{round.end_datetime && (
						<span><span className="font-bold">Bitiş Tarihi:</span> {round.end_datetime}</span>
					)}
					{round.shutdown_datetime && (
						<span><span className="font-bold">Kapanma Tarihi:</span> {round.shutdown_datetime}</span>
					)}
					{round.roundend_stats && (
						<span><span className="font-bold">İstasyon Bütünlüğü:</span> %{round.roundend_stats.station_integrity}</span>
					)}
					{round.dynamic_tier && (
						<span><span className="font-bold">Tehlike Seviyesi:</span> {threatTiers[round.dynamic_tier]}</span>
					)}
					{round.shuttle_name && (
						<span><span className="font-bold">Shuttle:</span> {round.shuttle_name}</span>
					)}
					{round.nukedisk && (round.nukedisk.x || round.nukedisk.holder) && (
						<span><span className="font-bold">Nuke Disk Konumu: </span>
						{round.nukedisk.holder}
						{(round.nukedisk.x && !round.nukedisk.holder) && ` X: ${round.nukedisk.x} Y: ${round.nukedisk.y} Z: ${round.nukedisk.z}`}</span>
					)}
				</div>
				<div className="max-w-full flex flex-col items-center gap-3">
					{round.roundend_stats && (
						<PlayersChart antagonists={round.antagonists} roundend_stats={round.roundend_stats}/>
					)}
				</div>
				<div className="max-w-full flex flex-col items-center gap-3">
					{round.population && (
						<PopulationChart population={round.population}/>
					)}
				</div>
				<div className="max-w-full flex flex-col items-center gap-3">
					{round.log_files && (
						<Logs log_files={round.log_files}/>
					)}
				</div>
				<div className="w-full flex flex-col items-center gap-3">
					{round.round_pictures && !!round.round_pictures.length && (
						<Pictures pictures={round.round_pictures}/>
					)}
				</div>
				{round_report && (
					<div className="w-full flex flex-col items-center gap-3">
						<RoundEndReport data={round_report}></RoundEndReport>
					</div>
				)}
			</div>
		</div>
	);
}

type PlayersProps = {
	antagonists: NonNullableRoundData['antagonists'];
	roundend_stats: NonNullableRoundData['roundend_stats'];
};

function PlayersChart({ antagonists, roundend_stats }: PlayersProps) {
	if(!roundend_stats) return <></>;
	const sortedLiving = [...sortByJob(roundend_stats.living.humans), ...roundend_stats.living.silicons, ...roundend_stats.living.others];
	return (
		<div className='max-w-full w-5/6 flex flex-col items-center gap-5'>
		<div className="max-w-full flex flex-col items-center gap-3">
			<span className="max-w-full text-center text-2xl font-bold overflow-hidden text-ellipsis">Oyuncular</span>
			<div className="flex flex-wrap gap-2 justify-center">
			{sortedLiving.map((item, index) => {
				let department = '';
				const antagonist = antagonists.filter(user => (user.key === item.ckey && user.name === item.name));

				if(item.job) {
					department = jobDepartments[item.job];
				}

				return (
					<Tooltip
						key={index}
						content={
							<div className="flex flex-col gap-2 items-center">
								<b className="text-lg flex flex-col items-center">{item.name} {item.ckey && (<div className='text-sm text-gray-400'>{item.ckey}</div>)}</b>
								{item.job && (<div>Görevi: {item.job}</div>)}
								{item.species && (<div>Irk: {item.species}</div>)}
								{item.module && (<div>Model: {item.module}</div>)}
								{antagonist.length > 0 && (
									<Fragment>
										<b className="text-[17px]">Özel Roller:</b>
										{antagonist.map((antagItem, antagIndex) => (
											<div
												key={antagIndex}
												className="w-full rounded-md flex flex-col items-center"
											>
												<div className="font-semibold text-white">{antagItem.antagonist_name}</div>
											</div>
										))}
									</Fragment>
								)}
							</div>
						}
					>
						<div
						className='border px-2 py-1 rounded-[.25rem]'
						style={{
              color: departmentColors[department] ?? '#c5c5c5',
							borderColor: departmentColors[department] ?? '#c5c5c5'
            }}
						>
							{item.name}
						</div>
					</Tooltip>
				);
			})}
			</div>
		</div>
		<div className="max-w-full flex flex-col items-center gap-3">
			<span className="max-w-full text-center text-2xl font-bold overflow-hidden text-ellipsis">İzleyiciler</span>
			<div className="flex flex-wrap gap-2 justify-center">
			{roundend_stats.ghosts.map((item, index) => (
				<div
					key={index}
					className='border px-2 py-1 rounded-[.25rem] text-slate-400 border-slate-400 cursor-default'
				>
					{item.ckey}
				</div>
				))}
			</div>
		</div>
		</div>
	);
}


type PopulationChartProps = {
	population: NonNullableRoundData['population'];
};

function PopulationChart({ population }: PopulationChartProps) {
	return (
		<div className="w-full flex flex-col items-center gap-3">
			<span className="w-full text-center text-2xl font-bold overflow-hidden text-ellipsis">Oyuncu Popülasyonu</span>
			<LineChart data={population} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} containerStyle={{ position: 'relative', left: -22 }}>
				<XAxis dataKey="0" tick={false} padding={{ left: 5, right: 5 }} />
				<YAxis padding={{ bottom: 5 }} domain={[0, 24]} />
				<ChartTooltip cursor={{ opacity: 0.1 }} content={PopulationChartTooltip} contentStyle={{ background: 'transparent', border: 'none' }} itemStyle={{ color: 'rgb(100 116 139)' }} />
				<Line type="monotone" dataKey="1" unit=" kişi" dot={false} />
			</LineChart>
		</div>
	);
}

function PopulationChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
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
	log_files: NonNullableRoundData['log_files'];
};

function Logs({ log_files }: LogsProps) {
	return (
		<div className="max-w-full flex flex-col items-center gap-3">
			<span className="max-w-full text-center text-2xl font-bold overflow-hidden text-ellipsis">Loglar</span>
			<div className="flex flex-wrap gap-2">
				{log_files.map((item, index) => (
					<Link key={index} href={item.src ?? ''} prefetch={false} className={`border ${item.src ? 'border-green-500 text-green-500 hover:bg-green-500' : 'border-gray-400 text-gray-400 hover:bg-gray-400 cursor-not-allowed'} hover:text-black px-2 py-1 rounded-[.25rem] text-sm`}>{item.name}</Link>
				))}
			</div>
		</div>
	);
}

type PicturesProps = {
	pictures: NonNullable<NonNullableRoundData['round_pictures']>;
};

function Pictures({ pictures }: PicturesProps) {
	return (
		<div className="w-full flex flex-col items-center">
			<span className="max-w-full text-center text-2xl font-bold overflow-hidden text-ellipsis">Fotoğraflar</span>
			<div className="justify-center w-5/6">
				<ScrollableObjects
					itemLength={pictures.length}
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
					{pictures.map((item, index) => (
						<Tooltip
							key={index}
							content={
							<div className="flex flex-col gap-3 items-center">
								<b>{item.name}</b>
								{item.id && (<div className='text-sm text-gray-400'>{item.id}</div>)}
								{item.caption}
								{item.desc && (<div dangerouslySetInnerHTML={{ __html: item.desc }}/>)}
							</div>
							}
						>
							<div className="bg-black bg-opacity-30 rounded-md p-2 flex flex-col items-center shadow-sm hover:shadow-md transition max-w-[45vw] sm:max-w-[192px]">
								<Image
									src={item.src}
									loader={pictureLogLoader}
									alt={item.name ?? ''}
									width={192}
									height={192}
									className="object-cover rounded-md image-pixelated w-full h-auto"
									draggable={false}
								/>
								<p className="mt-2 text-[10px] sm:text-sm text-center">{item.id}</p>
							</div>
						</Tooltip>
					))}
				</ScrollableObjects>
			</div>
		</div>
	);
}

function RoundEndReport({ data }: { data: string }) {
	const innerHtml = data?.replaceAll('&nbsp;&nbsp;', '&nbsp;');
	return (
		<div className="w-full flex flex-col items-center">
			<span className="max-w-full text-center text-2xl font-bold overflow-hidden text-ellipsis">Round Raporu</span>
			{innerHtml && (
				<div dangerouslySetInnerHTML={{ __html: innerHtml }}/>
			)}
		</div>
	);
}

function sortByJob<T extends { job?: string | null }>(arr: T[]) {
  const jobOrder: Record<string, number> = Object.keys(jobDepartments)
    .reduce((acc, job, index) => {
      acc[job] = index;
      return acc;
    }, {} as Record<string, number>);

  const known: T[] = [];
  const unknown: T[] = [];

  for (const item of arr) {
    if (item.job && jobOrder[item.job] !== undefined) {
      known.push(item);
    } else {
      unknown.push(item);
    }
  }

  known.sort((a, b) => {
    return jobOrder[a.job!] - jobOrder[b.job!];
  });

  const unknownGroups: Record<string, T[]> = {};
  for (const item of unknown) {
    const key = item.job ?? 'No Job';
    if (!unknownGroups[key]) unknownGroups[key] = [];
    unknownGroups[key].push(item);
  }

  const groupedUnknowns = Object.values(unknownGroups).flat();

  return [...known, ...groupedUnknowns];
}
