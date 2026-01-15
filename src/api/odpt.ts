export async function fetchBusTimetable(options: {
  consumerKey: string;
  operator?: string;
  title?: string;
}): Promise<any> {
  const operator = options.operator ?? 'odpt.Operator:KokusaiKogyoBus';
  const title = options.title ?? "大12";
  const consumerKey = options.consumerKey;

  if (!consumerKey) {
    throw new Error('consumerKey is required to call ODPT API');
  }

  const base = 'https://api-challenge.odpt.org/api/v4/odpt:BusTimetable';
  const params = new URLSearchParams({
    'odpt:operator': operator,
    'acl:consumerKey': consumerKey,
    "dc:title": title,
    "odpt:calendar": "odpt.Calendar:Holiday",
  });

  const url = `${base}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ODPT API error ${res.status}: ${text}`);
  }
  console.log("title: ", title);
  console.log("params: ", params);
  console.log("res: ", res);
  
  const data = await res.json();
  console.log(`📦 API response for "${title}":`, {
    status: res.status,
    isArray: Array.isArray(data),
    length: Array.isArray(data) ? data.length : 'N/A',
    fullData: data,
  });
  return data;
}
