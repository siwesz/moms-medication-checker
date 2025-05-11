/**
 * Mom's Medication Checker - Client-side JavaScript
 *
 * This file contains all the client-side functionality for the medication checker application.
 * It handles search suggestions, medication checking, history tracking, and UI interactions.
 *
 * @author Siphumelelisiwe Gcwabaza
 * @version 1.0.0
 */

/**
 * Common South African medications organized by category
 * This provides quick access to frequently used medications
 * Each category contains 5 common medications
 */
const commonMeds = {
  pain: ["Panado", "Adco-Dol", "Mybulen", "Disprin", "Grandpa"],
  cold: ["Corenza C", "Med-Lemon", "Sinutab", "Allergex", "Benylin"],
  heart: ["Adco-Bisocor", "Bilocor", "Tenston", "Disprin CV", "Lasix"],
  antibiotics: ["Augmentin", "Amuco", "Ciplatrim", "Purbac", "Ciprobay"],
  vitamins: ["Berocca", "Centrum", "Vital", "Slow-Mag", "Ferro-Grad C"],
  digestive: ["Buscopan", "Gaviscon", "Rennie", "Imodium", "Nexiam"],
  allergy: ["Texa", "Zyrtec", "Clarityne", "Telfast", "Rhinolast"],
}

/**
 * Complete list of all medications for search suggestions
 * This comprehensive list is used for the autocomplete functionality
 * It includes medications from all categories
 */
const allMedications = [
  // Pain & Fever
  "Panado",
  "Adco-Dol",
  "Mybulen",
  "Stilpane",
  "Gen-Payne",
  "Myprodol",
  "Betapyn",
  "Disprin",
  "Grandpa",
  "Nurofen",
  "Voltaren",
  "Cataflam",
  "Mypaid",
  "Syndol",
  "Ibupain",
  "Panamor",
  "Brufen",
  "Napamol",
  "Adco-Napamol",
  "Adco-Indomethacin",
  "Adco-Naproxen",
  "Adco-Piroxicam",

  // Cold & Flu
  "Corenza C",
  "Med-Lemon",
  "Sinutab",
  "Allergex",
  "Benylin",
  "Demazin",
  "Flusin",
  "Actifed",
  "Sinuend",
  "Strepsils",
  "Strepsils Plus",
  "Vicks VapoRub",
  "Vicks Inhaler",
  "Lemsip",
  "Codis",
  "Flutex",
  "Grippon",
  "Neoclear",
  "Linctus Codeine",
  "Broncleer",
  "Pholtex Forte",

  // Heart & Blood Pressure
  "Adco-Bisocor",
  "Bilocor",
  "Tenston",
  "Inderal",
  "Coveram",
  "Ridaq",
  "Prexum",
  "Amloc",
  "Zartan",
  "Disprin CV",
  "Lasix",
  "Adalat",
  "Carvedilol",
  "Enalapril",
  "Pharmapress",
  "Coversyl",
  "Exforge",
  "Micardis",
  "Natrilix",
  "Spiractin",
  "Corlan",

  // Antibiotics
  "Augmentin",
  "Amuco",
  "Ciplatrim",
  "Purbac",
  "Medi-Keel A",
  "Zinnat",
  "Ciprobay",
  "Azithromycin",
  "Erythrocin",
  "Keflex",
  "Flagyl",
  "Doxycycline",
  "Bactrim",
  "Zithromax",
  "Macrobid",
  "Klacid",
  "Orelox",

  // Vitamins & Supplements
  "Berocca",
  "Centrum",
  "Vital",
  "Caltrate",
  "Slow-Mag",
  "Wellwoman",
  "Wellman",
  "Redoxon",
  "Ferro-Grad C",
  "Omega 3",
  "Biotin",
  "Vitamin D3",
  "Folic Acid",
  "Calcium Sandoz",
  "Zinplex",
  "Solal",
  "Supradyn",
  "Spatone",

  // Digestive Health
  "Buscopan",
  "Gaviscon",
  "Rennie",
  "Imodium",
  "Nexiam",
  "Losec",
  "Laxettes",
  "Dulcolax",
  "Movicol",
  "Pegicol",
  "Nexium",
  "Controloc",
  "Motilium",
  "Maxolon",
  "Iberogast",
  "Lactulose",
  "Spasmomen",

  // Allergy & Sinus
  "Texa",
  "Zyrtec",
  "Clarityne",
  "Telfast",
  "Rhinolast",
  "Flomist",
  "Nasonex",
  "Otrivin",
  "Iliadin",
  "Sinumax",
]

