import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import itineraryService from '../../services/itinerary.service';
import { resolveMediaUrl } from '../../utils/constants';

/**
 * Cover / event image gallery picker with keyword search + custom upload.
 */
export default function ImageGalleryPicker({
  open,
  onClose,
  onSelect,
  query,
  destination,
  eventName,
  eventType,
  title = 'Choose Cover Photo',
  selectedUrl,
}) {
  const fileRef = useRef(null);
  const requestId = useRef(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [picked, setPicked] = useState(selectedUrl || null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const loadImages = async (searchOverride) => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    const searchQ = (searchOverride !== undefined ? searchOverride : debouncedSearch).trim();
    try {
      const { data } = await itineraryService.searchImages({
        q: searchQ || query || undefined,
        eventType: searchQ ? undefined : eventType || undefined,
        eventName: searchQ ? undefined : eventName || undefined,
        destination: destination || undefined,
        limit: 12,
      });
      if (id !== requestId.current) return;
      setImages(data?.data || []);
    } catch {
      if (id !== requestId.current) return;
      setImages([]);
      setError('Could not load images. Try another keyword or upload a custom image.');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  // Debounce search typing
  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText, open]);

  // Reset search when dialog opens
  useEffect(() => {
    if (!open) return;
    setPicked(selectedUrl || null);
    setSearchText('');
    setDebouncedSearch('');
  }, [open, selectedUrl]);

  // Fetch when dialog opens or search / context changes
  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => {
      loadImages(debouncedSearch);
    }, 150);
    return () => {
      clearTimeout(timer);
      requestId.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, debouncedSearch, query, destination, eventName, eventType]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    const next = searchText.trim();
    setDebouncedSearch(next);
    loadImages(next);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setDebouncedSearch('');
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPicked(url);
    onSelect?.({ url, file, provider: 'upload' });
    onClose?.();
  };

  const placeholderHint =
    destination || eventName
      ? `e.g. ${destination || eventName}, tea factory, lake…`
      : 'e.g. ooty, tea factory, beach…';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} mb={2}>
          <Box component="form" onSubmit={handleSearchSubmit}>
            <TextField
              fullWidth
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={placeholderHint}
              label="Search images"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchText ? (
                  <InputAdornment position="end">
                    <IconButton size="small" aria-label="Clear search" onClick={handleClearSearch}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={1.5}
          >
            <Typography variant="body2" color="text.secondary">
              {debouncedSearch
                ? `Showing results for “${debouncedSearch}”`
                : 'Select a suggested image or upload your own'}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={<RefreshIcon />}
                variant="text"
                onClick={() => loadImages()}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                startIcon={<CloudUploadOutlinedIcon />}
                variant="outlined"
                onClick={() => fileRef.current?.click()}
              >
                Upload Custom Image
              </Button>
            </Stack>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
          </Stack>
        </Stack>

        {loading ? (
          <Grid container spacing={1.5}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Grid key={i} size={{ xs: 6, sm: 3 }}>
                <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : images.length === 0 ? (
          <Box py={5} textAlign="center">
            <ImageOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary" mb={0.5}>
              {error ||
                (debouncedSearch
                  ? `No images found for “${debouncedSearch}”.`
                  : 'No suggested images right now.')}
            </Typography>
            <Typography variant="body2" color="text.disabled" mb={2}>
              Try another keyword or upload a custom image.
            </Typography>
            <Button
              variant="contained"
              startIcon={<CloudUploadOutlinedIcon />}
              onClick={() => fileRef.current?.click()}
            >
              Upload Custom Image
            </Button>
          </Box>
        ) : (
          <Grid container spacing={1.5}>
            {images.map((img) => {
              const active = picked === img.url || picked === img.thumb;
              return (
                <Grid key={img.id} size={{ xs: 6, sm: 3 }}>
                  <Box
                    onClick={() => setPicked(img.url)}
                    sx={{
                      position: 'relative',
                      borderRadius: 2,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      height: 140,
                      border: active ? '3px solid' : '3px solid transparent',
                      borderColor: active ? 'primary.main' : 'transparent',
                      boxShadow: active
                        ? '0 8px 24px rgba(33,150,243,0.35)'
                        : '0 2px 10px rgba(0,0,0,0.08)',
                      transition: 'transform 180ms ease, box-shadow 180ms ease',
                      bgcolor: 'rgba(240,244,248,0.8)',
                      '&:hover': { transform: 'translateY(-2px)' },
                    }}
                  >
                    <Box
                      component="img"
                      src={img.thumb || img.url}
                      alt={img.alt || 'Gallery'}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {active && (
                      <CheckCircleIcon
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: 'primary.main',
                          bgcolor: '#fff',
                          borderRadius: '50%',
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!picked}
          onClick={() => {
            onSelect?.({ url: picked, file: null, provider: 'gallery' });
            onClose?.();
          }}
        >
          Use Selected Image
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function CoverHeroBanner({
  title,
  coverImage,
  subtitle,
  onChangeCover,
  children,
  height = { xs: 220, md: 320 },
}) {
  const bg = resolveMediaUrl(coverImage) || null;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: { xs: 2, md: 3 },
        overflow: 'hidden',
        minHeight: height,
        background: bg
          ? `linear-gradient(120deg, rgba(13,21,38,0.72), rgba(21,34,56,0.45)), url(${bg}) center/cover no-repeat`
          : 'linear-gradient(135deg, #152238 0%, #1e3a5f 45%, #2196f3 140%)',
        color: '#fff',
        boxShadow: '0 16px 40px rgba(21,34,56,0.18)',
        mb: 2.5,
        animation: 'heroIn 400ms ease',
        '@keyframes heroIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(33,150,243,0.25), transparent 35%)',
          pointerEvents: 'none',
        }}
      />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
        spacing={2}
        sx={{ position: 'relative', p: { xs: 2.5, md: 4 }, minHeight: height }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.6rem', md: '2.4rem' },
              letterSpacing: '-0.02em',
              textShadow: '0 2px 16px rgba(0,0,0,0.35)',
              mb: 0.75,
            }}
          >
            {title || 'Untitled Itinerary'}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ opacity: 0.92, maxWidth: 640 }}>
              {subtitle}
            </Typography>
          )}
          {children}
        </Box>
        {onChangeCover && (
          <Button
            variant="contained"
            startIcon={<PhotoCameraOutlinedIcon />}
            onClick={onChangeCover}
            sx={{
              bgcolor: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.35)',
              color: '#fff',
              fontWeight: 700,
              px: 2.5,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
            }}
          >
            Change Cover Photo
          </Button>
        )}
      </Stack>
    </Box>
  );
}
