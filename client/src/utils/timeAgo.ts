import { formatDistanceToNow } from 'date-fns';

export function timeAgo(date: string | Date): string {
  if (!date) {
    return '';
  }
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
