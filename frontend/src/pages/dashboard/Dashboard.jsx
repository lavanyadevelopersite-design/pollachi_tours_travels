import { Box, Grid, Typography } from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import PhoneCallbackRoundedIcon from '@mui/icons-material/PhoneCallbackRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import BookingStatusDonut from '../../components/charts/BookingStatusDonut';
import DashboardSideBackground from '../../components/dashboard/DashboardSideBackground';
import EnquiryStatCard from '../../components/dashboard/EnquiryStatCard';
import DashboardRankTable from '../../components/dashboard/DashboardRankTable';
import DashboardInfoCard from '../../components/dashboard/DashboardInfoCard';
import ProfitLossTrendChart from '../../components/dashboard/ProfitLossTrendChart';
import PaymentCollectionCard from '../../components/dashboard/PaymentCollectionCard';
import TopDestinations from '../../components/dashboard/TopDestinations';
import TodayFollowUpsCard from '../../components/dashboard/TodayFollowUpsCard';
import UpcomingToursCard from '../../components/dashboard/UpcomingToursCard';
import {
  useDashboardStats,
  useBookingStatusChart,
  useSalesReps,
  useTopLeadSources,
  usePendingFollowUps,
  useRecentActivities,
  usePaymentCollection,
  useTopDestinations,
  useTodayFollowUps,
  useUpcomingTours,
} from '../../hooks/queries/useDashboard';
import { buildEnquiryDashboardCards } from '../../utils/dashboardData';
import { formatCurrency, formatDate, formatRelative } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: statsData, isLoading } = useDashboardStats();
  const { data: bookingStatus } = useBookingStatusChart();
  const { data: salesReps, isLoading: salesLoading } = useSalesReps();
  const { data: leadSources, isLoading: sourcesLoading } = useTopLeadSources();
  const { data: followUps, isLoading: followUpsLoading } = usePendingFollowUps();
  const { data: recentActivities, isLoading: activityLoading } = useRecentActivities();
  const { data: paymentCollection, isLoading: collectionLoading } = usePaymentCollection();
  const { data: topDestinations, isLoading: destinationsLoading } = useTopDestinations();
  const { data: todayFollowUps, isLoading: todayFollowUpsLoading } = useTodayFollowUps();
  const { data: upcomingTours, isLoading: upcomingLoading } = useUpcomingTours();
  const hasTopDestinations = (Array.isArray(topDestinations) ? topDestinations : []).some(
    (item) => Number(item?.queries || 0) > 0
  );
  const todayFollowUpRows = Array.isArray(todayFollowUps) ? todayFollowUps : [];
  const showTodayFollowUps = todayFollowUpsLoading || todayFollowUpRows.length > 0;

  const userName =
    user?.first_name ||
    user?.firstName ||
    user?.name?.split(' ')?.[0] ||
    'Admin';

  const pipelineCards = buildEnquiryDashboardCards(statsData?.pipeline || {});
  const statusChartData =
    Array.isArray(bookingStatus) && bookingStatus.length
      ? bookingStatus
      : (statsData?.pipeline?.statuses || []).map((status) => ({
          name: status.name,
          value: status.count,
          count: status.count,
          color: status.color,
        }));

  const finance = statsData?.finance || {};
  const insightItems = [
    {
      id: 'followups',
      label: 'Pending follow-ups',
      value: statsData?.pendingFollowUps ?? statsData?.counts?.pendingFollowUps ?? 0,
      dot: '#f97316',
      to: '/follow-ups',
    },
    {
      id: 'collection',
      label: "Today's collection",
      value: formatCurrency(statsData?.todayCollection || 0),
      dot: '#22c55e',
      valueColor: '#15803d',
    },
    {
      id: 'outstanding',
      label: 'Outstanding invoices',
      value: formatCurrency(finance.outstanding || 0),
      dot: '#ef4444',
      valueColor: '#b91c1c',
    },
    {
      id: 'revenue',
      label: 'This month revenue',
      value: formatCurrency(statsData?.monthlyRevenue || finance.enquiryPayments || 0),
      dot: '#4f46e5',
    },
    {
      id: 'expenses',
      label: 'Expenses this month',
      value: formatCurrency(finance.expenses || 0),
      dot: '#ec4899',
    },
    {
      id: 'customers',
      label: 'Unique customers',
      value: statsData?.customers ?? 0,
      dot: '#0ea5e9',
    },
    {
      id: 'quotations',
      label: 'Quotations this month',
      value: statsData?.counts?.quotations ?? 0,
      dot: '#8b5cf6',
      to: '/quotations',
    },
    {
      id: 'bookings',
      label: 'Bookings this month',
      value: statsData?.bookings ?? statsData?.counts?.bookings ?? 0,
      dot: '#14b8a6',
      to: '/bookings',
    },
    {
      id: 'feedback',
      label: 'Average feedback',
      value: statsData?.feedbackAverage != null ? `${statsData.feedbackAverage} / 5` : '—',
      dot: '#f59e0b',
      to: '/feedback',
    },
  ];

  const followUpItems = (Array.isArray(followUps) ? followUps : []).map((item) => {
    const isOverdue = item.status === 'overdue';
    const isToday = item.status === 'today';
    return {
      id: item.id,
      label: item.label,
      value: isOverdue ? `Overdue · ${formatDate(item.date)}` : isToday ? 'Today' : formatDate(item.date),
      dot: isOverdue ? '#ef4444' : isToday ? '#f97316' : '#0ea5e9',
      valueColor: isOverdue ? '#b91c1c' : isToday ? '#c2410c' : '#0f766e',
      to: '/follow-ups',
    };
  });

  const activityItems = (Array.isArray(recentActivities) ? recentActivities : []).map((item) => ({
    id: item.id,
    label: item.title || item.description || 'Activity',
    value: formatRelative(item.createdAt),
    dot: '#8b5cf6',
  }));

  return (
    <Box position="relative" sx={{ overflow: 'hidden', minHeight: '100%' }}>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(circle at 6% 8%, rgba(79, 70, 229, 0.2), transparent 34%),
            radial-gradient(circle at 94% 12%, rgba(6, 182, 212, 0.18), transparent 32%),
            radial-gradient(circle at 12% 78%, rgba(236, 72, 153, 0.12), transparent 30%),
            radial-gradient(circle at 78% 88%, rgba(249, 115, 22, 0.16), transparent 34%)
          `,
        }}
      />
      <DashboardSideBackground />

      <Box position="relative" zIndex={1}>
        <Box
          sx={{
            mb: 2.75,
            p: { xs: 2, sm: 2.5 },
            borderRadius: 3,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 46%, #0891b2 100%)',
            boxShadow: '0 14px 32px rgba(79, 70, 229, 0.28)',
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              right: -40,
              top: -50,
              width: 180,
              height: 180,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.12)',
            }}
          />
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              right: 80,
              bottom: -60,
              width: 140,
              height: 140,
              borderRadius: '50%',
              bgcolor: 'rgba(34, 211, 238, 0.22)',
            }}
          />
          <Typography variant="h4" fontWeight={800} position="relative">
            Dashboard
          </Typography>
          <Typography variant="body1" mt={1} position="relative" sx={{ opacity: 0.96, lineHeight: 1.7 }}>
            Welcome back, <strong>{userName}</strong>!
            <br />
            Here&apos;s what&apos;s happening with your enquiries today.
          </Typography>
        </Box>

        <Grid container spacing={1.25} sx={{ mt: 1 }}>
          {pipelineCards.map((card) => (
            <Grid key={card.key} size={{ xs: 6, sm: 4, md: 2 }}>
              <EnquiryStatCard
                title={card.title}
                value={card.count}
                iconColor={card.color}
                iconKey={card.key}
                viewAllTo={card.viewAllTo}
                loading={isLoading}
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ height: 40 }} />

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardRankTable
              title="Sales Reps."
              accent="#4f46e5"
              icon={GroupsRoundedIcon}
              loading={salesLoading}
              showTotal={true}
              rows={Array.isArray(salesReps) ? salesReps : []}
              columns={[
                { id: 'name', label: 'Name' },
                { id: 'assigned', label: 'Assigned', align: 'right' },
                { id: 'confirmed', label: 'Confirmed', align: 'right' },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardRankTable
              title="Top Lead Source"
              accent="#0d9488"
              icon={TravelExploreRoundedIcon}
              loading={sourcesLoading}
              showTotal={true}
              rows={Array.isArray(leadSources) ? leadSources : []}
              columns={[
                { id: 'name', label: 'Name' },
                { id: 'total', label: 'Total Queries', align: 'right' },
                { id: 'confirmed', label: 'Confirmed', align: 'right' },
              ]}
            />
          </Grid>
        </Grid>

        <Box sx={{ height: 40 }} />

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: hasTopDestinations || destinationsLoading ? 7 : 12 }}>
            <PaymentCollectionCard
              rows={Array.isArray(paymentCollection?.rows) ? paymentCollection.rows : []}
              totalDue={Number(paymentCollection?.totalDue || 0)}
              loading={collectionLoading}
            />
          </Grid>
          {hasTopDestinations || destinationsLoading ? (
            <Grid size={{ xs: 12, md: 5 }}>
              <TopDestinations
                data={Array.isArray(topDestinations) ? topDestinations : []}
                loading={destinationsLoading}
              />
            </Grid>
          ) : null}
        </Grid>

        <Box sx={{ height: 24 }} />

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <UpcomingToursCard
              rows={Array.isArray(upcomingTours) ? upcomingTours : []}
              loading={upcomingLoading}
            />
          </Grid>
          {showTodayFollowUps ? (
            <Grid size={{ xs: 12, md: 6 }}>
              <TodayFollowUpsCard rows={todayFollowUpRows} loading={todayFollowUpsLoading} />
            </Grid>
          ) : null}
        </Grid>

        <Box sx={{ height: 40 }} />

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <BookingStatusDonut data={statusChartData} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardInfoCard
              title="Business Snapshot"
              accent="#6366f1"
              icon={InsightsRoundedIcon}
              loading={isLoading}
              items={insightItems}
            />
          </Grid>
        </Grid>

        <Box sx={{ height: 40 }} />

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardInfoCard
              title="Pending Follow-ups"
              accent="#ea580c"
              icon={PhoneCallbackRoundedIcon}
              loading={followUpsLoading}
              empty="No pending follow-ups"
              items={followUpItems}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardInfoCard
              title="Recent Activity"
              accent="#8b5cf6"
              icon={HistoryRoundedIcon}
              loading={activityLoading}
              empty="No recent activity"
              items={activityItems}
            />
          </Grid>
        </Grid>

        <Box sx={{ height: 40 }} />

        <ProfitLossTrendChart />
      </Box>
    </Box>
  );
}
