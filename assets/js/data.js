
// busStops data
const busStops = [
    // East Exit Stops (9 stops)
    {
        id: 'e1',
        name: '東口1番のりば',
        area: 'east',
        position: { x: 65, y: 40 },
        coordinates: { lat: 35.9072, lng: 139.6255 },
        operator: 'tobu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['さいたま新都心駅', '浦和駅', '東浦和駅'],
        routes: ['tobu-e1', 'tobu-e2']
    },
    {
        id: 'e2',
        name: '東口2番のりば',
        area: 'east',
        position: { x: 70, y: 45 },
        coordinates: { lat: 35.9070, lng: 139.6257 },
        operator: 'tobu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['大宮公園', '岩槻駅', '春岡'],
        routes: ['tobu-e3', 'tobu-e4']
    },
    {
        id: 'e3',
        name: '東口3番のりば',
        area: 'east',
        position: { x: 75, y: 50 },
        coordinates: { lat: 35.9068, lng: 139.6259 },
        operator: 'seibu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['上尾駅', '桶川駅', 'ニューシャトル'],
        routes: ['seibu-e1', 'seibu-e2']
    },
    {
        id: 'e4',
        name: '東口4番のりば',
        area: 'east',
        position: { x: 80, y: 55 },
        coordinates: { lat: 35.9066, lng: 139.6261 },
        operator: 'kokusai',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['川越駅', '東松山駅', '鴻巣駅'],
        routes: ['kokusai-e1']
    },
    {
        id: 'e5',
        name: '東口5番のりば',
        area: 'east',
        position: { x: 65, y: 60 },
        coordinates: { lat: 35.9064, lng: 139.6254 },
        operator: 'tobu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['大和田駅', '七里駅', '岩槻駅'],
        routes: ['tobu-e5']
    },
    {
        id: 'e6',
        name: '東口6番のりば',
        area: 'east',
        position: { x: 70, y: 65 },
        coordinates: { lat: 35.9062, lng: 139.6256 },
        operator: 'seibu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['北浦和駅', '武蔵浦和駅', '戸田公園駅'],
        routes: ['seibu-e3']
    },
    {
        id: 'e7',
        name: '東口7番のりば',
        area: 'east',
        position: { x: 75, y: 70 },
        coordinates: { lat: 35.9060, lng: 139.6258 },
        operator: 'tobu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['浦和美園駅', 'ららぽーと', 'イオンモール'],
        routes: ['tobu-e6']
    },
    {
        id: 'e8',
        name: '東口8番のりば',
        area: 'east',
        position: { x: 80, y: 75 },
        coordinates: { lat: 35.9058, lng: 139.6260 },
        operator: 'kokusai',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['自治医大', '栗橋駅', '加須駅'],
        routes: ['kokusai-e2']
    },
    {
        id: 'e9',
        name: '東口9番のりば',
        area: 'east',
        position: { x: 65, y: 80 },
        coordinates: { lat: 35.9056, lng: 139.6253 },
        operator: 'tobu',
        isDropOffOnly: true,
        isOmiyaStation: true,
        destinations: [],
        routes: []
    },

    // West Exit Stops (11 stops)
    {
        id: 'w1',
        name: '西口1番のりば',
        area: 'west',
        position: { x: 30, y: 35 },
        coordinates: { lat: 35.9073, lng: 139.6225 },
        operator: 'tobu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['川越駅', '指扇駅', '西大宮駅'],
        routes: ['tobu-w1']
    },
    {
        id: 'w2',
        name: '西口2番のりば',
        area: 'west',
        position: { x: 25, y: 40 },
        coordinates: { lat: 35.9071, lng: 139.6223 },
        operator: 'seibu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['所沢駅', '新座駅', '清瀬駅'],
        routes: ['seibu-w1', 'seibu-w2']
    },
    {
        id: 'w3',
        name: '西口3番のりば',
        area: 'west',
        position: { x: 20, y: 45 },
        coordinates: { lat: 35.9069, lng: 139.6221 },
        operator: 'kokusai',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['丸山公園', '三橋総合公園', '植水'],
        routes: ['kokusai-w1']
    },
    {
        id: 'w4',
        name: '西口4番のりば',
        area: 'west',
        position: { x: 15, y: 50 },
        coordinates: { lat: 35.9067, lng: 139.6219 },
        operator: 'tobu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['宮原駅', '加茂宮駅', '東宮原'],
        routes: ['tobu-w2']
    },
    {
        id: 'w5',
        name: '西口5番のりば',
        area: 'west',
        position: { x: 30, y: 55 },
        coordinates: { lat: 35.9065, lng: 139.6224 },
        operator: 'seibu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['大成駅', '鉄道博物館', '北与野駅'],
        routes: ['seibu-w3']
    },
    {
        id: 'w6',
        name: '西口6番のりば',
        area: 'west',
        position: { x: 25, y: 60 },
        coordinates: { lat: 35.9063, lng: 139.6222 },
        operator: 'tobu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['土呂駅', '東大宮駅', '蓮田駅'],
        routes: ['tobu-w3']
    },
    {
        id: 'w7',
        name: '西口7番のりば',
        area: 'west',
        position: { x: 20, y: 65 },
        coordinates: { lat: 35.9061, lng: 139.6220 },
        operator: 'kokusai',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['日進駅', '指扇駅', '西遊馬'],
        routes: ['kokusai-w2']
    },
    {
        id: 'w8',
        name: '西口8番のりば',
        area: 'west',
        position: { x: 15, y: 70 },
        coordinates: { lat: 35.9059, lng: 139.6218 },
        operator: 'seibu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['大宮ソニックシティ', 'さいたまスーパーアリーナ'],
        routes: ['seibu-w4']
    },
    {
        id: 'w9',
        name: '西口9番のりば',
        area: 'west',
        position: { x: 30, y: 75 },
        coordinates: { lat: 35.9057, lng: 139.6223 },
        operator: 'tobu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['三橋', '佐知川', '中釘'],
        routes: ['tobu-w4']
    },
    {
        id: 'w10',
        name: '西口10番のりば',
        area: 'west',
        position: { x: 25, y: 80 },
        coordinates: { lat: 35.9055, lng: 139.6221 },
        operator: 'kokusai',
        isDropOffOnly: true,
        isOmiyaStation: true,
        destinations: [],
        routes: []
    },
    {
        id: 'w11',
        name: '西口11番のりば',
        area: 'west',
        position: { x: 20, y: 85 },
        coordinates: { lat: 35.9053, lng: 139.6219 },
        operator: 'seibu',
        isDropOffOnly: false,
        isOmiyaStation: true,
        destinations: ['吉野原', 'プラザノース', '三橋中央通り'],
        routes: ['seibu-w5']
    },

    // Route Stops (other stops along the routes)
    // Tobu-E1 Route Stops
    {
        id: 'route-e1-1',
        name: 'さいたま新都心駅',
        area: 'route',
        position: { x: 0, y: 0 },
        coordinates: { lat: 35.8948, lng: 139.6308 },
        operator: 'tobu',
        isDropOffOnly: false,
        destinations: ['大宮駅', '浦和駅'],
        routes: ['tobu-e1']
    },
    {
        id: 'route-e1-2',
        name: '浦和駅',
        area: 'route',
        position: { x: 0, y: 0 },
        coordinates: { lat: 35.8586, lng: 139.6567 },
        operator: 'tobu',
        isDropOffOnly: false,
        destinations: ['大宮駅', '東浦和駅'],
        routes: ['tobu-e1']
    },
    {
        id: 'route-e1-3',
        name: '東浦和駅',
        area: 'route',
        position: { x: 0, y: 0 },
        coordinates: { lat: 35.8412, lng: 139.6895 },
        operator: 'tobu',
        isDropOffOnly: false,
        destinations: ['大宮駅', '浦和駅'],
        routes: ['tobu-e1']
    },
    // Tobu-E3 Route Stops
    {
        id: 'route-e3-1',
        name: '大宮公園',
        area: 'route',
        position: { x: 0, y: 0 },
        coordinates: { lat: 35.9262, lng: 139.6379 },
        operator: 'tobu',
        isDropOffOnly: false,
        destinations: ['大宮駅', '岩槻駅'],
        routes: ['tobu-e3']
    },
    {
        id: 'route-e3-2',
        name: '岩槻駅',
        area: 'route',
        position: { x: 0, y: 0 },
        coordinates: { lat: 35.9493, lng: 139.6934 },
        operator: 'tobu',
        isDropOffOnly: false,
        destinations: ['大宮駅', '大宮公園'],
        routes: ['tobu-e3']
    },
    // Seibu-E1 Route Stops
    {
        id: 'route-se1-1',
        name: '上尾駅',
        area: 'route',
        position: { x: 0, y: 0 },
        coordinates: { lat: 35.9776, lng: 139.5931 },
        operator: 'seibu',
        isDropOffOnly: false,
        destinations: ['大宮駅', '桶川駅'],
        routes: ['seibu-e1']
    },
    {
        id: 'route-se1-2',
        name: '桶川駅',
        area: 'route',
        position: { x: 0, y: 0 },
        coordinates: { lat: 36.0026, lng: 139.5559 },
        operator: 'seibu',
        isDropOffOnly: false,
        destinations: ['大宮駅', '上尾駅'],
        routes: ['seibu-e1']
    },
    // Tobu-W1 Route Stops
    {
        id: 'route-w1-1',
        name: '指扇駅',
        area: 'route',
        position: { x: 0, y: 0 },
        coordinates: { lat: 35.9165, lng: 139.5648 },
        operator: 'tobu',
        isDropOffOnly: false,
        destinations: ['大宮駅', '川越駅'],
        routes: ['tobu-w1']
    },
    {
        id: 'route-w1-2',
        name: '西大宮駅',
        area: 'route',
        position: { x: 0, y: 0 },
        coordinates: { lat: 35.9251, lng: 139.5850 },
        operator: 'tobu',
        isDropOffOnly: false,
        destinations: ['大宮駅', '川越駅'],
        routes: ['tobu-w1']
    },
    {
        id: 'route-w1-3',
        name: '川越駅',
        area: 'route',
        position: { x: 0, y: 0 },
        coordinates: { lat: 35.9106, lng: 139.4855 },
        operator: 'tobu',
        isDropOffOnly: false,
        destinations: ['大宮駅', '指扇駅'],
        routes: ['tobu-w1']
    },
    // Seibu-W3 Route Stops
    {
        id: 'route-sw3-1',
        name: '鉄道博物館',
        area: 'route',
        position: { x: 0, y: 0 },
        coordinates: { lat: 35.9270, lng: 139.6168 },
        operator: 'seibu',
        isDropOffOnly: false,
        destinations: ['大宮駅', '北与野駅'],
        routes: ['seibu-w3']
    },
    {
        id: 'route-sw3-2',
        name: '北与野駅',
        area: 'route',
        position: { x: 0, y: 0 },
        coordinates: { lat: 35.9034, lng: 139.6139 },
        operator: 'seibu',
        isDropOffOnly: false,
        destinations: ['大宮駅', '鉄道博物館'],
        routes: ['seibu-w3']
    },
    // Dummy stops for many many routes... (Truncating for brevity in this thought, but writing full in file)
    // I will include all dummy stops from previous step
    { id: 'route-e1-dummy1', name: '大宮駅東口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9070, lng: 139.6250 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    // ... (All other dummy stops)
    // To ensure I don't miss anything, I will use the exact content from previous step but replace 'export const' with 'window.' or 'const'
    // I will use 'window.busStops = ...' to be safe.
    { id: 'route-e1-dummy2', name: '錦町', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9000, lng: 139.6280 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e1-dummy3', name: '南与野駅', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8767, lng: 139.6437 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e1-dummy4', name: '別所沼公園', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8499, lng: 139.6650 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e2-dummy1', name: 'ソニックシティ前', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9065, lng: 139.6240 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e2-dummy2', name: '北袋町', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9010, lng: 139.6270 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e2-dummy3', name: 'けやきひろば', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8950, lng: 139.6300 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e3-dummy1', name: '氷川参道', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9150, lng: 139.6300 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e3-dummy2', name: '大和田町', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9377, lng: 139.6656 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e4-dummy1', name: '大宮区役所前', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9100, lng: 139.6270 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e4-dummy2', name: '東大成', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9120, lng: 139.6320 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e4-dummy3', name: '春岡小学校前', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9140, lng: 139.6380 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e4-dummy4', name: '春岡', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9160, lng: 139.6420 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e5-dummy1', name: '東大宮駅入口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9080, lng: 139.6400 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e5-dummy2', name: '大和田駅入口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9200, lng: 139.6500 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e5-dummy3', name: '片柳', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9300, lng: 139.6600 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e5-dummy4', name: '七里駅入口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9400, lng: 139.6700 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e5-dummy5', name: '東岩槻', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9450, lng: 139.6800 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e6-dummy1', name: '上木崎', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8900, lng: 139.6450 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e6-dummy2', name: '埼玉スタジアム', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8700, lng: 139.6600 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e6-dummy3', name: 'ららぽーと新三郷', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8500, lng: 139.6750 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-e6-dummy4', name: '浦和美園駅', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8400, lng: 139.6850 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-se1-dummy1', name: '櫛引', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9300, lng: 139.6100 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-se1-dummy2', name: '西宮下', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9500, lng: 139.6000 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-se1-dummy3', name: '上尾中央総合病院', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9850, lng: 139.5850 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-se2-dummy1', name: '今羽町', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9150, lng: 139.6200 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-se2-dummy2', name: 'ニューシャトル大宮', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9200, lng: 139.6180 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-se2-dummy3', name: '加茂宮', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9250, lng: 139.6150 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-se3-dummy1', name: '与野本町駅', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8850, lng: 139.6200 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-se3-dummy2', name: '北浦和駅西口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8700, lng: 139.6300 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-se3-dummy3', name: '武蔵浦和駅', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8480, lng: 139.6440 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-se3-dummy4', name: '戸田公園駅', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8200, lng: 139.6580 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-ke1-dummy1', name: '中川', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9050, lng: 139.6000 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-ke1-dummy2', name: '上尾道路', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9000, lng: 139.5700 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-ke1-dummy3', name: '北坂戸', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9100, lng: 139.5200 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-ke1-dummy4', name: '若葉駅', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9150, lng: 139.5000 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-ke1-dummy5', name: '東松山駅', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 36.0300, lng: 139.3980 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-ke2-dummy1', name: '東大宮', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9300, lng: 139.6500 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-ke2-dummy2', name: '蓮田駅', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9900, lng: 139.6600 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-ke2-dummy3', name: '白岡駅', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 36.0200, lng: 139.6700 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-ke2-dummy4', name: '久喜駅', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 36.0600, lng: 139.6680 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-w2-dummy1', name: '宮原町', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9250, lng: 139.6100 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-w2-dummy2', name: '宮原駅東口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9350, lng: 139.6050 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-w2-dummy3', name: '加茂宮駅', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9450, lng: 139.6000 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-w3-dummy1', name: '大成町', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9150, lng: 139.6350 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-w3-dummy2', name: '土呂駅入口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9250, lng: 139.6450 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-w3-dummy3', name: '東大宮駅西口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9350, lng: 139.6550 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-w3-dummy4', name: '見沼区役所前', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9450, lng: 139.6650 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-w4-dummy1', name: '西大宮バイパス', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9100, lng: 139.6050 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-w4-dummy2', name: '三橋総合公園', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9000, lng: 139.5950 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-w4-dummy3', name: '佐知川原', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8900, lng: 139.5850 }, operator: 'tobu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-sw1-dummy1', name: '西区役所前', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9050, lng: 139.6050 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-sw1-dummy2', name: '西大宮駅南口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9100, lng: 139.5900 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-sw1-dummy3', name: '三橋六丁目', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9000, lng: 139.5750 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-sw1-dummy4', name: '所沢駅東口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.7990, lng: 139.4690 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-sw2-dummy1', name: '盆栽町', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9150, lng: 139.6100 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-sw2-dummy2', name: '新座駅入口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8500, lng: 139.5500 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-sw2-dummy3', name: '清瀬駅南口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.7850, lng: 139.5260 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-sw4-dummy1', name: 'ソニックシティ', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9065, lng: 139.6235 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-sw4-dummy2', name: 'さいたまスーパーアリーナ', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8950, lng: 139.6310 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-sw5-dummy1', name: 'プラザノース入口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9200, lng: 139.6050 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-sw5-dummy2', name: '吉野原一丁目', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9300, lng: 139.5950 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-sw5-dummy3', name: '吉野原公園', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9400, lng: 139.5850 }, operator: 'seibu', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-kw1-dummy1', name: '植竹', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9100, lng: 139.6100 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-kw1-dummy2', name: '丸山公園入口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9000, lng: 139.6000 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-kw1-dummy3', name: '三橋総合公園', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8900, lng: 139.5900 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-kw1-dummy4', name: '植水', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.8800, lng: 139.5800 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-kw2-dummy1', name: '大宮西警察署前', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9050, lng: 139.6150 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-kw2-dummy2', name: '日進駅北口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9000, lng: 139.5900 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
    { id: 'route-kw2-dummy3', name: '指扇駅入口', area: 'route', position: { x: 0, y: 0 }, coordinates: { lat: 35.9165, lng: 139.5648 }, operator: 'kokusai', isDropOffOnly: false, destinations: [], routes: [] },
];

