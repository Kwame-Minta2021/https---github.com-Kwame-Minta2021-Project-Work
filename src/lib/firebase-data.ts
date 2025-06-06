
import { database } from './firebase';
import { ref, onValue, off } from 'firebase/database';
import type { AirQualityData } from '@/types';

export interface FirebaseRealtimeData {
  CH4_LPG_ppm: number;
  CO_ppm: number;
  PM10_ug_m3: number;
  PM1_0_ug_m3: number;
  PM2_5_ug_m3: number;
  VOCs_ppm: number;
}

export function convertFirebaseDataToAirQualityData(firebaseData: FirebaseRealtimeData): AirQualityData {
  const timestamp = new Date();
  
  return {
    timestamp,
    co: {
      id: 'co',
      name: 'Carbon Monoxide',
      value: firebaseData.CO_ppm,
      unit: 'ppm',
      color: '#FF6B6B',
      iconName: 'FlaskConical',
      thresholds: { moderate: 4.5, unhealthy: 9.5 }
    },
    vocs: {
      id: 'vocs',
      name: 'Volatile Organic Compounds',
      value: firebaseData.VOCs_ppm,
      unit: 'ppm',
      color: '#4ECDC4',
      iconName: 'Cloud',
      thresholds: { moderate: 0.5, unhealthy: 3.0 }
    },
    ch4Lpg: {
      id: 'ch4Lpg',
      name: 'CH4/LPG',
      value: firebaseData.CH4_LPG_ppm,
      unit: 'ppm',
      color: '#45B7D1',
      iconName: 'Flame',
      thresholds: { moderate: 5000, unhealthy: 10000 }
    },
    pm1_0: {
      id: 'pm1_0',
      name: 'PM1.0',
      value: firebaseData.PM1_0_ug_m3,
      unit: 'µg/m³',
      color: '#96CEB4',
      iconName: 'Layers',
      thresholds: { moderate: 10, unhealthy: 25 }
    },
    pm2_5: {
      id: 'pm2_5',
      name: 'PM2.5',
      value: firebaseData.PM2_5_ug_m3,
      unit: 'µg/m³',
      color: '#FFEAA7',
      iconName: 'Layers',
      thresholds: { moderate: 12, unhealthy: 35.5 }
    },
    pm10: {
      id: 'pm10',
      name: 'PM10',
      value: firebaseData.PM10_ug_m3,
      unit: 'µg/m³',
      color: '#DDA0DD',
      iconName: 'Layers',
      thresholds: { moderate: 54, unhealthy: 154 }
    }
  };
}

export function subscribeToRealtimeData(callback: (data: AirQualityData | null) => void): () => void {
  if (!database) {
    console.error('Firebase database not initialized');
    callback(null);
    return () => {};
  }

  const dataRef = ref(database, '/');
  
  const unsubscribe = onValue(dataRef, (snapshot) => {
    const data = snapshot.val() as FirebaseRealtimeData;
    if (data && 
        typeof data.CH4_LPG_ppm === 'number' &&
        typeof data.CO_ppm === 'number' &&
        typeof data.PM10_ug_m3 === 'number' &&
        typeof data.PM1_0_ug_m3 === 'number' &&
        typeof data.PM2_5_ug_m3 === 'number' &&
        typeof data.VOCs_ppm === 'number') {
      
      const airQualityData = convertFirebaseDataToAirQualityData(data);
      callback(airQualityData);
    } else {
      console.warn('Invalid or incomplete Firebase data:', data);
      callback(null);
    }
  }, (error) => {
    console.error('Firebase realtime data error:', error);
    callback(null);
  });

  return () => off(dataRef, 'value', unsubscribe);
}
