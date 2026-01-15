export async function fetchBusTimetable(options: {
  consumerKey: string;
  operator?: string;
  title?: string;
}): Promise<any> {
  const operator = options.operator ?? 'odpt.Operator:TobuBus';
  const title = options.title ?? "大12";
  const consumerKey = options.consumerKey;

  if (!consumerKey) {
    throw new Error('consumerKey is required to call ODPT API');
  }
  console.log(`title:`, title);

  const base = 'https://api-challenge.odpt.org/api/v4/odpt:BusTimetable';
  
  // Try different parameter combinations to find what works
  const params = new URLSearchParams({
    'odpt:operator': operator,
    'acl:consumerKey': consumerKey,
  });
  
  // Use odpt:busroutePatternTitle instead of dc:title
  params.append('odpt:busroutePatternTitle', title);

  const url = `${base}?${params.toString()}`;

  console.log('🌐 Fetching from ODPT API:', url);

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ODPT API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log(`📦 API response for "${title}":`, {
    status: res.status,
    isArray: Array.isArray(data),
    length: Array.isArray(data) ? data.length : 'N/A',
    fullData: data,
  });
  return data;
}
