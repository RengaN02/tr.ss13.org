import { useCallback, useEffect, useRef, useState } from 'react';

type CarouselProps = {
  children: React.ReactNode[];
	itemSize?: number;
  gap?: number;
  breakpoints?: {
    mobileSmall: number;
    mobile: number;
    tabletSmall: number;
    tablet: number;
    desktop: number;
    largeDesktop: number;
  };
};

export default function Carousel({
  children,
  itemSize = 76,
  gap = 8,
  breakpoints = {
    mobileSmall: 2, // ≤ 360px
    mobile: 3, // ≤ 480px
    tabletSmall: 4, // ≤ 768px
    tablet: 6, // ≤ 1200px
    desktop: 8, // ≤ 2160px
    largeDesktop: 10, // > 2160px
  },
}: CarouselProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const innerRef = useRef<HTMLDivElement | null>(null);

	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const [visibleItems, setVisibleItems] = useState(breakpoints.desktop);

	const itemTotal = itemSize + gap;
	const desiredClientWidth = gap + visibleItems * itemSize + (visibleItems - 1) * gap;

	useEffect(() => {
		const checkDevice = () => {
			const width = window.innerWidth;
			let visibleCount;

			if (width <= 360) {
				visibleCount = breakpoints.mobileSmall;
			} else if (width <= 480) {
				visibleCount = breakpoints.mobile;
			} else if (width <= 768) {
				visibleCount = breakpoints.tabletSmall;
			} else if (width <= 1200) {
				visibleCount = breakpoints.tablet;
			} else if (width <= 2160) {
				visibleCount = breakpoints.desktop;
			} else {
				visibleCount = breakpoints.largeDesktop;
			}
			setVisibleItems(Math.min(visibleCount, children.length));
		};

		checkDevice();

		window.addEventListener('resize', checkDevice);

		return () => {
			window.removeEventListener('resize', checkDevice);
		};
	}, [breakpoints.mobileSmall, breakpoints.mobile, breakpoints.tabletSmall, breakpoints.tablet, breakpoints.desktop, breakpoints.largeDesktop, children.length]);

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
	}, [updateButtons, children.length]);

	const scrollByItems = (direction: 'left' | 'right') => {
		const container = containerRef.current;
		const inner = innerRef.current;

		if (!container || !inner) return;

		const innerStyle = getComputedStyle(inner);
		const innerPadding = parseFloat(innerStyle.paddingLeft) || 0;

		const relScroll = container.scrollLeft - innerPadding;
		const currentIndex = Math.round(relScroll / itemTotal);

		const visibleCount = Math.max(1, Math.floor(container.clientWidth / itemTotal));
		const step = visibleCount >= 3 ? 2 : 1;

		let targetIndex =
			direction === 'left' ? currentIndex - step : currentIndex + step;

		const maxIndex = Math.max(0, children.length - visibleCount);

		if (targetIndex < 0) targetIndex = 0;
		if (targetIndex > maxIndex) targetIndex = maxIndex;

		const targetScroll = innerPadding + targetIndex * itemTotal;
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

	if (children.length === 0) return <></>;

	return (
		<div className="w-full flex items-center gap-3 relative">
			<button
				className="p-2 rounded-full focus:outline-none bg-slate-100 bg-opacity-0 hover:bg-opacity-20 disabled:opacity-40 transition-colors"
				style={{ cursor: canScrollLeft ? 'pointer' : 'not-allowed' }}
				onClick={() => scrollByItems('left')}
				disabled={!canScrollLeft}
				title="Önceki"
			>
				<span className="text-xl">‹</span>
			</button>
			<div
				className="overflow-x-auto overflow-y-visible scrollbar-hidden flex gap-2 py-2 px-1 touch-pan-x cursor-grab w-full scrollling-touch"
				style={{ maxWidth: `${desiredClientWidth}px`, ...(!canScrollLeft && !canScrollRight) && { justifyContent: 'center' } }}
				ref={containerRef}
				onScroll={() => updateButtons()}
			>
				<div ref={innerRef} className="flex space-x-2 items-center">
					{children}
				</div>
			</div>
			<button
				className="p-2 rounded-full focus:outline-none bg-slate-100 bg-opacity-0 hover:bg-opacity-20 disabled:opacity-40 transition-colors"
				style={{ cursor: canScrollRight ? 'pointer' : 'not-allowed' }}
				onClick={() => scrollByItems('right')}
				disabled={!canScrollRight}
				title="Sonraki"
			>
				<span className="text-xl">›</span>
			</button>
		</div>
	);
}
