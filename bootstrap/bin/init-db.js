#!/usr/bin/env node

const { seedOnce } = require("../init-db");

async function initialize() {
  try {
    await seedOnce();
    console.log("Backend initialized successfully");
  } catch (error) {
    console.error("Error initializing backend:", error);
    process.exit(1);
  }
}

initialize();
