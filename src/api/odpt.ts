export async function fetchBusTimetable(options: {
  consumerKey: string;
  operator?: string;
  title?: string;
}): Promise<any> {
  const operator = options.operator ?? 'odpt.Operator:KokusaiKogyoBus';
  const title = options.title ??  "大１２";
  const consumerKey = options.consumerKey;

  if (!consumerKey) {
    throw new Error('consumerKey is required to call ODPT API');
  }

  const base = 'https://api-challenge.odpt.org/api/v4/odpt:BusTimetable';
  const params = new URLSearchParams({
    'odpt:operator': operator,
    'acl:consumerKey': consumerKey,
    "dc:title": "大12",
    "odpt:calendar": "odpt.Calendar:Holiday",
  });

  const url = `${base}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ODPT API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data;
}
