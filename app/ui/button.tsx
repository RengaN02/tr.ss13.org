import type { MouseEventHandler } from 'react';

type ButtonProps = {
	children: React.ReactNode;
	className?: string;
	active?: boolean;
	onClick?: MouseEventHandler<HTMLDivElement> | undefined;
	disabled?: boolean;
};

export default function Button({ children, className, active, onClick, disabled }: ButtonProps) {
	return (
		<div
			className={`${className ? className + ' ' : ''}${active ? 'bg-opacity-15 hover:bg-opacity-20' : !disabled ? 'bg-opacity-5 hover:bg-opacity-10' : 'bg-opacity-5 text-gray-400'} ${disabled ? 'cursor-not-allowed' : onClick ? 'cursor-pointer' : ''} bg-white transition-colors border border-white border-opacity-10 px-3 py-2 rounded-[.25rem]`}
			onClick={onClick}
			aria-disabled={disabled}
		>
			{children}
		</div>
	);
}
