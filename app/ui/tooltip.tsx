import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type TooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode;
};

export default function Tooltip({ children, content }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

	const ref = useRef<HTMLDivElement | null>(null);

	const updatePosition = useCallback(() => {
		if (ref.current) {
			const rect = ref.current.getBoundingClientRect();
			const tooltipHeight = rect.height - 60;

			const left = rect.left + window.scrollX + rect.width / 2;

			let top = rect.bottom + window.scrollY + 8;

			if (top + tooltipHeight > window.scrollY + window.innerHeight) {
				top = rect.top + window.scrollY - tooltipHeight - 8;
			}

			setPosition({ top, left });
		}
	}, []);

  useEffect(() => {
    if (!visible) return;

		const handler = () => updatePosition();

    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);

    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [visible, updatePosition]);

  const show = () => {
    updatePosition();
    setVisible(true);
  };
	const hide = () => setVisible(false);

  return (
    <>
      <div ref={ref} className="inline-flex" onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </div>
      {visible && createPortal(
				<div style={position} className="fixed z-50 transform -translate-x-1/2">
					{content}
				</div>,
				document.body
			)}
    </>
  );
}
