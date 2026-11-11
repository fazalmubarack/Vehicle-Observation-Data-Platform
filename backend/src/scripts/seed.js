require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Dataset = require('../models/Dataset');
const Observation = require('../models/Observation');
const { importDatasetWithRollback } = require('../services/csvService');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing demo data...');
    const demoEmail = 'demo.analyst@example.com';
    const existingDemoUser = await User.findOne({ email: demoEmail });

    if (existingDemoUser) {
      const userDatasets = await Dataset.find({ userId: existingDemoUser._id });
      for (const ds of userDatasets) {
        await Observation.deleteMany({ datasetId: ds._id });
      }
      await Dataset.deleteMany({ userId: existingDemoUser._id });
      await User.deleteOne({ _id: existingDemoUser._id });
      console.log('[Seed] Previous demo records cleaned up.');
    }

    console.log('[Seed] Creating demo analyst account...');
    const demoUser = await User.create({
      name: 'Demo Analyst',
      email: demoEmail,
      password: 'InterviewDemo123!',
    });

    console.log(`[Seed] User created: ${demoUser.email} (ID: ${demoUser._id})`);

    // Ingest sample dataset
    const sampleCsvPath = path.join(__dirname, '../../fixtures/sample_observations.csv');
    if (fs.existsSync(sampleCsvPath)) {
      console.log(`[Seed] Ingesting sample CSV dataset from: ${sampleCsvPath}`);
      const csvBuffer = fs.readFileSync(sampleCsvPath);
      const dataset = await importDatasetWithRollback(
        demoUser._id,
        'sample_vehicle_observations.csv',
        csvBuffer
      );
      console.log(
        `[Seed] Sample dataset imported successfully! Dataset ID: ${dataset._id}, Records: ${dataset.recordCount}`
      );
    }

    console.log('\n======================================================');
    console.log('   VEHICLE OBSERVATION PLATFORM SEED COMPLETE');
    console.log('======================================================');
    console.log(' Demo Login Credentials:');
    console.log(`   Email:    demo.analyst@example.com`);
    console.log(`   Password: InterviewDemo123!`);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();

