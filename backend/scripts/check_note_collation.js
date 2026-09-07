const { sequelize } = require('../src/config/database');

(async () => {
  try {
    const [[notesStatus]] = await sequelize.query("SHOW TABLE STATUS LIKE 'enquiry_notes'");
    const [[usersStatus]] = await sequelize.query("SHOW TABLE STATUS LIKE 'users'");
    const [[enqStatus]] = await sequelize.query("SHOW TABLE STATUS LIKE 'enquiries'");
    const [noteCols] = await sequelize.query('SHOW FULL COLUMNS FROM enquiry_notes');
    const [userCols] = await sequelize.query("SHOW FULL COLUMNS FROM users WHERE Field IN ('id')");
    const [enqCols] = await sequelize.query(
      "SHOW FULL COLUMNS FROM enquiries WHERE Field IN ('id')"
    );

    console.log('TABLE Collations:');
    console.log('  enquiry_notes:', notesStatus?.Collation);
    console.log('  users:', usersStatus?.Collation);
    console.log('  enquiries:', enqStatus?.Collation);
    console.log('COLUMN Collations enquiry_notes:', noteCols.map((c) => [c.Field, c.Collation, c.Type]));
    console.log('COLUMN users.id:', userCols.map((c) => [c.Field, c.Collation, c.Type]));
    console.log('COLUMN enquiries.id:', enqCols.map((c) => [c.Field, c.Collation, c.Type]));
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
