'use client';

import Link from 'next/link';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import Button from '@/app/ui/button';

interface DropdownMenuProps {
  children: ReactNode;
  items: DropdownItem[];
}

type DropdownItem = {
  label: string;
  href?: string;
  func?: () => void | Promise<void>;
  class?: string;
}

export default function DropdownMenu({ children, items }: DropdownMenuProps) {
  const [position, setPosition] = useState('left-0');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkPosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        if (rect.right > screenWidth - 150) {
          setPosition('right-0');
        } else {
          setPosition('left-0');
        }
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    checkPosition();
    window.addEventListener('resize', checkPosition);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', checkPosition);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-sm z-[100]">
      <details className="group" open={isOpen}>
        <summary
          onClick={toggleDropdown}
          className="list-none cursor-pointer outline-none appearance-none [&::-webkit-details-marker]:hidden"
        >
          {children}
        </summary>
        <div className={`absolute z-[110] ${position} mt-3 min-w-max flex flex-col rounded shadow-2xl overflow-hidden border border-white border-opacity-10 bg-gray-700 bg-opacity-10 backdrop-blur-md`}>
          {items.map((item, index) => {
            const content = <Button className="w-full text-left rounded-none px-4 py-2 hover:bg-white/5">{item.label}</Button>;

            return (
              <div key={index} onClick={() => setIsOpen(false)}>
                {item.href ? (
                  <Link href={item.href} className={`block ${item.class}`}>
                    {content}
                  </Link>
                ) : item.func ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      item.func?.();
                      setIsOpen(false);
                    }}
                    className={`block w-full ${item.class}`}
                  >
                    {content}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}
