import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme, useMediaQuery, Fab, Alert } from '@mui/material';
import { TripOrigin, Explore } from '@mui/icons-material';
import { calculateBearing, calculateDistance, formatDistance } from '../utils/gps';
import type { Location } from '../utils/gps';
import { useDeviceOrientation, getAdjustedBearing, useSmoothHeading } from '../hooks/useDeviceOrientation';

interface PrecisionFindingWithCompassProps {
  myLocation: Location;
  targetLocation: Location;
}

const PrecisionFindingWithCompass: React.FC<PrecisionFindingWithCompassProps> = ({ 
  myLocation, 
  targetLocation
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pulseKey, setPulseKey] = useState(0);
  const [needsPermission, setNeedsPermission] = useState(false);

  const { orientation, error, requestPermission, isSupported, hasPermission } = useDeviceOrientation();
  const smoothedHeading = useSmoothHeading(orientation.alpha, 0.85);

  // Calculate bearing from user to target
  const targetBearing = calculateBearing(
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

  // Get adjusted bearing that accounts for device orientation
  const adjustedBearing = getAdjustedBearing(targetBearing, smoothedHeading);

  // Responsive sizing
  const containerSize = isMobile ? 300 : 350;
  const arrowSize = isMobile ? 50 : 70;
  const ringSize1 = containerSize * 0.9;
  const ringSize2 = containerSize * 0.7;
  const ringSize3 = containerSize * 0.5;

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

  const getDirectionName = (bearing: number): string => {
    const directions = [
      'N', 'NNE', 'NE', 'ENE',
      'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW',
      'W', 'WNW', 'NW', 'NNW'
    ];
    
    const index = Math.round(bearing / 22.5) % 16;
    return directions[index];
  };

  const styles = getPrecisionStyles(distance);

  // Check if we need permission on mount
  useEffect(() => {
    if (isSupported && !hasPermission) {
      setNeedsPermission(true);
    }
  }, [isSupported, hasPermission]);

  // Trigger pulse animation when distance changes significantly
  useEffect(() => {
    setPulseKey(prev => prev + 1);
  }, [Math.floor(distance)]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      setNeedsPermission(false);
    }
  };

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

      {/* Permission request */}
      {needsPermission && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            textAlign: 'center',
            bgcolor: 'rgba(0,0,0,0.9)',
            p: 3,
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.2)',
            maxWidth: 300
          }}
        >
          <Explore sx={{ fontSize: 60, color: '#30D158', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Enable Compass
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.7)' }}>
            Allow access to device orientation for precise directional guidance
          </Typography>
          <Fab
            variant="extended"
            onClick={handleRequestPermission}
            sx={{
              bgcolor: '#30D158',
              color: 'white',
              '&:hover': { bgcolor: '#28A745' }
            }}
          >
            Enable Compass
          </Fab>
        </Box>
      )}

      {/* Error display */}
      {error && (
        <Alert 
          severity="warning" 
          sx={{ 
            position: 'fixed',
            top: 20,
            left: 20,
            right: 20,
            zIndex: 999,
            bgcolor: 'rgba(255,159,10,0.1)',
            color: 'white',
            border: '1px solid rgba(255,159,10,0.3)',
          }}
        >
          {error}
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
            animation: `radarSweep 4s linear infinite`,
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

        {/* Compass markings */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <Box
            key={angle}
            sx={{
              position: 'absolute',
              width: '2px',
              height: '20px',
              background: 'rgba(255,255,255,0.3)',
              transform: `rotate(${angle}deg) translate(0, -${ringSize1/2 - 10}px)`,
              transformOrigin: 'center bottom'
            }}
          />
        ))}

        {/* Cardinal directions - fixed to screen, not rotating */}
        {[
          { dir: 'N', angle: 0 },
          { dir: 'E', angle: 90 },
          { dir: 'S', angle: 180 },
          { dir: 'W', angle: 270 }
        ].map(({ dir, angle }) => (
          <Typography
            key={dir}
            sx={{
              position: 'absolute',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px',
              fontWeight: '600',
              transform: `rotate(${angle}deg) translate(0, -${containerSize/2 + 25}px) rotate(-${angle}deg)`,
              transformOrigin: 'center'
            }}
          >
            {dir}
          </Typography>
        ))}

        {/* Center dot (user location) */}
        <Box
          sx={{
            position: 'absolute',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: `3px solid ${styles.color}`,
            boxShadow: `0 0 15px ${styles.shadowColor}`,
            zIndex: 3
          }}
        />

        {/* Target indicator - adjusted for device orientation */}
        <Box
          sx={{
            position: 'absolute',
            transform: `rotate(${adjustedBearing}deg) translate(0, -${ringSize2/2 - 15}px)`,
            transformOrigin: 'center',
            transition: hasPermission ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            zIndex: 4
          }}
        >
          <TripOrigin
            sx={{
              fontSize: arrowSize,
              color: styles.color,
              filter: `drop-shadow(0 0 12px ${styles.shadowColor})`,
              animation: `targetPulse 1.5s ease-in-out infinite`
            }}
          />
        </Box>

        {/* Directional arrow pointing to target - also adjusted */}
        <Box
          sx={{
            position: 'absolute',
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderBottom: `35px solid ${styles.color}`,
            transform: `rotate(${adjustedBearing}deg) translate(0, -${ringSize3/2 + 25}px)`,
            transformOrigin: 'center bottom',
            transition: hasPermission ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            filter: `drop-shadow(0 0 8px ${styles.shadowColor})`,
            zIndex: 5
          }}
        />
      </Box>

      {/* Compass bearing and heading info */}
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
          {targetBearing.toFixed(0)}°
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'block'
          }}
        >
          {getDirectionName(targetBearing)}
        </Typography>
        
        {/* Device heading indicator */}
        {hasPermission && smoothedHeading !== null && (
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '10px',
              display: 'block',
              mt: 1
            }}
          >
            Heading: {smoothedHeading.toFixed(0)}°
          </Typography>
        )}
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

export default PrecisionFindingWithCompass;
