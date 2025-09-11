import { Fragment,useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type TooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode;
};

export default function Tooltip({ children, content }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!visible) return;
    const handler = () => updatePosition();

    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);

    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [visible]);

const updatePosition = () => {
  if (ref.current) {
    const rect = ref.current.getBoundingClientRect();
    const tooltipHeight = rect.height - 60;

    const left = rect.left + window.scrollX + rect.width / 2;

    let top = rect.bottom + window.scrollY + 8;

    if (top + tooltipHeight > window.scrollY + window.innerHeight) {
      top = rect.top + window.scrollY - tooltipHeight - 8;
    }

    setPos({ top, left });
  }
};

  const show = () => {
    updatePosition();
    setVisible(true);
  };
  const hide = () => setVisible(false);

  return (
    <Fragment>
      <div ref={ref} onMouseEnter={show} onMouseLeave={hide} className="inline-flex">
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            className="fixed z-50 bg-[#0d141c] text-white border border-gray-600 rounded-md px-3 py-2 shadow-lg text-sm min-w-[260px] w-max max-w-[380px] transform -translate-x-1/2"
            style={{
              top: pos.top,
              left: pos.left,
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </Fragment>
  );
}
