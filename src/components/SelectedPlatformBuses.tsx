import React, { useEffect, useState } from 'react';
import { fetchBusTimetable } from '../api/odpt';

type Props = {
	consumerKey?: string;
	operator?: string;
	limit?: number;
};

export default function SelectedPlatformBuses({
	consumerKey,
	operator = 'odpt.Operator:TobuBus',
	limit = 50,
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

		console.log('Fetching ODPT BusTimetable...', { operator, key: key.substring(0, 5) + '...' });

		fetchBusTimetable({ operator, consumerKey: key })
			.then((d) => {
				console.log('ODPT API response:', d);
				const arr = Array.isArray(d) ? d : d ? [d] : [];
				console.log('Timetable data:', arr[0].length, 'items');
				console.table(arr.slice(0, limit));
			})
			.catch((err) => {
				console.error('ODPT API error:', err);
			});
	}, [key, operator, limit]);

	// Render nothing (console-only output)
	return null;
}

