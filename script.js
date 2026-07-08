const IS_DEV_MODE = true;
// At the top of script.js
let sugarMode = 'default';
// Declare these globally
const avatarImg = document.getElementById("sugar-avatar");
const dialogueBox = document.getElementById("dialogue-box");
const optionsBox = document.getElementById("options-box");

function setSugarMode(mode) {
    sugarMode = mode;

    if (!avatarImg || !dialogueBox) return;

    switch(sugarMode) {
        case 'busy':
            avatarImg.src = "/assets/art/SUGAR_BUSY.png"; // Update your paths
            dialogueBox.innerText = "Sugar is busy right now...";
            optionsBox.innerHTML = "";
            break;
        case 'gaming':
            avatarImg.src = "/assets/art/SUGAR_GAMING.gif";
            dialogueBox.innerText = "Sugar is busy playing video games.";
            optionsBox.innerHTML = "";
            break;
        case 'blogging':
            avatarImg.src = "/assets/art/SUGAR_BLOGGING.png";
            dialogueBox.innerText = "Sugar is typing a new blog...";
            optionsBox.innerHTML = "";
            // Auto-revert to default after 5 seconds
            setTimeout(() => setSugarMode('default'), 5000);
            break;
        default:
            avatarImg.src = "/assets/art/Sugar-(Jul-3-2026).gif";
            dialogueBox.innerText = "So, what's up?";
            renderDefaultOptions();
            break;
    }
}

function renderDefaultOptions() {
    const optionsBox = document.getElementById("options-box");
    optionsBox.innerHTML = ""; // Clear existing
    const choices = ["How are you?", "What's new?", "Goodbye!"];
    
    choices.forEach(text => {
        const btn = document.createElement("button");
        btn.className = "dialogue-choice";
        btn.innerText = `► ${text}`;
        btn.onclick = () => { dialogueBox.innerText = "Sugar just shrugs in response."; };
        optionsBox.appendChild(btn);
    });
}

async function loadSiteData() {
    try {
        const res = await fetch('https://api.github.com/repos/SugarHyou/sugaroverdosed/contents/output/journal.json');
        const fileData = await res.json();

        // 1. Clean the base64 string (remove newlines)
        const base64Content = fileData.content.replace(/\n/g, '');
        
        // 2. Decode properly
        const jsonString = decodeURIComponent(escape(atob(base64Content)));
        
        // 3. Parse
        const data = JSON.parse(jsonString);
        
        // ... rest of your logic (updating DOM, etc)
    } catch (e) {
        console.error("Failed synchronization:", e);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    setSugarMode('default');
    loadSiteData();
    makeWindowsDraggable();
});

function playSong(trackName, audioSrc) {
    const audioEngine = document.getElementById('audio-engine');
    const playerTitle = document.getElementById('player-track-title');

    if (!audioEngine || !playerTitle) return;

    audioEngine.src = audioSrc;
    audioEngine.play();

    playerTitle.innerText = `NOW PLAYING: ${trackName}`;
}

function controlAudio(action) {
    const audioEngine = document.getElementById('audio-engine');
    const playerTitle = document.getElementById('player-track-title');
    if (!audioEngine) return;

    if (action === 'play' && audioEngine.src) {
        audioEngine.play();
    } else if (action === 'pause') {
        audioEngine.pause();
    } else if (action === 'stop') {
        audioEngine.pause();
        audioEngine.currentTime = 0;
        if (playerTitle) {
            playerTitle.innerText = "TRACK: [ IDLE / STOPPED ]";
            playerTitle.style.color = "lime";
        }
    }
}

function toggleWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.classList.toggle('hidden');
    }
}

const windowRestorationPositions = {};

function maximizeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    if (win.classList.contains('maximized')) {
        win.classList.remove('maximized');
        const saved = windowRestorationPositions[id];
        if (saved) {
            win.style.top = saved.top;
            win.style.left = saved.left;
            win.style.width = saved.width;
            win.style.height = saved.height;
        }
    } else {
        windowRestorationPositions[id] = {
            top: win.style.top,
            left: win.style.left,
            width: win.style.width,
            height: win.style.height
        };

        win.classList.add('maximized');
        win.style.top = "0px";
        win.style.left = "0px";
        win.style.width = "100vw";
        win.style.height = "100vh";
    }
}

