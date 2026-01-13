import React, { useEffect, useState } from 'react';
import { fetchBusTimetable } from '../api/odpt';

type Props = {
	consumerKey?: string;
	title?: string;
	onDepartures?: (data: any[]) => void;
};

export default function SelectedPlatformBuses({
	consumerKey,
	title = ' 大６１',
	onDepartures,
}: Props) {
	const envKey = (import.meta.env && (import.meta.env as any).VITE_ODPT_KEY) || '';
	const key = consumerKey ?? envKey;

	// Log for debugging
	React.useEffect(() => {
		console.log('SelectedPlatformBuses mounted. VITE_ODPT_KEY:', key ? '✓ set' : '✗ NOT set');
	}, [key]);

	useEffect(() => {
		if (!key) {
			console.error('ODPT consumer key not provided.');
			return;
		}

		console.log('Fetching ODPT BusTimetable...', {key: key.substring(0, 5) + '...' });

		fetchBusTimetable({consumerKey: key })
			.then((d) => {
				console.log('ODPT API response:', d);
				const arr = Array.isArray(d) ? d : d ? [d] : [];

				// Helper: parse HH:MM (and handle isMidnight) into a Date
				const parseToDate = (timeStr: string, isMidnight?: boolean) => {
					const [hh, mm] = (timeStr || '00:00').split(':').map((v) => parseInt(v, 10));
					const now = new Date();
					const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
					if (isMidnight) d.setDate(d.getDate() + 1);
					return d;
				};
				
				const now = new Date();

				// Process each timetable in the API response
				const allUpcoming: any[] = [];

				arr.forEach((timetable: any, tableIndex: number) => {
					const objects = timetable['odpt:busTimetableObject'] || [];
					const tableTitle = timetable['dc:title'] || timetable['odpt:busroutePattern'] || `Timetable ${tableIndex}`;

					// Only check objects[0]
					if (objects.length === 0) return;

					const obj = objects[0];
					const departureTime = obj['odpt:departureTime'];
					const isMidnight = obj['odpt:isMidnight'];
					const depDate = parseToDate(departureTime, isMidnight);

					if (depDate >= now) {
						allUpcoming.push({
							timetable,
							tableTitle,
							departureTime,
						});
					}
				});

				console.log(`🕐 Current time: ${now.toLocaleTimeString('ja-JP')}`);
				console.log(`📊 Total timetables: ${arr.length}`);
				console.log(`✓ Upcoming departures (>= now): ${allUpcoming.length}`);

				// Show only the first 3
				const displayItems = allUpcoming.slice(0, 3);

				if (displayItems.length > 0) {
					// Display full timetable objects
					displayItems.forEach((item: any) => {
						console.log(`\n📍 ${item.tableTitle}`);
						console.log('Timetable:', item.timetable);
					});
					// Pass data to parent component via callback
					if (onDepartures) {
						onDepartures(displayItems);
					}
				} else {
					console.log('✗ No upcoming departures found.');
					if (onDepartures) {
						onDepartures([]);
					}
				}
			})
			.catch((err) => {
				console.error('ODPT API error:', err);
			});
	}, [key, title]);

	// Render nothing (console-only output)
	return null;
}

