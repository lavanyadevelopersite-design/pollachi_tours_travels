const { sequelize } = require('../config/database');

const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const RefreshToken = require('./RefreshToken');
const TokenBlacklist = require('./TokenBlacklist');
const AuditLog = require('./AuditLog');
const Branch = require('./Branch');
const Destination = require('./Destination');
const Package = require('./Package');
const Hotel = require('./Hotel');
const Vehicle = require('./Vehicle');
const Supplier = require('./Supplier');
const LeadStatus = require('./LeadStatus');
const LeadSourceType = require('./LeadSourceType');
const PackageTerms = require('./PackageTerms');
const InclusionExclusion = require('./InclusionExclusion');
const Currency = require('./Currency');
const Country = require('./Country');
const State = require('./State');
const City = require('./City');
const PaymentMode = require('./PaymentMode');
const Tax = require('./Tax');
const SeasonPricing = require('./SeasonPricing');
const ExpensesType = require('./ExpensesType');
const Department = require('./Department');
const Designation = require('./Designation');
const Driver = require('./Driver');
const DriverProof = require('./DriverProof');
const Guide = require('./Guide');
const Lead = require('./Lead');
const Enquiry = require('./Enquiry');
const EnquiryNote = require('./EnquiryNote');
const FollowUp = require('./FollowUp');
const Quotation = require('./Quotation');
const Booking = require('./Booking');
const HotelReservation = require('./HotelReservation');
const VehicleAllocation = require('./VehicleAllocation');
const EnquiryVehicleAssignment = require('./EnquiryVehicleAssignment');
const EnquiryVehicleAssignmentStatusLog = require('./EnquiryVehicleAssignmentStatusLog');
const LeadStatusWhatsAppTemplate = require('./LeadStatusWhatsAppTemplate');
const FlightBooking = require('./FlightBooking');
const Invoice = require('./Invoice');
const Receipt = require('./Receipt');
const Payment = require('./Payment');
const SupplierPayment = require('./SupplierPayment');
const Expense = require('./Expense');
const Cancellation = require('./Cancellation');
const Refund = require('./Refund');
const Feedback = require('./Feedback');
const Notification = require('./Notification');
const Itinerary = require('./Itinerary');
const ItineraryDestination = require('./ItineraryDestination');
const ItineraryDay = require('./ItineraryDay');
const ItineraryEvent = require('./ItineraryEvent');
const Setting = require('./Setting');
const LoginHistory = require('./LoginHistory');
const UserTablePreference = require('./UserTablePreference');
const WhatsAppConversation = require('./WhatsAppConversation');
const WhatsAppMessage = require('./WhatsAppMessage');

// Role ↔ Permission
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions',
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles',
});

// User ↔ Role / Branch / Department / Designation
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Branch.hasMany(User, { foreignKey: 'branch_id', as: 'users' });
// constraints:false — PK collation on tt_departments/tt_designations is utf8mb4_bin;
// users columns use table collation (unicode_ci), so MariaDB rejects FK create (errno 150).
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department', constraints: false });
Department.hasMany(User, { foreignKey: 'department_id', as: 'users', constraints: false });
User.belongsTo(Designation, { foreignKey: 'designation_id', as: 'designation', constraints: false });
Designation.hasMany(User, { foreignKey: 'designation_id', as: 'users', constraints: false });

User.hasMany(UserTablePreference, {
  foreignKey: 'user_id',
  as: 'tablePreferences',
  constraints: false,
});
UserTablePreference.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  constraints: false,
});

// Tokens
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
TokenBlacklist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
LoginHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(LoginHistory, { foreignKey: 'user_id', as: 'loginHistories' });
LoginHistory.belongsTo(RefreshToken, { foreignKey: 'refresh_token_id', as: 'refreshToken' });

// Masters
Package.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });
Destination.hasMany(Package, { foreignKey: 'destination_id', as: 'packages' });
Hotel.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });
Destination.hasMany(Hotel, { foreignKey: 'destination_id', as: 'hotels' });
Vehicle.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
Supplier.hasMany(Vehicle, { foreignKey: 'supplier_id', as: 'vehicles' });

LeadStatus.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(LeadStatus, { foreignKey: 'created_by', as: 'leadStatuses' });

LeadSourceType.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(LeadSourceType, { foreignKey: 'created_by', as: 'leadSourceTypes' });

// constraints:false — XAMPP MariaDB rejects CHAR(36) BINARY FK vs users.id collation
PackageTerms.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
  constraints: false,
});
User.hasMany(PackageTerms, {
  foreignKey: 'created_by',
  as: 'packageTerms',
  constraints: false,
});

InclusionExclusion.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
  constraints: false,
});
User.hasMany(InclusionExclusion, {
  foreignKey: 'created_by',
  as: 'inclusionExclusions',
  constraints: false,
});

// Common Masters
Country.belongsTo(Currency, { foreignKey: 'currency_id', as: 'currency' });
Currency.hasMany(Country, { foreignKey: 'currency_id', as: 'countries' });

