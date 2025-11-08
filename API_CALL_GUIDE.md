# 前端 API 調用指南

## 環境與 Base URL
- 透過 Vite 環境變數設定 API 與地圖金鑰，建議於根目錄建立 `.env.local`：
  ```bash
  VITE_API_BASE_URL=https://lapras-backend-752705272074.asia-east1.run.app
  VITE_GOOGLE_MAPS_KEY=AIza...
  VITE_CUSTOM_MAP_TOKEN=your-map-provider-token
  ```
- 在程式中使用 `import.meta.env.VITE_*` 取得金鑰，避免將敏感資訊硬寫在 `MapView.vue` 或 `TrashView.vue`。

## 共用 HTTP 客戶端
在 `src/lib/http.ts` 建立 Axios 實例以統一標頭、逾時與錯誤處理：

```ts
import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

http.interceptors.response.use(
  (resp) => resp.data,
  (error) => {
    console.error('[API] ', error);
    return Promise.reject(error);
  }
);
```

前端畫面只需 `import { http } from '@/lib/http'` 並呼叫 `await http.post(...)`，即可取得 `.data`。

## 既有 API 端點
| 功能 | 位置 | 方法 | 路徑 | 請求摘要 |
| --- | --- | --- | --- | --- |
| 文本分類搜尋 | `src/views/TrashView.vue` | `POST` | `/api/chat/text/category` | `{"msg": chatMsgValue}`，回傳 AI 對話字串後顯示在彈窗 |
| 圖像分類：類別 | `TrashView.vue` | `POST` | `/api/chat/photo/category` | `FormData(image)`；回傳 `choices[0].message.content` 作為資訊面板內容 |
| 圖像分類：物件 | `TrashView.vue` | `POST` | `/api/chat/photo/thing` | 同上，結果用於對話框標題 |
| 地方服務資料 | `src/views/SurroundingServiceView.vue` | `GET` | `selectedSearchData.request_url` | 動態請求政府開放資料或 JSON，詳細欄位由 `mappingFormatter` 統一格式 |
| 自訂地圖資料 | `src/components/organisms/MapView.vue` & `src/Map.vue` | - | - | 兩個檔案現為佔位元件，可在整合端自行串接任意地圖 API |

## 呼叫流程建議
1. 於組件 `setup` 中引入共用 `http`，並以 `ref` 控制 `loading`、`error` 狀態。
2. 撰寫純函式封裝實際的 API 呼叫，回傳結構化結果（例如 `Promise<ServiceCategory[]>`），再交由 Pinia 或元件狀態使用。
3. 對於 `FormData` 上傳（例如 TrashView 的拍照/上傳），維持 `Content-Type` 自動由瀏覽器決定，並於 `finally` 區塊重置 `loading`。
4. 對地圖類 API，請在送出前驗證必填參數（座標、token），避免造成 401 或 422；一旦取得資料，立即緩存在 store 以減少重複呼叫。

## 錯誤與例外處理
- 捕捉 `try/catch`，將錯誤訊息寫入 UI（如 `dialogContent` 或 toast）並記錄 `console.error`，方便調試。
- API 回傳結構不穩定時（例如 `choices?.[0]?.message?.content`），請先使用 `optional chaining` 與預設值，以免畫面因 `undefined` 中斷。
- 若需要同時請求多個端點，可使用 `Promise.all`（TrashView 上傳案例），並在任何一個失敗時給出統一錯誤提示。

按照上述模式撰寫的 API 代碼，能與既有的 `TrashView`、`SurroundingServiceView`、`MapView` 等頁面行為保持一致，也方便後續集中調整金鑰或錯誤處理。 