window.busStops = busStops;

const routes = [
    // ... Routes Data ...
    // Copying full routes data ensuring correct brackets.
    {
        id: 'tobu-e1',
        name: '東01系統',
        operator: 'tobu',
        color: '#00A040',
        stops: ['e1', 'route-e1-dummy1', 'route-e1-dummy2', 'route-e1-1', 'route-e1-dummy3', 'route-e1-2', 'route-e1-dummy4', 'route-e1-3'],
        description: 'さいたま新都心駅・浦和駅・東浦和駅方面'
    },
    {
        id: 'tobu-e2',
        name: '東02系統',
        operator: 'tobu',
        color: '#00A040',
        stops: ['e1', 'route-e2-dummy1', 'route-e2-dummy2', 'route-e2-dummy3'],
        description: '新都心方面'
    },
    {
        id: 'tobu-e3',
        name: '東03系統',
        operator: 'tobu',
        color: '#00A040',
        stops: ['e2', 'route-e3-dummy1', 'route-e3-1', 'route-e3-dummy2', 'route-e3-2'],
        description: '大宮公園・岩槻駅方面'
    },
    {
        id: 'tobu-e4',
        name: '東04系統',
        operator: 'tobu',
        color: '#00A040',
        stops: ['e2', 'route-e4-dummy1', 'route-e4-dummy2', 'route-e4-dummy3', 'route-e4-dummy4'],
        description: '春岡方面'
    },
    {
        id: 'tobu-e5',
        name: '東05系統',
        operator: 'tobu',
        color: '#00A040',
        stops: ['e5', 'route-e5-dummy1', 'route-e5-dummy2', 'route-e5-dummy3', 'route-e5-dummy4', 'route-e5-dummy5'],
        description: '大和田駅・七里駅方面'
    },
    {
        id: 'tobu-e6',
        name: '東06系統',
        operator: 'tobu',
        color: '#00A040',
        stops: ['e7', 'route-e6-dummy1', 'route-e6-dummy2', 'route-e6-dummy3', 'route-e6-dummy4'],
        description: '浦和美園駅・ららぽーと方面'
    },
    {
        id: 'seibu-e1',
        name: '上01系統',
        operator: 'seibu',
        color: '#FFD700',
        stops: ['e3', 'route-se1-dummy1', 'route-se1-dummy2', 'route-se1-1', 'route-se1-dummy3', 'route-se1-2'],
        description: '上尾駅・桶川駅方面'
    },
    {
        id: 'seibu-e2',
        name: '上02系統',
        operator: 'seibu',
        color: '#FFD700',
        stops: ['e3', 'route-se2-dummy1', 'route-se2-dummy2', 'route-se2-dummy3'],
        description: 'ニューシャトル方面'
    },
    {
        id: 'seibu-e3',
        name: '浦01系統',
        operator: 'seibu',
        color: '#FFD700',
        stops: ['e6', 'route-se3-dummy1', 'route-se3-dummy2', 'route-se3-dummy3', 'route-se3-dummy4'],
        description: '北浦和駅・武蔵浦和駅方面'
    },
    {
        id: 'kokusai-e1',
        name: '川01系統',
        operator: 'kokusai',
        color: '#E60012',
        stops: ['e4', 'route-ke1-dummy1', 'route-ke1-dummy2', 'route-ke1-dummy3', 'route-ke1-dummy4', 'route-ke1-dummy5'],
        description: '川越駅・東松山駅方面'
    },
    {
        id: 'kokusai-e2',
        name: '栗01系統',
        operator: 'kokusai',
        color: '#E60012',
        stops: ['e8', 'route-ke2-dummy1', 'route-ke2-dummy2', 'route-ke2-dummy3', 'route-ke2-dummy4'],
        description: '自治医大・栗橋駅方面'
    },
    {
        id: 'tobu-w1',
        name: '西01系統',
        operator: 'tobu',
        color: '#00A040',
        stops: ['w1', 'route-w1-1', 'route-w1-2', 'route-w1-3'],
        description: '指扇駅・西大宮駅・川越駅方面'
    },
    {
        id: 'tobu-w2',
        name: '西02系統',
        operator: 'tobu',
        color: '#00A040',
        stops: ['w4', 'route-w2-dummy1', 'route-w2-dummy2', 'route-w2-dummy3'],
        description: '宮原駅・加茂宮駅方面'
    },
    {
        id: 'tobu-w3',
        name: '西03系統',
        operator: 'tobu',
        color: '#00A040',
        stops: ['w6', 'route-w3-dummy1', 'route-w3-dummy2', 'route-w3-dummy3', 'route-w3-dummy4'],
        description: '土呂駅・東大宮駅方面'
    },
    {
        id: 'tobu-w4',
        name: '西04系統',
        operator: 'tobu',
        color: '#00A040',
        stops: ['w9', 'route-w4-dummy1', 'route-w4-dummy2', 'route-w4-dummy3'],
        description: '三橋・佐知川方面'
    },
    {
        id: 'seibu-w1',
        name: '所01系統',
        operator: 'seibu',
        color: '#FFD700',
        stops: ['w2', 'route-sw1-dummy1', 'route-sw1-dummy2', 'route-sw1-dummy3', 'route-sw1-dummy4'],
        description: '所沢駅方面'
    },
    {
        id: 'seibu-w2',
        name: '所02系統',
        operator: 'seibu',
        color: '#FFD700',
        stops: ['w2', 'route-sw2-dummy1', 'route-sw2-dummy2', 'route-sw2-dummy3'],
        description: '新座駅・清瀬駅方面'
    },
    {
        id: 'seibu-w3',
        name: '鉄01系統',
        operator: 'seibu',
        color: '#FFD700',
        stops: ['w5', 'route-sw3-1', 'route-sw3-2'],
        description: '鉄道博物館・北与野駅方面'
    },
    {
        id: 'seibu-w4',
        name: 'ア01系統',
        operator: 'seibu',
        color: '#FFD700',
        stops: ['w8', 'route-sw4-dummy1', 'route-sw4-dummy2'],
        description: 'ソニックシティ・スーパーアリーナ方面'
    },
    {
        id: 'seibu-w5',
        name: '吉01系統',
        operator: 'seibu',
        color: '#FFD700',
        stops: ['w11', 'route-sw5-dummy1', 'route-sw5-dummy2', 'route-sw5-dummy3'],
        description: '吉野原・プラザノース方面'
    },
    {
        id: 'kokusai-w1',
        name: '丸01系統',
        operator: 'kokusai',
        color: '#E60012',
        stops: ['w3', 'route-kw1-dummy1', 'route-kw1-dummy2', 'route-kw1-dummy3', 'route-kw1-dummy4'],
        description: '丸山公園・三橋総合公園方面'
    },
    {
        id: 'kokusai-w2',
        name: '日01系統',
        operator: 'kokusai',
        color: '#E60012',
        stops: ['w7', 'route-kw2-dummy1', 'route-kw2-dummy2', 'route-kw2-dummy3'],
        description: '日進駅・指扇駅方面'
    }
];

