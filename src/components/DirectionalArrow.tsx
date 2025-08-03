import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme, useMediaQuery, Alert, Button } from '@mui/material';
import { TripOrigin } from '@mui/icons-material';
import { calculateBearing, calculateDistance, formatDistance } from '../utils/gps';
import type { Location } from '../utils/gps';

interface DirectionalArrowProps {
  myLocation: Location;
  targetLocation: Location;
}

const DirectionalArrow: React.FC<DirectionalArrowProps> = ({ 
  myLocation, 
  targetLocation
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pulseKey, setPulseKey] = useState(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [compassSupported, setCompassSupported] = useState<boolean>(true);
  const [compassPermission, setCompassPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const bearing = calculateBearing(
    myLocation.latitude,
    myLocation.longitude,
    targetLocation.latitude,
    targetLocation.longitude
  );

  const distance = calculateDistance(
    myLocation.latitude,
    myLocation.longitude,
    targetLocation.latitude,
    targetLocation.longitude
  );

  // Calculate relative bearing (target direction relative to device orientation)
  const relativeBearing = (bearing - deviceHeading + 360) % 360;

  // Request device orientation permission (iOS 13+)
  const requestOrientationPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        setCompassPermission(permission);
        if (permission === 'granted') {
          startCompass();
        }
      } catch (error) {
        console.error('Error requesting orientation permission:', error);
        setCompassPermission('denied');
      }
    } else {
      // Non-iOS devices or older iOS versions
      setCompassPermission('granted');
      startCompass();
    }
  };

  // Start compass/orientation tracking
  const startCompass = () => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading = 0;
      
      // Type assertion for iOS-specific property
      const eventWithWebkit = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
      
      if (eventWithWebkit.webkitCompassHeading !== undefined) {
        // iOS Safari
        heading = eventWithWebkit.webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android Chrome and others
        heading = 360 - event.alpha;
      }
      
      setDeviceHeading(heading);
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
      setCompassSupported(true);
    } else {
      setCompassSupported(false);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  };

  // Initialize compass on component mount
  useEffect(() => {
    // Check if we're on a mobile device
    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobileDevice && window.DeviceOrientationEvent) {
      // For iOS 13+, request permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // Don't auto-request, wait for user interaction
        setCompassPermission('prompt');
      } else {
        // Android or older iOS
        requestOrientationPermission();
      }
    } else {
      setCompassSupported(false);
    }
  }, []);

  // Trigger pulse animation when distance changes significantly
  useEffect(() => {
    setPulseKey(prev => prev + 1);
  }, [Math.floor(distance)]);
  const containerSize = isMobile ? 280 : 320;
  const arrowSize = isMobile ? 60 : 80;
  const ringSize1 = containerSize * 0.85;
  const ringSize2 = containerSize * 0.65;
  const ringSize3 = containerSize * 0.45;

  // Get precision finding colors and styles
  const getPrecisionStyles = (dist: number) => {
    if (dist < 2) return {
      color: '#00D4AA', // Mint green - very precise
      bgGradient: 'radial-gradient(circle, rgba(0,212,170,0.15) 0%, rgba(0,212,170,0.05) 50%, transparent 100%)',
      shadowColor: 'rgba(0,212,170,0.4)',
      intensity: 'very-high'
    };
    if (dist < 5) return {
      color: '#30D158', // Apple green - high precision  
      bgGradient: 'radial-gradient(circle, rgba(48,209,88,0.15) 0%, rgba(48,209,88,0.05) 50%, transparent 100%)',
      shadowColor: 'rgba(48,209,88,0.4)',
      intensity: 'high'
    };
    if (dist < 15) return {
      color: '#32D74B', // Green - good precision
      bgGradient: 'radial-gradient(circle, rgba(50,215,75,0.15) 0%, rgba(50,215,75,0.05) 50%, transparent 100%)',
      shadowColor: 'rgba(50,215,75,0.4)',
      intensity: 'medium'
    };
    if (dist < 50) return {
      color: '#FF9F0A', // Orange - medium precision
      bgGradient: 'radial-gradient(circle, rgba(255,159,10,0.15) 0%, rgba(255,159,10,0.05) 50%, transparent 100%)',
      shadowColor: 'rgba(255,159,10,0.4)',
      intensity: 'low'
    };
    return {
      color: '#FF453A', // Red - low precision
      bgGradient: 'radial-gradient(circle, rgba(255,69,58,0.15) 0%, rgba(255,69,58,0.05) 50%, transparent 100%)',
      shadowColor: 'rgba(255,69,58,0.4)',
      intensity: 'very-low'
    };
  };

  const styles = getPrecisionStyles(distance);

  // Trigger pulse animation when distance changes significantly
  useEffect(() => {
    setPulseKey(prev => prev + 1);
  }, [Math.floor(distance)]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 2,
        py: 4,
        background: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background effects */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: styles.bgGradient,
          opacity: 0.8,
        }}
      />

      {/* Compass permission prompt for iOS */}
      {compassPermission === 'prompt' && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(29, 78, 216, 0.1)',
            color: 'primary.main',
            border: '1px solid rgba(29, 78, 216, 0.3)',
            zIndex: 3,
            maxWidth: 350
          }}
          action={
            <Button 
              color="primary" 
              size="small" 
              onClick={requestOrientationPermission}
              sx={{ fontWeight: 600 }}
            >
              เปิดใช้งาน
            </Button>
          }
        >
          ต้องการสิทธิ์เข้าถึงเซ็นเซอร์ทิศทางเพื่อแสดงตำแหน่งที่แม่นยำ
        </Alert>
      )}

      {/* Compass not supported warning */}
      {!compassSupported && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            color: 'warning.main',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            zIndex: 3,
            maxWidth: 350
          }}
        >
          อุปกรณ์นี้ไม่รองรับเซ็นเซอร์ทิศทาง - จะแสดงทิศทางโดยประมาณ
        </Alert>
      )}

      {/* Distance display at top */}
      <Box sx={{ mb: 4, textAlign: 'center', zIndex: 2 }}>
        <Typography
          variant={isMobile ? 'h3' : 'h2'}
          sx={{
            fontWeight: '300',
            color: styles.color,
            mb: 1,
            textShadow: `0 0 20px ${styles.shadowColor}`,
            fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif'
          }}
        >
          {formatDistance(distance)}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '400'
          }}
        >
          {distance < 2 ? 'Very Close' : distance < 5 ? 'Close' : distance < 15 ? 'Nearby' : distance < 50 ? 'Far' : 'Very Far'}
        </Typography>
      </Box>

      {/* Main radar/compass display */}
      <Box
        sx={{
          position: 'relative',
          width: containerSize,
          height: containerSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2
        }}
      >
        {/* Outer ring - radar sweep effect */}
        <Box
          sx={{
            position: 'absolute',
            width: ringSize1,
            height: ringSize1,
            borderRadius: '50%',
            border: `1px solid ${styles.color}30`,
            animation: `radarSweep 3s linear infinite`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '50%',
              width: '1px',
              height: '50%',
              background: `linear-gradient(to bottom, ${styles.color}80, transparent)`,
              transformOrigin: 'bottom',
              animation: `sweep 3s linear infinite`,
            }
          }}
        />

        {/* Middle ring */}
        <Box
          sx={{
            position: 'absolute',
            width: ringSize2,
            height: ringSize2,
            borderRadius: '50%',
            border: `1px solid ${styles.color}40`,
            animation: `pulse 2s ease-in-out infinite`,
          }}
        />

        {/* Inner ring */}
        <Box
          sx={{
            position: 'absolute',
            width: ringSize3,
            height: ringSize3,
            borderRadius: '50%',
            border: `2px solid ${styles.color}60`,
            background: `radial-gradient(circle, ${styles.color}20, transparent 70%)`,
          }}
        />

        {/* Center dot (user location) */}
        <Box
          sx={{
            position: 'absolute',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: `3px solid ${styles.color}`,
            boxShadow: `0 0 15px ${styles.shadowColor}`,
            zIndex: 3
          }}
        />

        {/* Target indicator - positioned based on relative bearing */}
        <Box
          sx={{
            position: 'absolute',
            width: arrowSize,
            height: arrowSize,
            transform: `rotate(${relativeBearing}deg) translate(0, -${ringSize2/2 - 20}px)`,
            transformOrigin: 'center',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 4
          }}
        >
          <TripOrigin
            sx={{
              fontSize: arrowSize,
              color: styles.color,
              filter: `drop-shadow(0 0 10px ${styles.shadowColor})`,
              animation: `targetPulse 1.5s ease-in-out infinite`
            }}
          />
        </Box>

        {/* Directional arrow pointing to target */}
        <Box
          sx={{
            position: 'absolute',
            width: 0,
            height: 0,
            borderLeft: '15px solid transparent',
            borderRight: '15px solid transparent',
            borderBottom: `40px solid ${styles.color}`,
            transform: `rotate(${relativeBearing}deg) translate(0, -${ringSize3/2 + 30}px)`,
            transformOrigin: 'center bottom',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 8px ${styles.shadowColor})`,
            zIndex: 5
          }}
        />

        {/* Cardinal directions */}
        {['N', 'E', 'S', 'W'].map((direction, index) => (
          <Typography
            key={direction}
            sx={{
              position: 'absolute',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '12px',
              fontWeight: '500',
              transform: `rotate(${index * 90}deg) translate(0, -${containerSize/2 + 20}px) rotate(-${index * 90}deg)`,
              transformOrigin: 'center'
            }}
          >
            {direction}
          </Typography>
        ))}
      </Box>

      {/* Compass bearing */}
      <Box sx={{ mt: 4, textAlign: 'center', zIndex: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: styles.color,
            fontWeight: '500',
            mb: 0.5,
            fontFamily: 'SF Mono, Monaco, monospace'
          }}
        >
          {bearing.toFixed(0)}°
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          {getDirectionName(bearing)}
        </Typography>
      </Box>

      {/* Haptic feedback simulation */}
      <Box
        key={pulseKey}
        sx={{
          position: 'absolute',
          width: containerSize * 1.5,
          height: containerSize * 1.5,
          borderRadius: '50%',
          border: `1px solid ${styles.color}20`,
          animation: 'hapticPulse 0.6s ease-out',
          pointerEvents: 'none'
        }}
      />
    </Box>
  );
};

function getDirectionName(bearing: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
}

// Add keyframes for pulse animation to the global styles
const pulseKeyframes = `
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.05);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseKeyframes;
  document.head.appendChild(style);
}

export default DirectionalArrow;
