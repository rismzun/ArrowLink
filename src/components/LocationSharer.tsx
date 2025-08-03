import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  Share,
  LocationOn,
  ContentCopy,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { getCurrentLocation, watchLocation } from '../utils/gps';
import type { Location } from '../utils/gps';
import { useLocationSharing } from '../hooks/useSocket';
import DirectionalArrow from './DirectionalArrow';

interface LocationSharerProps {
  sessionId: string;
}

const LocationSharer: React.FC<LocationSharerProps> = ({ sessionId }) => {
  const [myLocation, setMyLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [showMyLocation, setShowMyLocation] = useState(false);

  const { otherUserLocation, connected, error: socketError } = useLocationSharing({
    sessionId,
    role: 'sharer',
    myLocation: isSharing ? myLocation : null,
  });

  const shareUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;

  const startSharing = async () => {
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
      setIsSharing(true);
    } catch (error) {
      setLocationError(`Failed to get location: ${(error as Error).message}`);
    }
  };

  const stopSharing = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsSharing(false);
    setMyLocation(null);
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedMessage(true);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const shareNatively = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Track My Location',
          text: 'Click this link to see my real-time location',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Failed to share:', error);
        copyShareUrl();
      }
    } else {
      copyShareUrl();
    }
  };

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
          Share Your Location
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Start sharing your location to let others track you in real-time
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

        {/* Share Controls */}
        {!isSharing ? (
          <Button
            variant="contained"
            size="large"
            startIcon={<Share />}
            onClick={startSharing}
            disabled={!connected}
            sx={{ mb: 3 }}
          >
            Start Sharing Location
          </Button>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={stopSharing}
              sx={{ mb: 2 }}
            >
              Stop Sharing
            </Button>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="body2" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                {shareUrl}
              </Typography>
              <IconButton onClick={copyShareUrl} size="small">
                <ContentCopy />
              </IconButton>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<Share />}
              onClick={shareNatively}
              fullWidth
            >
              Share Link
            </Button>
          </Box>
        )}

        {/* Location Status */}
        {myLocation && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="success.main">
                Location Active
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

        {/* Other User Tracking */}
        {isSharing && otherUserLocation && myLocation && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Someone is tracking you!
            </Typography>
            <DirectionalArrow
              myLocation={myLocation}
              targetLocation={otherUserLocation}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This shows where the person tracking you is located
            </Typography>
          </Box>
        )}

        {/* Waiting for Tracker */}
        {isSharing && !otherUserLocation && (
          <Box sx={{ mt: 4 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Waiting for someone to join your session...
            </Typography>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={showCopiedMessage}
        autoHideDuration={3000}
        onClose={() => setShowCopiedMessage(false)}
        message="Link copied to clipboard!"
      />
    </Container>
  );
};

export default LocationSharer;
