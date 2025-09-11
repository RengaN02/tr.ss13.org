import { ImageLoaderProps } from 'next/image';

export function achievementsImageLoader(props: ImageLoaderProps) {
  return `${'https://cdn.ss13.tr'}/tg/achievements/${props.src}`;
}

export function pictureLogLoader(props: ImageLoaderProps) {
  return `${process.env.CDN_URL ?? 'http://localhost:8000'}/picture-logs/${props.src}`;
}

