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

// Import the FDA API functions
const { searchFDADatabase, searchFDADatabaseAlternative, extractSafetyInfo } = require("./fda-api")

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
 * It checks multiple databases including the FDA API.
 *
 * @route GET /check-medication
 * @param {string} name - The name of the medication to check
 * @returns {Object} Medication safety information
 */
app.get("/check-medication", async (req, res) => {
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
  }

  // If not found in our local databases, try the FDA API
  try {
    console.log(`Searching FDA API for: ${medicationName}`)

    // Search the FDA database
    let fdaData = await searchFDADatabase(medicationName)

    // If not found, try alternative search method
    if (!fdaData) {
      console.log(`No results from primary FDA search, trying alternative search for: ${medicationName}`)
      fdaData = await searchFDADatabaseAlternative(medicationName)
    }

    if (fdaData) {
      // Extract safety information from the FDA data
      const safetyInfo = extractSafetyInfo(fdaData)

      if (safetyInfo) {
        console.log(`Found FDA data for: ${medicationName}`)

        // Format the response to match our expected format
        const response = {
          name: safetyInfo.brandName || medicationName,
          found: true,
          isSafe: !safetyInfo.heartIssue && !safetyInfo.pacemakerIssue && !safetyInfo.warfarinIssue,
          warfarinIssue: safetyInfo.warfarinIssue,
          heartIssue: safetyInfo.heartIssue,
          pacemakerIssue: safetyInfo.pacemakerIssue,
          medicationNames: {
            brand: safetyInfo.brandName || "Not available",
            generic: safetyInfo.genericName || "Not available",
          },
          generalInfo: safetyInfo.description || safetyInfo.generalInfo || "No detailed information available.",
          warnings: safetyInfo.warnings,
          dataSource: "FDA Medication Database",
        }

        return res.json(response)
      }
    }

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
  } catch (error) {
    console.error("Error searching medication:", error)

    return res.json({
      found: false,
      message: "Sorry, we couldn't find information about this medication.",
      error: "Error connecting to medication database",
    })
  }
})

/**
 * Helper function to generate relevant medication information
 * This function categorizes medications and returns specific information based on the category
 *
 * @param {string} medicationName - The name of the medication
 * @returns {string} Formatted information about the medication
 */