State.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });
Country.hasMany(State, { foreignKey: 'country_id', as: 'states' });

City.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });
Country.hasMany(City, { foreignKey: 'country_id', as: 'cities' });
City.belongsTo(State, { foreignKey: 'state_id', as: 'state' });
State.hasMany(City, { foreignKey: 'state_id', as: 'cities' });

// Administration Masters
Designation.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Department.hasMany(Designation, { foreignKey: 'department_id', as: 'designations' });

// Ops Masters — Drivers / Guides
Driver.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });
Vehicle.hasMany(Driver, { foreignKey: 'vehicle_id', as: 'drivers' });
Driver.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
Supplier.hasMany(Driver, { foreignKey: 'supplier_id', as: 'drivers' });
Driver.hasMany(DriverProof, { foreignKey: 'driver_id', as: 'proofs' });
DriverProof.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });
User.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver', constraints: false });
Driver.hasOne(User, { foreignKey: 'driver_id', as: 'portalUser', constraints: false });

// Leads / Enquiries / FollowUps
Lead.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
Lead.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Enquiry.belongsTo(Lead, { foreignKey: 'lead_id', as: 'lead' });
Enquiry.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });
Enquiry.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });
Enquiry.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
Enquiry.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Enquiry.belongsTo(Country, { foreignKey: 'country_id', as: 'country' });
Enquiry.belongsTo(State, { foreignKey: 'state_id', as: 'state' });
Enquiry.belongsTo(City, { foreignKey: 'city_id', as: 'city' });
Enquiry.belongsTo(LeadSourceType, { foreignKey: 'lead_source_id', as: 'leadSource' });
Enquiry.belongsTo(LeadStatus, { foreignKey: 'lead_status_id', as: 'leadStatus' });
Enquiry.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Enquiry.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });
Enquiry.hasMany(EnquiryNote, { foreignKey: 'enquiry_id', as: 'notes' });
EnquiryNote.belongsTo(Enquiry, { foreignKey: 'enquiry_id', as: 'enquiry' });
EnquiryNote.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
FollowUp.belongsTo(Lead, { foreignKey: 'lead_id', as: 'lead' });
FollowUp.belongsTo(Enquiry, { foreignKey: 'enquiry_id', as: 'enquiry' });
FollowUp.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
FollowUp.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });
FollowUp.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Payment.belongsTo(Enquiry, { foreignKey: 'enquiry_id', as: 'enquiry' });
Enquiry.hasMany(Payment, { foreignKey: 'enquiry_id', as: 'payments' });
Payment.belongsTo(Quotation, { foreignKey: 'quotation_id', as: 'quotation' });
Payment.belongsTo(User, { foreignKey: 'received_by', as: 'receiver' });
Payment.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Payment.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

// Quotation / Booking
Quotation.belongsTo(Enquiry, { foreignKey: 'enquiry_id', as: 'enquiry' });
Enquiry.hasMany(Quotation, { foreignKey: 'enquiry_id', as: 'quotations' });
Quotation.belongsTo(Lead, { foreignKey: 'lead_id', as: 'lead' });
Quotation.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });
Quotation.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });
Quotation.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Quotation.belongsTo(Itinerary, { foreignKey: 'itinerary_id', as: 'itinerary' });
Quotation.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
Quotation.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Itinerary.hasMany(Quotation, { foreignKey: 'itinerary_id', as: 'quotations' });

Booking.belongsTo(Quotation, { foreignKey: 'quotation_id', as: 'quotation' });
Booking.belongsTo(Enquiry, { foreignKey: 'enquiry_id', as: 'enquiry' });
Booking.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });
Booking.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });
Booking.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Booking.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
Booking.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Booking.hasMany(HotelReservation, { foreignKey: 'booking_id', as: 'hotelReservations' });
Booking.hasMany(VehicleAllocation, { foreignKey: 'booking_id', as: 'vehicleAllocations' });
Booking.hasMany(FlightBooking, { foreignKey: 'booking_id', as: 'flightBookings' });

HotelReservation.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
HotelReservation.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'hotel' });
VehicleAllocation.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
VehicleAllocation.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });
FlightBooking.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

Enquiry.hasMany(EnquiryVehicleAssignment, {
  foreignKey: 'enquiry_id',
  as: 'vehicleAssignments',
});
EnquiryVehicleAssignment.belongsTo(Enquiry, { foreignKey: 'enquiry_id', as: 'enquiry' });
EnquiryVehicleAssignment.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });
EnquiryVehicleAssignment.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });
Vehicle.hasMany(EnquiryVehicleAssignment, {
  foreignKey: 'vehicle_id',
  as: 'enquiryAssignments',
});
Driver.hasMany(EnquiryVehicleAssignment, {
  foreignKey: 'driver_id',
  as: 'enquiryAssignments',
});

LeadStatus.hasMany(LeadStatusWhatsAppTemplate, {
  foreignKey: 'lead_status_id',
  as: 'whatsappTemplates',
});
LeadStatusWhatsAppTemplate.belongsTo(LeadStatus, {
  foreignKey: 'lead_status_id',
  as: 'leadStatus',
});

