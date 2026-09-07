/**
 * Restore WhatsApp templates after accidental truncate.
 * Usage: node scripts/restoreWhatsAppTemplates.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { randomUUID } = require('crypto');
const { sequelize, LeadStatusWhatsAppTemplate } = require('../src/models');
const logger = require('../src/config/logger');

const TEMPLATES = [
  {
    template_name: 'Vehicle_driver_assigned',
    template_content: `Dear {{customer_name}}, 👋

Your trip vehicle and driver have been successfully assigned. 🚐

Trip Details:
📅 Trip Date: {{trip_date}}
📍 Pickup Id: {{trip_id}}
🏁 Destination: {{trip_to_destination}}

Vehicle Details:
🚐 Vehicle No: {{vehicle_number}}
🚗 Vehicle Type: {{vehicle_type}}

Driver Details:
👨‍✈️ Driver Name: {{driver_name}}
📞 Driver Contact: {{driver_mobile}}

Please contact the driver directly if required.

Have a safe and comfortable journey! 😊

Thank you for choosing {{company_name}} 🙏`,
    lead_status_id: null,
  },
  {
    template_name: 'payment_Receipt',
    template_content: `Dear {{customer_name}}, 👋

Thank you for your payment. 🙏

Your Payment Receipt has been generated successfully.

Payment Details:
🧾 Receipt No: {{receipt_number}}
📅 Payment Date: {{payment_date}}
💰 Amount Paid: ₹{{paid_amount}}
💳 Payment Mode: {{payment_mode}}
📌 Trip Id: {{trip_id}}

Please find your payment receipt attached to this message. 📄

Thank you for choosing {{company_name}} 😊
We look forward to serving you!

{{company_name}}
📞 {{company_mobile}}`,
    lead_status_id: null,
  },
  {
    template_name: 'driver_login_credentials',
    template_content: `🚗 *Driver Login & Trip Details*

Dear *{{driver_name}}*,

Your driver login account has been created successfully.

👤 *Username:* {{username}}
🔐 *Password:* {{password}}
🔗 *Login Link:* {{login_link}}

📋 *Assigned Trip Details:*
• *Trip ID:* {{trip_id}}
• *Customer Name:* {{customer_name}}
• *Trip Date:* {{trip_date}}
• *Pickup Location:* {{pickup_location}}
• *Destination:* {{destination}}
• *Vehicle No:* {{vehicle_number}}

Please log in using the above credentials and check your complete trip details.

⚠️ Please keep your username and password confidential.

Thank you,
*{{company_name}}*`,
    lead_status_id: null,
  },
  {
    template_name: 'customer_feedback',
    template_content: `⭐ *We Value Your Feedback*

Dear *{{Customer Name}}*,

Thank you for choosing *{{Company Name}}* for your recent trip. 🙏

We hope you had a safe and pleasant journey with us. Your feedback is very valuable and helps us improve our services.

Please take a moment to share your experience by clicking the link below:

🔗 *Feedback Link:* {{FEEDBACK LINK}}

Thank you for your valuable time and feedback. We look forward to serving you again! 🚗✨

*{{Company Name}}*`,
    lead_status_id: null,
  },
  {
    template_name: 'Trip_completed',
    template_content: `🎉 *Trip Completed Successfully*

Dear *{{Customer Name}}*,

We are pleased to inform you that your trip has been completed successfully.

📋 *Trip Details:*
• *Trip ID:* {{TRIP ID}}
• *Trip Date:* {{TRIP DATE}}
• *Pickup:* {{PICKUP LOCATION}}
• *Destination:* {{DESTINATION}}
• *Vehicle No:* {{VEHICLE NUMBER}}

🧾 *Invoice Details:*
• *Invoice No:* {{INVOICE NUMBER}}
• *Invoice Date:* {{INVOICE DATE}}
• *Total Amount:* ₹ {{TOTAL AMOUNT}}
• *Paid Amount:* ₹ {{PAID AMOUNT}}
• *Balance Amount:* ₹ {{BALANCE AMOUNT}}

📎 Your invoice has been shared with this message for your reference.

Thank you for choosing *{{Company Name}}*. We look forward to serving you again! 🙏`,
    lead_status_id: null,
  },
  {
    template_name: 'Booking Confirmed',
    lead_status_id: '2519c449-7ebb-4fe3-886c-969a73ed2da6',
    template_content: `Dear {{Customer}},

Your Booking has been Confirmed.

Your trip Id is {{trip_id}}

Thanks for reaching Pollachi Tours & Travels`,
  },
  {
    template_name: 'Assign Enquiry',
    lead_status_id: '70d2dfb2-20c8-48e1-8c4e-2b4f87f6bcdb',
    template_content: `Dear {{Customer}}

Your Enquiry has been Verified and Assigned.

Your Trip Id is {{trip_id}}

Thanks for reaching Pollachi Tours & Travels`,
  },
  {
    template_name: 'Itinerary Preparation',
    lead_status_id: '34bbf414-bef5-455c-8372-b54a30f9074c',
    template_content: `Dear {{Customer}}

Greetings from {{company_name}}!

We are happy to share your travel itinerary for your upcoming trip.

Destination: {{destination}}
Travel Dates: {{travel_dates}}
Travellers: {{adults}} Adult(s), {{children}} Child(ren)

Your detailed itinerary includes the day-wise travel plan, destinations, activities, and other trip details.

Kindly review the itinerary and let us know if you need any changes or customization. We will be happy to assist you.

Thank you for choosing {{company_name}}!

Contact us: {{company_phone}}`,
  },
];

async function restore() {
  await sequelize.authenticate();
  logger.info('Restoring WhatsApp templates...');

  let created = 0;
  let skipped = 0;

  for (const item of TEMPLATES) {
    const existing = await LeadStatusWhatsAppTemplate.findOne({
      where: { template_name: item.template_name },
    });

    if (existing) {
      logger.info('Skipped (already exists): %s', item.template_name);
      skipped += 1;
      continue;
    }

    await LeadStatusWhatsAppTemplate.create({
      id: randomUUID(),
      lead_status_id: item.lead_status_id || null,
      template_name: item.template_name,
      template_content: item.template_content,
      language_code: 'en_US',
      include_itinerary: false,
      is_active: true,
    });
    logger.info('Restored: %s', item.template_name);
    created += 1;
  }

  const [count] = await sequelize.query(
    'SELECT COUNT(*) AS count FROM lead_status_whatsapp_templates'
  );
  logger.info('Done. Created: %s, skipped: %s, total in table: %s', created, skipped, count[0].count);
}

restore()
  .catch((error) => {
    logger.error('Restore failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
