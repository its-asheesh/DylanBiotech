import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  surfaceHeight?: number; // e.g., 300
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  surfaceHeight = 300,
}) => {

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        position: 'relative',
        overflow: 'hidden', // Prevent body scroll
      }}
    >
      {/* Fixed "surface" layer (the "water surface") */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: surfaceHeight,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.3))',
          backdropFilter: 'blur(8px)', // Frosted glass effect (optional)
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 10,
          pointerEvents: 'none', // Allow clicks to pass through if needed
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.primary',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          // Optional: add a subtle wave or divider at bottom
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(to right, transparent, #6366f1, transparent)',
          },
        }}
      >
        {/* You can put a logo, title, or leave empty */}
        DylanBiotech
      </Box>

      {/* Scrollable content that "submerges" under the surface */}
      <Box
        component="main"
        sx={{
          pt: `${surfaceHeight}px`, // Push content below surface
          minHeight: `calc(100vh + ${surfaceHeight}px)`, // Ensure scroll
          position: 'relative',
          zIndex: 1,
          // Optional: add a subtle blue tint to enhance "underwater" feel
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: surfaceHeight,
            //background: 'rgba(99, 102, 241, 0.05)', // Light indigo tint
            pointerEvents: 'none',
            zIndex: 9,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};