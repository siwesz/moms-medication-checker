# Mom's Medication Checker

## Overview

Mom's Medication Checker is a specialized web application designed to help users (particularly those with specific health conditions like heart issues or those taking blood thinners) check if medications are safe for them to take. The application features a comprehensive South African medication database and provides clear safety indicators.

## Features

- **Medication Safety Checking**: Instantly check if a medication is safe for specific health conditions
- **South African Medication Database**: Comprehensive database of South African medications
- **Warfarin Interaction Warnings**: Special warnings for medications that interact with blood thinners
- **Heart Condition & Pacemaker Alerts**: Specific alerts for medications that may affect heart conditions
- **Smart Search Suggestions**: Real-time search suggestions as you type
- **Search History**: Keeps track of your recent medication searches
- **Common Medications List**: Quick access to frequently checked medications
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **AI Assistant Integration**: Get additional information about medications from the AI assistant

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: In-memory JavaScript objects (easily extendable to MongoDB or other databases)
- **Deployment**: Compatible with Vercel, Heroku, or any Node.js hosting platform

## Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/moms-medication-checker.git
   cd moms-medication-checker
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

4. Open your browser and navigate to:
   \`\`\`
   http://localhost:3000
   \`\`\`

## Project Structure

\`\`\`
moms-medication-checker/
├── public/                  # Static files
│   ├── app.html             # Main application HTML
│   ├── index.html           # Splash page
│   ├── script.js            # Client-side JavaScript
│   ├── styles.css           # CSS styles
│   └── .htaccess            # Server configuration
├── sa-medications.js        # South African medications database
├── server.js                # Express server and API endpoints
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation
\`\`\`

## API Documentation

### GET /check-medication

Checks if a medication is safe based on specific health conditions.

**Parameters:**
- `name` (string): The name of the medication to check

**Response:**
\`\`\`json
{
  "name": "Medication Name",
  "found": true,
  "isSafe": true|false,
  "warfarinIssue": true|false,
  "medicationNames": {
    "brand": "Brand Name",
    "generic": "Generic Name"
  },
  "generalInfo": "General information about the medication",
  "warnings": ["Warning 1", "Warning 2"],
  "dataSource": "South African Medication Database",
  "category": "Medication Category"
}
\`\`\`

### POST /ask-ai

Gets additional information about a medication from the AI assistant.

**Request Body:**
\`\`\`json
{
  "medicationName": "Medication Name"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "response": "AI-generated information about the medication"
}
\`\`\`

## Usage

1. Enter a medication name in the search box
2. Click "Check Medication" or press Enter
3. View the safety information and warnings
4. For additional information, click "Ask AI Assistant"

## Future Improvements

- Add user accounts for personalized health profiles
- Expand the medication database to include more international medications
- Implement a more sophisticated AI assistant for detailed medication information
- Add medication interaction checker for multiple medications
- Create a mobile app version using React Native

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Created with ❤️ for Mom

## Acknowledgments

- South African Medicines Formulary for medication information
- All the healthcare professionals who provided guidance on medication safety
