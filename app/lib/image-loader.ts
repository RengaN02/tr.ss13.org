import { ImageLoaderProps } from 'next/image';

export function achievementsImageLoader(props: ImageLoaderProps) {
  return `${process.env.CDN_URL ?? 'https://cdn.ss13.tr'}/tg/achievements/${props.src}`;
}

export function pictureLogLoader(props: ImageLoaderProps) {
  return `${process.env.CDN_URL ?? 'https://cdn.ss13.tr'}/picture-logs/${props.src}`;
}
/* TEST İCİN picture_logs yapıldı. picture-logs yapılcak */
