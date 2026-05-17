const { ipcRenderer } = require('electron')

// ── Close
document.getElementById('closeBtn').addEventListener('click', () => {
  ipcRenderer.send('close-dashboard')
})

// ── Default projects
const defaultProjects = [
  { id: 1, name: 'QA Scout', tag: 'qa', tagLabel: 'QA Tool', status: 'active', progress: 80, nextTodo: 'Add Maestro flow support', notes: '', completed: false },
  { id: 2, name: 'Pit Wall F1 Dashboard', tag: 'dev', tagLabel: 'Dev', status: 'todo', progress: 0, nextTodo: 'Setup React + Ergast API', notes: '', completed: false },
  { id: 3, name: 'Race Day Flutter App', tag: 'dev', tagLabel: 'Dev', status: 'todo', progress: 0, nextTodo: 'Setup Flutter project structure', notes: '', completed: false },
  { id: 4, name: 'Maestro Flows', tag: 'auto', tagLabel: 'Automation', status: 'todo', progress: 0, nextTodo: 'Write Spotify login flow', notes: '', completed: false },
  { id: 5, name: 'Playwright — Flipkart', tag: 'auto', tagLabel: 'Automation', status: 'todo', progress: 0, nextTodo: 'Setup Playwright project', notes: '', completed: false },
  { id: 6, name: 'Selenium — Naukri', tag: 'auto', tagLabel: 'Automation', status: 'todo', progress: 0, nextTodo: 'Setup Selenium + ChromeDriver', notes: '', completed: false },
  { id: 7, name: 'Rahul Pet 🧢', tag: 'dev', tagLabel: 'Dev', status: 'active', progress: 85, nextTodo: 'Push to GitHub + README', notes: '', completed: false },
]

// ── Load/Save
async function loadProjects() {
  const saved = await ipcRenderer.invoke('load-projects')
  return saved && saved.length ? saved : defaultProjects
}

function saveProjects(projects) {
  ipcRenderer.send('save-projects', projects)
}

let projects = []

// ── Quotes
const quotes = [
  '"Bharat Jodo! One commit at a time." — Rahul Gandhi',
  '"Paper leak nahi hoga, but bugs might." — Rahul Gandhi',
  '"Hum honge kamyaab, after fixing this bug." — Rahul Gandhi',
  '"Ship it like you mean it." — Rahul Gandhi',
  '"QA is not a phase, its a lifestyle." — Rahul Gandhi',
  '"No bugs on my watch. Nyay milega." — Rahul Gandhi',
  '"Jai Hind! Now write your test cases." — Rahul Gandhi',
]

document.getElementById('quoteBar').textContent =
  quotes[Math.floor(Math.random() * quotes.length)]

// ── Rahul reactions
function getRahulReaction(progress, completed) {
  if (completed) return '✅ Rahul is proud. Nyay mila!'
  if (progress === 0) return '😴 Arre yaar... start karo!'
  if (progress < 25) return '🐢 Thoda aur effort chahiye!'
  if (progress < 50) return '💪 Theek hai, keep going!'
  if (progress < 75) return '🔥 Wah! Bharat jod raha hai!'
  if (progress < 100) return '🚀 Almost there! Ship it!'
  return '🎉 100%! Jai Hind!'
}

function getProgressClass(progress, completed) {
  if (completed || progress === 100) return 'done'
  if (progress > 0) return 'active'
  return 'todo'
}

// ── Modal
let activeProjectId = null
const modalOverlay = document.getElementById('modalOverlay')
const modalNotes = document.getElementById('modalNotes')
const modalTitle = document.getElementById('modalTitle')

document.getElementById('saveNotes').addEventListener('click', () => {
  if (activeProjectId !== null) {
    const p = projects.find(p => p.id === activeProjectId)
    if (p) {
      p.notes = modalNotes.value
      saveProjects(projects)
      renderProjects()
    }
  }
  modalOverlay.classList.remove('visible')
})

document.getElementById('cancelNotes').addEventListener('click', () => {
  modalOverlay.classList.remove('visible')
})

