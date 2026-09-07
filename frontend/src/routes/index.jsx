import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import AuthLayout from '../layout/AuthLayout';
import DriverLayout from '../layout/DriverLayout';
import ProtectedRoute from './ProtectedRoute';
import DriverRoute from './DriverRoute';
import GuestRoute from './GuestRoute';
import Loader from '../components/common/Loader';
import { PUBLIC_ENQUIRY_PATH, PUBLIC_ENQUIRY_THANKS_PATH } from '../utils/constants';
const Login = lazy(() => import('../pages/auth/Login'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const DriverLogin = lazy(() => import('../pages/driver/DriverLogin'));
const DriverTrips = lazy(() => import('../pages/driver/DriverTrips'));
const DriverTripDetail = lazy(() => import('../pages/driver/DriverTripDetail'));
const DriverTripRoute = lazy(() => import('../pages/driver/DriverTripRoute'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const UserList = lazy(() => import('../pages/users/UserList'));
const UserCreate = lazy(() => import('../pages/users/UserCreate'));
const UserEdit = lazy(() => import('../pages/users/UserEdit'));
const UserProfile = lazy(() => import('../pages/users/UserProfile'));
const RoleList = lazy(() => import('../pages/roles/RoleList'));
const BranchList = lazy(() => import('../pages/masters/BranchList'));
const BranchCreate = lazy(() => import('../pages/masters/BranchCreate'));
const BranchEdit = lazy(() => import('../pages/masters/BranchEdit'));
const DestinationList = lazy(() => import('../pages/masters/DestinationList'));
const DestinationCreate = lazy(() => import('../pages/masters/DestinationCreate'));
const DestinationEdit = lazy(() => import('../pages/masters/DestinationEdit'));
const PackageList = lazy(() => import('../pages/masters/PackageList'));
const PackageCreate = lazy(() => import('../pages/masters/PackageCreate'));
const PackageEdit = lazy(() => import('../pages/masters/PackageEdit'));
const HotelList = lazy(() => import('../pages/masters/HotelList'));
const HotelCreate = lazy(() => import('../pages/masters/HotelCreate'));
const HotelEdit = lazy(() => import('../pages/masters/HotelEdit'));
const VehicleList = lazy(() => import('../pages/masters/VehicleList'));
const VehicleCreate = lazy(() => import('../pages/masters/VehicleCreate'));
const VehicleEdit = lazy(() => import('../pages/masters/VehicleEdit'));
const SupplierList = lazy(() => import('../pages/masters/SupplierList'));
const SupplierCreate = lazy(() => import('../pages/masters/SupplierCreate'));
const SupplierEdit = lazy(() => import('../pages/masters/SupplierEdit'));
const LeadStatusList = lazy(() => import('../pages/masters/LeadStatusList'));
const LeadStatusCreate = lazy(() => import('../pages/masters/LeadStatusCreate'));
const LeadStatusEdit = lazy(() => import('../pages/masters/LeadStatusEdit'));
const LeadSourceTypeList = lazy(() => import('../pages/masters/LeadSourceTypeList'));
const LeadSourceTypeCreate = lazy(() => import('../pages/masters/LeadSourceTypeCreate'));
const LeadSourceTypeEdit = lazy(() => import('../pages/masters/LeadSourceTypeEdit'));
const AgentList = lazy(() => import('../pages/masters/AgentList'));
const AgentCreate = lazy(() => import('../pages/masters/AgentCreate'));
const AgentEdit = lazy(() => import('../pages/masters/AgentEdit'));
const CorporateList = lazy(() => import('../pages/masters/CorporateList'));
const CorporateCreate = lazy(() => import('../pages/masters/CorporateCreate'));
const CorporateEdit = lazy(() => import('../pages/masters/CorporateEdit'));
const PackageTermsList = lazy(() => import('../pages/masters/PackageTermsList'));
const PackageTermsCreate = lazy(() => import('../pages/masters/PackageTermsCreate'));
const PackageTermsEdit = lazy(() => import('../pages/masters/PackageTermsEdit'));
const InclusionExclusionList = lazy(() => import('../pages/masters/InclusionExclusionList'));
const InclusionExclusionCreate = lazy(() => import('../pages/masters/InclusionExclusionCreate'));
const InclusionExclusionEdit = lazy(() => import('../pages/masters/InclusionExclusionEdit'));
const CurrencyList = lazy(() => import('../pages/masters/CurrencyList'));
const CurrencyCreate = lazy(() => import('../pages/masters/CurrencyCreate'));
const CurrencyEdit = lazy(() => import('../pages/masters/CurrencyEdit'));
const CountryList = lazy(() => import('../pages/masters/CountryList'));
const CountryCreate = lazy(() => import('../pages/masters/CountryCreate'));
const CountryEdit = lazy(() => import('../pages/masters/CountryEdit'));
const StateList = lazy(() => import('../pages/masters/StateList'));
const StateCreate = lazy(() => import('../pages/masters/StateCreate'));
const StateEdit = lazy(() => import('../pages/masters/StateEdit'));
const CityList = lazy(() => import('../pages/masters/CityList'));
const CityCreate = lazy(() => import('../pages/masters/CityCreate'));
const CityEdit = lazy(() => import('../pages/masters/CityEdit'));
const PaymentModeList = lazy(() => import('../pages/masters/PaymentModeList'));
const PaymentModeCreate = lazy(() => import('../pages/masters/PaymentModeCreate'));
const PaymentModeEdit = lazy(() => import('../pages/masters/PaymentModeEdit'));
const TaxList = lazy(() => import('../pages/masters/TaxList'));
const TaxCreate = lazy(() => import('../pages/masters/TaxCreate'));
const TaxEdit = lazy(() => import('../pages/masters/TaxEdit'));
const SeasonPricingList = lazy(() => import('../pages/masters/SeasonPricingList'));
const SeasonPricingCreate = lazy(() => import('../pages/masters/SeasonPricingCreate'));
const SeasonPricingEdit = lazy(() => import('../pages/masters/SeasonPricingEdit'));
const ExpensesTypeList = lazy(() => import('../pages/masters/ExpensesTypeList'));
const ExpensesTypeCreate = lazy(() => import('../pages/masters/ExpensesTypeCreate'));
const ExpensesTypeEdit = lazy(() => import('../pages/masters/ExpensesTypeEdit'));
const DepartmentList = lazy(() => import('../pages/masters/DepartmentList'));
const DepartmentCreate = lazy(() => import('../pages/masters/DepartmentCreate'));
const DepartmentEdit = lazy(() => import('../pages/masters/DepartmentEdit'));
const DesignationList = lazy(() => import('../pages/masters/DesignationList'));
const DesignationCreate = lazy(() => import('../pages/masters/DesignationCreate'));
const DesignationEdit = lazy(() => import('../pages/masters/DesignationEdit'));
const DriverList = lazy(() => import('../pages/masters/DriverList'));
const DriverCreate = lazy(() => import('../pages/masters/DriverCreate'));
const DriverEdit = lazy(() => import('../pages/masters/DriverEdit'));
const DriverDocuments = lazy(() => import('../pages/masters/DriverDocuments'));
const GuideList = lazy(() => import('../pages/masters/GuideList'));
const GuideCreate = lazy(() => import('../pages/masters/GuideCreate'));
const GuideEdit = lazy(() => import('../pages/masters/GuideEdit'));
const GuideDocuments = lazy(() => import('../pages/masters/GuideDocuments'));
const LeadList = lazy(() => import('../pages/leads/LeadList'));
const LeadCreate = lazy(() => import('../pages/leads/LeadCreate'));
const LeadEdit = lazy(() => import('../pages/leads/LeadEdit'));
const EnquiryList = lazy(() => import('../pages/enquiry/EnquiryList'));
const EnquiryCreate = lazy(() => import('../pages/enquiry/EnquiryCreate'));
const EnquiryEdit = lazy(() => import('../pages/enquiry/EnquiryEdit'));
const EnquiryView = lazy(() => import('../pages/enquiry/EnquiryView'));
const EnquiryQuotationView = lazy(() => import('../pages/enquiry/EnquiryQuotationView'));
const EnquiryQuotationEdit = lazy(() => import('../pages/enquiry/EnquiryQuotationEdit'));
const PaymentReceipt = lazy(() => import('../pages/enquiry/PaymentReceipt'));
const EnquiryInvoiceView = lazy(() => import('../pages/enquiry/EnquiryInvoiceView'));
const PublicEnquiryPage = lazy(() => import('../pages/enquiry/PublicEnquiryPage'));
const EnquirySuccessPage = lazy(() => import('../pages/enquiry/EnquirySuccessPage'));
const FollowUpList = lazy(() => import('../pages/followUp/FollowUpList'));
const FollowUpCreate = lazy(() => import('../pages/followUp/FollowUpCreate'));
const FollowUpEdit = lazy(() => import('../pages/followUp/FollowUpEdit'));
const ItineraryList = lazy(() => import('../pages/itinerary/ItineraryList'));
const ItineraryGenerator = lazy(() => import('../pages/itinerary/ItineraryGenerator'));
const ItineraryView = lazy(() => import('../pages/itinerary/ItineraryView'));
const ItineraryPreview = lazy(() => import('../pages/itinerary/ItineraryPreview'));
const PublicItineraryPage = lazy(() => import('../pages/itinerary/PublicItineraryPage'));
const QuotationList = lazy(() => import('../pages/quotation/QuotationList'));
const QuotationCreate = lazy(() => import('../pages/quotation/QuotationCreate'));
const QuotationEdit = lazy(() => import('../pages/quotation/QuotationEdit'));
const BookingList = lazy(() => import('../pages/booking/BookingList'));
const BookingCreate = lazy(() => import('../pages/booking/BookingCreate'));
const BookingEdit = lazy(() => import('../pages/booking/BookingEdit'));
const InvoiceList = lazy(() => import('../pages/invoice/InvoiceList'));
const InvoiceCreate = lazy(() => import('../pages/invoice/InvoiceCreate'));
const InvoiceEdit = lazy(() => import('../pages/invoice/InvoiceEdit'));
const ReceiptList = lazy(() => import('../pages/receipt/ReceiptList'));
const ExpenseList = lazy(() => import('../pages/expense/ExpenseList'));
const ExpenseCreate = lazy(() => import('../pages/expense/ExpenseCreate'));
const ExpenseEdit = lazy(() => import('../pages/expense/ExpenseEdit'));
const RefundList = lazy(() => import('../pages/refund/RefundList'));
const FeedbackList = lazy(() => import('../pages/feedback/FeedbackList'));
const PublicFeedbackPage = lazy(() => import('../pages/feedback/PublicFeedbackPage'));
const CalendarPage = lazy(() => import('../pages/calendar/CalendarPage'));
const WhatsAppTemplateList = lazy(() => import('../pages/whatsapp/WhatsAppTemplateList'));
const WhatsAppInboxPage = lazy(() => import('../pages/whatsapp/WhatsAppInboxPage'));
const WhatsAppIntegrationPage = lazy(() => import('../pages/integrations/WhatsAppIntegrationPage'));
const MailIntegrationPage = lazy(() => import('../pages/integrations/MailIntegrationPage'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'));
const ProfitLossReport = lazy(() => import('../pages/reports/ProfitLossReport'));
const EnquiryReport = lazy(() => import('../pages/reports/EnquiryReport'));
const ExpenseReport = lazy(() => import('../pages/reports/ExpenseReport'));
const CustomerReport = lazy(() => import('../pages/reports/CustomerReport'));
const VehicleReport = lazy(() => import('../pages/reports/VehicleReport'));
const DriverReport = lazy(() => import('../pages/reports/DriverReport'));
const UserFollowUpReport = lazy(() => import('../pages/reports/UserFollowUpReport'));
const UserAttendanceReport = lazy(() => import('../pages/reports/UserAttendanceReport'));
const MisReport = lazy(() => import('../pages/reports/MisReport'));
const ToursReport = lazy(() => import('../pages/reports/ToursReport'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const NotificationList = lazy(() => import('../pages/notifications/NotificationList'));
const AuditLogList = lazy(() => import('../pages/audit/AuditLogList'));
const LoginHistoryPage = lazy(() => import('../pages/loginHistory/LoginHistoryPage'));
const NotFound = lazy(() => import('../pages/errors/NotFound'));
const Unauthorized = lazy(() => import('../pages/errors/Unauthorized'));

const SuspenseWrap = ({ children }) => (
  <Suspense fallback={<Loader message="Loading..." />}>{children}</Suspense>
);

const crudRoutes = (path, List, Create, Edit, extras = []) => ({
  path,
  children: [
    {
      index: true,
      element: (
        <SuspenseWrap>
          <List />
        </SuspenseWrap>
      ),
    },
    {
      path: 'create',
      element: (
        <SuspenseWrap>
          <Create />
        </SuspenseWrap>
      ),
    },
    {
      path: 'edit/:id',
      element: (
        <SuspenseWrap>
          <Edit />
        </SuspenseWrap>
      ),
    },
    ...extras,
  ],
});

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <GuestRoute>
            <SuspenseWrap>
              <Login />
            </SuspenseWrap>
          </GuestRoute>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <GuestRoute>
            <SuspenseWrap>
              <ForgotPassword />
            </SuspenseWrap>
          </GuestRoute>
        ),
      },
      {
        path: '/driver/login',
        element: (
          <GuestRoute driverOnly>
            <SuspenseWrap>
              <DriverLogin />
            </SuspenseWrap>
          </GuestRoute>
        ),
      },
      {
        path: '/d/:code',
        element: (
          <GuestRoute driverOnly>
            <SuspenseWrap>
              <DriverLogin />
            </SuspenseWrap>
          </GuestRoute>
        ),
      },
    ],
  },
  {
    element: <DriverRoute />,
    children: [
      {
        element: <DriverLayout />,
        children: [
          {
            path: '/driver',
            element: <Navigate to="/driver/trips" replace />,
          },
          {
            path: '/driver/trips',
            element: (
              <SuspenseWrap>
                <DriverTrips />
              </SuspenseWrap>
            ),
          },
          {
            path: '/driver/trips/:id/route',
            element: (
              <SuspenseWrap>
                <DriverTripRoute />
              </SuspenseWrap>
            ),
          },
          {
            path: '/driver/trips/:id',
            element: (
              <SuspenseWrap>
                <DriverTripDetail />
              </SuspenseWrap>
            ),
          },
        ],
      },
    ],
  },
  {
    path: PUBLIC_ENQUIRY_PATH,
    element: (
      <SuspenseWrap>
        <PublicEnquiryPage />
      </SuspenseWrap>
    ),
  },
  {
    path: PUBLIC_ENQUIRY_THANKS_PATH,
    element: (
      <SuspenseWrap>
        <EnquirySuccessPage />
      </SuspenseWrap>
    ),
  },
  {
    path: '/enquire',
    element: <Navigate to={PUBLIC_ENQUIRY_PATH} replace />,
  },
  {
    path: '/enquire/thanks',
    element: <Navigate to={PUBLIC_ENQUIRY_THANKS_PATH} replace />,
  },
  {
    path: '/enquiries',
    element: <Navigate to={PUBLIC_ENQUIRY_PATH} replace />,
  },
  {
    path: '/enquiries/success',
    element: <Navigate to={PUBLIC_ENQUIRY_THANKS_PATH} replace />,
  },
  {
    path: '/feedback/:token',
    element: (
      <SuspenseWrap>
        <PublicFeedbackPage />
      </SuspenseWrap>
    ),
  },
  {
    path: '/itinerary/:token',
    element: (
      <SuspenseWrap>
        <PublicItineraryPage />
      </SuspenseWrap>
    ),
  },
  {
    path: '/i/:token',
    element: (
      <SuspenseWrap>
        <PublicItineraryPage />
      </SuspenseWrap>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          {
            path: '/dashboard',
            element: (
              <SuspenseWrap>
                <Dashboard />
              </SuspenseWrap>
            ),
          },
          crudRoutes('/users', UserList, UserCreate, UserEdit, [
            {
              path: 'profile/:id',
              element: (
                <SuspenseWrap>
                  <UserProfile />
                </SuspenseWrap>
              ),
            },
          ]),
          {
            path: '/roles',
            element: (
              <SuspenseWrap>
                <RoleList />
              </SuspenseWrap>
            ),
          },
          crudRoutes('/masters/branches', BranchList, BranchCreate, BranchEdit),
          crudRoutes('/masters/destinations', DestinationList, DestinationCreate, DestinationEdit),
          crudRoutes('/masters/packages', PackageList, PackageCreate, PackageEdit),
          crudRoutes('/masters/hotels', HotelList, HotelCreate, HotelEdit),
          crudRoutes('/masters/vehicles', VehicleList, VehicleCreate, VehicleEdit),
          crudRoutes('/masters/suppliers', SupplierList, SupplierCreate, SupplierEdit),
          crudRoutes('/masters/lead-statuses', LeadStatusList, LeadStatusCreate, LeadStatusEdit),
          crudRoutes(
            '/masters/lead-source-types',
            LeadSourceTypeList,
            LeadSourceTypeCreate,
            LeadSourceTypeEdit
          ),
          crudRoutes('/masters/agents', AgentList, AgentCreate, AgentEdit),
          crudRoutes('/masters/corporates', CorporateList, CorporateCreate, CorporateEdit),
          crudRoutes(
            '/masters/package-terms',
            PackageTermsList,
            PackageTermsCreate,
            PackageTermsEdit
          ),
          crudRoutes(
            '/masters/inclusion-exclusions',
            InclusionExclusionList,
            InclusionExclusionCreate,
            InclusionExclusionEdit
          ),
          crudRoutes('/masters/currencies', CurrencyList, CurrencyCreate, CurrencyEdit),
          crudRoutes('/masters/countries', CountryList, CountryCreate, CountryEdit),
          crudRoutes('/masters/states', StateList, StateCreate, StateEdit),
          crudRoutes('/masters/cities', CityList, CityCreate, CityEdit),
          crudRoutes('/masters/payment-modes', PaymentModeList, PaymentModeCreate, PaymentModeEdit),
          crudRoutes('/masters/taxes', TaxList, TaxCreate, TaxEdit),
          crudRoutes('/masters/season-pricing', SeasonPricingList, SeasonPricingCreate, SeasonPricingEdit),
          crudRoutes('/masters/expenses-types', ExpensesTypeList, ExpensesTypeCreate, ExpensesTypeEdit),
          crudRoutes('/masters/departments', DepartmentList, DepartmentCreate, DepartmentEdit),
          crudRoutes('/masters/designations', DesignationList, DesignationCreate, DesignationEdit),
          crudRoutes('/masters/drivers', DriverList, DriverCreate, DriverEdit, [
            {
              path: 'documents/:id',
              element: (
                <SuspenseWrap>
                  <DriverDocuments />
                </SuspenseWrap>
              ),
            },
          ]),
          crudRoutes('/masters/guides', GuideList, GuideCreate, GuideEdit, [
            {
              path: 'documents/:id',
              element: (
                <SuspenseWrap>
                  <GuideDocuments />
                </SuspenseWrap>
              ),
            },
          ]),
          crudRoutes('/leads', LeadList, LeadCreate, LeadEdit),
          crudRoutes('/enquiry', EnquiryList, EnquiryCreate, EnquiryEdit),
          {
            path: '/enquiry/view/:id',
            element: (
              <SuspenseWrap>
                <EnquiryView />
              </SuspenseWrap>
            ),
          },
          {
            path: '/enquiry/:enquiryId/quotation/:itineraryId',
            element: (
              <SuspenseWrap>
                <EnquiryQuotationView />
              </SuspenseWrap>
            ),
          },
          {
            path: '/enquiry/:enquiryId/quotation/:itineraryId/edit',
            element: (
              <SuspenseWrap>
                <EnquiryQuotationEdit />
              </SuspenseWrap>
            ),
          },
          {
            path: '/enquiry/:enquiryId/payments/:paymentId/receipt',
            element: (
              <SuspenseWrap>
                <PaymentReceipt />
              </SuspenseWrap>
            ),
          },
          {
            path: '/enquiry/:enquiryId/quotation/:itineraryId/invoice',
            element: (
              <SuspenseWrap>
                <EnquiryInvoiceView />
              </SuspenseWrap>
            ),
          },
          { path: '/leads/enquiries/*', element: <Navigate to="/enquiry" replace /> },
          { path: '/enquiries/list', element: <Navigate to="/enquiry" replace /> },
          crudRoutes('/follow-ups', FollowUpList, FollowUpCreate, FollowUpEdit),
          {
            path: '/itineraries',
            children: [
              {
                index: true,
                element: (
                  <SuspenseWrap>
                    <ItineraryList />
                  </SuspenseWrap>
                ),
              },
              {
                path: 'generate',
                element: (
                  <SuspenseWrap>
                    <ItineraryGenerator />
                  </SuspenseWrap>
                ),
              },
              {
                path: 'view/:id',
                element: (
                  <SuspenseWrap>
                    <ItineraryView />
                  </SuspenseWrap>
                ),
              },
              {
                path: 'preview/:id',
                element: (
                  <SuspenseWrap>
                    <ItineraryPreview />
                  </SuspenseWrap>
                ),
              },
            ],
          },
          crudRoutes('/quotations', QuotationList, QuotationCreate, QuotationEdit),
          crudRoutes('/bookings', BookingList, BookingCreate, BookingEdit),
          crudRoutes('/invoices', InvoiceList, InvoiceCreate, InvoiceEdit),
          {
            path: '/receipts',
            element: (
              <SuspenseWrap>
                <ReceiptList />
              </SuspenseWrap>
            ),
          },
          crudRoutes('/expenses', ExpenseList, ExpenseCreate, ExpenseEdit),
          {
            path: '/refunds',
            element: (
              <SuspenseWrap>
                <RefundList />
              </SuspenseWrap>
            ),
          },
          {
            path: '/feedback',
            element: (
              <SuspenseWrap>
                <FeedbackList />
              </SuspenseWrap>
            ),
          },
          {
            path: '/calendar',
            element: (
              <SuspenseWrap>
                <CalendarPage />
              </SuspenseWrap>
            ),
          },
          {
            path: '/whatsapp-inbox',
            element: (
              <SuspenseWrap>
                <WhatsAppInboxPage />
              </SuspenseWrap>
            ),
          },
          {
            path: '/whatsapp-templates',
            element: (
              <SuspenseWrap>
                <WhatsAppTemplateList />
              </SuspenseWrap>
            ),
          },
          {
            path: '/integrations/whatsapp',
            element: (
              <SuspenseWrap>
                <WhatsAppIntegrationPage />
              </SuspenseWrap>
            ),
          },
          {
            path: '/integrations/mail',
            element: (
              <SuspenseWrap>
                <MailIntegrationPage />
              </SuspenseWrap>
            ),
          },
          {
            path: '/reports',
            children: [
              {
                index: true,
                element: (
                  <SuspenseWrap>
                    <ReportsPage />
                  </SuspenseWrap>
                ),
              },
              {
                path: 'tours',
                element: (
                  <SuspenseWrap>
                    <ToursReport />
                  </SuspenseWrap>
                ),
              },
              {
                path: 'mis',
                element: (
                  <SuspenseWrap>
                    <MisReport />
                  </SuspenseWrap>
                ),
              },
              {
                path: 'profit-loss',
                element: (
                  <SuspenseWrap>
                    <ProfitLossReport />
                  </SuspenseWrap>
                ),
              },
              {
                path: 'enquiries',
                element: (
                  <SuspenseWrap>
                    <EnquiryReport />
                  </SuspenseWrap>
                ),
              },
              {
                path: 'expenses',
                element: (
                  <SuspenseWrap>
                    <ExpenseReport />
                  </SuspenseWrap>
                ),
              },
              {
                path: 'customers',
                element: (
                  <SuspenseWrap>
                    <CustomerReport />
                  </SuspenseWrap>
                ),
              },
              {
                path: 'vehicles',
                element: (
                  <SuspenseWrap>
                    <VehicleReport />
                  </SuspenseWrap>
                ),
              },
              {
                path: 'drivers',
                element: (
                  <SuspenseWrap>
                    <DriverReport />
                  </SuspenseWrap>
                ),
              },
              {
                path: 'follow-ups',
                element: (
                  <SuspenseWrap>
                    <UserFollowUpReport />
                  </SuspenseWrap>
                ),
              },
              {
                path: 'attendance',
                element: (
                  <SuspenseWrap>
                    <UserAttendanceReport />
                  </SuspenseWrap>
                ),
              },
            ],
          },
          {
            path: '/settings',
            element: (
              <SuspenseWrap>
                <SettingsPage />
              </SuspenseWrap>
            ),
          },
          {
            path: '/notifications',
            element: (
              <SuspenseWrap>
                <NotificationList />
              </SuspenseWrap>
            ),
          },
          {
            path: '/audit-logs',
            element: (
              <SuspenseWrap>
                <AuditLogList />
              </SuspenseWrap>
            ),
          },
          {
            path: '/login-history',
            element: (
              <SuspenseWrap>
                <LoginHistoryPage />
              </SuspenseWrap>
            ),
          },
          {
            path: '/unauthorized',
            element: (
              <SuspenseWrap>
                <Unauthorized />
              </SuspenseWrap>
            ),
          },
          {
            path: '*',
            element: (
              <SuspenseWrap>
                <NotFound />
              </SuspenseWrap>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
