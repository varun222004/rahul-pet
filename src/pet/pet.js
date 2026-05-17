const { ipcRenderer } = require('electron')

const rahul = document.getElementById('rahul')
const bubble = document.getElementById('bubble')

const quotes = [
  "Bharat Jodo! 🇮🇳",
  "Let's test this bug!",
  "Nyay milega! ✊",
  "Paper leak nahi hoga!",
  "Hum honge kamyaab!",
  "Ship it! 🚀",
  "QA is love, QA is life.",
  "No bugs on my watch!",
  "Open source zindabad!",
  "Jai Hind! 🫡",
  "Click for dashboard!",
  "Rahul Gandhi approved ✅",
]

const screenW = window.screen.width
const screenH = window.screen.height

let x = -200
let speed = 2
let bubbleTimeout

function showBubble(text) {
  bubble.textContent = text
  bubble.style.left = (x + 20) + 'px'
  bubble.style.bottom = '230px'
  bubble.classList.add('visible')
  clearTimeout(bubbleTimeout)
  bubbleTimeout = setTimeout(() => {
    bubble.classList.remove('visible')
  }, 2500)
}

// Animate Rahul cycling across screen
function animate() {
  x += speed
  if (x > screenW + 50) {
    x = -220
  }
  rahul.style.left = x + 'px'

  // Update bubble position if visible
  if (bubble.classList.contains('visible')) {
    bubble.style.left = (x + 20) + 'px'
  }

  requestAnimationFrame(animate)
}

animate()

// Make clickable when mouse is near Rahul
document.addEventListener('mousemove', (e) => {
  const rect = rahul.getBoundingClientRect()
  const near = (
    e.clientX >= rect.left - 10 &&
    e.clientX <= rect.right + 10 &&
    e.clientY >= rect.top - 10 &&
    e.clientY <= rect.bottom + 10
  )
  ipcRenderer.send('set-clickable', near)
})

// Click Rahul
rahul.addEventListener('click', () => {
  const quote = quotes[Math.floor(Math.random() * quotes.length)]
  showBubble(quote)
  ipcRenderer.send('open-dashboard')
})