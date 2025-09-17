#!/usr/bin/env node

const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function migrateToPourPayoffSchema() {
  console.log('🔄 Starting migration to The Pour & Payoff Planner™ schema...\n');

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Applying database schema...');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        if (statement.trim()) {
          await pool.query(statement);
          successCount++;
        }
      } catch (error) {
        // Some errors are expected (like table already exists)
        if (error.code === '42P07' || error.code === '42710') {
          console.log(`⚠️  ${error.code}: ${error.message.split('\n')[0]}`);
        } else {
          console.error(`❌ Error executing statement: ${error.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`📊 Successfully executed: ${successCount} statements`);
    if (errorCount > 0) {
      console.log(`⚠️  Errors encountered: ${errorCount} statements`);
    }

    // Verify key tables exist
    console.log('\n🔍 Verifying key tables...');
    const tables = [
      'users', 'user_settings', 'debts', 'payments', 
      'framework_steps', 'user_framework_progress', 'scenarios',
      'payment_reminders', 'calendar_events', 'devotionals',
      'user_devotional_progress', 'achievements', 'user_achievements',
      'data_exports'
    ];

    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ ${table}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`❌ ${table}: ${error.message}`);
      }
    }

    // Check framework steps
    console.log('\n📚 Framework Steps:');
    const frameworkResult = await pool.query('SELECT step_number, title FROM framework_steps ORDER BY step_number');
    frameworkResult.rows.forEach(step => {
      console.log(`   ${step.step_number}. ${step.title}`);
    });

    // Check achievements
    console.log('\n🏆 Achievements:');
    const achievementsResult = await pool.query('SELECT name, points FROM achievements ORDER BY points DESC');
    achievementsResult.rows.forEach(achievement => {
      console.log(`   ${achievement.name} (${achievement.points} points)`);
    });

    // Check devotionals
    console.log('\n📖 Devotionals:');
    const devotionalsResult = await pool.query('SELECT title, category FROM devotionals WHERE is_published = true');
    devotionalsResult.rows.forEach(devotional => {
      console.log(`   ${devotional.title} (${devotional.category})`);
    });

    console.log('\n🎉 The Pour & Payoff Planner™ database is ready!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your backend models to use the new schema');
    console.log('2. Create API endpoints for the new features');
    console.log('3. Test the framework steps and devotionals');
    console.log('4. Implement the calendar and reminder features');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToPourPayoffSchema();
}

module.exports = { migrateToPourPayoffSchema };

