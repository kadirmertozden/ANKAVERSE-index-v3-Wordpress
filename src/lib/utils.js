import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}
/**
 * Calculate read time from HTML content
 * @param {string} content 
 * @returns {string}
 */
export function calculateReadTime(content) {
  if (!content) return '1 dk';
  const wordsPerMinute = 200;
  const text = content.replace(/<[^>]+>/g, '');
  const noOfWords = text.split(/\s/g).length;
  const minutes = Math.ceil(noOfWords / wordsPerMinute);
  return `${minutes} dk`;
}

/**
 * Strip HTML tags from string
 * @param {string} html 
 * @returns {string}
 */
export function stripHtml(html) {
   if (!html) return "";
   return html.replace(/<[^>]+>/g, '');
}