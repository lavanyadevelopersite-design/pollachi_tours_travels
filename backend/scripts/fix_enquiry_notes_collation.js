const { sequelize, Enquiry, EnquiryNote, User } = require('../src/models');

(async () => {
  try {
    await sequelize.query(`
      ALTER TABLE \`enquiry_notes\`
        CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('OK: enquiry_notes converted to utf8mb4_unicode_ci');

    const enquiry = await Enquiry.findOne({ order: [['created_at', 'DESC']] });
    if (!enquiry) {
      console.log('No enquiry found to attach note');
      process.exit(0);
    }

    const user = await User.findOne({ order: [['created_at', 'ASC']] });
    const note = await EnquiryNote.create({
      enquiry_id: enquiry.id,
      note: 'Test note from collation fix script',
      created_by: user?.id || null,
    });

    const loaded = await EnquiryNote.findByPk(note.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] }],
    });

    console.log('OK: test note created');
    console.log({
      id: loaded.id,
      enquiry_id: loaded.enquiry_id,
      note: loaded.note,
      created_by: loaded.created_by,
      creator: loaded.creator
        ? `${loaded.creator.first_name || ''} ${loaded.creator.last_name || ''}`.trim()
        : null,
    });

    // also verify join query used by listNotes
    const listed = await EnquiryNote.findAll({
      where: { enquiry_id: enquiry.id },
      include: [{ model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] }],
      order: [['created_at', 'DESC']],
      limit: 3,
    });
    console.log('OK: list with creator join works, count=', listed.length);
  } catch (e) {
    console.error('ERR:', e.message || e);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
