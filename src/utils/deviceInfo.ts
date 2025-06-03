
import UAParser from 'ua-parser-js';

export interface DeviceInfo {
  browser: {
    name?: string;
    version?: string;
    major?: string;
  };
  os: {
    name?: string;
    version?: string;
  };
  device: {
    type?: string;
    vendor?: string;
    model?: string;
  };
  engine: {
    name?: string;
    version?: string;
  };
  cpu: {
    architecture?: string;
  };
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
  timezone: string;
  language: string;
  cookieEnabled: boolean;
  doNotTrack: boolean;
  hardwareConcurrency?: number;
  maxTouchPoints?: number;
}

export interface NetworkInfo {
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  online: boolean;
}

export interface LocationInfo {
  timestamp: number;
  userAgent: string;
  referrer: string;
  url: string;
}

export const getDeviceInfo = (): DeviceInfo => {
  const parser = new UAParser();
  const result = parser.getResult();

  return {
    browser: result.browser,
    os: result.os,
    device: result.device,
    engine: result.engine,
    cpu: result.cpu,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1',
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
  };
};

export const getNetworkInfo = (): NetworkInfo => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    connection: connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    } : undefined,
    online: navigator.onLine,
  };
};

export const getLocationInfo = (): LocationInfo => {
  return {
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    url: window.location.href,
  };
};

export const getClientIP = async (): Promise<string | null> => {
  try {
    // Use a public IP service to get the client's IP
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Failed to get client IP:', error);
    return null;
  }
};
