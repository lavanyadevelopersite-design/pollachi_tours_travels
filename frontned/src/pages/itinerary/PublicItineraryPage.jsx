import { Box } from '@mui/material';

import { useEffect } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import Loader from '../../components/common/Loader';

import EmptyState from '../../components/common/EmptyState';

import ThemedItineraryDocument from '../../components/itinerary/ThemedItineraryDocument';

import itineraryService from '../../services/itinerary.service';

import { getItineraryThemeId } from '../../utils/itineraryThemes';



const markPdfReady = () => {

  document.documentElement.setAttribute('data-pdf-ready', 'true');

};



export default function PublicItineraryPage() {

  const { token } = useParams();

  const [searchParams] = useSearchParams();

  const isPdfMode = searchParams.get('pdf') === '1';



  const { data, isLoading, isError } = useQuery({

    queryKey: ['public-itinerary', token],

    queryFn: async () => {

      const { data: response } = await itineraryService.getPublic(token);

      return response?.data || response;

    },

    enabled: Boolean(token),

    retry: false,

  });



  useEffect(() => {

    if (!isPdfMode || !data || isLoading) return undefined;



    let cancelled = false;

    const ready = () => {

      if (!cancelled) markPdfReady();

    };



    const timer = setTimeout(ready, 3000);

    if (document.fonts?.ready) {

      document.fonts.ready.then(() => {

        if (!cancelled) {

          clearTimeout(timer);

          setTimeout(ready, 800);

        }

      });

    }



    return () => {

      cancelled = true;

      clearTimeout(timer);

    };

  }, [data, isLoading, isPdfMode]);

  useEffect(() => {
    if (!data) return undefined;

    document.title = 'Show Itinerary | Pollachi Tours and Travels';

    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const previewTitle = data?.title ? `Show Itinerary - ${data.title}` : 'Show Itinerary';
    setMeta('property', 'og:title', previewTitle);
    setMeta('property', 'og:description', 'Tap to view your travel itinerary preview.');
    setMeta('name', 'description', 'Tap to view your travel itinerary preview.');

    return undefined;
  }, [data]);

  if (isLoading) {

    return isPdfMode ? null : <Loader message="Loading itinerary..." />;

  }



  if (isError || !data) {

    if (isPdfMode) return null;

    return (

      <EmptyState

        title="Itinerary not found"

        description="This link may be invalid or expired. Please contact Pollachi Tours & Travels for assistance."

      />

    );

  }



  const themeId = getItineraryThemeId(data);



  return (

    <Box

      className="print-document"

      sx={{

        maxWidth: { xs: '100%', sm: themeId === 'scenic_escape' ? 980 : 960 },

        mx: 'auto',

        px: isPdfMode ? 0 : { xs: 1, sm: 2 },

        py: isPdfMode ? 0 : { xs: 2, sm: 3 },

        bgcolor: isPdfMode ? '#fff' : '#f8fafc',

        minHeight: isPdfMode ? 'auto' : '100vh',

      }}

    >

      <Box

        sx={{

          bgcolor: '#fff',

          borderRadius: 0,

          overflow: 'hidden',

          border: isPdfMode ? 'none' : '1px solid',

          borderColor: 'divider',

          boxShadow: isPdfMode ? 'none' : '0 18px 50px rgba(21,34,56,0.12)',

        }}

      >

        <ThemedItineraryDocument data={data} branding={data?.branding} />

      </Box>

    </Box>

  );

}