function makeWindowsDraggable() {
    const titles = document.querySelectorAll('.window-title');

    titles.forEach(title => {
        const win = title.closest('.window');
        if (!win) return;

        title.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON' || win.classList.contains('maximized')) return;

            document.querySelectorAll('.window').forEach(w => w.style.zIndex = "10");
            win.style.zIndex = "100";

            let startX = e.clientX;
            let startY = e.clientY;

            let rect = win.getBoundingClientRect();
            let startLeft = rect.left;
            let startTop = rect.top;

            function elementDrag(e) {
                e.preventDefault();
                let dx = e.clientX - startX;
                let dy = e.clientY - startY;

                win.style.left = (startLeft + dx) + "px";
                win.style.top = (startTop + dy) + "px";

                win.style.margin = "0";
            }

            function closeDragElement() {
                document.removeEventListener('mouseup', closeDragElement);
                document.removeEventListener('mousemove', elementDrag);
            }

            document.addEventListener('mouseup', closeDragElement);
            document.addEventListener('mousemove', elementDrag);
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    makeWindowsDraggable();
});

function switchAboutTab(tabId) {
    const tabs = document.querySelectorAll('.about-tab-content');
    tabs.forEach(tab => tab.style.display = 'none');

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.style.display = 'flex';

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.style.border = "2px outset #fff";
        btn.style.opacity = "0.6";
    });

    const clickedBtn = event.currentTarget;
    clickedBtn.style.border = "2px inset #000";
    clickedBtn.style.opacity = "1";
}

// Listen for changes from other tabs/pages
window.addEventListener('storage', (event) => {
    if (event.key === 'sugar_mode_request') {
        const newMode = event.newValue;
        if (newMode) {
            setSugarMode(newMode);
            console.log("Mode updated from dashboard: " + newMode);
        }
    }
});

// Also check the mode immediately when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const savedMode = localStorage.getItem('sugar_mode_request') || 'default';
    setSugarMode(savedMode);
    
    makeWindowsDraggable();
    loadSiteData();
});

// Initialize the audio object globally
const openSound = new Audio('/assets/audio/ui/Maximize.wav');

function playOpen() {
    openSound.currentTime = 0;
    openSound.play().catch(e => console.log("Open audio blocked by browser policy"));
}

function handleSugarClick() {
    // Determine what happens when the avatar is clicked
    if (sugarMode === 'default') {
        const dialogueBox = document.getElementById("dialogue-box");
        dialogueBox.innerText = "Stop poking me!";
        setTimeout(() => setSugarMode('default'), 2000);
    }
}

function triggerBlogAnimation() {
    const chatWin = document.getElementById('window-chat');
    if (chatWin) {
        chatWin.classList.remove('hidden');
        // Set the mode to blogging
        setSugarMode('blogging');
        // Optional: Play a sound
        playOpen(); 
    }
}

async function updateUIStats() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/SugarHyou/sugaroverdosed/main/output/journal.json');
        const data = await res.json();

        if (data.currentStats) {
            const stats = data.currentStats;

            // Update Stress
            document.getElementById('meter-stress').style.width = stats.stress + '%';
            document.getElementById('txt-stress').innerText = stats.stress + '%';

            // Update Affection
            document.getElementById('meter-affection').style.width = stats.affection + '%';
            document.getElementById('txt-affection').innerText = stats.affection + '%';
            
            // Note: If you add darkness to the chat UI later, add it here too:
            // document.getElementById('meter-darkness').style.width = stats.darkness + '%';
        }
    } catch (error) {
        console.error("Failed to sync stats:", error);
    }
}

// Run this when the page loads to ensure stats are current
window.addEventListener('load', () => {
    updateUIStats();
});

// --- CALENDAR ENGINE ---
let date = new Date();


// ==========================================
// CALENDAR & HOLIDAYS SYSTEM (REMIXED)
// ==========================================