/**
 * Loads common medications into the UI
 * Displays a compact list of important medications from different categories
 * for quick access
 */
function loadCommonMedications() {
  // Just show the most important medications across categories
  const commonMedsList = document.getElementById("commonMedsList")
  commonMedsList.innerHTML = ""

  // Select just a few important medications from different categories
  const importantMeds = ["Panado", "Disprin", "Adco-Bisocor", "Corenza C", "Allergex", "Buscopan", "Amuco"]

  importantMeds.forEach((med) => {
    addMedicationPill(commonMedsList, med)
  })
}

/**
 * Helper function to add a medication pill to a container
 * Creates a clickable pill element for a medication
 *
 * @param {HTMLElement} container - The container to add the pill to
 * @param {string} medName - The name of the medication
 */
function addMedicationPill(container, medName) {
  const pill = document.createElement("div")
  pill.className = "common-med-pill"
  pill.textContent = medName
  pill.addEventListener("click", () => {
    document.getElementById("medicationName").value = medName
    document.getElementById("medicationForm").dispatchEvent(new Event("submit"))
  })
  container.appendChild(pill)
}

// Setup real-time search suggestions
function setupSearchSuggestions() {
  const input = document.getElementById("medicationName")
  const suggestionsDiv = document.getElementById("searchSuggestions")

  // Show suggestions as user types
  input.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase()

    if (query.length < 2) {
      suggestionsDiv.style.display = "none"
      return
    }

    // Find matching medications
    const exactMatches = allMedications.filter((med) => med.toLowerCase().startsWith(query))

    const partialMatches = allMedications.filter(
      (med) => !med.toLowerCase().startsWith(query) && med.toLowerCase().includes(query),
    )

    // Combine matches, prioritizing exact matches
    let matches = [...exactMatches, ...partialMatches].slice(0, 6)

    // If no matches, find similar medications (for misspellings)
    if (matches.length === 0) {
      const similarMatches = []
      allMedications.forEach((med) => {
        const distance = levenshteinDistance(query, med.toLowerCase())
        if (distance <= 3) {
          // Allow some error
          similarMatches.push({
            name: med,
            distance: distance,
          })
        }
      })

      // Sort by distance and take top results
      similarMatches.sort((a, b) => a.distance - b.distance)
      matches = similarMatches.slice(0, 5).map((match) => match.name)
    }

    // Display suggestions
    if (matches.length > 0) {
      suggestionsDiv.innerHTML = ""
      matches.forEach((med) => {
        const item = document.createElement("div")
        item.className = "suggestion-item"

        // Highlight the matching part
        const medLower = med.toLowerCase()
        if (medLower.includes(query)) {
          const index = medLower.indexOf(query)
          const before = med.substring(0, index)
          const match = med.substring(index, index + query.length)
          const after = med.substring(index + query.length)
          item.innerHTML = before + '<span class="suggestion-match">' + match + "</span>" + after
        } else {
          // For similar matches
          item.textContent = med + " (similar)"
        }

        item.addEventListener("click", () => {
          input.value = med
          suggestionsDiv.style.display = "none"
          // Submit the form when a suggestion is clicked
          document.getElementById("medicationForm").dispatchEvent(new Event("submit"))
        })

        suggestionsDiv.appendChild(item)
      })

      suggestionsDiv.style.display = "block"
    } else {
      suggestionsDiv.style.display = "none"
    }
  })

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (e.target !== input && !suggestionsDiv.contains(e.target)) {
      suggestionsDiv.style.display = "none"
    }
  })

  // Handle keyboard navigation
  input.addEventListener("keydown", (e) => {
    if (suggestionsDiv.style.display === "none") return

    const items = suggestionsDiv.querySelectorAll(".suggestion-item")
    if (!items.length) return

    const highlighted = suggestionsDiv.querySelector(".suggestion-item.highlighted")
    let index = -1

    if (highlighted) {
      index = Array.from(items).indexOf(highlighted)
    }

    // Down arrow
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (highlighted) highlighted.classList.remove("highlighted")

      if (index < items.length - 1) {
        items[index + 1].classList.add("highlighted")
      } else {
        items[0].classList.add("highlighted")
      }
    }

    // Up arrow
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (highlighted) highlighted.classList.remove("highlighted")

      if (index > 0) {
        items[index - 1].classList.add("highlighted")
      } else {
        items[items.length - 1].classList.add("highlighted")
      }
    }

    // Enter key
    if (e.key === "Enter" && highlighted) {
      e.preventDefault()
      input.value = highlighted.textContent.replace(" (similar)", "")
      suggestionsDiv.style.display = "none"
    }
  })

  // Show suggestions on focus if input has value
  input.addEventListener("focus", function () {
    if (this.value.trim().length >= 2) {
      // Trigger the input event to show suggestions
      this.dispatchEvent(new Event("input"))
    }
  })
}

