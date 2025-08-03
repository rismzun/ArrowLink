import { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
  Fab,
  Alert,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { LocationOn, Share } from '@mui/icons-material';
import LocationSharerNew from './components/LocationSharerNew';
import LocationTrackerNew from './components/LocationTrackerNew';

const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create dark theme optimized for mobile
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#30D158', // iOS green
    },
    secondary: {
      main: '#FF9F0A', // iOS orange
    },
    background: {
      default: '#000000',
      paper: 'rgba(28, 28, 30, 0.9)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    error: {
      main: '#FF453A',
    },
    success: {
      main: '#30D158',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, Roboto, sans-serif',
    h3: {
      fontWeight: 300,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 300,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
        },
        extended: {
          borderRadius: 25,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backdropFilter: 'blur(20px)',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<'home' | 'sharer' | 'tracker'>('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Check URL for session parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session');
    
    if (sessionParam) {
      verifySession(sessionParam);
    }
  }, []);

  const verifySession = async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_API_URL}/api/session/${sessionId}`);

      if (response.ok) {
        setSessionId(sessionId);
        setMode('tracker');
      } else {
        setError('Session not found or expired');
      }
    } catch (error) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_API_URL}/api/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setMode('sharer');
      } else {
        setError('Failed to create session');
      }
    } catch (error) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setMode('home');
    setSessionId(null);
    setError(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          sx={{ 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #000000 0%, #1a1a1a 100%)',
            color: 'white'
          }}
        >
          <CircularProgress size={60} sx={{ mb: 2, color: '#30D158' }} />
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Loading...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {mode === 'home' && (
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
            <LocationOn sx={{ fontSize: 100, color: '#30D158', mb: 4 }} />
            
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              sx={{
                fontWeight: '300',
                mb: 2,
                fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif'
              }}
            >
              GPS Tracker
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                mb: 6,
                lineHeight: 1.6
              }}
            >
              Share your real-time location or track someone else using GPS with 
              precision finding-like interface. No login required.
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4,
                  bgcolor: 'rgba(255,69,58,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,69,58,0.3)',
                  '& .MuiAlert-icon': { color: '#FF453A' }
                }}
              >
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 6 }}>
              <Fab
                variant="extended"
                size="large"
                onClick={createNewSession}
                disabled={loading}
                sx={{
                  bgcolor: '#30D158',
                  color: 'white',
                  px: 4,
                  py: 2,
                  fontSize: '16px',
                  fontWeight: '500',
                  '&:hover': { bgcolor: '#28A745' },
                  '&:disabled': { 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    color: 'rgba(255,255,255,0.3)' 
                  }
                }}
              >
                <Share sx={{ mr: 1 }} />
                Share My Location
              </Fab>
              
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                or open a shared location link to start tracking
              </Typography>
            </Box>

            {/* Feature highlights */}
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
                <strong>Features:</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                • Real-time GPS tracking with precision finding UI<br/>
                • One-click location sharing via unique links<br/>
                • Directional arrow and distance guidance<br/>
                • Works on any device with location services
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {mode === 'sharer' && sessionId && (
        <>
          <Fab
            onClick={goHome}
            size="small"
            sx={{
              position: 'fixed',
              top: isMobile ? 20 : 32,
              left: isMobile ? 20 : 32,
              zIndex: 1000,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
            }}
          >
            ←
          </Fab>
          <LocationSharerNew sessionId={sessionId} />
        </>
      )}

      {mode === 'tracker' && sessionId && (
        <>
          <Fab
            onClick={goHome}
            size="small"
            sx={{
              position: 'fixed',
              top: isMobile ? 20 : 32,
              left: isMobile ? 20 : 32,
              zIndex: 1000,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
            }}
          >
            ←
          </Fab>
          <LocationTrackerNew sessionId={sessionId} />
        </>
      )}
    </ThemeProvider>
  );
}

export default App;
