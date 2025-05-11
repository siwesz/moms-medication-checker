// Using DiceBear API for pre-made cartoon characters
// This uses the "adventurer-neutral" style which has cute cartoon characters

// Define the cartoon images using DiceBear API
const cartoonImages = {
  happy: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=happy&mouth=smile,laughing&eyes=happy&backgroundColor=ffb8d9`,
  sad: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=sad&mouth=sad,frown&eyes=tearful&backgroundColor=ffb8d9`,
  confused: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=confused&mouth=nervous&eyes=surprised&backgroundColor=ffb8d9`,
}

// Random cartoon messages for different states
const cartoonMessages = {
  happy: [
    "This one's safe, Mother!",
    "Good choice for you!",
    "This medicine is fine!",
    "Safe for your heart!",
    "This won't affect your warfarin!",
    "Doctor would approve!",
    "Perfect for your condition!",
  ],
  sad: [
    "Oh no, not this one!",
    "Please avoid this, Mother!",
    "This could be dangerous!",
    "Not safe with your heart!",
    "This might affect your warfarin!",
    "Better find an alternative!",
    "I wouldn't recommend this one!",
  ],
  confused: [
    "I'm not sure about this...",
    "Let me think, Mother...",
    "This one's tricky...",
    "I need more information...",
    "Ask your doctor about this one!",
    "The research is unclear...",
    "I can't be certain about this one...",
  ],
}

// Get a random message for the cartoon character
function getRandomMessage(type) {
  const messages = cartoonMessages[type]
  return messages[Math.floor(Math.random() * messages.length)]
}

// Create cartoon character element with random message
function createCartoonCharacter(type, message = null) {
  const container = document.createElement("div")
  container.className = "cartoon-container"

  const img = document.createElement("img")
  img.className = "cartoon-character"
  img.src = cartoonImages[type]
  img.alt = type + " cartoon character"

  const messageDiv = document.createElement("div")
  messageDiv.className = "cartoon-message"

  // Use provided message or get a random one
  messageDiv.textContent = message || getRandomMessage(type)

  container.appendChild(img)
  container.appendChild(messageDiv)

  return container
}

// Export the functions and data for use in other files
window.CartoonHelper = {
  images: cartoonImages,
  messages: cartoonMessages,
  getRandomMessage: getRandomMessage,
  createCartoonCharacter: createCartoonCharacter,
}
