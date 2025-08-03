import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Fab,
  Chip,
  Alert,
  Slide,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import {
  LocationOn,
  LocationDisabled,
  Refresh,
  Close,
  Info,
} from '@mui/icons-material';
import { getCurrentLocation, watchLocation } from '../utils/gps';
import type { Location } from '../utils/gps';
import { useLocationSharing } from '../hooks/useSocket';
import PrecisionFindingWithCompass from './PrecisionFindingWithCompass';

interface LocationTrackerProps {
  sessionId: string;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ sessionId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [myLocation, setMyLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const { otherUserLocation, connected, error: socketError } = useLocationSharing({
    sessionId,
    role: 'viewer',
    myLocation: isTracking ? myLocation : null,
  });

  const startTracking = async () => {
    try {
      setLocationError(null);
      
      const location = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
      setMyLocation(location);
      
      const id = watchLocation(
        (newLocation) => {
          setMyLocation(newLocation);
        },
        (error) => {
          setLocationError(`Location error: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 5000
        }
      );
      
      setWatchId(id);
      setIsTracking(true);
    } catch (error) {
      setLocationError(`Failed to get location: ${(error as Error).message}`);
    }
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    setMyLocation(null);
  };

  const refreshLocation = async () => {
    try {
      setLocationError(null);
      const location = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
      setMyLocation(location);
    } catch (error) {
      setLocationError(`Failed to refresh location: ${(error as Error).message}`);
    }
  };

  useEffect(() => {
    if (otherUserLocation) {
      setLastUpdate(new Date());
    }
  }, [otherUserLocation]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Show precision finding interface if both locations are available
  if (isTracking && otherUserLocation && myLocation) {
    return (
      <Box sx={{ position: 'relative', minHeight: '100vh' }}>
        <PrecisionFindingWithCompass
          myLocation={myLocation}
          targetLocation={otherUserLocation}
        />
        
        {/* Control overlay */}
        <Box
          sx={{
            position: 'fixed',
            top: isMobile ? 20 : 32,
            right: isMobile ? 20 : 32,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Fab
            size="small"
            onClick={() => setShowInfo(!showInfo)}
            sx={{
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
            }}
          >
            <Info />
          </Fab>
          
          <Fab
            size="small"
            onClick={refreshLocation}
            sx={{
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
            }}
          >
            <Refresh />
          </Fab>
          
          <Fab
            size="small"
            onClick={stopTracking}
            sx={{
              bgcolor: 'rgba(255,69,58,0.9)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,69,58,1)' }
            }}
          >
            <Close />
          </Fab>
        </Box>

        {/* Info panel */}
        <Slide direction="left" in={showInfo} mountOnEnter unmountOnExit>
          <Paper
            sx={{
              position: 'fixed',
              top: isMobile ? 20 : 32,
              right: isMobile ? 80 : 112,
              p: 2,
              minWidth: 200,
              maxWidth: 300,
              bgcolor: 'rgba(0,0,0,0.8)',
              color: 'white',
              zIndex: 999,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
              Session: {sessionId.slice(0, 8)}...
            </Typography>
            {lastUpdate && (
              <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                Updated: {lastUpdate.toLocaleTimeString()}
              </Typography>
            )}
            {myLocation?.accuracy && (
              <Typography variant="caption" display="block">
                Accuracy: ±{Math.round(myLocation.accuracy)}m
              </Typography>
            )}
          </Paper>
        </Slide>

        {/* Bottom status bar */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            bgcolor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            zIndex: 999
          }}
        >
          <Box display="flex" justifyContent="center" alignItems="center">
            <Chip
              icon={<LocationOn />}
              label={connected ? 'Tracking Active' : 'Connecting...'}
              color={connected ? 'success' : 'default'}
              variant="filled"
              sx={{
                bgcolor: connected ? 'rgba(48,209,88,0.2)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: connected ? '1px solid rgba(48,209,88,0.5)' : '1px solid rgba(255,255,255,0.2)'
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  // Setup/error screen
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
        color: 'white',
        px: 3,
        py: 4
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: 400,
          width: '100%'
        }}
      >
        {/* Header */}
        <LocationOn sx={{ fontSize: 80, color: '#30D158', mb: 3 }} />
        
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          sx={{
            fontWeight: '300',
            mb: 2,
            fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif'
          }}
        >
          Track Location
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.7)',
            mb: 4,
            lineHeight: 1.6
          }}
        >
          Follow the directional guide to find your target in real-time
        </Typography>

        {/* Connection Status */}
        <Box sx={{ mb: 3 }}>
          <Chip
            icon={<LocationOn />}
            label={connected ? 'Connected' : 'Connecting...'}
            color={connected ? 'success' : 'default'}
            variant={connected ? 'filled' : 'outlined'}
            sx={{
              bgcolor: connected ? 'rgba(48,209,88,0.2)' : 'transparent',
              color: 'white',
              border: connected ? '1px solid rgba(48,209,88,0.5)' : '1px solid rgba(255,255,255,0.3)'
            }}
          />
        </Box>

        {/* Error Messages */}
        {(locationError || socketError) && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              bgcolor: 'rgba(255,69,58,0.1)',
              color: 'white',
              border: '1px solid rgba(255,69,58,0.3)',
              '& .MuiAlert-icon': { color: '#FF453A' }
            }}
          >
            {locationError || socketError}
          </Alert>
        )}

        {/* Main Action Button */}
        {!isTracking ? (
          <Fab
            variant="extended"
            size="large"
            onClick={startTracking}
            disabled={!connected}
            sx={{
              bgcolor: '#30D158',
              color: 'white',
              px: 4,
              py: 2,
              fontSize: '16px',
              fontWeight: '500',
              mb: 3,
              '&:hover': { bgcolor: '#28A745' },
              '&:disabled': { 
                bgcolor: 'rgba(255,255,255,0.1)', 
                color: 'rgba(255,255,255,0.3)' 
              }
            }}
          >
            <LocationOn sx={{ mr: 1 }} />
            Start Tracking
          </Fab>
        ) : !otherUserLocation ? (
          <Box sx={{ mb: 3 }}>
            <Fab
              variant="extended"
              onClick={stopTracking}
              sx={{
                bgcolor: 'rgba(255,69,58,0.9)',
                color: 'white',
                px: 3,
                py: 1.5,
                mb: 2,
                '&:hover': { bgcolor: 'rgba(255,69,58,1)' }
              }}
            >
              <LocationDisabled sx={{ mr: 1 }} />
              Stop Tracking
            </Fab>
            
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Waiting for target location...
            </Typography>
          </Box>
        ) : null}

        {/* Instructions */}
        <Box
          sx={{
            p: 3,
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'left'
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
            <strong>How it works:</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            • Grant location access for precise tracking<br/>
            • The radar will show the target's direction<br/>
            • Follow the arrow to reach your destination<br/>
            • Distance updates in real-time as you move
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LocationTracker;