// Levenshtein distance function for finding similar words
function levenshteinDistance(a, b) {
  const matrix = Array(a.length + 1)
    .fill()
    .map(() => Array(b.length + 1).fill(0))

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      )
    }
  }

  return matrix[a.length][b.length]
}

// Load search history from localStorage
function loadSearchHistory() {
  const history = JSON.parse(localStorage.getItem("medicationHistory")) || []
  const historyPills = document.getElementById("historyPills")
  historyPills.innerHTML = ""

  // Display the 5 most recent searches
  history.slice(0, 5).forEach((med) => {
    const pill = document.createElement("div")
    pill.className = "history-pill"
    pill.textContent = med
    pill.addEventListener("click", () => {
      document.getElementById("medicationName").value = med
      document.getElementById("medicationForm").dispatchEvent(new Event("submit"))
    })
    historyPills.appendChild(pill)
  })

  // Show/hide history section
  document.getElementById("searchHistory").style.display = history.length > 0 ? "block" : "none"
}

// Save search to history
function saveToHistory(medicationName) {
  if (!medicationName) return

  let history = JSON.parse(localStorage.getItem("medicationHistory")) || []

  // Remove if already exists (to move it to the front)
  history = history.filter((med) => med.toLowerCase() !== medicationName.toLowerCase())

  // Add to the beginning
  history.unshift(medicationName)

  // Keep only the 10 most recent
  history = history.slice(0, 10)

  localStorage.setItem("medicationHistory", JSON.stringify(history))
  loadSearchHistory()
}

// Function to render markdown-like text
function renderMarkdown(text) {
  if (!text) return ""

  // Replace **text** with <strong>text</strong>
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Replace *text* with <em>text</em>
  text = text.replace(/\*(.*?)\*/g, "<em>text</em>")

  // Replace - list items with <li> elements
  text = text.replace(/^- (.*?)$/gm, "<li>$1</li>")

  // Wrap lists in <ul> tags
  if (text.includes("<li>")) {
    text = text.replace(/(<li>.*?<\/li>)+/gs, "<ul>$&</ul>")
  }

  // Replace newlines with <br>
  text = text.replace(/\n/g, "<br>")

  return text
}

// Ask AI for help
async function askAI(medicationName) {
  try {
    const loading = document.getElementById("loading")
    loading.style.display = "block"

    const response = await fetch("/ask-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ medicationName }),
    })

    const data = await response.json()

    if (data.success) {
      // Add AI response to the results
      const aiResponseDiv = document.createElement("div")
      aiResponseDiv.className = "ai-response"

      // Format the response with markdown-like rendering
      const formattedResponse = renderMarkdown(data.response)

      aiResponseDiv.innerHTML = `
                <h4>AI Assistant:</h4>
                <div class="markdown">${formattedResponse}</div>
            `

      const resultContent = document.getElementById("resultContent")
      resultContent.appendChild(aiResponseDiv)

      // If the AI found medication info that wasn't in our database, save it to history
      if (data.medicationInfo && data.medicationInfo.name) {
        saveToHistory(data.medicationInfo.name)
      }
    } else {
      throw new Error(data.message || "Failed to get AI response")
    }
  } catch (error) {
    console.error("Error asking AI:", error)
    const aiResponseDiv = document.createElement("div")
    aiResponseDiv.className = "ai-response"
    aiResponseDiv.innerHTML = `
            <h4>AI Assistant:</h4>
            <p>I'm sorry, I couldn't provide information about this medication. Please consult with your healthcare provider.</p>
        `

    const resultContent = document.getElementById("resultContent")
    resultContent.appendChild(aiResponseDiv)
  } finally {
    const loading = document.getElementById("loading")
    loading.style.display = "none"
  }
}

