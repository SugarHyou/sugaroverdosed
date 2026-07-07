const IS_DEV_MODE = true;

const dialogueTree = {
    start: {
        text: "Sugar is turned away, busy doing something at their desk. Try to get their attention!",
        typingImage: "/assets/art/SUGARWIP.png",
        gifImage: "/assets/art/SUGARWIP.png",
        choices: []
    },
    startShock: {
        text: "Huh... OH!! Someone is actually here?! Oh my God, hold on, don't look at me yet—",
        typingImage: "/assets/art/SUGARWIP2.png",
        gifImage: "/assets/art/SUGARWIP2.png",
        choices: [
            { text: "It's okay!", nextNode: "introHappy" },
            { text: "Who are you?", nextNode: "introQues" },
            { text: "Take your time.", nextNode: "introHappy" },
            { text: "...", nextNode: "introQuiet" }
        ]
    },
    introHappy: {
        text: "Thank you, just... One sec... Okay! Hi! I'm Sugar! Welcome to my website! There's not much going on right now, but... Well, actually, hold on... OKAY! I just unlocked my 'About Me' text file so you have something to do. Check it out!",
        typingImage: "/assets/art/",
        gifImage: "/assets/art/",
        choices: [
            { text: "Nice to meet you!", nextNode: "mainMenu" }
        ],
        onLoad: () => {
            localStorage.setItem('sugar_intro_done', 'true');
        }
    },
    introQues: {
        text: "One sec... Okay! Uh-I'm Sugar! I don't know how else to answer that question other than my name... Y'know what? I made something that could help. Here, there should be a new 'About Me' file on the site! Look through it so... You know. Your question will be answered there.",
        typingImage: "/assets/art/",
        gifImage: "/assets/art/",
        choices: [
            { text: "Thanks!", nextNode: "mainMenu" }
        ],
        onLoad: () => {
            localStorage.setItem('sugar_intro_done', 'true');
        }
    },
    introQuiet: { 
        text: "... Um. Okay, I think I'm good now. Hi...? I'm Sugar. Are you not very talkative? It's kinda creepy to just stare... Well, that's okay! I can talk for the both of us. Wait, actually-I have something you might like! Click on the new 'About Me' icon that just showed up. It's just reading, no talking, promise! Just to get to know a bit about... Uh. I guess It's self explanatory.",
        typingImage: "/assets/art/",
        gifImage: "/assets/art/",
        choices: [
            { text: "Continue.", nextNode: "mainMenu" }
        ],
        onLoad: () => {
            localStorage.setItem('sugar_intro_done', 'true');
        }
    },
    mainMenu: {
        text: "So, what's up?",
        typingImage: "/assets/art/Sugar-(Jul-3-2026).png",
        gifImage: "/assets/art/Sugar-2-(Jul-3-2026).gif",
        choices: [
        ]
    },
};

let currentDialogueNode = 'start';

function handleSugarClick() {
    if (currentDialogueNode === 'start') {
        playClick();
        currentDialogueNode = 'startShock';
        loadNode('startShock');
    }
}

let currentTypingTimer = null;

function typeWriterEffect(text, index, element, callback) {
    if (index < text.length) {
        element.innerHTML += text.charAt(index);
        currentTypingTimer = setTimeout(() => {
            typeWriterEffect(text, index + 1, element, callback);
        }, 25);
    } else if (callback) {
        callback();
    }
}

function loadNode(nodeKey) {
    currentDialogueNode = nodeKey;
    if (!IS_DEV_MODE) {
        const pstTimeStr = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", hour12: false });
        const pstHour = parseInt(pstTimeStr, 10);
        if (pstHour >= 21 || pstHour < 9) return;
    }

    const node = dialogueTree[nodeKey];
    const textElement = document.getElementById("dialogue-box");
    const optionsElement = document.getElementById("options-box");
    const avatarImg = document.getElementById("sugar-avatar");

    clearTimeout(currentTypingTimer);
    textElement.innerHTML = "";
    optionsElement.innerHTML = "";

    if (avatarImg) avatarImg.src = node.typingImage;

    if (node.onLoad) {
        node.onLoad();
    }

    if (nodeKey === 'mainMenu') {
        if (unlockedInteractions.username) {
            node.choices.push({ text: "Where did your username come from?", nextNode: "loreUsername" });
        }
    }

    typeWriterEffect(node.text, 0, textElement, () => {
        if (avatarImg) avatarImg.src = node.gifImage;

        node.choices.forEach(choice => {
            const button = document.createElement("button");
            button.className = "dialogue-choice";
            button.innerText = `► ${choice.text}`;
            button.onclick = () => loadNode(choice.nextNode);
            optionsElement.appendChild(button);
        });
    });
}

