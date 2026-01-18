import { ImageLoaderProps } from 'next/image';

export function achievementsImageLoader(props: ImageLoaderProps) {
  return `${process.env.CDN_URL ?? 'https://cdn.ss13.tr'}/tg/achievements/${props.src}`;
}

export function pictureImageLoader(props: ImageLoaderProps) {
  return `${process.env.CDN_URL ?? 'https://cdn.ss13.tr'}/pictures/${props.src}`;
}

export function playerSpriteImageLoader(props: ImageLoaderProps) {
  return `${process.env.CDN_URL ?? 'https://cdn.ss13.tr'}/characters/${props.src}`;
}
