export interface ServiceItem {
  id: string;
  name: string;
  icon: string;
  route: string;
}

export interface MapPreview {
  title: string;
  addressHint: string;
  road: string;
  landmark: string;
  updatedAt: string;
}

export interface StreetInfo {
  intersection: string;
  status: string;
  source: string;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  time?: string;
  source?: string;
  thumbnail?: string;
}

export interface WindInfo {
  speed: string;
  unit: string;
  direction: string;
  intensity: number;
  temperature: string;
  humidity: string;
  pressure: string;
}

export interface HomeOverview {
  location: string;
  advisory: string;
  windInfo: WindInfo;
  drivingAdvice: string;
  services: ServiceItem[];
  mapPreview: MapPreview;
  googleMapEmbed: string;
  streetInfo: StreetInfo;
  newsList: NewsItem[];
}

export const getHomeOverview = (): HomeOverview => ({
  location: '臺北市信義區莊敬路391巷22號',
  advisory: '行車建議：盡可能減少外出',
  windInfo: {
    speed: '10.5',
    unit: 'm/s',
    direction: '東北風',
    intensity: 70,
    temperature: '25',
    humidity: '65',
    pressure: '1013'
  },
  drivingAdvice: '持續有強陣風與短暫大雨，建議非必要不要駕車上路。',
  services: [
    { id: 'traffic', name: '路況檢視', icon: '🚗', route: 'traffic' },
    { id: 'safe-nav', name: '安全導航', icon: '🧭', route: 'traffic' },
    { id: 'report', name: '障礙回報', icon: '⚠️', route: 'traffic' },
    { id: 'wind', name: '風況詳情', icon: '🌪️', route: 'wind' },
    { id: 'settings', name: '個人設定', icon: '⚙️', route: 'settings' }
  ],
  mapPreview: {
    title: '路況查看',
    addressHint: '顯示詳細地址 >',
    road: '信義路五段',
    landmark: '台北101',
    updatedAt: '更新於 2 分鐘前'
  },
  googleMapEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3615.022253974696!2d121.56235021214552!3d25.03396498397207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442abbf0c93418d%3A0x64db763b69ad2b6!2z5Y-w5YyXIDEwMQ!5e0!3m2!1szh-TW!2stw!4v1717132800000!5m2!1szh-TW!2stw',
  streetInfo: {
    intersection: '莊敬路391巷 x 信義路五段',
    status: '街口資料讀取中，等待 API 注入',
    source: '資料來源：智慧交通 API（預留）'
  },
  newsList: [
    {
      id: 1,
      title: '北部持續豪大雨 勿強行涉水',
      summary: '台北一名大學生於返家路上遭遇颱風外圍環流，雨勢造成能見度低，駕駛須減速慢行。'
    },
    {
      id: 2,
      title: '東部山區出現落石 須注意',
      summary: '花蓮天祥路段傳出落石，公路總局籲民眾暫勿前往並密切關注最新路況資訊。'
    }
  ]
});

export const getWindMetrics = (): WindInfo => ({
  speed: '15',
  direction: '東北風',
  unit: 'm/s',
  intensity: 65,
  temperature: '25',
  humidity: '65',
  pressure: '1013'
});

export const getWindNews = (): NewsItem[] => [
  {
    id: 1,
    title: '東北季風增強 北部轉涼有雨',
    summary: '受東北季風影響，北部地區氣溫下降3-5度，並有局部陣雨...',
    time: '2小時前',
    source: '中央氣象署'
  },
  {
    id: 2,
    title: '強風特報 沿海地區需注意',
    summary: '今日午後東北風持續增強，沿海空曠地區陣風可達8-9級...',
    time: '5小時前',
    source: '氣象局'
  },
  {
    id: 3,
    title: '週末天氣轉好 適合戶外活動',
    summary: '預計週末東北季風減弱，各地多雲到晴，溫度回升...',
    time: '1天前',
    source: '天氣風險公司'
  },
  {
    id: 4,
    title: '空氣品質預報 中南部需注意',
    summary: '受風向影響，中南部地區空氣品質可能達到橘色提醒等級...',
    time: '1天前',
    source: '環保署'
  }
];

export interface TrafficTab {
  id: 'avoid' | 'danger' | 'safe';
  label: string;
}

export interface TrafficLayerPreset {
  title: string;
  description: string;
  highlight: string;
  color: string;
}

export const getTrafficTabs = (): TrafficTab[] => [
  { id: 'avoid', label: '迴避路段' },
  { id: 'danger', label: '危險路段' },
  { id: 'safe', label: '安全路段' }
];

export const getTrafficLayerPresets = (): Record<TrafficTab['id'], TrafficLayerPreset> => ({
  avoid: {
    title: '請迴避：忠孝復興圓環',
    description: '目前車流壅塞，陣風達 10 m/s，建議改道至敦化南路。',
    highlight: '灰色虛線顯示可能封閉路段',
    color: '#6B7280'
  },
  danger: {
    title: '危險路段：仁愛路三段',
    description: '路樹傾倒仍在處理，局部區域有積水，進入前請放慢速度。',
    highlight: '紅色警示標記顯示事故熱點',
    color: '#D45251'
  },
  safe: {
    title: '安全路段：市民大道高架',
    description: '路況順暢且視線良好，系統建議優先通過該路段。',
    highlight: '綠色線段顯示建議路徑',
    color: '#62A3A6'
  }
});

export const getTrafficMapEmbedUrl = (): string =>
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.568581001418!2d121.54126917607693!3d25.045193677804056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a97a5ddeea4f%3A0x1dea53c58d32e848!2z5paw5YyX6Y6u5Lit5b-DIOWPsOmdmOaWsOWMl-W6lw!5e0!3m2!1szh-TW!2stw!4v1717136400000!5m2!1szh-TW!2stw';