const characterEvents = {
    "4-25": ["SugarHyou's Neocities Anniversary! ✨"],
    "10-14": ["SugarHyou's Birthday! ✨"],
    "2026-5-2": ["One4AllTeam Cosplay Meetup"],
    "2026-5-15": ["Comic-Con Revolution Early Badge Pickup"],    
    "2026-5-16": ["Comic-Con Revolution! ✨"],
    "2026-5-17": ["Comic-Con Revolution! ✨"],
    "2026-5-21": ["BN Appt"],
    "2026-5-24": ["BKawaii Market x Kira Kira Gals! ✨"],
    "2026-5-30": ["Anime Riverside ✨"],
    "2026-5-31": ["Anime Riverside ✨"],
    "2026-6-6": ["One4AllTeam "],
    "2026-6-8": ["Photoshoot"],
    "2026-6-19": ["The Nostalgia Con"],
    "2026-6-20": ["Anime Night Mart", "Harajuku Day Swap Meet", "The Nostalgia Con", "Jade's Furry Friends 5K Run/Walk", "QCON", "Santa Ana Flea Market"],
    "2026-6-21": ["The Nostalgia Con", "Anime Night Mart"],
    "2026-6-22": ["STEP"],
    "2026-6-23": ["STEP"],
    "2026-6-24": ["STEP"],
    "2026-6-25": ["STEP"],
    "2026-6-26": ["Fan Expo Anaheim"],
    "2026-6-27": ["Fan Expo Anaheim"],
    "2026-6-28": ["Fan Expo Anaheim"],
    "2026-6-29": ["STEP"],
    "2026-6-30": ["STEP"],
    "2026-7-1": ["STEP"],
    "2026-7-2": ["Anime Expo! ✨", "STEP"],
    "2026-7-3": ["Anime Expo! ✨"],
    "2026-7-4": ["Harajuku Day Swap Meet", "Anime Expo"],
    "2026-7-5": ["Anime Expo"],
    "2026-7-11": ["Spirit of Japan Festival! ✨"],
    "2026-7-12": ["Spirit of Japan Festival"],
    "2026-8-15": ["Sonic Boost"],
    "2026-8-16": ["Sonic Boost"],
    "2026-9-5": ["Anime San Diego! ✨"],
    "2026-9-6": ["Anime San Diego! ✨"],
};

let fetchedHolidays = {};
let loadedHolidayYear = null;
let calDate = new Date(); // Renamed to avoid conflicts

function fetchHolidays(year) {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/US`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            data.forEach(holiday => {
                const parts = holiday.date.split('-'); 
                const key = `${parseInt(parts[0], 10)}-${parseInt(parts[1], 10)}-${parseInt(parts[2], 10)}`;
                fetchedHolidays[key] = holiday.localName;
            });
            renderCalendar();
        })
        .catch(err => console.error("Error fetching holidays:", err));
}

function renderCalendar() {
    const monthDisplay = document.getElementById('monthDisplay');
    const grid = document.getElementById('calendarGrid');
    if (!grid || !monthDisplay) return; 
    
    grid.innerHTML = "";
    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const monthName = calDate.toLocaleString('default', { month: 'long' });
    monthDisplay.innerText = `${monthName} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));

    for (let i = 1; i <= lastDate; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.innerText = i;
        const absKey = `${year}-${month + 1}-${i}`;
        const recKey = `${month + 1}-${i}`;

        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) dayDiv.classList.add('today');

        let dayEvents = [];
        if (characterEvents[absKey]) dayEvents = dayEvents.concat(characterEvents[absKey]);
        if (characterEvents[recKey]) dayEvents = dayEvents.concat(characterEvents[recKey]);
        if (fetchedHolidays[absKey]) dayEvents.push(fetchedHolidays[absKey]);

        if (dayEvents.length > 0) {
            dayDiv.classList.add('event-day');
            const combinedText = dayEvents.join('\n');
            dayDiv.title = combinedText;
            dayDiv.onclick = () => alert(`Events for today:\n\n${combinedText}`);
        }
        grid.appendChild(dayDiv);
    }
}

document.getElementById('prevMonth').onclick = () => { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); };

// Initialize
fetchHolidays(calDate.getFullYear());