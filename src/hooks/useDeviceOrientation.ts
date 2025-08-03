import { useState, useEffect } from 'react';

interface DeviceOrientation {
  alpha: number | null; // Z-axis rotation (compass heading)
  beta: number | null;  // X-axis rotation (front-to-back tilt)
  gamma: number | null; // Y-axis rotation (left-to-right tilt)
  absolute: boolean;    // Whether the orientation is absolute or relative
}

interface UseDeviceOrientationReturn {
  orientation: DeviceOrientation;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  isSupported: boolean;
  hasPermission: boolean;
}

export function useDeviceOrientation(): UseDeviceOrientationReturn {
  const [orientation, setOrientation] = useState<DeviceOrientation>({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: false
  });
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Check if DeviceOrientationEvent is supported
  const isSupported = typeof DeviceOrientationEvent !== 'undefined';

  const handleOrientation = (event: DeviceOrientationEvent) => {
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
      absolute: event.absolute || false
    });
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Device orientation is not supported');
      return false;
    }

    try {
      // For iOS 13+ devices, we need to request permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setHasPermission(true);
          setError(null);
          return true;
        } else {
          setError('Permission denied for device orientation');
          return false;
        }
      } else {
        // For other devices, permission is granted by default
        setHasPermission(true);
        setError(null);
        return true;
      }
    } catch (err) {
      setError(`Permission request failed: ${(err as Error).message}`);
      return false;
    }
  };

  useEffect(() => {
    if (!isSupported || !hasPermission) return;

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [isSupported, hasPermission]);

  return {
    orientation,
    error,
    requestPermission,
    isSupported,
    hasPermission
  };
}

// Utility function to calculate compass bearing adjusted for device orientation
export function getAdjustedBearing(
  targetBearing: number, 
  deviceHeading: number | null
): number {
  if (deviceHeading === null) return targetBearing;
  
  // Adjust the target bearing relative to device heading
  let adjustedBearing = targetBearing - deviceHeading;
  
  // Normalize to 0-360 degrees
  if (adjustedBearing < 0) adjustedBearing += 360;
  if (adjustedBearing >= 360) adjustedBearing -= 360;
  
  return adjustedBearing;
}

// Utility function to get smoothed heading (reduce jitter)
export function useSmoothHeading(alpha: number | null, smoothingFactor: number = 0.8): number | null {
  const [smoothedHeading, setSmoothedHeading] = useState<number | null>(null);

  useEffect(() => {
    if (alpha === null) return;

    setSmoothedHeading(prevHeading => {
      if (prevHeading === null) return alpha;

      // Handle the circular nature of compass readings (0-360)
      let diff = alpha - prevHeading;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      const newHeading = prevHeading + diff * (1 - smoothingFactor);
      return newHeading < 0 ? newHeading + 360 : newHeading % 360;
    });
  }, [alpha, smoothingFactor]);

  return smoothedHeading;
}