EnquiryVehicleAssignment.hasMany(EnquiryVehicleAssignmentStatusLog, {
  foreignKey: 'assignment_id',
  as: 'statusLogs',
});
EnquiryVehicleAssignmentStatusLog.belongsTo(EnquiryVehicleAssignment, {
  foreignKey: 'assignment_id',
  as: 'assignment',
});
EnquiryVehicleAssignmentStatusLog.belongsTo(Enquiry, {
  foreignKey: 'enquiry_id',
  as: 'enquiry',
});
EnquiryVehicleAssignmentStatusLog.belongsTo(Driver, {
  foreignKey: 'driver_id',
  as: 'driver',
});
EnquiryVehicleAssignmentStatusLog.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});
Enquiry.hasMany(EnquiryVehicleAssignmentStatusLog, {
  foreignKey: 'enquiry_id',
  as: 'tripStatusLogs',
});

// Finance
Invoice.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Invoice.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Invoice.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Receipt.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
Receipt.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
SupplierPayment.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
SupplierPayment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Expense.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Expense.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
Expense.belongsTo(Branch, { foreignKey: 'branch_id', as: 'branch' });
Cancellation.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Refund.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Refund.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
Refund.belongsTo(Cancellation, { foreignKey: 'cancellation_id', as: 'cancellation' });
Feedback.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Feedback.belongsTo(Enquiry, { foreignKey: 'enquiry_id', as: 'enquiry' });
Enquiry.hasMany(Feedback, { foreignKey: 'enquiry_id', as: 'feedbacks' });

// Notifications / Itinerary / Settings
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Itinerary.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Itinerary.belongsTo(Quotation, { foreignKey: 'quotation_id', as: 'quotation' });
Itinerary.belongsTo(Enquiry, { foreignKey: 'enquiry_id', as: 'enquiry' });
Enquiry.hasMany(Itinerary, { foreignKey: 'enquiry_id', as: 'itineraries' });
Itinerary.belongsTo(Destination, { foreignKey: 'destination_id', as: 'destination' });
Itinerary.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });
Itinerary.hasMany(ItineraryDestination, {
  foreignKey: 'itinerary_id',
  as: 'destinations',
});
ItineraryDestination.belongsTo(Itinerary, {
  foreignKey: 'itinerary_id',
  as: 'itinerary',
});
Itinerary.hasMany(ItineraryDay, { foreignKey: 'itinerary_id', as: 'itineraryDays' });
ItineraryDay.belongsTo(Itinerary, { foreignKey: 'itinerary_id', as: 'itinerary' });
ItineraryDay.hasMany(ItineraryEvent, {
  foreignKey: 'itinerary_day_id',
  as: 'events',
});
ItineraryEvent.belongsTo(ItineraryDay, {
  foreignKey: 'itinerary_day_id',
  as: 'day',
});
Itinerary.hasMany(ItineraryEvent, { foreignKey: 'itinerary_id', as: 'events' });
ItineraryEvent.belongsTo(Itinerary, { foreignKey: 'itinerary_id', as: 'itinerary' });

WhatsAppConversation.hasMany(WhatsAppMessage, {
  foreignKey: 'conversation_id',
  as: 'messages',
  constraints: false,
});
WhatsAppMessage.belongsTo(WhatsAppConversation, {
  foreignKey: 'conversation_id',
  as: 'conversation',
  constraints: false,
});
WhatsAppConversation.belongsTo(Enquiry, {
  foreignKey: 'enquiry_id',
  as: 'enquiry',
  constraints: false,
});
Enquiry.hasMany(WhatsAppConversation, {
  foreignKey: 'enquiry_id',
  as: 'whatsappConversations',
  constraints: false,
});

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  RefreshToken,
  TokenBlacklist,
  AuditLog,
  Branch,
  Destination,
  Package,
  Hotel,
  Vehicle,
  Supplier,
  LeadStatus,
  LeadSourceType,
  PackageTerms,
  InclusionExclusion,
  ItineraryDestination,
  ItineraryDay,
  ItineraryEvent,
  Currency,
  Country,
  State,
  City,
  PaymentMode,
  Tax,
  SeasonPricing,
  ExpensesType,
  Department,
  Designation,
  Driver,
  DriverProof,
  Guide,
  Lead,
  Enquiry,
  EnquiryNote,
  FollowUp,
  Quotation,
  Booking,
  HotelReservation,
  VehicleAllocation,
  EnquiryVehicleAssignment,
  EnquiryVehicleAssignmentStatusLog,
  LeadStatusWhatsAppTemplate,
  FlightBooking,
  Invoice,
  Receipt,
  Payment,
  SupplierPayment,
  Expense,
  Cancellation,
  Refund,
  Feedback,
  Notification,
  Itinerary,
  Setting,
  LoginHistory,
  UserTablePreference,
  WhatsAppConversation,
  WhatsAppMessage,
};
