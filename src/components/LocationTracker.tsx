import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Button,
} from '@mui/material';
import {
  LocationOn,
  Visibility,
  VisibilityOff,
  Refresh,
} from '@mui/icons-material';
import { getCurrentLocation, watchLocation } from '../utils/gps';
import type { Location } from '../utils/gps';
import { useLocationSharing } from '../hooks/useSocket';
import DirectionalArrow from './DirectionalArrow';

interface LocationTrackerProps {
  sessionId: string;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ sessionId }) => {
  const [myLocation, setMyLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [showMyLocation, setShowMyLocation] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { otherUserLocation, connected, error: socketError } = useLocationSharing({
    sessionId,
    role: 'viewer',
    myLocation: isTracking ? myLocation : null,
  });

  const startTracking = async () => {
    try {
      setLocationError(null);
      
      // Get initial location
      const location = await getCurrentLocation();
      setMyLocation(location);
      
      // Start watching location
      const id = watchLocation(
        (newLocation) => {
          setMyLocation(newLocation);
        },
        (error) => {
          setLocationError(`Location error: ${error.message}`);
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
      const location = await getCurrentLocation();
      setMyLocation(location);
    } catch (error) {
      setLocationError(`Failed to refresh location: ${(error as Error).message}`);
    }
  };

  // Update last update time when other user's location changes
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

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Track Location
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Track someone's real-time location and get directions to them
        </Typography>

        {/* Connection Status */}
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<LocationOn />}
            label={connected ? 'Connected' : 'Connecting...'}
            color={connected ? 'success' : 'default'}
            variant={connected ? 'filled' : 'outlined'}
          />
        </Box>

        {/* Error Messages */}
        {(locationError || socketError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {locationError || socketError}
          </Alert>
        )}

        {/* Tracking Controls */}
        {!isTracking ? (
          <Button
            variant="contained"
            size="large"
            startIcon={<LocationOn />}
            onClick={startTracking}
            disabled={!connected}
            sx={{ mb: 3 }}
          >
            Enable Location Tracking
          </Button>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={stopTracking}
              sx={{ mr: 1 }}
            >
              Stop Tracking
            </Button>
            <IconButton onClick={refreshLocation} color="primary">
              <Refresh />
            </IconButton>
          </Box>
        )}

        {/* My Location Status */}
        {myLocation && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="success.main">
                Your Location Active
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setShowMyLocation(!showMyLocation)}
              >
                {showMyLocation ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Box>
            
            {showMyLocation && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {myLocation.latitude.toFixed(6)}, {myLocation.longitude.toFixed(6)}
                {myLocation.accuracy && ` (±${Math.round(myLocation.accuracy)}m)`}
              </Typography>
            )}
          </Box>
        )}

        {/* Target Location Tracking */}
        {isTracking && otherUserLocation && myLocation ? (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Target Found!
            </Typography>
            <DirectionalArrow
              myLocation={myLocation}
              targetLocation={otherUserLocation}
            />
            {lastUpdate && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        ) : isTracking && !otherUserLocation ? (
          <Box sx={{ mt: 4 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Waiting for target location...
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Make sure the person you're tracking has started sharing their location
            </Typography>
          </Box>
        ) : null}

        {/* Instructions */}
        {!isTracking && (
          <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>How to use:</strong>
            </Typography>
            <Typography variant="body2" component="div" sx={{ mt: 1 }}>
              1. Enable location tracking above<br/>
              2. The arrow will point toward the target location<br/>
              3. Follow the arrow to reach your destination<br/>
              4. Distance and direction update in real-time
            </Typography>
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default LocationTracker;