// Function to handle spelling suggestions
function handleSpellingSuggestions(suggestions, originalQuery) {
  const suggestionsList = document.createElement("div")
  suggestionsList.className = "suggestion-list"
  suggestionsList.innerHTML = "<p>Did you mean:</p>"

  suggestions.forEach((suggestion) => {
    const suggestionItem = document.createElement("div")
    suggestionItem.className = "suggestion-item"
    suggestionItem.textContent = suggestion
    suggestionItem.addEventListener("click", () => {
      document.getElementById("medicationName").value = suggestion
      document.getElementById("medicationForm").dispatchEvent(new Event("submit"))
    })
    suggestionsList.appendChild(suggestionItem)
  })

  return suggestionsList
}

// Load search history and common medications on page load
document.addEventListener("DOMContentLoaded", () => {
  loadSearchHistory()
  loadCommonMedications()
  setupSearchSuggestions()
})

document.getElementById("medicationForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const medicationName = document.getElementById("medicationName").value.trim()
  const loading = document.getElementById("loading")
  const results = document.getElementById("results")
  const errorMessage = document.getElementById("errorMessage")
  const resultContent = document.getElementById("resultContent")

  if (!medicationName) {
    errorMessage.textContent = "Please enter a medication name"
    errorMessage.style.display = "block"
    return
  }

  errorMessage.style.display = "none"
  loading.style.display = "block"
  results.style.display = "none"

  // Clear previous results
  resultContent.innerHTML = ""

  try {
    // Use fetch with error handling that doesn't rely on response.ok
    const response = await fetch(`/check-medication?name=${encodeURIComponent(medicationName)}`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()

    document.getElementById("medicationTitle").textContent = medicationName

    if (!data.found) {
      // Medication not found
      const notFoundMessage = document.createElement("p")
      notFoundMessage.textContent =
        data.message ||
        "Sorry, we couldn't find information about this medication. Please check the spelling or try another medication."
      resultContent.appendChild(notFoundMessage)

      // Add spelling suggestions if available
      if (data.suggestions && data.suggestions.length > 0) {
        const suggestionsElement = handleSpellingSuggestions(data.suggestions, medicationName)
        resultContent.appendChild(suggestionsElement)
      }

      // Add "Ask AI" button for not found medications
      const actionsDiv = document.createElement("div")
      actionsDiv.className = "not-found-actions"

      const askAIButton = document.createElement("button")
      askAIButton.id = "askAIButton"
      askAIButton.className = "ai-button"
      askAIButton.textContent = "Ask AI Assistant"
      askAIButton.addEventListener("click", function () {
        askAI(medicationName)
        this.disabled = true
        this.textContent = "AI Assistant Consulted"
      })

      actionsDiv.appendChild(askAIButton)
      resultContent.appendChild(actionsDiv)
    } else {
      // Save to search history for successful searches
      saveToHistory(medicationName)

      // Display medication names
      const medicationInfoDiv = document.createElement("div")
      medicationInfoDiv.className = "medication-info"

      // Add South African badge if from SA database
      if (data.dataSource === "South African Medication Database") {
        const nameP = document.createElement("p")
        nameP.innerHTML = `<strong>Medication:</strong> ${data.name} <span class="sa-badge">South African</span>`

        if (data.category) {
          nameP.innerHTML += ` <span class="category-badge">${data.category}</span>`
        }

        medicationInfoDiv.appendChild(nameP)
      }

      if (data.medicationNames) {
        if (data.medicationNames.brand && data.medicationNames.brand !== "Not available") {
          const brandP = document.createElement("p")
          brandP.innerHTML = `<strong>Brand Name(s):</strong> ${data.medicationNames.brand}`
          medicationInfoDiv.appendChild(brandP)
        }
        if (
          data.medicationNames.generic &&
          data.medicationNames.generic !== "Not available" &&
          data.medicationNames.generic !== data.medicationNames.brand
        ) {
          const genericP = document.createElement("p")
          genericP.innerHTML = `<strong>Active Ingredient(s):</strong> ${data.medicationNames.generic}`
          medicationInfoDiv.appendChild(genericP)
        }
      }

      if (data.activeIngredient && !data.medicationNames) {
        const ingredientP = document.createElement("p")
        ingredientP.innerHTML = `<strong>Active Ingredient(s):</strong> ${data.activeIngredient}`
        medicationInfoDiv.appendChild(ingredientP)
      }

      resultContent.appendChild(medicationInfoDiv)

      // Determine overall safety based on both general safety and warfarin interaction
      const isSafeOverall = data.isSafe && data.warfarinIssue !== true

      // Display overall recommendation with enhanced visibility
      const safetyIndicator = document.createElement("div")
      safetyIndicator.className = isSafeOverall
        ? "safety-indicator safe-indicator"
        : "safety-indicator unsafe-indicator"

      if (isSafeOverall) {
        safetyIndicator.innerHTML = `
                    <span class="safety-icon">✓</span> 
                    SAFE TO TAKE
                `
      } else {
        safetyIndicator.innerHTML = `
                    <span class="safety-icon">✗</span> 
                    NOT SAFE TO TAKE
                `
      }

      resultContent.appendChild(safetyIndicator)

      // Add explanation section for why medication is unsafe
      if (!isSafeOverall) {
        const reasonsDiv = document.createElement("div")
        reasonsDiv.className = "safety-reasons"
        reasonsDiv.style.backgroundColor = "#fff0f0"
        reasonsDiv.style.padding = "15px"
        reasonsDiv.style.borderRadius = "5px"
        reasonsDiv.style.marginTop = "10px"
        reasonsDiv.style.marginBottom = "15px"
        reasonsDiv.style.fontSize = "16px"

        const reasonsTitle = document.createElement("h4")
        reasonsTitle.textContent = "Why this medication is not safe:"
        reasonsTitle.style.margin = "0 0 10px 0"
        reasonsTitle.style.color = "#cc0000"
        reasonsDiv.appendChild(reasonsTitle)

        const reasonsList = document.createElement("ul")
        reasonsList.style.margin = "0"
        reasonsList.style.paddingLeft = "20px"

        // Add specific reasons based on the medication's issues
        if (data.heartIssue) {
          const heartItem = document.createElement("li")
          heartItem.textContent = "This medication may affect your heart condition"
          reasonsList.appendChild(heartItem)
        }

        if (data.pacemakerIssue) {
          const pacemakerItem = document.createElement("li")
          pacemakerItem.textContent = "This medication may interfere with your pacemaker"
          reasonsList.appendChild(pacemakerItem)
        }

        if (data.warfarinIssue) {
          const warfarinItem = document.createElement("li")
          warfarinItem.textContent = "This medication may interact with your blood thinner (warfarin)"
          reasonsList.appendChild(warfarinItem)
        }

        reasonsDiv.appendChild(reasonsList)
        resultContent.appendChild(reasonsDiv)
      }

      // Add warfarin-specific information with enhanced visibility - MOVED HERE
      const warfarinDiv = document.createElement("div")
      if (data.warfarinIssue === true) {
        // Known interaction with warfarin
        warfarinDiv.className = "warfarin-warning"
        warfarinDiv.innerHTML = `
                    <h4>⚠️ Warning: May Affect Blood Thinner</h4>
                    <p>This medicine may not mix well with warfarin (your blood thinner).</p>
                    <p>It could change how your blood thinner works or cause more bleeding.</p>
                    <p>Ask your doctor before taking this medicine.</p>
                `
      } else if (data.warfarinIssue === false) {
        // Known to be safe with warfarin
        warfarinDiv.className = "warfarin-safe"
        warfarinDiv.innerHTML = `
                    <h4>✓ Safe With Blood Thinner</h4>
                    <p>This medicine should not affect your warfarin (blood thinner).</p>
                    <p>Still, tell your doctor about all medicines you take.</p>
                `
      } else {
        // Unknown or not specified
        warfarinDiv.className = "warfarin-unknown"
        warfarinDiv.innerHTML = `
                    <h4>⚠️ Not Sure About Blood Thinner</h4>
                    <p>We don't know if this medicine affects warfarin (your blood thinner).</p>
                    <p>To be safe, ask your doctor before taking this medicine.</p>
                `
      }
      resultContent.appendChild(warfarinDiv)

      // Display specific warnings in a more visible format
      if (data.warnings && data.warnings.length > 0) {
        const warningsDiv = document.createElement("div")
        warningsDiv.className = "warnings-list"

        const warningsH3 = document.createElement("h3")
        warningsH3.textContent = "Important Things to Know:"
        warningsDiv.appendChild(warningsH3)

        const warningsUl = document.createElement("ul")
        data.warnings.forEach((warning) => {
          const warningLi = document.createElement("li")
          warningLi.className = "warning"
          warningLi.textContent = warning
          warningsUl.appendChild(warningLi)
        })
        warningsDiv.appendChild(warningsUl)
        resultContent.appendChild(warningsDiv)
      }

      // Display general information
      if (data.generalInfo) {
        const infoDiv = document.createElement("div")
        infoDiv.className = "general-info"

        const infoH3 = document.createElement("h3")
        infoH3.textContent = "About This Medicine:"
        infoDiv.appendChild(infoH3)

        const infoP = document.createElement("p")
        infoP.textContent = data.generalInfo
        infoDiv.appendChild(infoP)

        resultContent.appendChild(infoDiv)
      }

      // Always add disclaimer
      const disclaimerP = document.createElement("div")
      disclaimerP.className = "disclaimer"
      disclaimerP.innerHTML =
        "<strong>Important:</strong> Always ask your doctor before starting or stopping any medicine."
      resultContent.appendChild(disclaimerP)

      // Add "Ask AI" button for more information
      const actionsDiv = document.createElement("div")
      actionsDiv.className = "not-found-actions"

      const askAIButton = document.createElement("button")
      askAIButton.id = "askAIButton"
      askAIButton.className = "ai-button"
      askAIButton.textContent = "Ask AI for More Information"
      askAIButton.addEventListener("click", function () {
        askAI(medicationName)
        this.disabled = true
        this.textContent = "AI Assistant Consulted"
      })

      actionsDiv.appendChild(askAIButton)
      resultContent.appendChild(actionsDiv)

      // Display data source
      if (data.dataSource) {
        document.getElementById("dataSource").textContent = `Data source: ${data.dataSource}`
      }
    }
  } catch (error) {
    console.error("Error fetching medication data:", error)

    const errorP = document.createElement("p")
    errorP.className = "unsafe"
    errorP.textContent = "Sorry, there was an error checking this medication. Please try again later."
    resultContent.appendChild(errorP)

    const errorDetailsP = document.createElement("p")
    errorDetailsP.textContent = `Error details: ${error.message}`
    resultContent.appendChild(errorDetailsP)

    // Add "Ask AI" button even in error case
    const actionsDiv = document.createElement("div")
    actionsDiv.className = "not-found-actions"

    const askAIButton = document.createElement("button")
    askAIButton.id = "askAIButton"
    askAIButton.className = "ai-button"
    askAIButton.textContent = "Ask AI Assistant"
    askAIButton.addEventListener("click", function () {
      askAI(medicationName)
      this.disabled = true
      this.textContent = "AI Assistant Consulted"
    })

    actionsDiv.appendChild(askAIButton)
    resultContent.appendChild(actionsDiv)
  } finally {
    loading.style.display = "none"
    results.style.display = "block"

    // Scroll to the results section
    results.scrollIntoView({ behavior: "smooth", block: "start" })
  }
})
