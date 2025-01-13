const { exec } = require('child_process');
const dotenv = require('dotenv');
const { Client } = require('pg');

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

const checkIfSeeded = async () => {
  try {
    await client.connect();
    const user = await client.query('SELECT 1 FROM "user" LIMIT 1;');
    return user.rows.length > 0;
  } catch (error) {
    if (error.message.includes('relation "user" does not exist')) {
      return false;
    }
    console.error('Unexpected error checking if database is seeded:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        reject(error);
        return;
      }
      console.log(`stdout: ${stdout}`);
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      resolve();
    });
  });
};

const seedDatabase = async () => {
  try {
    console.log('Running seed script...');
    await runCommand('yarn seed');
    
    const adminEmail = process.env.MEDUSA_ADMIN_EMAIL;
    const adminPassword = process.env.MEDUSA_ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      console.log('Creating admin user...');
      await runCommand(`npx medusa user -e "${adminEmail}" -p "${adminPassword}"`);
    }
    
    console.log('Database seeded and admin user created successfully.');
    return;
    
  } catch (error) {
    console.error('Failed to seed database or create admin user:', error);
    process.exit(1);
  }
};

const seedOnce = async () => {
  console.log('Running migrations...');
  await runCommand('npx medusa db:migrate');
  console.log("Checking if database is seeded...");
  const isSeeded = await checkIfSeeded();
  if (!isSeeded) {
    console.log('Database is not seeded. Seeding now...');
    await seedDatabase();
  } else {
    console.log('Database is already seeded. Skipping seeding.');
  }
};

module.exports = {
  seedOnce
};