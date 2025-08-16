import { ImageLoaderProps } from 'next/image';

export function achievementsImageLoader(props: ImageLoaderProps) {
  return `${process.env.CDN_URL ?? 'https://cdn.ss13.tr'}/tg/achievements/${props.src}`;
}