function generateMedicationInfo(medicationName) {
  // Common medication categories and their descriptions
  const medicationCategories = {
    painRelievers: [
      "panado",
      "disprin",
      "grandpa",
      "adco-dol",
      "mybulen",
      "nurofen",
      "voltaren",
      "paracetamol",
      "aspirin",
      "ibuprofen",
    ],
    coldAndFlu: ["corenza", "med-lemon", "sinutab", "allergex", "benylin", "demazin", "flusin", "actifed"],
    heartMedication: [
      "adco-bisocor",
      "bilocor",
      "tenston",
      "disprin cv",
      "lasix",
      "bisoprolol",
      "atenolol",
      "carvedilol",
    ],
    antibiotics: [
      "augmentin",
      "amuco",
      "ciplatrim",
      "purbac",
      "ciprobay",
      "amoxicillin",
      "azithromycin",
      "doxycycline",
    ],
    digestive: ["buscopan", "gaviscon", "rennie", "imodium", "nexiam", "losec", "laxettes", "dulcolax"],
    vitamins: ["berocca", "centrum", "vital", "slow-mag", "ferro-grad", "vitamin", "calcium", "magnesium"],
    allergy: ["texa", "zyrtec", "clarityne", "telfast", "rhinolast", "loratadine", "cetirizine"],
  }

  // Determine the category of the medication
  let category = "unknown"
  const medNameLower = medicationName.toLowerCase()

  for (const [cat, meds] of Object.entries(medicationCategories)) {
    if (meds.some((med) => medNameLower.includes(med) || med.includes(medNameLower))) {
      category = cat
      break
    }
  }

  // Generate a response based on the category
  switch (category) {
    case "painRelievers":
      return `**${medicationName} - Pain Reliever**

**How it works:**
${medicationName} works by blocking pain signals and reducing inflammation in the body. It belongs to a class of medications known as analgesics.

**Common uses:**
- Headaches and migraines
- Muscle aches and joint pain
- Fever reduction
- Menstrual cramps
- Minor injuries and inflammation

**Important information:**
- Take with food to reduce stomach irritation
- Don't exceed the recommended dosage (typically 1-2 tablets every 4-6 hours)
- Avoid alcohol while taking this medication
- Not recommended for long-term use without medical supervision
- May interact with blood thinners like warfarin

**When to seek medical help:**
- If pain persists for more than 5-7 days
- If you experience stomach pain, black stools, or vomiting
- If you develop a rash or difficulty breathing after taking`

    case "coldAndFlu":
      return `**${medicationName} - Cold & Flu Relief**

**How it works:**
${medicationName} contains ingredients that target multiple cold and flu symptoms, including decongestants, antihistamines, and sometimes pain relievers.

**Common uses:**
- Nasal congestion and sinus pressure
- Runny nose and sneezing
- Cough and sore throat
- Fever and body aches
- Allergic reactions

**Important information:**
- May cause drowsiness - avoid driving or operating machinery
- Don't combine with other cold medications to avoid ingredient overlap
- Stay hydrated while taking this medication
- Not recommended for people with high blood pressure or heart conditions
- Typically safe for short-term use (3-5 days)

**When to seek medical help:**
- If symptoms worsen or don't improve after 7 days
- If you develop high fever (above 39°C/102°F)
- If you experience severe headache or chest pain
- If you have difficulty breathing`

    case "heartMedication":
      return `**${medicationName} - Heart & Blood Pressure Medication**

**How it works:**
${medicationName} helps manage heart conditions by regulating heart rate, reducing blood pressure, or improving blood flow. It belongs to a class of medications that support cardiovascular health.

**Common uses:**
- High blood pressure management
- Heart rhythm regulation
- Prevention of heart attacks and strokes
- Management of heart failure
- Improving circulation

**Important information:**
- Take exactly as prescribed, at the same time each day
- Don't stop taking suddenly - this can cause serious complications
- Monitor your blood pressure regularly
- May cause dizziness when standing up quickly
- Avoid grapefruit juice as it may interact with this medication

**When to seek medical help:**
- If you experience chest pain or shortness of breath
- If you have unusual swelling in your ankles or feet
- If you feel extreme dizziness or faintness
- If your heart rate becomes very slow or irregular`

    case "antibiotics":
      return `**${medicationName} - Antibiotic**

**How it works:**
${medicationName} fights bacterial infections by killing bacteria or preventing them from multiplying. It targets specific types of bacteria that cause infections.

**Common uses:**
- Respiratory infections (bronchitis, pneumonia)
- Urinary tract infections
- Skin and soft tissue infections
- Ear and sinus infections
- Dental infections

**Important information:**
- Complete the full course even if you feel better
- Take at regular intervals as prescribed for consistent blood levels
- May cause digestive issues (take with food if recommended)
- Some antibiotics should not be taken with dairy products or certain minerals
- May reduce effectiveness of birth control pills

**When to seek medical help:**
- If you develop severe diarrhea
- If you have an allergic reaction (rash, itching, swelling)
- If your symptoms worsen despite taking the medication
- If you develop severe abdominal pain`

    case "digestive":
      return `**${medicationName} - Digestive Health Medication**

**How it works:**
${medicationName} helps manage digestive issues by reducing acid production, relieving spasms, or regulating bowel movements depending on the specific medication.

**Common uses:**
- Acid reflux and heartburn
- Stomach ulcers
- Irritable bowel syndrome
- Diarrhea or constipation
- Abdominal cramps and bloating

**Important information:**
- Some digestive medications work best when taken before meals
- Avoid alcohol and spicy foods while taking this medication
- Don't lie down immediately after taking acid reducers
- Long-term use of some digestive medications may affect nutrient absorption
- May interact with other medications, affecting their absorption

**When to seek medical help:**
- If you notice blood in your stool
- If you have severe, persistent abdominal pain
- If you experience unexplained weight loss
- If symptoms don't improve after 2 weeks of treatment`

    case "vitamins":
      return `**${medicationName} - Vitamin & Mineral Supplement**

**How it works:**
${medicationName} provides essential vitamins and minerals that may be lacking in your diet, supporting various bodily functions and overall health.

**Common uses:**
- Addressing nutritional deficiencies
- Supporting immune function
- Promoting bone health
- Enhancing energy levels
- Supporting nervous system function

**Important information:**
- Best absorbed when taken with food
- Some vitamins are water-soluble (B, C) while others are fat-soluble (A, D, E, K)
- Fat-soluble vitamins can accumulate in the body if taken in excess
- Iron supplements may cause constipation
- Calcium supplements may interfere with certain medications

**When to seek medical help:**
- If you experience unusual symptoms after starting supplements
- Before taking high-dose supplements if you have chronic health conditions
- If you're taking multiple supplements that may have overlapping ingredients`

    case "allergy":
      return `**${medicationName} - Allergy Medication**

**How it works:**
${medicationName} blocks histamine, a substance your body produces during an allergic reaction, helping to reduce allergy symptoms.

**Common uses:**
- Seasonal allergies (hay fever)
- Pet allergies
- Dust and mold allergies
- Mild allergic skin reactions
- Allergic rhinitis

**Important information:**
- Newer antihistamines cause less drowsiness than older ones
- May take 1-3 hours to start working
- Regular use during allergy season provides better protection
- Extended-release formulations provide longer symptom relief
- May be combined with decongestants for additional relief

**When to seek medical help:**
- If you experience severe allergic reactions (anaphylaxis)
- If you develop a rash or hives that spread quickly
- If you have difficulty breathing or swallowing
- If allergy symptoms persist despite medication`

    default:
      return `**${medicationName} - Medication Information**

**General information:**
${medicationName} is a medication that should be taken according to your healthcare provider's instructions. While I don't have specific details about this particular medication, here are some general medication guidelines.

**Best practices:**
- Take medications exactly as prescribed
- Keep a list of all medications you're taking
- Store in a cool, dry place away from direct sunlight
- Check expiration dates regularly
- Don't crush or split tablets unless specifically instructed

**Safety tips:**
- Inform all healthcare providers about all medications you take
- Learn about possible side effects and interactions
- Use the same pharmacy for all prescriptions when possible
- Consider using pill organizers if taking multiple medications
- Keep all medications out of reach of children

For specific information about ${medicationName}, please consult with your healthcare provider or pharmacist.`
  }
}

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

  if (!medicationName) {
    return res.status(400).json({
      success: false,
      message: "Medication name is required",
    })
  }

  // Generate medication-specific information using our helper function
  const response = generateMedicationInfo(medicationName)

  res.json({
    success: true,
    response: response,
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
