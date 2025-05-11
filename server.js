/**
 * Mom's Medication Checker - Server
 *
 * This is the main server file for the Mom's Medication Checker application.
 * It sets up an Express server, serves static files, and provides API endpoints
 * for checking medication safety and getting AI assistant responses.
 *
 * @author Siphumelelisiwe Gcwabaza
 * @version 1.0.0
 */

const express = require("express")
const path = require("path")
const app = express()
const port = process.env.PORT || 3000

// Parse JSON request bodies for POST requests
app.use(express.json())

// Serve static files from the public directory
// This makes all files in the public directory accessible via HTTP
app.use(express.static(path.join(__dirname, "public")))

/**
 * Import the South African medications database
 * This database contains information about medications available in South Africa,
 * including their active ingredients, safety information, and warnings.
 */
let saMedications = []
try {
  // Import the database directly since we've modified it to use CommonJS
  saMedications = require("./sa-medications.js")
  console.log(`Successfully loaded ${saMedications.length} South African medications`)
} catch (error) {
  console.error("Error loading South African medications database:", error)
}

/**
 * API endpoint to check medication safety
 *
 * This endpoint takes a medication name and returns safety information
 * based on specific health conditions (heart condition, pacemaker, warfarin use).
 *
 * @route GET /check-medication
 * @param {string} name - The name of the medication to check
 * @returns {Object} Medication safety information
 */
app.get("/check-medication", (req, res) => {
  // Get the medication name from the query parameters and convert to lowercase for case-insensitive matching
  const medicationName = req.query.name.toLowerCase()

  // First, check the South African medications database
  // This is our primary and more comprehensive database
  const saMedication = saMedications.find((med) => med.name.toLowerCase() === medicationName)

  if (saMedication) {
    // Format the medication data to match our expected response format
    const response = {
      name: saMedication.name,
      found: true,
      isSafe: !saMedication.heartIssue && !saMedication.pacemakerIssue,
      warfarinIssue: saMedication.warfarinIssue,
      medicationNames: {
        brand: saMedication.name,
        generic: saMedication.activeIngredient,
      },
      generalInfo: saMedication.description,
      warnings: saMedication.warnings,
      dataSource: "South African Medication Database",
      category: saMedication.category,
      heartIssue: saMedication.heartIssue,
      pacemakerIssue: saMedication.pacemakerIssue,
    }

    return res.json(response)
  }

  /**
   * Mock database for testing and fallback
   * This is a smaller database used as a fallback if the medication
   * is not found in the South African database.
   */
  const medicationDatabase = {
    panado: {
      name: "Panado",
      found: true,
      isSafe: true,
      warfarinIssue: false,
      medicationNames: {
        brand: "Panado",
        generic: "Paracetamol",
      },
      generalInfo:
        "Panado is a common pain reliever and fever reducer. It's generally considered safe for most people when taken as directed.",
      warnings: ["Do not exceed the recommended dose", "Avoid alcohol when taking this medication"],
      dataSource: "South African Medication Database",
      category: "Pain & Fever",
    },
    disprin: {
      name: "Disprin",
      found: true,
      isSafe: false,
      warfarinIssue: true,
      medicationNames: {
        brand: "Disprin",
        generic: "Aspirin",
      },
      generalInfo: "Disprin contains aspirin which is used to relieve pain, reduce inflammation, and lower fever.",
      warnings: [
        "May increase risk of bleeding",
        "Not recommended for people on blood thinners",
        "May cause stomach irritation",
      ],
      dataSource: "South African Medication Database",
      category: "Pain & Fever",
    },
    "adco-bisocor": {
      name: "Adco-Bisocor",
      found: true,
      isSafe: true,
      warfarinIssue: false,
      medicationNames: {
        brand: "Adco-Bisocor",
        generic: "Bisoprolol",
      },
      generalInfo: "Adco-Bisocor is a beta-blocker used to treat high blood pressure and heart conditions.",
      warnings: ["Do not stop taking suddenly without consulting your doctor", "May cause dizziness or fatigue"],
      dataSource: "South African Medication Database",
      category: "Heart & Blood Pressure",
    },
  }

  // Check if the medication is in our mock database
  const medication = medicationDatabase[medicationName]

  if (medication) {
    return res.json(medication)
  } else {
    // If medication is not found, provide suggestions for similar medications
    // This helps users who might have misspelled the medication name
    const suggestions = []

    // Check SA database for similar medications
    saMedications.forEach((med) => {
      if (med.name.toLowerCase().includes(medicationName) || medicationName.includes(med.name.toLowerCase())) {
        suggestions.push(med.name)
      }
    })

    // Check mock database for similar medications
    Object.keys(medicationDatabase).forEach((med) => {
      if (med.includes(medicationName) || medicationName.includes(med)) {
        suggestions.push(medicationDatabase[med].name)
      }
    })

    // Remove duplicates and limit to 3 suggestions
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 3)

    return res.json({
      found: false,
      message: "Sorry, we couldn't find information about this medication.",
      suggestions: uniqueSuggestions.length > 0 ? uniqueSuggestions : undefined,
    })
  }
})

/**
 * API endpoint for AI assistant
 *
 * This endpoint takes a medication name and returns additional information
 * about the medication from the AI assistant.
 *
 * @route POST /ask-ai
 * @param {Object} req.body - Request body
 * @param {string} req.body.medicationName - The name of the medication to get information about
 * @returns {Object} AI assistant response
 */
app.post("/ask-ai", (req, res) => {
  const medicationName = req.body.medicationName

  // Mock AI response
  // In a production environment, this would call an actual AI service
  res.json({
    success: true,
    response: `**About ${medicationName}**\n\nThis is additional information that would be provided by an AI assistant. Please consult with your healthcare provider for accurate medical advice.\n\n- Always follow your doctor's instructions\n- Report any unusual side effects\n- Keep all medications out of reach of children`,
  })
})

/**
 * Route handler for the /app path
 * Serves the app.html file when /app is accessed
 */
app.get("/app", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "app.html"))
})

/**
 * Route handler for the root path (/)
 * Serves the index.html file (splash page) when the root URL is accessed
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// For Vercel serverless functions
if (process.env.VERCEL) {
  // Export the Express app as a serverless function
  module.exports = app
} else {
  /**
   * Start the server and listen for incoming requests
   * The server will listen on the specified port (default: 3000)
   */
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    console.log(`Open http://localhost:${port} in your browser to see the splash page`)
  })
}
