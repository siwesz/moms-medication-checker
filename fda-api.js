/**
 * FDA API Integration
 *
 * This file provides functions to search the FDA drug database
 * and extract safety information from the API responses.
 *
 * @author Siphumelelisiwe Gcwabaza
 * @version 1.0.0
 */

const https = require("https")

/**
 * Search the FDA database for a medication
 *
 * @param {string} medicationName - The name of the medication to search for
 * @returns {Promise<Object|null>} - The FDA data for the medication, or null if not found
 */
async function searchFDADatabase(medicationName) {
  return new Promise((resolve, reject) => {
    // Clean and encode the medication name for the API query
    const query = encodeURIComponent(medicationName.trim())

    // Build the FDA API URL - search by both brand name and generic name
    const url = `https://api.fda.gov/drug/label.json?search=(openfda.brand_name:"${query}"+openfda.generic_name:"${query}")&limit=1`

    console.log(`Searching FDA API for: ${medicationName}`)
    console.log(`FDA API URL: ${url}`)

    // Make the HTTPS request to the FDA API
    https
      .get(url, (res) => {
        let data = ""

        // Collect data chunks
        res.on("data", (chunk) => {
          data += chunk
        })

        // Process the complete response
        res.on("end", () => {
          try {
            // Parse the JSON response
            const response = JSON.parse(data)

            // Check for API errors or no results
            if (response.error) {
              console.log(`FDA API error: ${response.error.message}`)
              resolve(null) // No results found
            } else if (response.results && response.results.length > 0) {
              console.log(`FDA API found data for: ${medicationName}`)
              resolve(response.results[0])
            } else {
              console.log(`FDA API found no results for: ${medicationName}`)
              resolve(null)
            }
          } catch (e) {
            console.error("Error parsing FDA API response:", e)
            resolve(null)
          }
        })
      })
      .on("error", (err) => {
        console.error("Error fetching from FDA API:", err)
        resolve(null) // Resolve with null instead of rejecting to handle gracefully
      })
  })
}

/**
 * Try alternative search methods if the main search fails
 *
 * @param {string} medicationName - The name of the medication to search for
 * @returns {Promise<Object|null>} - The FDA data for the medication, or null if not found
 */
async function searchFDADatabaseAlternative(medicationName) {
  // Try a more general search if the specific search fails
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(medicationName.trim())

    // Use a more general search approach
    const url = `https://api.fda.gov/drug/label.json?search=${query}&limit=1`

    console.log(`Trying alternative FDA API search for: ${medicationName}`)

    https
      .get(url, (res) => {
        let data = ""

        res.on("data", (chunk) => {
          data += chunk
        })

        res.on("end", () => {
          try {
            const response = JSON.parse(data)

            if (response.error) {
              resolve(null)
            } else if (response.results && response.results.length > 0) {
              console.log(`Alternative FDA API search found data for: ${medicationName}`)
              resolve(response.results[0])
            } else {
              resolve(null)
            }
          } catch (e) {
            console.error("Error parsing alternative FDA API response:", e)
            resolve(null)
          }
        })
      })
      .on("error", (err) => {
        console.error("Error fetching from alternative FDA API:", err)
        resolve(null)
      })
  })
}

/**
 * Extract safety information from FDA data
 *
 * @param {Object} fdaData - The FDA data for a medication
 * @returns {Object|null} - Extracted safety information, or null if no data
 */
