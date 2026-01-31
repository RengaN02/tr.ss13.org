'use client';

import {
	faArrowDown,
	faArrowUp,
	faQuestion,
	faSpinner,
	faUserCheck,
	faUserClock,
	faUserFriends,
	faUserMinus,
	faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bar, Line, Tooltip, type TooltipContentProps, XAxis, YAxis } from 'recharts';
import useSWRImmutable from 'swr/immutable';

import {
	acceptFriend,
	addFriend,
	declineFriend,
	removeFriend,
} from '@/app/lib/actions';
import { achievementsIcons, roles } from '@/app/lib/constants';
import type { Friendship, Player } from '@/app/lib/definitions';
import fetcher from '@/app/lib/fetcher';
import { achievementsImageLoader } from '@/app/lib/image-loader';
import { relativeTime } from '@/app/lib/time';
import Button from '@/app/ui/button';
import Carousel from '@/app/ui/carousel';
import { BarChart, LineChart } from '@/app/ui/chart';
import { NumberInput } from '@/app/ui/input';
import { Navigation } from '@/app/ui/navigation';

type PlayerProps = {
	player: Player;
};

export default function Player({ player }: PlayerProps) {
	useEffect(() => {
		document.getElementById('navigation')?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	return (
		<div className="w-full max-w-full flex-1 flex flex-col items-center gap-5">
			{/* Basic Info */}
			<div className="max-w-full flex flex-col items-center gap-3">
				<div className="w-full flex justify-center items-center">
					<div className="relative">
						<span className="block text-5xl font-bold overflow-hidden text-ellipsis whitespace-nowrap max-w-[80vw]">
							{player.byond_key || player.ckey}
						</span>
						<FriendButton player={player} />
					</div>
				</div>
				<span>İlk Görülen Round: {player.first_seen_round}</span>
				<span>Son Görülen Round: {player.last_seen_round}</span>
				<span>İlk Görülen Tarih: <span title={`${relativeTime(player.first_seen)} önce`}>{player.first_seen}</span></span>
				<span>Son Görülen Tarih: <span title={`${relativeTime(player.last_seen)} önce`}>{player.last_seen}</span></span>
				<span>BYOND&apos;a Katıldığı Tarih: <span title={`${relativeTime(player.byond_age)} önce`}>{player.byond_age}</span></span>
			</div>
			{/* Characters */}
			<div className="flex flex-col items-center gap-3">
				<span className="text-center text-3xl font-bold">Karakterler</span>
				<div className="flex flex-wrap justify-center gap-4 px-2 py-6 sm:px-14 md:px-18 xl:px-60">
					{player.characters.length ? player.characters.map(([character]) => (
						<Button key={character}>{character}</Button>
					)) : (
						<span className="text-center">Hiçbir karakter bulunamadı.</span>
					)}
				</div>
			</div>
			{/* Activity */}
			<div className="w-full flex flex-col items-center gap-3 sm:px-14 lg:px-48">
				<span className="text-center text-3xl font-bold">Aktivite</span>
				{player.activity.length ? (
					<ActivityChart activity={player.activity} />
				) : (
					<div className="flex justify-center py-6 text-center">
						<span>180 gün içerisinde hiçbir aktivite bulunamadı.</span>
					</div>
				)}
			</div>
			{/* Roletimes */}
			<div className="w-full flex flex-col items-center gap-3 sm:px-14 lg:px-48">
				<span className="text-center text-3xl font-bold">Rol Süreleri</span>
				{player.roletime.length ? (
					<RoletimeChart roletime={player.roletime} />
				) : (
					<div className="flex justify-center py-6 text-center">
						<span>Hiçbir rol bulunamadı.</span>
					</div>
				)}
			</div>
			{/* Achievements */}
			<div className="w-full flex flex-col items-center gap-3 sm:px-14 lg:px-48">
				<span className="text-center text-3xl font-bold">Başarımlar</span>
				{player.achievements.length ? (
					<Achievements achievements={player.achievements} />
				) : (
					<div className="flex justify-center py-6 text-center">
						<span>Hiçbir başarım bulunamadı.</span>
					</div>
				)}
			</div>
			{/* Ban History */}
			<div className="w-full flex flex-col items-center gap-3 sm:px-14 lg:px-48">
				<span className="text-center text-3xl font-bold">
					<div className="h-0"><div className="relative left-[calc(100%+8px)] -top-2 w-4 h-4 opacity-60 hover:opacity-100 transition-opacity cursor-help flex" title="Yalnızca 23.08.2023'den itibaren kalıcı olan banlar listeleniyor"><Icon icon={faQuestion} className="w-full h-full" /></div></div>
					Ban Geçmişi
				</span>
				{player.bans.length ? (
					<BanHistory bans={player.bans} />
				) : (
					<div className="flex justify-center py-6 text-center">
						<span>Hiçbir kalıcı ban bulunamadı.</span>
					</div>
				)}
			</div>
		</div>
	);
}

type RoletimeChartProps = {
	roletime: Player['roletime'];
};

const tooltipFormatter = (value: number) => [value.toString().replace('.', ','), ''];

function RoletimeChart({ roletime }: RoletimeChartProps) {
	const [maxBars, setMaxBars] = useState(20);
	const [inputInvalid, setInputInvalid] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);

	const [chartOptions, setChartOptions] = useState({
		jobs: true,
		nonRole: false,
		trait: true,
		spawner: false,
		ghost: false,
		antagonists: false,
	});

	const filterJob = useCallback((
		job: Player['roletime'][number]['job'],
		options: typeof chartOptions
	) => !(
		(!options.nonRole && roles.nonRoles.includes(job)) ||
		(!options.trait && roles.traitRoles.includes(job)) ||
		(!options.spawner && roles.spawnerRoles.includes(job)) ||
		(!options.ghost && roles.ghostRoles.includes(job)) ||
		(!options.antagonists && roles.antagonistRoles.includes(job)) ||
		(!options.jobs && !roles.all.includes(job))
	), []);

	const roletimeFilter = useCallback(({ job }: { job: string }) => filterJob(job, chartOptions), [filterJob, chartOptions]);

	const onCheckboxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = event.target;

		const setOptions = (options: typeof chartOptions) => {
			if (roletime.filter(({ job }) => filterJob(job, options)).length) {
				setChartOptions(options);
			}
		};

		switch (name) {
			case 'jobs':
				setOptions({ ...chartOptions, jobs: checked });
				break;
			case 'trait':
				setOptions({ ...chartOptions, trait: checked });
				break;
			case 'ghost':
				setOptions({ ...chartOptions, ghost: checked });
				break;
			case 'spawner':
				setOptions({ ...chartOptions, spawner: checked });
				break;
			case 'antagonists':
				setOptions({ ...chartOptions, antagonists: checked });
				break;
			case 'other':
				setOptions({ ...chartOptions, nonRole: checked });
				break;
		}
	}, [roletime, filterJob, chartOptions]);

	const filteredRoletime = useMemo(() => roletime.filter(roletimeFilter).map(({ job, minutes }) => ({ job, hours: Math.floor(minutes / 6) / 10, })), [roletime, roletimeFilter]);
	const visibleRoletime = useMemo(() => filteredRoletime.slice(0, maxBars), [filteredRoletime, maxBars]);

	const onInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		let value: string | number = event.target.value;

		if (!value) {
			event.target.value = '1';
		} else if (value.startsWith('0') && +value !== 0) {
			event.target.value = String(+value);
		}

		value = +event.target.value;

		if (value >= 1 && value <= filteredRoletime.length) {
			setMaxBars(value);
			setInputInvalid(false);
		} else {
			if (value > filteredRoletime.length) {
				setMaxBars(filteredRoletime.length);
			}
			setInputInvalid(true);
		}
	}, [filteredRoletime]);

	useEffect(() => {
		if (inputRef.current) {
			const value = +inputRef.current.value;

			if (value >= 1 && value <= filteredRoletime.length) {
				setInputInvalid(false);
			} else {
				setInputInvalid(true);
			}
		}
	}, [filteredRoletime]);

	return (
		<>
			<BarChart data={visibleRoletime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} containerStyle={{ position: 'relative', left: -22 }}>
				<XAxis dataKey="job" padding={{ left: 5, right: 5 }} />
				<YAxis padding={{ bottom: 5 }} allowDecimals={false} />
				<Tooltip cursor={{ opacity: 0.1 }} separator="" formatter={tooltipFormatter} contentStyle={{ background: 'transparent', border: 'none' }} itemStyle={{ color: 'rgb(100 116 139)' }} />
				<Bar dataKey="hours" fill="#dc2626" unit=" saat" />
			</BarChart>
			<div className="flex flex-wrap items-center justify-center gap-4 [&>div]:flex [&>div]:items-center [&>div]:gap-2">
				<div>
					<span>Meslekler</span>
					<input name="jobs" type="checkbox" checked={chartOptions.jobs} onChange={onCheckboxChange} />
				</div>
				<div>
					<span>Station Trait</span>
					<input name="trait" type="checkbox" checked={chartOptions.trait} onChange={onCheckboxChange} />
				</div>
				<div>
					<span>Ghost Offer</span>
					<input name="ghost" type="checkbox" checked={chartOptions.ghost} onChange={onCheckboxChange} />
				</div>
				<div>
					<span>Spawner</span>
					<input name="spawner" type="checkbox" checked={chartOptions.spawner} onChange={onCheckboxChange} />
				</div>
				<div>
					<span>Antagonist</span>
					<input name="antagonists" type="checkbox" checked={chartOptions.antagonists} onChange={onCheckboxChange} />
				</div>
				<div>
					<span>Diğer</span>
					<input name="other" type="checkbox" checked={chartOptions.nonRole} onChange={onCheckboxChange} />
				</div>
			</div>
			<NumberInput ref={inputRef} className="pb-4" style={{ opacity: inputInvalid ? 0.7 : 1 }} title="Gösterilen sütun sayısı" onChange={onInputChange} defaultValue={maxBars} min={1} max={999} />
		</>
	);
}