// ── Render
function renderProjects() {
  const grid = document.getElementById('projectsGrid')
  grid.innerHTML = ''

  projects.forEach(p => {
    const card = document.createElement('div')
    card.className = 'card' + (p.completed ? ' completed' : '')

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${p.name}</div>
        <span class="card-tag tag-${p.tag}">${p.tagLabel}</span>
      </div>
      <div class="progress-label">PROGRESS — ${p.progress}%</div>
      <div class="progress-track" id="track-${p.id}">
        <div class="progress-fill ${getProgressClass(p.progress, p.completed)}"
             style="width: ${p.progress}%"
             id="fill-${p.id}">
        </div>
      </div>
      <div class="rahul-reaction">${getRahulReaction(p.progress, p.completed)}</div>
      <div class="next-label">▶ NEXT UP</div>
      <div class="next-todo">${p.nextTodo}</div>
      ${p.notes ? `<div class="notes-indicator">📝 ${p.notes.substring(0, 40)}${p.notes.length > 40 ? '...' : ''}</div>` : ''}
      <div class="card-actions">
        <button class="btn-done" data-id="${p.id}">${p.completed ? '↩ UNDO' : '✓ DONE'}</button>
        <button class="btn-notes" data-id="${p.id}">📝 NOTES</button>
        <button class="btn-delete" data-id="${p.id}">✕</button>
      </div>
    `

    // ── Draggable progress
    const track = card.querySelector(`#track-${p.id}`)
    const fill = card.querySelector(`#fill-${p.id}`)
    let dragging = false

    track.addEventListener('mousedown', (e) => {
      dragging = true
      updateProgress(e, p, track, fill, card)
    })

    document.addEventListener('mousemove', (e) => {
      if (dragging) updateProgress(e, p, track, fill, card)
    })

    document.addEventListener('mouseup', () => {
      if (dragging) {
        dragging = false
        saveProjects(projects)
        fill.className = `progress-fill ${getProgressClass(p.progress, p.completed)}`
      }
    })

    // ── Done
    card.querySelector('.btn-done').addEventListener('click', () => {
      p.completed = !p.completed
      if (p.completed) p.progress = 100
      saveProjects(projects)
      renderProjects()
    })

    // ── Notes
    card.querySelector('.btn-notes').addEventListener('click', () => {
      activeProjectId = p.id
      modalTitle.textContent = `NOTES — ${p.name}`
      modalNotes.value = p.notes || ''
      modalOverlay.classList.add('visible')
    })

    // ── Delete
    card.querySelector('.btn-delete').addEventListener('click', () => {
      projects = projects.filter(proj => proj.id !== p.id)
      saveProjects(projects)
      renderProjects()
    })

    grid.appendChild(card)
  })
}

function updateProgress(e, p, track, fill, card) {
  const rect = track.getBoundingClientRect()
  let pct = Math.round(((e.clientX - rect.left) / rect.width) * 100)
  pct = Math.max(0, Math.min(100, pct))
  p.progress = pct
  fill.style.width = pct + '%'
  track.previousElementSibling.textContent = `PROGRESS — ${pct}%`
  card.querySelector('.rahul-reaction').textContent =
    getRahulReaction(p.progress, p.completed)
}

// ── Add project
document.getElementById('addProjectBtn').addEventListener('click', () => {
  const name = document.getElementById('newProjectName').value.trim()
  const tag = document.getElementById('newProjectTag').value
  if (!name) return

const tagLabels = { dev: 'Dev', qa: 'QA Tool', auto: 'Automation', research: 'Research', learning: 'Learning', other: 'Other' }
  projects.push({
    id: Date.now(),
    name,
    tag,
    tagLabel: tagLabels[tag],
    status: 'todo',
    progress: 0,
    nextTodo: 'Get started!',
    notes: '',
    completed: false
  })

  saveProjects(projects)
  renderProjects()
  document.getElementById('newProjectName').value = ''
})

// ── Enter key
document.getElementById('newProjectName').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('addProjectBtn').click()
})

// ── Init
loadProjects().then(data => {
  projects = data
  renderProjects()
})