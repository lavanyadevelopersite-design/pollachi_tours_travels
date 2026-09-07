require('dotenv').config();
const { Op } = require('sequelize');
const { sequelize, LeadStatus, Enquiry } = require('../src/models');

(async () => {
  await sequelize.authenticate();

  const newEnquiry = await LeadStatus.findOne({
    where: { lead_status: 'New Enquiry', is_active: true },
  });
  if (!newEnquiry) {
    throw new Error('Lead Status "New Enquiry" not found in master');
  }

  const validIds = (
    await LeadStatus.findAll({ attributes: ['id'], where: { is_active: true }, raw: true })
  ).map((r) => r.id);

  const [affected] = await Enquiry.update(
    { lead_status_id: newEnquiry.id },
    {
      where: {
        [Op.or]: [
          { lead_status_id: null },
          { lead_status_id: { [Op.notIn]: validIds } },
        ],
      },
    }
  );

  console.log(`Updated ${affected} enquiries to New Enquiry (${newEnquiry.id}) color ${newEnquiry.button_color}`);

  const [counts] = await sequelize.query(`
    SELECT ls.lead_status AS status, ls.button_color, COUNT(*) AS cnt
    FROM enquiries e
    LEFT JOIN lead_status_master ls ON ls.id = e.lead_status_id
    GROUP BY ls.lead_status, ls.button_color
  `);
  console.table(counts);
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
