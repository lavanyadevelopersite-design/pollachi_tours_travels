import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { publicAssetUrl } from '../utils/constants';

const LAST_BG_KEY = 'tt_auth_last_bg';

/** Tours & travels destination backgrounds — rotated on each login visit */
const TRAVEL_BACKGROUNDS = [
  publicAssetUrl('dashboard/auth/maldives-overwater.jpg'),
  publicAssetUrl('dashboard/auth/swiss-alps.jpg'),
  publicAssetUrl('dashboard/auth/santorini.jpg'),
  publicAssetUrl('dashboard/auth/kerala-backwaters.jpg'),
  publicAssetUrl('dashboard/auth/desert-safari.jpg'),
  publicAssetUrl('dashboard/auth/tokyo-skyline.jpg'),
  publicAssetUrl('dashboard/auth/goa-beach.jpg'),
  publicAssetUrl('dashboard/auth/machu-picchu.jpg'),
  publicAssetUrl('dashboard/auth/paris-eiffel.jpg'),
  publicAssetUrl('dashboard/auth/bali-rice-terrace.jpg'),
  publicAssetUrl('dashboard/beach-palm-sunset.jpg'),
  publicAssetUrl('dashboard/beach-decoration.jpg'),
];

function pickTravelBackground() {
  const last = sessionStorage.getItem(LAST_BG_KEY);
  const lastIndex = Number.parseInt(last, 10);
  const candidates = TRAVEL_BACKGROUNDS.map((_, i) => i).filter(
    (i) => !Number.isFinite(lastIndex) || TRAVEL_BACKGROUNDS.length < 2 || i !== lastIndex
  );
  const nextIndex = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
  sessionStorage.setItem(LAST_BG_KEY, String(nextIndex));
  return TRAVEL_BACKGROUNDS[nextIndex];
}

export default function AuthLayout() {
  const [bgImage, setBgImage] = useState(() => pickTravelBackground());
  const [fadeIn, setFadeIn] = useState(true);

  const preload = useMemo(() => bgImage, [bgImage]);

  useEffect(() => {
    const img = new Image();
    img.src = preload;
  }, [preload]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      window.setTimeout(() => {
        setBgImage(pickTravelBackground());
        setFadeIn(true);
      }, 450);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#1c232f',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 0.45s ease',
          transform: 'scale(1.04)',
        }}
      />

      {/* Soft dark overlay so the login card stays readable */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(145deg, rgba(28, 35, 47, 0.72) 0%, rgba(63, 77, 103, 0.55) 45%, rgba(28, 35, 47, 0.78) 100%)',
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, px: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
