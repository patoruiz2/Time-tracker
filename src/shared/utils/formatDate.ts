import { differenceInMinutes, format, parseISO } from 'date-fns';

export const toISO = (date: Date = new Date()): string => date.toISOString();

export const formatTime = (iso: string): string => format(parseISO(iso), 'HH:mm');

export const formatDateTime = (iso: string): string =>
  format(parseISO(iso), 'MMM d, yyyy HH:mm');

export const minutesBetween = (start: string, end: string): number =>
  differenceInMinutes(parseISO(end), parseISO(start));
