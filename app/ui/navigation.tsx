import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { ChangeEvent, useCallback } from 'react';

import { NumberInput } from '@/app/ui/input';

type NavigationProps = {
	onPrevious?: () => boolean | void;
	onNext?: () => boolean | void;
	onChange?: (value: number) => boolean | void;
	min?: number;
	max?: number;
	value?: number;
	id: string;
};

export function Navigation({ onPrevious, onNext, onChange, min, max, value, id }: NavigationProps) {
	const scrollIntoView = useCallback(() => {
		setTimeout(() => {
			document.getElementById(id)?.scrollIntoView({
				block: 'end',
				inline: 'nearest',
				behavior: 'smooth',
			});
		}, 1);
	}, [id]);

	const handlePrevious = useCallback(() => {
		if (onPrevious && onPrevious() !== false) {
			scrollIntoView();
		}
	}, [onPrevious, scrollIntoView]);

	const handleNext = useCallback(() => {
		if (onNext && onNext() !== false) {
			scrollIntoView();
		}
	}, [onNext, scrollIntoView]);

	const handleOnChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		if (onChange && onChange(+event.target.value) !== false) {
			scrollIntoView();
		}
	}, [onChange, scrollIntoView]);

	return (
		<div className="[&>span]:cursor-pointer [&>span]:px-2">
			<span className="inline-block" onClick={handlePrevious}><Icon icon={faAngleLeft} /></span>
			<div className="inline-flex flex-row items-center">
				<NumberInput value={value ?? 1} min={min ?? 1} max={max ?? 1} onChange={handleOnChange} />
				<span className="cursor-default">/</span>
				<NumberInput value={max ?? 1} disabled min={1} max={max ?? 1} />
			</div>
			<span className="inline-block" onClick={handleNext}><Icon icon={faAngleRight} /></span>
			<div id={id} className="relative top-6"></div>
		</div>
	);
}
