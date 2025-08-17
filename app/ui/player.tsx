'use client';

import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bar, Line, Tooltip, XAxis, YAxis } from 'recharts';

import { achievementsIcons, roles } from '@/app/lib/constants';
import type { Player } from '@/app/lib/definitions';
import { achievementsImageLoader } from '@/app/lib/image-loader';
import { relativeTime } from '@/app/lib/time';
import Button from '@/app/ui/button';
import { BarChart, LineChart} from '@/app/ui/chart';
import { NumberInput } from '@/app/ui/input';
import { Navigation } from '@/app/ui/navigation';

const allRoles = [...roles.nonRoles, ...roles.traitRoles, ...roles.spawnerRoles, ...roles.ghostRoles, ...roles.antagonistRoles];

type NonNullablePlayer = NonNullable<Player>;

type PlayerProps = {
	player: NonNullablePlayer;
};

export default function Player({ player }: PlayerProps) {
	useEffect(() => {
		document.getElementById('navigation')?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	return (
		<div className="w-full max-w-full flex-1 flex flex-col items-center gap-5">
			{/* Basic Info */}
			<div className="max-w-full flex flex-col items-center gap-3">
				<span className="max-w-full text-center text-5xl font-bold overflow-hidden text-ellipsis">{player.byond_key}</span>
				<span>İlk Görülen Round: {player.first_seen_round}</span>
				<span>Son Görülen Round: {player.last_seen_round}</span>
				<span>İlk Görülen Tarih: <span title={`${relativeTime(player.first_seen, undefined)} önce`}>{player.first_seen}</span></span>
				<span>Son Görülen Tarih: <span title={`${relativeTime(player.last_seen, undefined)} önce`}>{player.last_seen}</span></span>
				<span>BYOND&apos;a Katıldığı Tarih: <span title={`${relativeTime(player.byond_age, undefined)} önce`}>{player.byond_age}</span></span>
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
	roletime: NonNullablePlayer['roletime'];
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
		job: NonNullablePlayer['roletime'][number]['job'],
		options: typeof chartOptions
	) => !(
		(!options.nonRole && roles.nonRoles.includes(job)) ||
		(!options.trait && roles.traitRoles.includes(job)) ||
		(!options.spawner && roles.spawnerRoles.includes(job)) ||
		(!options.ghost && roles.ghostRoles.includes(job)) ||
		(!options.antagonists && roles.antagonistRoles.includes(job)) ||
		(!options.jobs && !allRoles.includes(job))
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
	activity: NonNullablePlayer['activity'];
};

function ActivityChart({ activity }: ActivityChartProps) {
	const data = useMemo(() => {
		const activityClone = [...activity];
		const days: { date: string; rounds: number }[] = [];
		const firstDay = dayjs().subtract(180, 'day').startOf('day');

		for (let i = 0; i < 180; i++) {
			const day = firstDay.add(i, 'day').format('YYYY-MM-DD');
			days.push({ date: day, rounds: activityClone.find(([date]) => date === day)?.[1] ?? 0 });
		}

		return days;
	}, [activity]);

	return (
		<LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} containerStyle={{ position: 'relative', left: -22 }}>
			<XAxis dataKey="date" tick={false} padding={{ left: 5, right: 5 }} />
			<YAxis padding={{ bottom: 5 }} domain={[0, 24]} />
			<Tooltip cursor={{ opacity: 0.1 }} separator="" formatter={tooltipFormatter} contentStyle={{ background: 'transparent', border: 'none' }} itemStyle={{ color: 'rgb(100 116 139)' }} />
			<Line type="monotone" dataKey="rounds" unit=" round" dot={false} />
		</LineChart>
	);
}

type AchievementsProps = {
	achievements: NonNullablePlayer['achievements'];
};

function Achievements({ achievements }: AchievementsProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const innerRef = useRef<HTMLDivElement | null>(null);

	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const VISIBLE_MOBILE_SMALL = 2; // ≤ 360px
	const VISIBLE_MOBILE = 3; // ≤ 480px
	const VISIBLE_TABLET_SMALL = 4; // ≤ 768px
	const VISIBLE_TABLET = 6; // ≤ 1200px
	const VISIBLE_DEFAULT = 8; // ≤ 2160px
	const VISIBLE_LARGE_DESKTOP = 10; // > 2160px

	const [visibleItems, setVisibleItems] = useState(VISIBLE_DEFAULT);

	const ITEM_SIZE = 76;
	const GAP = 8;
	const ITEM_TOTAL = ITEM_SIZE + GAP;
	const DESIRED_CLIENT_WIDTH = GAP + visibleItems * ITEM_SIZE + (visibleItems - 1) * GAP;

	useEffect(() => {
		const checkDevice = () => {
			const width = window.innerWidth;

			if (width <= 360) {
				setVisibleItems(VISIBLE_MOBILE_SMALL);
			} else if (width <= 480) {
				setVisibleItems(VISIBLE_MOBILE);
			} else if (width <= 768) {
				setVisibleItems(VISIBLE_TABLET_SMALL);
			} else if (width <= 1200) {
				setVisibleItems(VISIBLE_TABLET);
			} else if (width <= 2160) {
				setVisibleItems(VISIBLE_DEFAULT);
			} else {
				setVisibleItems(VISIBLE_LARGE_DESKTOP);
			}
		};

		checkDevice();

		window.addEventListener('resize', checkDevice);

		return () => {
			window.removeEventListener('resize', checkDevice);
		};
	}, []);

	const updateButtons = useCallback(() => {
		if (!containerRef.current) return;

		const { scrollWidth, clientWidth, scrollLeft } = containerRef.current;
		const maxScroll = scrollWidth - clientWidth;

		setCanScrollLeft(scrollLeft > 1);
		setCanScrollRight(scrollLeft < maxScroll - 1);
	}, [containerRef]);

	useEffect(() => {
		const onResize = () => updateButtons();

		onResize();

		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('resize', onResize);
		};
	}, [updateButtons, achievements.length]);

	const scrollByItems = (direction: 'left' | 'right') => {
		const container = containerRef.current;
		const inner = innerRef.current;

		if (!container || !inner) return;

		const innerStyle = getComputedStyle(inner);
		const innerPadding = parseFloat(innerStyle.paddingLeft) || 0;

		const relScroll = container.scrollLeft - innerPadding;
		const currentIndex = Math.round(relScroll / ITEM_TOTAL);

		const visibleCount = Math.max(1, Math.floor(container.clientWidth / ITEM_TOTAL));
		const step = visibleCount >= 3 ? 2 : 1;

		let targetIndex =
			direction === 'left' ? currentIndex - step : currentIndex + step;

		const maxIndex = Math.max(0, achievements.length - visibleCount);

		if (targetIndex < 0) targetIndex = 0;
		if (targetIndex > maxIndex) targetIndex = maxIndex;

		const targetScroll = innerPadding + targetIndex * ITEM_TOTAL;
		const maxScroll = container.scrollWidth - container.clientWidth;
		const finalScroll = Math.max(0, Math.min(targetScroll, maxScroll));

		if (finalScroll !== container.scrollLeft) {
			container.scrollTo({ left: finalScroll, behavior: 'smooth' });
		}
	};

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		let isDown = false;
		let startX = 0;
		let startScroll = 0;
		let lastX = 0;
		let lastT = 0;
		let velocity = 0;
		let rafId: number | null = null;

		const onPointerDown = (event: PointerEvent) => {
			if (event.pointerType === 'touch') return;

			isDown = true;
			startX = event.clientX;
			startScroll = container.scrollLeft;
			lastX = startX;
			lastT = performance.now();
			velocity = 0;

			container.style.cursor = 'grabbing';
			container.setPointerCapture(event.pointerId);

			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		};

		const onPointerMove = (event: PointerEvent) => {
			if (!isDown) return;

			const now = performance.now();
			const dx = event.clientX - lastX;
			const dt = now - lastT || 16;

			container.scrollLeft = startScroll - (event.clientX - startX);

			lastX = event.clientX;
			lastT = now;
			velocity = -dx / dt;

			event.preventDefault();
		};

		const startInertia = () => {
			const friction = 0.95;
			let scroll = velocity * 16;

			const step = () => {
				container.scrollLeft += scroll;
				scroll *= friction;

				if (Math.abs(scroll) > 0.5) {
					rafId = requestAnimationFrame(step);
				} else {
					rafId = null;
					updateButtons();
				}
			};

			rafId = requestAnimationFrame(step);
		};

		const onPointerUp = (event: PointerEvent) => {
			if (!isDown) return;

			isDown = false;

			container.style.cursor = 'grab';
			container.releasePointerCapture(event.pointerId);

			if (Math.abs(velocity) > 0.001) {
				startInertia();
			} else {
				updateButtons();
			}
		};

		container.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);

		return () => {
			if (rafId) cancelAnimationFrame(rafId);

			container.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
		};
	}, [updateButtons]);

	if (achievements.length === 0) return <></>;

	return (
		<div className="w-full py-5 flex items-center gap-3 justify-center">
			<button
				className="p-2 rounded-full focus:outline-none bg-slate-100 bg-opacity-0 hover:bg-opacity-20 disabled:opacity-40 transition-colors"
				onClick={() => scrollByItems('left')}
				disabled={!canScrollLeft}
				title="Önceki"
			>
				<span className="text-xl">‹</span>
			</button>
			<div
				className="overflow-x-auto scrollbar-hidden flex gap-2 py-2 px-1 touch-pan-x cursor-grab w-full scrollling-touch"
				style={{ maxWidth: `${DESIRED_CLIENT_WIDTH}px`, ...(!canScrollLeft && !canScrollRight) && { justifyContent: 'center' } }}
				ref={containerRef}
				onScroll={() => updateButtons()}
			>
				<div ref={innerRef} className="flex space-x-2 items-center">
					{achievements.map(({ achievement_name, achievement_description, achievement_key }) =>
						<div
							key={achievement_key}
							className="flex-shrink-0 w-[76px] h-[76px] rounded-md flex items-center justify-center border border-transparent hover:border-slate-300 hover:border-opacity-20 select-none"
							title={`${achievement_name}\n${achievement_description}`}
							aria-label={achievement_key}
							role="img"
						>
							<Image
								className="rounded-sm object-cover"
								src={`${achievementsIcons[achievement_key] ?? achievement_key}.png`}
								loader={achievementsImageLoader}
								alt={achievement_name || 'Başarım'}
								width={ITEM_SIZE}
								height={ITEM_SIZE}
								draggable={false}
							/>
						</div>
					)}
				</div>
			</div>
			<button
				className="p-2 rounded-full focus:outline-none bg-slate-100 bg-opacity-0 hover:bg-opacity-20 disabled:opacity-40 transition-colors"
				onClick={() => scrollByItems('right')}
				disabled={!canScrollRight}
				title="Sonraki"
			>
				<span className="text-xl">›</span>
			</button>
		</div>
	);
}

type BanHistoryProps = {
	bans: NonNullablePlayer['bans'];
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
				<span title={`${relativeTime(ban.bantime, undefined)} önce`}>{ban.bantime}</span>
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
