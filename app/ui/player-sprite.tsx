'use client';
import { ImageLoaderProps } from 'next/image';
import { useEffect, useState } from 'react';

import EmptyChracter from '@/app/images/empty_character.png';

enum Direction { Front = 0, Back = 1, Right = 2, Left = 3 }
enum TargetArea { All = 0, Biometric = 1 }

interface PlayerSpriteCanvasProps {
  className?: string;
  imageSrc: string;
  direction: Direction | number;
  frameSize?: number;
  scale?: number;
  targetArea?: TargetArea | number;
  job?: string;
  loader?: (props: ImageLoaderProps) => string;
}

const PlayerSprite = ({
  imageSrc,
  direction,
  frameSize = 32,
  scale = 1,
  targetArea = 0,
  job,
  loader
}: PlayerSpriteCanvasProps) => {
  const [emptyCharacter, setEmptyCharacter] = useState<string | null>(EmptyChracter.src);
  const [area, setArea] = useState(targetArea);
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const newSrc = loader ? loader({ src: imageSrc, width: frameSize * scale }) : imageSrc;
		setSrc(newSrc);
    setArea(targetArea);
  }, [imageSrc, loader, frameSize, scale, targetArea]);

  useEffect(() => {
    if (job === 'Animal') {
      setArea(TargetArea.All);
    }
  }, [job]);

  useEffect(() => {
    if (!src) return;

    const testImg = new Image();
    testImg.src = src;

    testImg.onload = () => {
      setEmptyCharacter(null);
    };

    testImg.onerror = () => {
      setEmptyCharacter(EmptyChracter.src);
    };
  }, [src]);

  let currentFrameSize = frameSize;
  let currentScale = scale;
  let x = 0;
  let y = 0;

  if (area === TargetArea.Biometric) {
    currentFrameSize /= 2;
    x -= 7.5;
    currentScale *= 2;
  }

  if (direction === Direction.Back) x -= 32;
  if (direction === Direction.Right) y -= 32;
  if (direction === Direction.Left) {
    x -= 32;
    y -= 32;
  }

  return (
    <div
      className="inline-block bg-no-repeat pixelated"
      style={{
        transform: `scale(${currentScale})`,
        width: currentFrameSize,
        height: currentFrameSize,
        backgroundImage: src ? (emptyCharacter ? `url(${src}), url(${emptyCharacter})` : `url(${src})`) : `url(${EmptyChracter.src})`,
        backgroundPosition: `${x}px ${y}px`,
      }}
    />
  );
};

export default PlayerSprite;
