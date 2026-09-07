import { useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider, useSnackbar } from 'notistack';
import theme from './theme';
import AppRoutes from './routes';
import { setApiHelpers } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function ApiHelperBridge({ children }) {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setApiHelpers({ queryClient, enqueueSnackbar });
  }, [enqueueSnackbar]);

  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          <SnackbarProvider
            maxSnack={4}
            autoHideDuration={3500}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <ApiHelperBridge>
              <AppRoutes />
            </ApiHelperBridge>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
