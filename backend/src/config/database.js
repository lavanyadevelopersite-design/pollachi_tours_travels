require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('./logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tours_travels_crm',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    define: {
      underscored: true,
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Prefer authenticate-only on existing XAMPP DBs. Full sync with cyclic FKs
    // often fails (errno 150) due to charset/collation mismatches across tables.
    // Set DB_SYNC=true only when intentionally creating missing tables.
    if (String(process.env.DB_SYNC || '').toLowerCase() === 'true') {
      const qi = sequelize.getQueryInterface();
      const conn = await sequelize.connectionManager.getConnection();
      try {
        await qi.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { connection: conn });
        // Run sync on the same connection so FK checks stay disabled
        await sequelize.sync({ logging: false });
        await qi.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { connection: conn });
        logger.info('Database models synchronized');
      } finally {
        sequelize.connectionManager.releaseConnection(conn);
      }
    } else {
      logger.info('Skipping sequelize.sync() (set DB_SYNC=true to enable)');
    }

    // Ensure new enquiry vehicle assignment table exists without full DB sync.
    try {
      const [rows] = await sequelize.query(
        "SHOW TABLES LIKE 'enquiry_vehicle_assignments'"
      );
      if (!rows || rows.length === 0) {
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS enquiry_vehicle_assignments (
            id CHAR(36) NOT NULL PRIMARY KEY,
            enquiry_id CHAR(36) NOT NULL,
            vehicle_id CHAR(36) NOT NULL,
            driver_id CHAR(36) NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            pickup_location VARCHAR(255) NULL,
            drop_location VARCHAR(255) NULL,
            amount DECIMAL(12,2) DEFAULT 0.00,
            status VARCHAR(50) DEFAULT 'allocated',
            trip_status VARCHAR(50) NULL,
            starting_km DECIMAL(12,2) NULL,
            starting_km_photo VARCHAR(500) NULL,
            closing_km DECIMAL(12,2) NULL,
            closing_km_photo VARCHAR(500) NULL,
            total_km DECIMAL(12,2) NULL,
            driver_update_notes TEXT NULL,
            status_updated_at DATETIME NULL,
            trip_status_history JSON NULL,
            notes TEXT NULL,
            created_by CHAR(36) NULL,
            updated_by CHAR(36) NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            deleted_at DATETIME NULL,
            INDEX idx_eva_enquiry (enquiry_id),
            INDEX idx_eva_vehicle (vehicle_id),
            INDEX idx_eva_driver (driver_id),
            INDEX idx_eva_dates (start_date, end_date)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        logger.info('Created enquiry_vehicle_assignments table');
      } else {
        const tripColumns = [
          ['trip_status', 'VARCHAR(50) NULL'],
          ['starting_km', 'DECIMAL(12,2) NULL'],
          ['starting_km_photo', 'VARCHAR(500) NULL'],
          ['closing_km', 'DECIMAL(12,2) NULL'],
          ['closing_km_photo', 'VARCHAR(500) NULL'],
          ['total_km', 'DECIMAL(12,2) NULL'],
          ['driver_update_notes', 'TEXT NULL'],
          ['status_updated_at', 'DATETIME NULL'],
          ['trip_status_history', 'JSON NULL'],
        ];
        for (const [column, definition] of tripColumns) {
          const [colRows] = await sequelize.query(
            `SHOW COLUMNS FROM enquiry_vehicle_assignments LIKE '${column}'`
          );
          if (!colRows || colRows.length === 0) {
            await sequelize.query(
              `ALTER TABLE enquiry_vehicle_assignments ADD COLUMN ${column} ${definition}`
            );
            logger.info(`Added enquiry_vehicle_assignments.${column}`);
          }
        }
      }
    } catch (tableErr) {
      logger.warn('Could not ensure enquiry_vehicle_assignments table:', tableErr.message);
    }

    // Driver trip status history log (one row per status update).
    try {
      const [logTable] = await sequelize.query(
        "SHOW TABLES LIKE 'enquiry_vehicle_assignment_status_logs'"
      );
      if (!logTable || logTable.length === 0) {
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS enquiry_vehicle_assignment_status_logs (
            id CHAR(36) NOT NULL PRIMARY KEY,
            assignment_id CHAR(36) NOT NULL,
            enquiry_id CHAR(36) NOT NULL,
            driver_id CHAR(36) NULL,
            status VARCHAR(50) NOT NULL,
            label VARCHAR(255) NOT NULL,
            recorded_at DATETIME NOT NULL,
            created_by CHAR(36) NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            deleted_at DATETIME NULL,
            INDEX idx_eva_status_log_assignment (assignment_id),
            INDEX idx_eva_status_log_enquiry (enquiry_id),
            INDEX idx_eva_status_log_recorded (recorded_at)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        logger.info('Created enquiry_vehicle_assignment_status_logs table');
      }
    } catch (logTableErr) {
      logger.warn('Could not ensure enquiry_vehicle_assignment_status_logs table:', logTableErr.message);
    }

    // Lead status WhatsApp message templates.
    try {
      const [waTable] = await sequelize.query(
        "SHOW TABLES LIKE 'lead_status_whatsapp_templates'"
      );
      if (!waTable || waTable.length === 0) {
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS lead_status_whatsapp_templates (
            id CHAR(36) NOT NULL PRIMARY KEY,
            lead_status_id CHAR(36) NULL,
            template_name VARCHAR(150) NOT NULL,
            template_content TEXT NOT NULL,
            template_id VARCHAR(100) NULL,
            language_code VARCHAR(20) NOT NULL DEFAULT 'en_US',
            include_itinerary TINYINT(1) NOT NULL DEFAULT 0,
            header_media_url VARCHAR(500) NULL,
            message_notes TEXT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_by CHAR(36) NULL,
            updated_by CHAR(36) NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            deleted_at DATETIME NULL,
            UNIQUE KEY uq_whatsapp_template_name (template_name),
            INDEX idx_ls_whatsapp_active (is_active)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        logger.info('Created lead_status_whatsapp_templates table');
      } else {
        const [contentCol] = await sequelize.query(
          "SHOW COLUMNS FROM lead_status_whatsapp_templates LIKE 'template_content'"
        );
        if (!contentCol || contentCol.length === 0) {
          await sequelize.query(
            'ALTER TABLE lead_status_whatsapp_templates ADD COLUMN template_content TEXT NULL AFTER template_name'
          );
          await sequelize.query(
            "UPDATE lead_status_whatsapp_templates SET template_content = COALESCE(message_notes, template_name, 'WhatsApp message') WHERE template_content IS NULL"
          );
          await sequelize.query(
            'ALTER TABLE lead_status_whatsapp_templates MODIFY COLUMN template_content TEXT NOT NULL'
          ).catch(() => {});
          logger.info('Added lead_status_whatsapp_templates.template_content');
        }

        const [leadStatusCol] = await sequelize.query(
          "SHOW COLUMNS FROM lead_status_whatsapp_templates LIKE 'lead_status_id'"
        );
        if (leadStatusCol && leadStatusCol.length > 0 && leadStatusCol[0].Null === 'NO') {
          await sequelize.query(
            'ALTER TABLE lead_status_whatsapp_templates MODIFY COLUMN lead_status_id CHAR(36) NULL'
          ).catch(() => {});
          logger.info('Made lead_status_whatsapp_templates.lead_status_id nullable');
        }

        const [oldUnique] = await sequelize.query(
          "SHOW INDEX FROM lead_status_whatsapp_templates WHERE Key_name = 'uq_ls_whatsapp_lead_status'"
        );
        if (oldUnique && oldUnique.length > 0) {
          await sequelize.query(
            'ALTER TABLE lead_status_whatsapp_templates DROP INDEX uq_ls_whatsapp_lead_status'
          ).catch(() => {});
          logger.info('Dropped lead_status unique index on whatsapp templates');
        }

        const [nameUnique] = await sequelize.query(
          "SHOW INDEX FROM lead_status_whatsapp_templates WHERE Key_name = 'uq_whatsapp_template_name'"
        );
        if (!nameUnique || nameUnique.length === 0) {
          await sequelize.query(`
            UPDATE lead_status_whatsapp_templates wt
            INNER JOIN lead_status_master ls ON ls.id = wt.lead_status_id
            SET wt.template_name = ls.lead_status
            WHERE wt.lead_status_id IS NOT NULL
              AND (wt.template_name IS NULL OR wt.template_name = '' OR wt.template_name = 'trip_booking_confirmation')
          `).catch(() => {});
          await sequelize.query(
            "UPDATE lead_status_whatsapp_templates SET template_name = CONCAT('Template ', LEFT(id, 8)) WHERE template_name IS NULL OR template_name = ''"
          ).catch(() => {});
          await sequelize.query(
            'ALTER TABLE lead_status_whatsapp_templates ADD UNIQUE KEY uq_whatsapp_template_name (template_name)'
          ).catch(() => {});
          logger.info('Added unique index on whatsapp template_name');
        }
      }
    } catch (waTableErr) {
      logger.warn('Could not ensure lead_status_whatsapp_templates table:', waTableErr.message);
    }

    try {
      const [convTable] = await sequelize.query("SHOW TABLES LIKE 'whatsapp_conversations'");
      if (!convTable || convTable.length === 0) {
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS whatsapp_conversations (
            id CHAR(36) NOT NULL PRIMARY KEY,
            phone_number VARCHAR(20) NOT NULL,
            contact_name VARCHAR(150) NULL,
            profile_image_url VARCHAR(500) NULL,
            enquiry_id CHAR(36) NULL,
            last_message_at DATETIME NULL,
            last_message_preview VARCHAR(500) NULL,
            last_message_direction ENUM('inbound', 'outbound') NULL,
            unread_count INT NOT NULL DEFAULT 0,
            status ENUM('open', 'closed', 'archived') NOT NULL DEFAULT 'open',
            wasender_session_id VARCHAR(50) NULL,
            metadata JSON NULL,
            created_by CHAR(36) NULL,
            updated_by CHAR(36) NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            deleted_at DATETIME NULL,
            UNIQUE KEY uq_wa_conv_phone (phone_number),
            INDEX idx_wa_conv_enquiry (enquiry_id),
            INDEX idx_wa_conv_last_msg (last_message_at),
            INDEX idx_wa_conv_status (status)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        logger.info('Created whatsapp_conversations table');
      }

      const [msgTable] = await sequelize.query("SHOW TABLES LIKE 'whatsapp_messages'");
      if (!msgTable || msgTable.length === 0) {
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS whatsapp_messages (
            id CHAR(36) NOT NULL PRIMARY KEY,
            conversation_id CHAR(36) NOT NULL,
            direction ENUM('inbound', 'outbound') NOT NULL,
            message_type ENUM('text', 'image', 'document', 'audio', 'video', 'location', 'template', 'other')
              NOT NULL DEFAULT 'text',
            body TEXT NULL,
            media_url VARCHAR(500) NULL,
            wasender_msg_id VARCHAR(100) NULL,
            status ENUM('pending', 'sent', 'delivered', 'read', 'failed', 'received') NOT NULL DEFAULT 'pending',
            error_message TEXT NULL,
            enquiry_id CHAR(36) NULL,
            sent_by CHAR(36) NULL,
            raw_payload JSON NULL,
            sent_at DATETIME NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            deleted_at DATETIME NULL,
            INDEX idx_wa_msg_conversation (conversation_id),
            INDEX idx_wa_msg_wasender_id (wasender_msg_id),
            INDEX idx_wa_msg_sent_at (sent_at)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        logger.info('Created whatsapp_messages table');
      }
    } catch (waInboxErr) {
      logger.warn('Could not ensure WhatsApp inbox tables:', waInboxErr.message);
    }

    // Public share link for customer itinerary view.
    try {
      const [shareCol] = await sequelize.query("SHOW COLUMNS FROM itineraries LIKE 'share_token'");
      if (!shareCol || shareCol.length === 0) {
        await sequelize.query(
          'ALTER TABLE itineraries ADD COLUMN share_token VARCHAR(64) NULL UNIQUE AFTER status'
        );
        logger.info('Added itineraries.share_token');
      }
    } catch (shareColErr) {
      logger.warn('Could not ensure itineraries.share_token:', shareColErr.message);
    }

    // Ensure users.driver_id exists for driver portal login linking.
    try {
      const [userCol] = await sequelize.query("SHOW COLUMNS FROM users LIKE 'driver_id'");
      if (!userCol || userCol.length === 0) {
        await sequelize.query(
          'ALTER TABLE users ADD COLUMN driver_id CHAR(36) NULL AFTER designation_id'
        );
        await sequelize.query(
          'CREATE INDEX idx_users_driver_id ON users (driver_id)'
        ).catch(() => {});
        logger.info('Added users.driver_id for driver portal');
      }
    } catch (userColErr) {
      logger.warn('Could not ensure users.driver_id:', userColErr.message);
    }

    // Ensure feedbacks table supports enquiry share links + multi ratings.
    try {
      const [fbTable] = await sequelize.query("SHOW TABLES LIKE 'feedbacks'");
      if (fbTable && fbTable.length > 0) {
        const feedbackColumns = [
          ['enquiry_id', 'CHAR(36) NULL'],
          ['share_token', 'VARCHAR(64) NULL'],
          ['transportation_rating', 'INT NULL'],
          ['overall_rating', 'INT NULL'],
          ['customer_support_rating', 'INT NULL'],
          ['staff_behaviour_rating', 'INT NULL'],
          ['submitted_at', 'DATETIME NULL'],
        ];
        for (const [column, definition] of feedbackColumns) {
          const [colRows] = await sequelize.query(
            `SHOW COLUMNS FROM feedbacks LIKE '${column}'`
          );
          if (!colRows || colRows.length === 0) {
            await sequelize.query(`ALTER TABLE feedbacks ADD COLUMN ${column} ${definition}`);
            logger.info(`Added feedbacks.${column}`);
          }
        }
        try {
          await sequelize.query(
            'ALTER TABLE feedbacks MODIFY COLUMN rating INT NULL'
          );
        } catch (_) {
          /* already nullable or unsupported */
        }
        try {
          await sequelize.query(
            'CREATE UNIQUE INDEX feedbacks_share_token_unique ON feedbacks (share_token)'
          );
        } catch (_) {
          /* index may already exist */
        }
      }
    } catch (fbErr) {
      logger.warn('Could not ensure feedbacks columns:', fbErr.message);
    }

    // Vehicle master: ownership + image (supplier_id already exists).
    try {
      const [vehTable] = await sequelize.query("SHOW TABLES LIKE 'vehicles'");
      if (vehTable && vehTable.length > 0) {
        const vehicleColumns = [
          ['ownership', "VARCHAR(20) NOT NULL DEFAULT 'own'"],
          ['image', 'VARCHAR(500) NULL'],
          ['availability_status', "VARCHAR(30) NULL DEFAULT 'available'"],
        ];
        for (const [column, definition] of vehicleColumns) {
          const [colRows] = await sequelize.query(
            `SHOW COLUMNS FROM vehicles LIKE '${column}'`
          );
          if (!colRows || colRows.length === 0) {
            await sequelize.query(`ALTER TABLE vehicles ADD COLUMN ${column} ${definition}`);
            logger.info(`Added vehicles.${column}`);
          }
        }
      }
    } catch (vehErr) {
      logger.warn('Could not ensure vehicles columns:', vehErr.message);
    }

    // Driver master: own / vendor type + vendor link.
    try {
      const [drvTable] = await sequelize.query("SHOW TABLES LIKE 'tt_drivers'");
      if (drvTable && drvTable.length > 0) {
        const driverColumns = [
          ['driver_type', "VARCHAR(20) NOT NULL DEFAULT 'own'"],
          ['supplier_id', 'CHAR(36) NULL'],
        ];
        for (const [column, definition] of driverColumns) {
          const [colRows] = await sequelize.query(
            `SHOW COLUMNS FROM tt_drivers LIKE '${column}'`
          );
          if (!colRows || colRows.length === 0) {
            await sequelize.query(`ALTER TABLE tt_drivers ADD COLUMN ${column} ${definition}`);
            logger.info(`Added tt_drivers.${column}`);
          }
        }
      }
    } catch (drvErr) {
      logger.warn('Could not ensure tt_drivers columns:', drvErr.message);
    }
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = { sequelize, connectDatabase };
