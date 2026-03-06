// --- 1. THEME TOGGLE ---
const themeBtn = document.getElementById('theme-btn');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;

const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    themeIcon.setAttribute('data-lucide', 'sun');
}

themeBtn.addEventListener('click', () => {
    const isDark = body.classList.toggle('dark-theme');
    body.classList.toggle('light-theme', !isDark);
    themeIcon.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    lucide.createIcons();
});

// --- 2. ADVANCED TIME & DATE (Timezone Detection) ---
function updateClock() {
    const now = new Date();
    
    // Main Time
    document.getElementById('time').textContent = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Date
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    // Timezone Info
    const offset = -now.getTimezoneOffset() / 60;
    const gmtLabel = `GMT${offset >= 0 ? '+' : ''}${offset}`;
    document.getElementById('timezone-label').textContent = gmtLabel;
    
    // UTC Time
    const utcTime = now.toUTCString().split(' ')[4].substring(0, 5);
    document.getElementById('utc-time').textContent = `${utcTime} UTC`;
}

setInterval(updateClock, 1000);
updateClock();

// --- 3. TOAST NOTIFICATION SYSTEM ---
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="check-circle" style="width: 18px; color: var(--accent-primary);"></i><span>${message}</span>`;
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => toast.remove(), 3000);
}

const motivationalMessages = [
    "Nice work! Keep going.",
    "Great progress today!",
    "Task completed. You're doing great.",
    "One step closer to your goal.",
    "You're on fire!",
    "Productivity levels rising!"
];

// --- 4. SMART TO-DO LIST & PROGRESS ---
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const progressPercentage = document.getElementById('progress-percentage');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    updateProgress();
}

function updateProgress() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressText.textContent = `${completed} / ${total} Tasks`;
    progressBar.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;
    
    // Update daily stats bar height for today
    const today = new Date().getDay();
    const todayBar = document.querySelector(`.stat-day[data-day="${today}"] .bar`);
    if (todayBar) todayBar.style.height = `${percentage}%`;
}

function highlightToday() {
    const today = new Date().getDay();
    document.querySelectorAll('.stat-day').forEach(el => {
        el.classList.toggle('active', parseInt(el.dataset.day) === today);
    });
}

function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn btn-ghost" aria-label="Delete task" style="padding: 0.5rem; border-radius: 8px;">
                <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
            </button>
        `;

        li.querySelector('.todo-checkbox').addEventListener('change', (e) => {
            todos[index].completed = e.target.checked;
            if (e.target.checked) {
                const msg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
                showToast(msg);
            }
            saveTodos();
            renderTodos();
        });

        li.querySelector('.delete-btn').addEventListener('click', () => {
            todos.splice(index, 1);
            saveTodos();
            renderTodos();
        });

        todoList.appendChild(li);
    });
    lucide.createIcons();
    updateProgress();
}

function addTodo() {
    const text = todoInput.value.trim();
    if (text) {
        todos.push({ text, completed: false });
        todoInput.value = '';
        saveTodos();
        renderTodos();
    }
}

addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTodo(); });

// --- 5. CUSTOMIZABLE POMODORO TIMER ---
let timerInterval;
let timeLeft = 25 * 60;
let isRunning = false;

const pomodoroDisplay = document.getElementById('pomodoro-time');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const presetBtns = document.querySelectorAll('.preset-btn');
const customMinInput = document.getElementById('custom-minutes');
const setCustomBtn = document.getElementById('set-custom-timer');

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    pomodoroDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    startBtn.textContent = 'Running...';
    startBtn.disabled = true;
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.textContent = 'Start';
            startBtn.disabled = false;
            showToast("Focus session complete! Time for a break.");
            new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(() => {});
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.textContent = 'Resume';
    startBtn.disabled = false;
}

function resetTimer() {
    pauseTimer();
    const activePreset = document.querySelector('.preset-btn.active');
    timeLeft = (activePreset ? parseInt(activePreset.dataset.time) : 25) * 60;
    startBtn.textContent = 'Start';
    updateTimerDisplay();
}

presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        pauseTimer();
        timeLeft = parseInt(btn.dataset.time) * 60;
        updateTimerDisplay();
    });
});

setCustomBtn.addEventListener('click', () => {
    const val = parseInt(customMinInput.value);
    if (val > 0 && val <= 180) {
        presetBtns.forEach(b => b.classList.remove('active'));
        pauseTimer();
        timeLeft = val * 60;
        updateTimerDisplay();
        customMinInput.value = '';
    }
});

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// --- 6. QUOTES & KEYBOARD SHORTCUTS ---
const quotes = [
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { text: "Sometimes later becomes never. Do it now.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },
    { text: "Dream it. Wish it. Do it.", author: "Unknown" },
    { text: "Success doesn’t just find you. You have to go out and get it.", author: "Unknown" },
    { text: "The harder you work for something, the greater you’ll feel.", author: "Unknown" },
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" }
];

const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const newQuoteBtn = document.getElementById('new-quote-btn');

function generateQuote() {
    quoteText.style.opacity = 0;
    setTimeout(() => {
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = quote.author;
        quoteText.style.opacity = 1;
    }, 300);
}

newQuoteBtn.addEventListener('click', generateQuote);

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'n' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        todoInput.focus();
    }
});

// --- INITIALIZE ---
highlightToday();
renderTodos();
updateTimerDisplay();
document.querySelector('.preset-btn[data-time="25"]').classList.add('active');
