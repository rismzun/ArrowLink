import { useState, useEffect } from 'react';

interface DeviceOrientationData {
  alpha: number | null; // Z-axis rotation (compass)
  beta: number | null;  // X-axis rotation
  gamma: number | null; // Y-axis rotation
  absolute: boolean;
}

interface CompassData {
  heading: number | null; // Compass heading in degrees
  accuracy: number | null; // Accuracy in degrees
}

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<DeviceOrientationData>({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: false
  });
  
  const [compass, setCompass] = useState<CompassData>({
    heading: null,
    accuracy: null
  });
  
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [supported, setSupported] = useState(false);

  // Request permission for iOS 13+
  const requestPermission = async (): Promise<boolean> => {
    if ('DeviceOrientationEvent' in window) {
      // Check if permission API is available (iOS 13+)
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          setPermission(permission);
          return permission === 'granted';
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
          setPermission('denied');
          return false;
        }
      } else {
        // Permission not required (Android/older iOS)
        setPermission('granted');
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    // Check if DeviceOrientationEvent is supported
    if ('DeviceOrientationEvent' in window) {
      setSupported(true);
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha, // 0-360 degrees
        beta: event.beta,   // -180 to 180 degrees
        gamma: event.gamma, // -90 to 90 degrees
        absolute: event.absolute || false
      });
    };

    const handleCompass = (event: any) => {
      // For compass events (some browsers)
      if (event.webkitCompassHeading !== undefined) {
        // iOS Safari
        setCompass({
          heading: event.webkitCompassHeading,
          accuracy: event.webkitCompassAccuracy
        });
      } else if (event.alpha !== undefined) {
        // Standard compass
        setCompass({
          heading: 360 - event.alpha, // Convert to compass heading
          accuracy: null
        });
      }
    };

    if (permission === 'granted') {
      window.addEventListener('deviceorientation', handleOrientation);
      window.addEventListener('deviceorientationabsolute', handleOrientation);
      window.addEventListener('compassneedscalibration', handleCompass);
      
      // For iOS devices
      if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleCompass);
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('compassneedscalibration', handleCompass);
      if ('ondeviceorientationabsolute' in window) {
        window.removeEventListener('deviceorientationabsolute', handleCompass);
      }
    };
  }, [permission]);

  // Calculate true compass heading
  const getCompassHeading = (): number | null => {
    // Prefer compass data if available
    if (compass.heading !== null) {
      return compass.heading;
    }
    
    // Fallback to device orientation alpha
    if (orientation.alpha !== null) {
      // Convert alpha to compass heading
      // Alpha: 0 = North, 90 = East, 180 = South, 270 = West
      return orientation.absolute ? orientation.alpha : (360 - orientation.alpha) % 360;
    }
    
    return null;
  };

  // Calculate device rotation relative to portrait
  const getDeviceRotation = (): number => {
    if (orientation.gamma !== null && orientation.beta !== null) {
      // Calculate device rotation based on gamma and beta
      // This helps determine how the device is oriented
      const gamma = orientation.gamma;
      const beta = orientation.beta;
      
      // Determine rotation based on device orientation
      if (Math.abs(gamma) > Math.abs(beta)) {
        // Device is more rotated left/right
        return gamma > 0 ? 90 : -90;
      } else {
        // Device is more rotated forward/backward
        return beta > 0 ? 180 : 0;
      }
    }
    return 0;
  };

  return {
    orientation,
    compass,
    compassHeading: getCompassHeading(),
    deviceRotation: getDeviceRotation(),
    permission,
    supported,
    requestPermission,
    isCalibrated: compass.accuracy !== null ? Math.abs(compass.accuracy) < 15 : true
  };
}
