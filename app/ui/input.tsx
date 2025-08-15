'use client';

import { useEffect, useRef } from 'react';

type NumberInputProps = {
	ref?: React.RefObject<HTMLInputElement | null>;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function NumberInput(props: NumberInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const { min, max, onChange, ref } = props;

	useEffect(() => {
		const preventScroll = (event: Event) => {
			if (inputRef.current && event.target === inputRef.current) {
				event.preventDefault();
				event.stopPropagation();

				const deltaY = (event as WheelEvent).deltaY > 0 ? -1 : 1;
				const value = +inputRef.current.value + deltaY;

				if (min !== undefined && value < +min || max !== undefined && value > +max) {
					return;
				}

				inputRef.current.value = String(value);

				onChange?.({
					target: inputRef.current,
					currentTarget: inputRef.current,
					persist: () => {},
					stopPropagation: () => {},
					preventDefault: () => {},
				} as React.ChangeEvent<HTMLInputElement>);
			}
		};

		document.body.addEventListener('wheel', preventScroll, { passive: false });

		return () => {
			document.body.removeEventListener('wheel', preventScroll);
		};
	}, [min, max, onChange]);

	useEffect(() => {
		if (ref) {
			ref.current = inputRef.current;
		}
	}, [ref]);

	return (
		<input
			{...props}
			className={[props.className, 'bg-transparent outline-none text-center caret-white transition-opacity'].join(' ')}
			ref={inputRef}
			type="number"
		/>
	);
}
