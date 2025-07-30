import { useEffect } from 'react';

export default function useResize(callback: ResizeObserverCallback, ref: React.RefObject<HTMLElement | null>) {
	useEffect(() => {
		if (!ref.current) return;

		const resizeObserver = new ResizeObserver(callback);

		resizeObserver.observe(ref.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, [callback, ref]);
}
