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
	title = '大６１',
	operator = 'odpt.Operator:TobuBus',
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
		const allUpcoming: any[] = [];

		// Fetch data for all titles
		Promise.all(
			titlesToFetch.map(titleToFetch =>
				fetchBusTimetable({ consumerKey: key, operator, title: titleToFetch })
					.then(data => {
						console.log(`✓ API response for "${titleToFetch}":`, data);
						return data;
					})
					.catch(err => {
						console.error(`✗ Error fetching timetable for ${titleToFetch}:`, err);
						return [];
					})
			)
		)
			.then((results) => {
				console.log('📋 All API Results:', results);
				
				// Process each title's results
				results.forEach((d, titleIndex) => {
					const arr = Array.isArray(d) ? d : d ? [d] : [];
					const fetchedTitle = titlesToFetch[titleIndex];
					
					console.log(`Processing "${fetchedTitle}": received ${arr.length} timetable(s)`);

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

						console.log(`    - objects[0] departureTime: ${departureTime}, depDate: ${depDate.toLocaleTimeString('ja-JP')}, isUpcoming: ${depDate >= now}`);

						if (depDate >= now) {
							allUpcoming.push({
								timetable,
								tableTitle,
								departureTime,
							});
						}
					});
				});

				console.log(`🕐 Current time: ${now.toLocaleTimeString('ja-JP')}`);
				console.log(`📊 Searched titles: ${titlesToFetch.length}`);
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
				if (onDepartures) onDepartures([]);
			});
	}, [key, operator, titlesToFetch.join(',')]);  // Join titles array for dependency array

	// Render nothing (console-only output)
	return null;
}

