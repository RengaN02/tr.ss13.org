import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export function relativeTime(past: string, future?: string): string {
	let past_ = dayjs(past);
	const future_ = dayjs(future);

	const array = [];

	const years = future_.diff(past_, 'year');
	if (years) {
		array.push(`${years} yıl`);
		past_ = past_.add(years, 'year');
	}

	const months = future_.diff(past_, 'month');
	if (months) {
		array.push(`${months} ay`);
		past_ = past_.add(months, 'month');
	}

	const days = future_.diff(past_, 'day');
	if (days) {
		array.push(`${days} gün`);
		past_ = past_.add(days, 'day');
	}

	if (years + months + days === 0) {
		const hours = future_.diff(past_, 'hour');
		if (hours) {
			array.push(`${hours} saat`);
			past_ = past_.add(hours, 'hour');
		}

		const minutes = future_.diff(past_, 'minute');
		if (minutes) {
			array.push(`${minutes} dakika`);
			past_ = past_.add(minutes, 'minute');
		}

		const seconds = future_.diff(past_, 'second');
		if (seconds) {
			array.push(`${seconds} saniye`);
		}
	}

	return array.join(' ');
}

export function minutesToHours(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const remainder = minutes % 60;

	return `${hours ? `${hours} saat ` : ''}${remainder} dakika`;
}

/**
 * Converts a date string from a given timezone (e.g. 'Europe/Istanbul') to UTC.
 * @param {string} dateStr - Format: 'YYYY-MM-DD HH:mm:ss'
 * @param {string} fromTz - Source timezone, default 'Europe/Istanbul'
 * @param {string} format - New time format
 * @returns {string} - Converted UTC time in specified format
 */
export function convertToUTC(dateStr: string, fromTz: string = 'Europe/Istanbul', format: string = 'YYYY-MM-DD HH:mm:ss') {
	return dayjs.tz(dateStr, 'YYYY-MM-DD HH:mm:ss', fromTz).utc().format(format);
}
