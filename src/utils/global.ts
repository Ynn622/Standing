// composable 或 component 中
import { ref, onMounted } from 'vue';

export function useUserInfo() {
  const userId = ref<string>('');
  const userInfo = ref<any>(null);

  const requestUserInfo = () => {
    // @ts-ignore
    if (window.flutterObject) {
      // 請求用戶資訊
      // @ts-ignore
      window.flutterObject.postMessage(JSON.stringify({
        name: 'userinfo',
        data: null
      }));

      // 監聽回應
      // @ts-ignore
      window.flutterObject.addEventListener('message', (event: MessageEvent) => {
        const response = JSON.parse(event.data);
        
        if (response.name === 'userinfo') {
          userInfo.value = response.data;
          userId.value = response.data.id;  // 取得 ID
        }
      });
    }
  };

  onMounted(() => {
    requestUserInfo();
  });

  return {
    userId,
    userInfo,
    requestUserInfo
  };
}