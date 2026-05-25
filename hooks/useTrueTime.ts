import { useState, useEffect, useCallback } from 'react';

// Biến toàn cục lưu độ lệch thời gian để chia sẻ giữa các instance nếu cần
let globalTimeOffset = 0;
let hasSynced = false;

/**
 * Lấy thời gian thực tế đã bù đắp độ lệch (chống gian lận)
 */
export const getTrueTime = (): Date => {
  return new Date(Date.now() + globalTimeOffset);
};

export const useTrueTime = () => {
  const [isSyncing, setIsSyncing] = useState(!hasSynced);

  const syncTime = useCallback(async () => {
    try {
      setIsSyncing(true);
      // Gọi API lấy giờ chuẩn Quốc tế (Múi giờ HCM)
      const res = await fetch('https://worldtimeapi.org/api/timezone/Asia/Ho_Chi_Minh', { 
        cache: 'no-store' 
      });
      const data = await res.json();
      
      const serverTime = new Date(data.datetime).getTime();
      const localTime = Date.now();
      
      // Tính toán độ lệch giữa giờ Server và giờ Client (Điện thoại)
      globalTimeOffset = serverTime - localTime;
      hasSynced = true;
    } catch (error) {
      console.error('⚠️ Lỗi đồng bộ thời gian máy chủ. Sử dụng giờ Local làm fallback.', error);
      // Nếu rớt mạng hoặc lỗi API, đành dùng giờ máy điện thoại (offset = 0)
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (!hasSynced) {
      syncTime();
    }
  }, [syncTime]);

  return { getTrueTime, isSyncing, syncTime };
};