type ActivityChartProps = {
	activity: Player['activity'];
};

function ActivityChart({ activity }: ActivityChartProps) {
	const data = useMemo(() => {
		const activityClone = [...activity];
		const days: { date: string; rounds: number, index: number }[] = [];
		const firstDay = dayjs().subtract(180, 'day').startOf('day');

		for (let i = 0; i < 180; i++) {
			const day = firstDay.add(i, 'day').format('YYYY-MM-DD');
			days.push({ date: day, rounds: activityClone.find(([date]) => date === day)?.[1] ?? 0, index: i });
		}

		return days;
	}, [activity]);

	const [slope, intercept] = useMemo(() => {
		const daysAvg = (data.length - 1) / 2;
		const roundsAvg = data.reduce((sum, day) => sum + day.rounds, 0) / data.length; // y

		const slope = data.reduce((sum, { rounds }, day) => sum + (day - daysAvg) * (rounds - roundsAvg), 0) / data.reduce((sum, _, day) => sum + (day - daysAvg) ** 2, 0);
		const intercept = roundsAvg - slope * daysAvg;

		return [slope, intercept];
	}, [data]);

	return (
		<LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} containerStyle={{ position: 'relative', left: -22 }}>
			<XAxis dataKey="date" tick={false} padding={{ left: 5, right: 5 }} />
			<YAxis dataKey="rounds" domain={[0, 24]} padding={{ bottom: 5 }} />
			{/* @ts-expect-error i couldnt figure out */}
			<Tooltip cursor={{ opacity: 0.1 }} content={<ActivityTooltip slope={slope} />} />
			<Line type="linear" dataKey={({ index }) => slope * index + intercept} stroke="#212121" dot={false} activeDot={false} strokeDasharray="5 5" />
			<Line type="monotone" dataKey="rounds" dot={false} />
		</LineChart>
	);
}