function extractSafetyInfo(fdaData) {
  if (!fdaData) return null

  // Initialize the safety information object
  const info = {
    brandName: getFirstValue(fdaData.openfda?.brand_name) || "Not available",
    genericName: getFirstValue(fdaData.openfda?.generic_name) || "Not available",
    warnings: [],
    warfarinIssue: false,
    heartIssue: false,
    pacemakerIssue: false,
    generalInfo: "",
    description: "",
  }

  // Extract warnings
  if (fdaData.boxed_warning && fdaData.boxed_warning.length > 0) {
    info.warnings.push(...formatWarnings(fdaData.boxed_warning[0]))
  }

  if (fdaData.warnings && fdaData.warnings.length > 0) {
    info.generalInfo = fdaData.warnings[0]
    info.warnings.push(...formatWarnings(fdaData.warnings[0]))
  } else if (fdaData.warning && fdaData.warning.length > 0) {
    info.generalInfo = fdaData.warning[0]
    info.warnings.push(...formatWarnings(fdaData.warning[0]))
  }

  // Extract description/indications
  if (fdaData.description && fdaData.description.length > 0) {
    info.description = fdaData.description[0]
  } else if (fdaData.indications_and_usage && fdaData.indications_and_usage.length > 0) {
    info.description = fdaData.indications_and_usage[0]
  }

  // Check for drug interactions
  if (fdaData.drug_interactions && fdaData.drug_interactions.length > 0) {
    const interactionsText = fdaData.drug_interactions[0].toLowerCase()

    // Check for warfarin/anticoagulant interactions
    if (
      interactionsText.includes("warfarin") ||
      interactionsText.includes("anticoagulant") ||
      interactionsText.includes("blood thinner")
    ) {
      info.warfarinIssue = true
      info.warnings.push("May interact with blood thinners like warfarin")
    }
  }

  // Check for specific warnings in all warning texts
  const warningText = [
    info.generalInfo || "",
    info.description || "",
    fdaData.precautions ? getFirstValue(fdaData.precautions) || "" : "",
    fdaData.contraindications ? getFirstValue(fdaData.contraindications) || "" : "",
  ]
    .join(" ")
    .toLowerCase()

  // Check for warfarin/anticoagulant warnings
  if (
    warningText.includes("warfarin") ||
    warningText.includes("anticoagulant") ||
    warningText.includes("blood thinner") ||
    warningText.includes("bleeding risk") ||
    warningText.includes("increased bleeding")
  ) {
    info.warfarinIssue = true
    if (!info.warnings.some((w) => w.toLowerCase().includes("warfarin") || w.toLowerCase().includes("blood thinner"))) {
      info.warnings.push("May interact with blood thinners like warfarin")
    }
  }

  // Check for heart-related warnings
  if (
    warningText.includes("heart") ||
    warningText.includes("cardiac") ||
    warningText.includes("cardiovascular") ||
    warningText.includes("arrhythmia") ||
    warningText.includes("heart rate") ||
    warningText.includes("heart failure")
  ) {
    info.heartIssue = true
    info.warnings.push("May affect heart conditions")
  }

  // Check for pacemaker warnings
  if (
    warningText.includes("pacemaker") ||
    warningText.includes("cardiac device") ||
    warningText.includes("implanted device") ||
    warningText.includes("cardiac implant")
  ) {
    info.pacemakerIssue = true
    info.warnings.push("May interfere with pacemakers")
  }

  // Add general warnings if none were found
  if (info.warnings.length === 0 && info.generalInfo) {
    // Split the general info into sentences and use the first few as warnings
    info.warnings = formatWarnings(info.generalInfo)
  }

  // Ensure we have at least some warnings
  if (info.warnings.length === 0) {
    info.warnings.push("No specific warnings found. Always consult with your healthcare provider.")
  }

  // Remove duplicate warnings
  info.warnings = [...new Set(info.warnings)]

  return info
}

/**
 * Helper function to get the first value from an array or undefined
 *
 * @param {Array} arr - The array to get the first value from
 * @returns {string|undefined} - The first value or undefined
 */
function getFirstValue(arr) {
  return arr && arr.length > 0 ? arr[0] : undefined
}

/**
 * Helper function to format warnings from a text block
 *
 * @param {string} text - The text to extract warnings from
 * @returns {Array} - Array of formatted warnings
 */
function formatWarnings(text) {
  if (!text) return []

  // Split the text into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10 && s.length < 150)

  // Take the first few sentences as warnings
  return sentences.slice(0, 5).map((s) => {
    // Capitalize first letter and add period if missing
    return s.charAt(0).toUpperCase() + s.slice(1) + (s.endsWith(".") ? "" : ".")
  })
}

module.exports = {
  searchFDADatabase,
  searchFDADatabaseAlternative,
  extractSafetyInfo,
}