window.routes = routes;

window.getBusStopById = function (id) {
    return window.busStops.find(stop => stop.id === id);
}

window.getRouteById = function (id) {
    return window.routes.find(route => route.id === id);
}

// Generate mock departures for a bus stop
window.getDepartures = function (stopId, currentTime) {
    const stop = window.getBusStopById(stopId);
    if (!stop || stop.isDropOffOnly) return [];

    const departures = [];
    const baseHour = currentTime.getHours();
    const baseMinute = currentTime.getMinutes();

    // Generate departures for the next 2 hours
    stop.routes.forEach((routeId, index) => {
        const route = window.getRouteById(routeId);
        if (!route) return;

        const destination = stop.destinations[index] || stop.destinations[0];

        // Generate departures every 15-20 minutes
        for (let i = 0; i < 6; i++) {
            const minuteOffset = i * 15 + (index * 5);
            let departureHour = baseHour;
            let departureMinute = baseMinute + minuteOffset;

            if (departureMinute >= 60) {
                departureHour += Math.floor(departureMinute / 60);
                departureMinute = departureMinute % 60;
            }

            if (departureHour < 24) {
                departures.push({
                    routeId: route.id,
                    routeName: route.name,
                    destination,
                    departureTime: `${String(departureHour).padStart(2, '0')}:${String(departureMinute).padStart(2, '0')}`,
                    isRealTime: i === 0,
                    delay: i === 0 && Math.random() > 0.7 ? Math.floor(Math.random() * 5) : undefined
                });
            }
        }
    });

    return departures.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}