function ActivityTooltip({ active, payload, label, slope }: TooltipContentProps<number, string> & { slope: number }) {
	if (!active || !payload) return null;

	const rounds = payload[1].value ?? 0;
	const average = payload[0].value ?? 0;

	return (
		<div className="flex flex-col">
			<span>{label}</span>
			<div className="flex gap-2">
				<span className="text-[#64748B]">{rounds.toString()} round</span>
				{average > 0 && (
					<span className={`${rounds > average ? 'text-green-300' : 'text-red-300'} text-opacity-50 transition-colors`}>{(Math.round(average * 10) / 10).toString().replace('.', ',')} ort.</span>
				)}
				{slope !== 0 && (slope > 0 ? (
					<span className="text-green-300 text-opacity-50"><Icon icon={faArrowUp} /></span>
				) : (
					<span className="text-red-300 text-opacity-50"><Icon icon={faArrowDown} /></span>
				))}
			</div>
		</div>
	);
}

type AchievementsProps = {
	achievements: Player['achievements'];
};

function Achievements({ achievements }: AchievementsProps) {
	return (
		<div className="justify-center py-5">
			<Carousel>
				{achievements.map(({ achievement_name, achievement_description, achievement_key }) =>
					<div
						key={achievement_key}
						className="flex-shrink-0 w-[76px] h-[76px] rounded-md flex items-center justify-center border border-transparent hover:border-slate-300 hover:border-opacity-20 select-none"
						title={`${achievement_name}\n${achievement_description}`}
						aria-label={achievement_key}
						role="img"
					>
						<Image
							className="rounded-sm object-cover pixelated"
							src={`${achievementsIcons[achievement_key] ?? achievement_key}.png`}
							loader={achievementsImageLoader}
							alt={achievement_name || 'Başarım'}
							width={76}
							height={76}
							draggable={false}
						/>
					</div>
				)}
			</Carousel>
		</div>
	);
}

type BanHistoryProps = {
	bans: Player['bans'];
};