const clickSound = new Audio('/assets/audio/ui/Default Beep.wav');
const openSound = new Audio('/assets/audio/ui/Maximize.wav');

function playClick() {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log("Click audio blocked"));
}

function playOpen() {
    openSound.currentTime = 0;
    openSound.play().catch(e => console.log("Open audio blocked"));
}

function updateMeters(stats) {
    const defaultStats = { stress: 20, affection: 50 };
    const current = stats || defaultStats;

    const stressMeter = document.getElementById('meter-stress');
    const affectionMeter = document.getElementById('meter-affection');

    if (stressMeter) {
        stressMeter.style.width = `${current.stress}%`;
        document.getElementById('txt-stress').innerText = `${current.stress}%`;
    }
    if (affectionMeter) {
        affectionMeter.style.width = `${current.affection}%`;
        document.getElementById('txt-affection').innerText = `${current.affection}%`;
    }
}

function restoreUnlockedApps() {
    const possibleWindows = ['window-about', 'window-chat'];

    possibleWindows.forEach(id => {
        if (localStorage.getItem(`unlocked_${id}`) === 'true') {
            addShortcutToDesktop(id);
        }
    });
}

async function loadSiteData() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/SugarHyou/sugaroverdosed/main/output/journal.json');
        if (!res.ok) throw new Error("Could not download database core.");
        const data = await res.json();

        updateMeters(data.currentStats);

        const posts = data.posts || [];
        const container = document.getElementById('latest-post-content');

        if (container) {
            if (posts.length > 0) {
                const latest = posts[0];
                container.innerHTML = `
                    <article class="post-card" style="width: 100%; margin: 0;">
                        <div class="post-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <img src="/assets/art/Sugar-3-(Jul-4-2026).png" style="width: 40px; height: 40px; border: 1px solid red;" alt="PFP">
                            <div class="post-meta" style="display: flex; flex-direction: column;">
                                <span class="username" style="font-weight: 900; color: var(--hot-pink);">Sugar</span>
                                <span class="date" style="font-size: 0.8rem; color: dodgerblue; opacity: 0.8;">${latest.date}</span>
                            </div>
                        </div>
                        ${latest.title ? `<h3 class="post-title" style="margin: 5px 0;">${latest.title}</h3>` : ''}
                        <div class="post-content" style="font-size: 0.95rem; line-height: 1.3;">
                            <p style="margin: 0; white-space: pre-wrap;">${latest.content}</p>
                        </div>
                    </article>
                `;
            } else {
                container.innerHTML = `
                    <div style="text-align: center; color: hotpink; font-weight: bold; padding: 10px;">
                        STATUS: WAITING FOR FIRST BROADCAST...
                    </div>
                `;
            }
        }
    } catch (e) {
        console.error("Failed executing synchronization matrix:", e);
        const container = document.getElementById('latest-post-content');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; color: red; font-weight: bold; padding: 10px;">
                    ERROR SYNCING SYSTEM DATABASE CORE...
                </div>
            `;
        }
    }
}

function applySleepCycleSystem() {
    const statusElement = document.getElementById('online-status');
    const avatarImg = document.getElementById("sugar-avatar");
    const dialogueBox = document.getElementById("dialogue-box");
    const optionsBox = document.getElementById("options-box");
    const blogWindow = document.getElementById('window-blog');
    const fullBodyImg = document.getElementById('sugar-fullbody');

    if (!statusElement) return;

    let isSleeping = false;

    if (!IS_DEV_MODE) {
        const pstTimeStr = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", hour12: false });
        const pstHour = parseInt(pstTimeStr, 10);
        if (pstHour >= 21 || pstHour < 9) {
            isSleeping = true;
        }
    }

    if (isSleeping) {
        statusElement.style.color = "red";
        statusElement.style.animation = "none";
        statusElement.innerText = "🔴 OFFLINE";

        if (avatarImg) avatarImg.src = "/assets/art/Sugar-sleeping.png";
        if (dialogueBox) dialogueBox.innerHTML = `Sugar is recharging their brain right now. Check back in the morning!`;
        if (optionsBox) optionsBox.innerHTML = "";
        if (blogWindow) blogWindow.style.display = "none";
        if (fullBodyImg) fullBodyImg.style.visibility = "hidden";
    } else {
        statusElement.style.color = "lime";
        statusElement.style.animation = "blinker 1.5s linear infinite";
        statusElement.innerText = "🟢 ONLINE";

        if (blogWindow) blogWindow.style.display = "block";
        if (fullBodyImg) fullBodyImg.style.visibility = "visible";
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadSiteData();
    applySleepCycleSystem();
    restoreUnlockedApps();
    makeWindowsDraggable();

    const hasSeenIntro = localStorage.getItem('sugar_intro_done') === 'true';

    if (IS_DEV_MODE) {
        if (!hasSeenIntro) {
            loadNode('start');
        } else {
            loadNode('mainMenu');
        }
    } else {
        const pstHour = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", hour12: false });
        if (pstHour >= 9 && pstHour < 21) {
            if (!hasSeenIntro) {
                loadNode('start');
            } else {
                loadNode('mainMenu');
            }
        }
    }
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

const unlockedApps = new Set();

function unlockDesktopFile(windowId, iconEmoji, filenameText) {
    if (unlockedApps.has(windowId)) return;

    const desktopGrid = document.getElementById('desktop-grid');
    if (!desktopGrid) return;

    const shortcutElement = document.createElement('a');
    shortcutElement.href = "javascript:void(0)";
    shortcutElement.onclick = () => {
        toggleWindow(windowId);
        playOpen();
    };
    shortcutElement.style = "display: flex; flex-direction: column; align-items: center; text-decoration: none; color: #000; text-align: center; animation: blinker 0.5s ease 3;";
    shortcutElement.innerHTML = `
        <span style="font-size: 2.2rem;">${iconEmoji}</span>
        <span style="color: white; padding: 1px 4px; font-weight: bold;">${filenameText}</span>
    `;

    desktopGrid.appendChild(shortcutElement);
    unlockedApps.add(windowId);
    makeWindowsDraggable();

    localStorage.setItem(`unlocked_${windowId}`, 'true');
}

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

function addShortcutToDesktop(windowId) {
    if (unlockedApps.has(windowId)) return;

    const desktopGrid = document.getElementById('desktop-grid');
    if (!desktopGrid) return;

    const iconConfig = {
        'window-chat': { emoji: '💬', text: 'chat.exe' }
    };

    const config = iconConfig[windowId];
    if (!config) return;

    const shortcutElement = document.createElement('a');
    shortcutElement.href = "javascript:void(0)";
    shortcutElement.onclick = () => {
        toggleWindow(windowId);
        playOpen();
    };
    shortcutElement.classList.add('app', 'flex', 'column');
    shortcutElement.innerHTML = `
        <span class="app-icon">${config.emoji}</span>
        <span class="app-name" style="background: orange; color: white;">${config.text}</span>
    `;

    desktopGrid.appendChild(shortcutElement);
    unlockedApps.add(windowId);
}

// Tracks if the user has clicked these things
const unlockedInteractions = JSON.parse(localStorage.getItem('unlocked_interactions')) || {
    username: false,
    art: false,
    breakcore: false,
    weather: false
};

function unlockInteraction(key) {
    unlockedInteractions[key] = true;
    localStorage.setItem('unlocked_interactions', JSON.stringify(unlockedInteractions));
    playClick();
    loadNode(currentDialogueNode);
}
