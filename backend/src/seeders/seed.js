require('dotenv').config();

const { Op } = require('sequelize');
const { connectDatabase } = require('../config/database');
const logger = require('../config/logger');
const { MODULES, ACTIONS } = require('../utils/constants');
const {
  sequelize,
  Role,
  Permission,
  RolePermission,
  User,
  Branch,
  Destination,
  Package,
  LeadStatus,
  LeadSourceType,
  Enquiry,
  PackageTerms,
  InclusionExclusion,
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
  Setting,
} = require('../models');

const seed = async () => {
  try {
    await connectDatabase();
    logger.info('Starting seed...');

    // Permissions
    const permissions = [];
    for (const module of MODULES) {
      for (const action of ACTIONS) {
        const code = `${module}.${action}`;
        const [permission] = await Permission.findOrCreate({
          where: { code },
          defaults: {
            name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module}`,
            code,
            module,
            action,
            description: `Permission to ${action} ${module}`,
          },
        });
        permissions.push(permission);
      }
    }
    logger.info('Permissions seeded: %s', permissions.length);

    // Super Admin role
    const [superAdminRole] = await Role.findOrCreate({
      where: { code: 'super_admin' },
      defaults: {
        name: 'Super Admin',
        code: 'super_admin',
        description: 'Full system access',
        is_active: true,
      },
    });

    await RolePermission.destroy({ where: { role_id: superAdminRole.id } });
    await RolePermission.bulkCreate(
      permissions.map((p) => ({
        role_id: superAdminRole.id,
        permission_id: p.id,
      }))
    );
    logger.info('Super Admin role linked to all permissions');

    // Sales Agent role (sample limited)
    const [salesRole] = await Role.findOrCreate({
      where: { code: 'sales_agent' },
      defaults: {
        name: 'Sales Agent',
        code: 'sales_agent',
        description: 'Sales and lead management',
        is_active: true,
      },
    });

    const salesModules = ['leads', 'enquiries', 'follow_ups', 'quotations', 'bookings', 'calendar', 'notifications', 'dashboard'];
    const salesPerms = permissions.filter(
      (p) => salesModules.includes(p.module) && ['view', 'create', 'edit'].includes(p.action)
    );
    await RolePermission.destroy({ where: { role_id: salesRole.id } });
    await RolePermission.bulkCreate(
      salesPerms.map((p) => ({ role_id: salesRole.id, permission_id: p.id }))
    );

    // Branches
    const [hq] = await Branch.findOrCreate({
      where: { code: 'HQ' },
      defaults: {
        name: 'Head Office',
        code: 'HQ',
        address: '100 Travel Plaza',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400001',
        phone: '+91-22-12345678',
        email: 'hq@tours.com',
        manager_name: 'Operations Head',
        is_active: true,
      },
    });

    await Branch.findOrCreate({
      where: { code: 'DEL' },
      defaults: {
        name: 'Delhi Branch',
        code: 'DEL',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        phone: '+91-11-87654321',
        email: 'delhi@tours.com',
        is_active: true,
      },
    });

    // Admin user
    const [admin] = await User.findOrCreate({
      where: { email: 'admin@tours.com' },
      defaults: {
        first_name: 'System',
        last_name: 'Admin',
        email: 'admin@tours.com',
        phone: '+91-9999999999',
        password: 'Admin@123',
        role_id: superAdminRole.id,
        branch_id: hq.id,
        is_active: true,
      },
    });

    if (admin.role_id !== superAdminRole.id) {
      await admin.update({ role_id: superAdminRole.id, branch_id: hq.id });
    }
    logger.info('Admin user ready: admin@tours.com / Admin@123');

    // Destinations
    const destinations = [
      { name: 'Goa', code: 'GOA', country: 'India', state: 'Goa', city: 'Panaji', description: 'Beach paradise' },
      { name: 'Manali', code: 'MAN', country: 'India', state: 'Himachal Pradesh', city: 'Manali', description: 'Hill station' },
      { name: 'Dubai', code: 'DXB', country: 'UAE', city: 'Dubai', description: 'Luxury city break' },
    ];

    const destRecords = {};
    for (const d of destinations) {
      const [rec] = await Destination.findOrCreate({
        where: { code: d.code },
        defaults: { ...d, is_active: true },
      });
      destRecords[d.code] = rec;
    }

    // Packages
    const packages = [
      {
        name: 'Goa Beach Escape 4N/5D',
        code: 'PKG-GOA-01',
        destination_id: destRecords.GOA.id,
        duration_days: 5,
        duration_nights: 4,
        base_price: 18999,
        description: 'Sun, sand and nightlife',
        inclusions: 'Hotel, breakfast, airport transfer',
        exclusions: 'Flights, personal expenses',
      },
      {
        name: 'Manali Snow Adventure 5N/6D',
        code: 'PKG-MAN-01',
        destination_id: destRecords.MAN.id,
        duration_days: 6,
        duration_nights: 5,
        base_price: 22499,
        description: 'Mountains and adventure sports',
        inclusions: 'Hotel, meals, sightseeing',
        exclusions: 'Flights, adventure activity fees',
      },
      {
        name: 'Dubai Highlights 3N/4D',
        code: 'PKG-DXB-01',
        destination_id: destRecords.DXB.id,
        duration_days: 4,
        duration_nights: 3,
        base_price: 45999,
        description: 'Iconic Dubai experiences',
        inclusions: 'Hotel, breakfast, city tour',
        exclusions: 'Visa, flights',
      },
    ];

    for (const p of packages) {
      await Package.findOrCreate({
        where: { code: p.code },
        defaults: { ...p, is_active: true },
      });
    }

    // Lead Statuses (pipeline order with button colors)
    const leadStatuses = [
      { lead_status: 'New Enquiry', button_color: '#3B82F6', is_active: true },
      { lead_status: 'Assign Enquiry', button_color: '#6366F1', is_active: true },
      { lead_status: 'Contacted Customer', button_color: '#06B6D4', is_active: true },
      { lead_status: 'Verified/ Qualified', button_color: '#14B8A6', is_active: true },
      { lead_status: 'Itinerary Preparation', button_color: '#8B5CF6', is_active: true },
      { lead_status: 'Proposal send', button_color: '#A855F7', is_active: true },
      { lead_status: 'Follow up -1', button_color: '#F59E0B', is_active: true },
      { lead_status: 'Follow up- 2', button_color: '#F97316', is_active: true },
      { lead_status: 'Negotiation', button_color: '#FB923C', is_active: true },
      { lead_status: 'Awaiting Advance', button_color: '#EAB308', is_active: true },
      { lead_status: 'Booking In progress', button_color: '#84CC16', is_active: true },
      { lead_status: 'Booking Confirmed', button_color: '#22C55E', is_active: true },
      { lead_status: 'Trip Ongoing', button_color: '#0EA5E9', is_active: true },
      { lead_status: 'Fully Paid', button_color: '#10B981', is_active: true },
      { lead_status: 'Trip Completed', button_color: '#059669', is_active: true },
      { lead_status: 'Feedback', button_color: '#64748B', is_active: true },
    ];

    const activeLeadStatusNames = leadStatuses.map((s) => s.lead_status);

    for (const status of leadStatuses) {
      const [row, created] = await LeadStatus.findOrCreate({
        where: { lead_status: status.lead_status },
        defaults: { ...status, created_by: admin.id },
      });
      if (!created) {
        await row.update({
          button_color: status.button_color,
          is_active: true,
          updated_by: admin.id,
        });
      }
    }

    // Deactivate legacy statuses not in the current pipeline
    await LeadStatus.update(
      { is_active: false, updated_by: admin.id },
      {
        where: {
          lead_status: { [Op.notIn]: activeLeadStatusNames },
          is_active: true,
        },
      }
    );

    // Remap orphan / inactive enquiry lead statuses to New Enquiry
    const newEnquiryStatus = await LeadStatus.findOne({
      where: { lead_status: 'New Enquiry', is_active: true },
    });
    if (newEnquiryStatus) {
      const validIds = (
        await LeadStatus.findAll({ attributes: ['id'], where: { is_active: true }, raw: true })
      ).map((r) => r.id);
      await Enquiry.update(
        { lead_status_id: newEnquiryStatus.id },
        {
          where: {
            [Op.or]: [
              { lead_status_id: null },
              { lead_status_id: { [Op.notIn]: validIds } },
            ],
          },
        }
      );
    }

    // Lead Source Types
    const leadSourceTypes = [
      { lead_source_type: 'Instagram', description: 'Leads from Instagram', is_active: true },
      { lead_source_type: 'Facebook', description: 'Leads from Facebook', is_active: true },
      { lead_source_type: 'Newspaper', description: 'Leads from newspaper ads', is_active: true },
      { lead_source_type: 'Reference', description: 'Leads from customer references', is_active: true },
      { lead_source_type: 'Website', description: 'Leads from company website', is_active: true },
      { lead_source_type: 'Walk-in', description: 'Walk-in enquiry leads', is_active: true },
      { lead_source_type: 'WhatsApp', description: 'Leads from WhatsApp', is_active: true },
    ];

    for (const source of leadSourceTypes) {
      await LeadSourceType.findOrCreate({
        where: { lead_source_type: source.lead_source_type },
        defaults: { ...source, created_by: admin.id },
      });
    }

    // Package Terms
    const packageTerms = [
      {
        heading: 'Cancellation Policy',
        description:
          'Cancellations made 15 days or more before departure will receive a full refund minus processing fees. Cancellations within 7–14 days will incur a 50% charge. No refund for cancellations within 7 days of departure.',
        is_active: true,
      },
      {
        heading: 'Payment Terms',
        description:
          'A minimum of 30% advance payment is required to confirm the booking. The remaining balance must be paid at least 7 days before the travel date.',
        is_active: true,
      },
      {
        heading: 'Child Policy',
        description:
          'Children below 5 years are complimentary without an extra bed. Children aged 5–11 years are charged 50% of the adult rate. Children 12 years and above are treated as adults.',
        is_active: true,
      },
      {
        heading: 'Hotel Check-in',
        description:
          'Standard hotel check-in time is 2:00 PM and check-out is 11:00 AM. Early check-in or late check-out is subject to hotel availability and may attract additional charges.',
        is_active: true,
      },
      {
        heading: 'Visa Terms',
        description:
          'Visa assistance is provided on a best-effort basis. Approval of visa is at the sole discretion of the embassy/consulate. Processing fees are non-refundable.',
        is_active: true,
      },
    ];

    for (const term of packageTerms) {
      await PackageTerms.findOrCreate({
        where: { heading: term.heading },
        defaults: { ...term, created_by: admin.id },
      });
    }

    // Inclusions & Exclusions
    const inclusionExclusions = [
      {
        type: 'inclusion',
        heading: 'Accommodation',
        description: 'Hotel stay as per the itinerary on twin/triple sharing basis.',
      },
      {
        type: 'inclusion',
        heading: 'Daily Breakfast',
        description: 'Complimentary breakfast at the hotel for all travelers.',
      },
      {
        type: 'inclusion',
        heading: 'Private Transfers',
        description: 'Private vehicle transfers for airport/hotel and sightseeing as mentioned.',
      },
      {
        type: 'inclusion',
        heading: 'Sightseeing',
        description: 'Local sightseeing as per the day-wise plan with applicable entry tickets where stated.',
      },
      {
        type: 'inclusion',
        heading: 'Driver Allowance',
        description: 'Driver bata / night halt charges included for private cab packages.',
      },
      {
        type: 'exclusion',
        heading: 'Airfare / Train Fare',
        description: 'Domestic or international flight and train tickets are not included unless mentioned.',
      },
      {
        type: 'exclusion',
        heading: 'Personal Expenses',
        description: 'Laundry, tips, telephone, mini-bar, and other personal expenses.',
      },
      {
        type: 'exclusion',
        heading: 'Meals Not Mentioned',
        description: 'Lunch, dinner, and beverages other than those specifically listed in inclusions.',
      },
      {
        type: 'exclusion',
        heading: 'Entrance Fees',
        description: 'Monument / park / activity entrance fees unless explicitly stated as included.',
      },
      {
        type: 'exclusion',
        heading: 'Travel Insurance',
        description: 'Travel insurance and medical expenses are not included in the package cost.',
      },
    ];

    for (const item of inclusionExclusions) {
      await InclusionExclusion.findOrCreate({
        where: { type: item.type, heading: item.heading },
        defaults: { ...item, is_active: true, created_by: admin.id },
      });
    }

    // Common Masters — Currency / Country / State / City
    const [inr] = await Currency.findOrCreate({
      where: { code: 'INR' },
      defaults: {
        name: 'Indian Rupee',
        code: 'INR',
        symbol: '₹',
        decimal_places: 2,
        exchange_rate: 1,
        is_default: true,
        is_active: true,
      },
    });
    await Currency.findOrCreate({
      where: { code: 'USD' },
      defaults: {
        name: 'US Dollar',
        code: 'USD',
        symbol: '$',
        decimal_places: 2,
        exchange_rate: 0.012,
        is_default: false,
        is_active: true,
      },
    });
    await Currency.findOrCreate({
      where: { code: 'AED' },
      defaults: {
        name: 'UAE Dirham',
        code: 'AED',
        symbol: 'AED',
        decimal_places: 2,
        exchange_rate: 0.044,
        is_default: false,
        is_active: true,
      },
    });

    const [india] = await Country.findOrCreate({
      where: { code: 'IN' },
      defaults: {
        name: 'India',
        code: 'IN',
        iso_numeric_code: '356',
        currency_id: inr.id,
        currency_per_rupees: 1,
        nationality: 'Indian',
        phone_code: '+91',
        is_active: true,
      },
    });

    const [tamilNadu] = await State.findOrCreate({
      where: { country_id: india.id, name: 'Tamil Nadu' },
      defaults: {
        country_id: india.id,
        name: 'Tamil Nadu',
        code: 'TN',
        is_active: true,
      },
    });

    await City.findOrCreate({
      where: { state_id: tamilNadu.id, name: 'Chennai' },
      defaults: {
        country_id: india.id,
        state_id: tamilNadu.id,
        name: 'Chennai',
        code: 'CHN',
        airport_code: 'MAA',
        is_active: true,
      },
    });

    const paymentModes = [
      { name: 'Cash', display_order: 1 },
      { name: 'UPI', display_order: 2 },
      { name: 'Credit Card', display_order: 3 },
      { name: 'Debit Card', display_order: 4 },
      { name: 'Bank Transfer', display_order: 5 },
      { name: 'Net Banking', display_order: 6 },
      { name: 'Cheque', display_order: 7 },
      { name: 'Wallet', display_order: 8 },
      { name: 'Pay Later', display_order: 9 },
    ];
    for (const mode of paymentModes) {
      await PaymentMode.findOrCreate({
        where: { name: mode.name },
        defaults: { ...mode, is_active: true },
      });
    }

    const taxes = [
      { name: 'GST 5%', tax_percentage: 5, tax_type: 'GST', applicable_on: 'Package' },
      { name: 'GST 12%', tax_percentage: 12, tax_type: 'GST', applicable_on: 'Package' },
      { name: 'GST 18%', tax_percentage: 18, tax_type: 'GST', applicable_on: 'Package' },
      { name: 'GST 28%', tax_percentage: 28, tax_type: 'GST', applicable_on: 'Package' },
    ];
    for (const tax of taxes) {
      await Tax.findOrCreate({
        where: { name: tax.name },
        defaults: { ...tax, is_active: true },
      });
    }

    const seasons = [
      { name: 'Peak Season', price_per_km: 60 },
      { name: 'Normal Season', price_per_km: 50 },
      { name: 'Off Season', price_per_km: 40 },
    ];
    for (const season of seasons) {
      await SeasonPricing.findOrCreate({
        where: { name: season.name },
        defaults: { ...season, is_active: true },
      });
    }

    const expenseTypes = [
      'Fuel',
      'Driver Allowance',
      'Food',
      'Accommodation',
      'Guide Charges',
      'Parking',
      'Toll',
      'Flight Booking',
      'Hotel Booking',
      'Miscellaneous',
    ];
    for (const name of expenseTypes) {
      await ExpensesType.findOrCreate({
        where: { name },
        defaults: { name, is_active: true },
      });
    }

    const departments = [
      { department_code: 'ADM', department_name: 'Administration', display_order: 1 },
      { department_code: 'SAL', department_name: 'Sales', display_order: 2 },
      { department_code: 'OPS', department_name: 'Operations', display_order: 3 },
      { department_code: 'FIN', department_name: 'Finance', display_order: 4 },
      { department_code: 'HR', department_name: 'HR', display_order: 5 },
      { department_code: 'VISA', department_name: 'Visa Processing', display_order: 6 },
      { department_code: 'TKT', department_name: 'Ticketing', display_order: 7 },
      { department_code: 'CS', department_name: 'Customer Support', display_order: 8 },
      { department_code: 'MKT', department_name: 'Marketing', display_order: 9 },
    ];
    const departmentMap = {};
    for (const dept of departments) {
      const [record] = await Department.findOrCreate({
        where: { department_code: dept.department_code },
        defaults: { ...dept, is_active: true },
      });
      departmentMap[dept.department_code] = record;
    }

    const designations = [
      { designation_code: 'MD', designation_name: 'Managing Director', department_code: 'ADM', hierarchy_level: 1 },
      { designation_code: 'GM', designation_name: 'General Manager', department_code: 'ADM', hierarchy_level: 2 },
      { designation_code: 'SM', designation_name: 'Sales Manager', department_code: 'SAL', hierarchy_level: 3 },
      { designation_code: 'TRC', designation_name: 'Travel Consultant', department_code: 'SAL', hierarchy_level: 5 },
      { designation_code: 'OM', designation_name: 'Operations Manager', department_code: 'OPS', hierarchy_level: 3 },
      { designation_code: 'FM', designation_name: 'Finance Manager', department_code: 'FIN', hierarchy_level: 3 },
      { designation_code: 'ACC', designation_name: 'Accountant', department_code: 'FIN', hierarchy_level: 5 },
      { designation_code: 'HRM', designation_name: 'HR Manager', department_code: 'HR', hierarchy_level: 3 },
      { designation_code: 'VE', designation_name: 'Visa Executive', department_code: 'VISA', hierarchy_level: 5 },
      { designation_code: 'TKE', designation_name: 'Ticketing Executive', department_code: 'TKT', hierarchy_level: 5 },
      { designation_code: 'CSE', designation_name: 'Customer Support Executive', department_code: 'CS', hierarchy_level: 5 },
      { designation_code: 'MKE', designation_name: 'Marketing Executive', department_code: 'MKT', hierarchy_level: 5 },
    ];
    for (const item of designations) {
      const department = departmentMap[item.department_code];
      if (!department) continue;
      await Designation.findOrCreate({
        where: { designation_code: item.designation_code },
        defaults: {
          designation_code: item.designation_code,
          designation_name: item.designation_name,
          department_id: department.id,
          hierarchy_level: item.hierarchy_level,
          is_active: true,
        },
      });
    }

    // Settings
    const settings = [
      { key: 'company_name', value: 'Pollachi Tours and Travels', group: 'general' },
      { key: 'company_logo', value: '', group: 'general', description: 'Company logo path' },
      { key: 'currency', value: 'INR', group: 'finance' },
      { key: 'tax_percent', value: '18', type: 'number', group: 'finance' },
      { key: 'invoice_prefix', value: 'INV', group: 'finance' },
      { key: 'booking_prefix', value: 'BK', group: 'operations' },
    ];

    for (const s of settings) {
      await Setting.findOrCreate({
        where: { key: s.key },
        defaults: {
          key: s.key,
          value: s.value,
          type: s.type || 'string',
          group: s.group,
        },
      });
    }

    // Drivers & Guides sample masters
    const seedDriversGuides = require('./seedDriversGuides');
    await seedDriversGuides();

    logger.info('Seed completed successfully');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed: %s', error.stack || error.message);
    process.exit(1);
  }
};

seed();