function BanHistory({ bans }: BanHistoryProps) {
	const [currentBan, setCurrentBan] = useState(1);

	const onInputChange = useCallback((value: number) => {
		if (value >= 1 && value <= bans.length) {
			setCurrentBan(value);
		}
	}, [bans.length]);

	const onPrevious = useCallback(() => {
		setCurrentBan((current) => Math.max(current - 1, 1));
	}, []);

	const onNext = useCallback(() => {
		setCurrentBan((current) => Math.min(current + 1, bans.length));
	}, [bans.length]);

	const ban = bans[bans.length - currentBan];

	return (
		<>
			<div className="max-w-md flex flex-col items-center gap-2 p-4 [&>span:nth-child(odd)]:text-gray-500">
				<span>Round</span>
				<span>{ban.round_id ?? '—'}</span>
				<span>Tarih</span>
				<span title={`${relativeTime(ban.bantime)} önce`}>{ban.bantime}</span>
				<span>Süre</span>
				<span>{ban.expiration_time ? relativeTime(ban.bantime, ban.expiration_time) : 'Kalıcı'}</span>
				<span>Admin</span>
				<span><Link href={`/players/${ban.a_ckey}`}>{ban.a_ckey}</Link></span>
				<span>Kaldırıldığı Tarih</span>
				{ban.unbanned_datetime ? <span title={`${relativeTime(ban.bantime, ban.unbanned_datetime)} sonra`}>{ban.unbanned_datetime}</span> : <span>—</span>}
				<span>Kaldıran Admin</span>
				<span>{ban.unbanned_ckey ? <Link href={`/players/${ban.unbanned_ckey}`}>{ban.unbanned_ckey}</Link> : '—'}</span>
				<span>Roller</span>
				<span className="text-center">{ban.roles ?? '—'}</span>
				<span>Sebep</span>
				<span className="text-center">{ban.reason}</span>
			</div>
			<Navigation id="bans-navigation" value={currentBan} min={1} max={bans.length} onPrevious={onPrevious} onNext={onNext} onChange={onInputChange} />
		</>
	);
}

function FriendButton({ player }: PlayerProps) {
	const { data: session } = useSession();
	const [friendship, setFriendship] = useState<Friendship | null | undefined>(
		undefined,
	);

	const { data: checked_friendship, isLoading, error } = useSWRImmutable<Friendship>(
		`/api/player/friends/check-friendship?friend=${player.ckey}`,
		fetcher
	);

	useEffect(() => {
		if (checked_friendship) {
			setFriendship(checked_friendship);
		}
	}, [checked_friendship]);

	if (!session?.user?.ckey) return <div></div>;
	if (friendship === undefined) return <div></div>;

	if(error) return <div></div>;

	if(isLoading) {
		return (
			<div
				className="absolute left-full ml-2 top-1/2 -translate-y-1/2 transition transform duration-300 hover:scale-110"
			>
			<Icon icon={faSpinner} spin className="text-xl" />
			</div>
		);
	}

	if (friendship?.status === 'pending') {
		if (friendship.user_ckey === session?.user.ckey) {
			return (
				<button
					className="group absolute left-full ml-2 top-1/2 -translate-y-1/2 transition transform duration-300 hover:scale-110"
					onClick={async () => {
						declineFriend(session!.user!.ckey!, friendship.id).then((res) =>
							setFriendship(res),
						);
					}}
				>
					<Icon
						icon={faUserClock}
						className="block group-hover:hidden text-xl"
					/>
					<Icon
						icon={faUserMinus}
						className="hidden group-hover:block text-xl"
					/>
				</button>
			);
		} else if (friendship.friend_ckey === session?.user.ckey) {
			return (
				<button
					className="absolute left-full ml-2 top-1/2 -translate-y-1/2 transition transform duration-300 hover:scale-110"
					onClick={async () => {
						acceptFriend(session!.user!.ckey!, friendship.id).then((res) =>
							setFriendship(res),
						);
					}}
				>
					<Icon icon={faUserCheck} className="text-xl" />
				</button>
			);
		}
	} else if (friendship?.status === 'accepted') {
		return (
			<button
				className="group absolute left-full ml-2 top-1/2 -translate-y-1/2 transition transform duration-300 hover:scale-110"
				onClick={async () => {
					removeFriend(session!.user!.ckey!, friendship.id).then((res) =>
						setFriendship(res),
					);
				}}
			>
				<Icon
					icon={faUserFriends}
					className="block group-hover:hidden text-xl"
				/>
				<Icon icon={faUserMinus} className="hidden group-hover:block text-xl" />
			</button>
		);
	}
	return (
		<button
			className="absolute left-full ml-2 top-1/2 -translate-y-1/2 transition transform duration-300 hover:scale-110"
			onClick={async () => {
				addFriend(session!.user!.ckey!, player.ckey).then((res) =>
					setFriendship(res),
				);
			}}
		>
			<Icon icon={faUserPlus} className="text-xl" />
		</button>
	);
}
