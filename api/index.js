// This file is a Vercel serverless function entry point
// It re-exports the Express app from server.js

const app = require("../server.js")

module.exports = app
