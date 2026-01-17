import React, { useEffect, useState } from 'react';
import { fetchBusTimetable } from '../api/odpt';

type Props = {
	consumerKey?: string;
	titles?: string[];
	title?: string;
	operator?: string;
	onDepartures?: (data: any[]) => void;
};

export default function SelectedPlatformBuses({
	consumerKey,
	titles,
	operator = 'odpt.Operator:KokusaiKogyoBus',
	onDepartures,
}: Props) {
	const envKey = (import.meta.env && (import.meta.env as any).VITE_ODPT_KEY) || '';
	const key = consumerKey ?? envKey;

	// Use provided titles array or fall back to single title
	const titlesToFetch = titles || (title ? [title] : []);

	// Log for debugging
	React.useEffect(() => {
		console.log('SelectedPlatformBuses mounted.', {
			key: key ? '✓ set' : '✗ NOT set',
			titlesToFetch,
			operator,
		});
	}, [key, titlesToFetch, operator]);

	useEffect(() => {
		if (!key || titlesToFetch.length === 0) {
			console.error('ODPT consumer key or titles not provided.');
			if (onDepartures) onDepartures([]);
			return;
		}

		console.log('Fetching ODPT BusTimetable...', { titles: titlesToFetch, key: key.substring(0, 5) + '...' });

		// Helper: parse HH:MM (and handle isMidnight) into a Date
		const parseToDate = (timeStr: string, isMidnight?: boolean) => {
			const [hh, mm] = (timeStr || '00:00').split(':').map((v) => parseInt(v, 10));
			const now = new Date();
			const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
			if (isMidnight) d.setDate(d.getDate() + 1);
			return d;
		};

		const now = new Date();

		// Fetch for each title
		Promise.all(
			titlesToFetch.map(titleToFetch =>
				fetchBusTimetable({ consumerKey: key, title: titleToFetch, operator })
					.then((d) => {
						console.log(`✓ API response for "${titleToFetch}":`, d);
						const arr = Array.isArray(d) ? d : d ? [d] : [];
						console.log(`  Array length: ${arr.length}`);
						if (arr.length > 0) {
							console.log(`  First item:`, arr[0]);
						}
						return arr;
					})
					.catch((err) => {
						console.error(`✗ Error fetching for "${titleToFetch}":`, err);
						return [];
					})
			)
		)
			.then((results) => {
				console.log('📋 All Results:', results);
				
				const allUpcoming: any[] = [];

				// Process each title's results
				results.forEach((arr, titleIndex) => {
					const fetchedTitle = titlesToFetch[titleIndex];
					console.log(`\nProcessing "${fetchedTitle}": received ${arr.length} timetable(s)`);

					arr.forEach((timetable: any) => {
						const objects = timetable['odpt:busTimetableObject'] || [];
						const tableTitle = timetable['dc:title'] || timetable['odpt:busroutePattern'] || fetchedTitle;

						console.log(`  - Timetable "${tableTitle}" has ${objects.length} stops`);

						// Only check objects[0]
						if (objects.length === 0) return;

						const obj = objects[0];
						const departureTime = obj['odpt:departureTime'];
						const isMidnight = obj['odpt:isMidnight'];
						const depDate = parseToDate(departureTime, isMidnight);

						console.log(`    - departureTime: ${departureTime}, isUpcoming: ${depDate >= now}`);

						if (depDate >= now) {
							allUpcoming.push({
								timetable,
								tableTitle,
								departureTime,
							});
						}
					});
				});

				console.log(`\n🕐 Current time: ${now.toLocaleTimeString('ja-JP')}`);
				console.log(`📊 Searched titles: ${titlesToFetch.length}`);
				console.log(`✓ Upcoming departures (>= now): ${allUpcoming.length}`);

				// Sort by departure time (closest to now first) and take top 3
				const sortedItems = allUpcoming.sort((a, b) => {
					const depDateA = parseToDate(a.departureTime);
					const depDateB = parseToDate(b.departureTime);
					return depDateA.getTime() - depDateB.getTime();
				});
				const displayItems = sortedItems.slice(0, 3);

				if (displayItems.length > 0) {
					displayItems.forEach((item: any) => {
						console.log(`\n📍 ${item.tableTitle} - ${item.departureTime}`);
					});
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
				if (onDepartures) onDepartures([]);
			});
	}, [key, operator, titlesToFetch.join(',')]);  // Join titles array for dependency array

	// Render nothing (console-only output)
	return null;
}

