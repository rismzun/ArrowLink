import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Fab,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
  Paper,
  IconButton,
  Snackbar,
  Slide,
} from '@mui/material';
import {
  Share,
  LocationOn,
  ContentCopy,
  Close,
  LocationDisabled,
  Info,
} from '@mui/icons-material';
import { getCurrentLocation, watchLocation } from '../utils/gps';
import type { Location } from '../utils/gps';
import { useLocationSharing } from '../hooks/useSocket';
import PrecisionFinding from './PrecisionFinding';

interface LocationSharerProps {
  sessionId: string;
}

const LocationSharer: React.FC<LocationSharerProps> = ({ sessionId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [myLocation, setMyLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const { otherUserLocation, connected, error: socketError } = useLocationSharing({
    sessionId,
    role: 'sharer',
    myLocation: isSharing ? myLocation : null,
  });

  const shareUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;

  const startSharing = async () => {
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

  // Show precision finding interface if someone is tracking
  if (isSharing && otherUserLocation && myLocation) {
    return (
      <Box sx={{ position: 'relative', minHeight: '100vh' }}>
        <PrecisionFinding
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
            onClick={shareNatively}
            sx={{
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
            }}
          >
            <Share />
          </Fab>
          
          <Fab
            size="small"
            onClick={stopSharing}
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
            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
              Someone is tracking you!
            </Typography>
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
              label="Location Being Shared"
              color="success"
              variant="filled"
              sx={{
                bgcolor: 'rgba(48,209,88,0.2)',
                color: 'white',
                border: '1px solid rgba(48,209,88,0.5)'
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  // Setup/sharing screen
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
        <Share sx={{ fontSize: 80, color: '#30D158', mb: 3 }} />
        
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          sx={{
            fontWeight: '300',
            mb: 2,
            fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif'
          }}
        >
          Share Location
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.7)',
            mb: 4,
            lineHeight: 1.6
          }}
        >
          Share your real-time location so others can find you with precision
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
        {!isSharing ? (
          <Fab
            variant="extended"
            size="large"
            onClick={startSharing}
            disabled={!connected}
            sx={{
              bgcolor: '#30D158',
              color: 'white',
              px: 4,
              py: 2,
              fontSize: '16px',
              fontWeight: '500',
              mb: 4,
              '&:hover': { bgcolor: '#28A745' },
              '&:disabled': { 
                bgcolor: 'rgba(255,255,255,0.1)', 
                color: 'rgba(255,255,255,0.3)' 
              }
            }}
          >
            <LocationOn sx={{ mr: 1 }} />
            Start Sharing
          </Fab>
        ) : (
          <Box sx={{ mb: 4 }}>
            <Fab
              variant="extended"
              onClick={stopSharing}
              sx={{
                bgcolor: 'rgba(255,69,58,0.9)',
                color: 'white',
                px: 3,
                py: 1.5,
                mb: 3,
                '&:hover': { bgcolor: 'rgba(255,69,58,1)' }
              }}
            >
              <LocationDisabled sx={{ mr: 1 }} />
              Stop Sharing
            </Fab>
            
            {/* Share URL */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.2)',
                mb: 3
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'block' }}>
                Share this link:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    flexGrow: 1, 
                    wordBreak: 'break-all',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                >
                  {shareUrl}
                </Typography>
                <IconButton 
                  onClick={copyShareUrl} 
                  size="small"
                  sx={{ color: 'white' }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            {/* Share buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Fab
                variant="extended"
                onClick={shareNatively}
                sx={{
                  bgcolor: 'rgba(0,122,255,0.9)',
                  color: 'white',
                  px: 3,
                  '&:hover': { bgcolor: 'rgba(0,122,255,1)' }
                }}
              >
                <Share sx={{ mr: 1 }} />
                Share
              </Fab>
            </Box>
            
            {!otherUserLocation && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 2 }}>
                Waiting for someone to join...
              </Typography>
            )}
          </Box>
        )}

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
            • Start sharing to begin location broadcast<br/>
            • Copy and send the link to someone<br/>
            • They can track your location in real-time<br/>
            • Both of you can see each other's position
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={showCopiedMessage}
        autoHideDuration={3000}
        onClose={() => setShowCopiedMessage(false)}
        message="Link copied to clipboard!"
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: 'rgba(48,209,88,0.9)',
            color: 'white'
          }
        }}
      />
    </Box>
  );
};

export default LocationSharer;
