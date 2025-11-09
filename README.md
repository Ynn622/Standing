## 吹不倒 (Standing)

此專案為一個以 Vue 3 + TypeScript 架構的前端 Web 應用，整合即時風況、路況與相關服務查詢功能。專案使用 Vite 作為開發與建置工具，並以 Tailwind CSS 作為樣式基底，部分功能整合 Google Maps。

## 目標
- 提供即時的風速、風向與氣象資訊視覺化
- 支援路線規劃與路況查詢
- 整合附近服務（如公廁、公共設施）與氣象新聞

## 主要特色
- 即時風況儀表板（風速、風向、溫度、濕度等）
- 智慧路線規劃（多條建議路線、時間/距離估算）
- Google Maps 整合與地圖標記群聚（marker clustering）
- 可擴充的 Base UI 組件（位於 `src/components/base`）

## 技術棧
- Vue 3 + TypeScript
- Vite
- Tailwind CSS
- Pinia（狀態管理）
- Axios（HTTP 客戶端）
- Google Maps JS API

## 快速開始
建議使用 Node.js（16+ 或相容版本）與 npm：

```bash
# 安裝相依套件
npm install

# 本地開發
npm run dev

# 建置生產
npm run build

# 本地預覽已建置的產物
npm run preview

# 類型檢查
npm run type-check

# 靜態檢查與格式化
npm run lint
npm run format
```

## 環境變數
請於專案根目錄建立 `.env.local` 或相容的 Vite env 檔案，範例如下：

```env
VITE_API_BASE_URL=https://your-backend.example.com
VITE_GOOGLE_MAPS_KEY=AIza...your_key_here...
VITE_CUSTOM_MAP_TOKEN=your-map-provider-token
```

在原始碼中透過 `import.meta.env.VITE_*` 讀取，不要將金鑰等敏感資料寫死於程式碼。

## 專案結構（重點）

```
src/
├── components/       # UI 組件（含 base 組件）
├── views/            # 各頁面視圖：Home、Report、SafeNavigation、Traffic
├── router/           # 路由設定 (`src/router/index.ts`)
├── composables/      # 可重用的 Composition API
├── utils/            # API 客戶端、全域工具
└── assets/           # 圖片、靜態資源
```
