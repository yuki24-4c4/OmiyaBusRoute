import React, { useEffect } from 'react';
import { fetchBusroutePattern } from '../api/odpt';

type Props = {
	consumerKey?: string;
	titles?: string[];
	title?: string;
	operator?: string;
};

export default function BusroutePattern({
	consumerKey,
	titles,
	title = '大12',
	operator = 'odpt.Operator:KokusaiKogyoBus',
}: Props) {
	const envKey = (import.meta.env && (import.meta.env as any).VITE_ODPT_KEY) || '';
	const key = consumerKey ?? envKey;

	// Use provided titles array or fall back to single title
	const titlesToFetch = titles || (title ? [title] : []);

	// Log for debugging
	React.useEffect(() => {
		console.log('BusroutePattern mounted.', {
			key: key ? '✓ set' : '✗ NOT set',
			titlesToFetch,
			operator,
		});
	}, [key, titlesToFetch, operator]);

	useEffect(() => {
		if (!key || titlesToFetch.length === 0) {
			console.error('ODPT consumer key or titles not provided.');
			return;
		}

		// Fetch for each title
		Promise.all(
			titlesToFetch.map(titleToFetch =>
				fetchBusroutePattern({ consumerKey: key, title: titleToFetch, operator })
					.catch((err) => {
						console.error(`✗ Error fetching BusroutePattern for "${titleToFetch}":`, err);
						return [];
					})
			)
		)
			.then((results) => {
				results.forEach((dataArray, index) => {
					const titleName = titlesToFetch[index];
					const arr = Array.isArray(dataArray) ? dataArray : [];
					
					arr.forEach((routePattern: any) => {
						const stops = routePattern['odpt:busstopPoleOrder'] || [];
					const notes = stops.map((stop: any) => stop['odpt:note'].split(':')[0]);
						console.log(`📍 "${titleName}":`, notes);
					});
				});
			})
			.catch((err) => {
				console.error('ODPT API error:', err);
			});
	}, [key, operator, titlesToFetch.join(',')]);

	// Render nothing (console-only output)
	return null;
}
