const dialogueTree = {
    start: {
        text: "HIIII!!! Welcome to my desktop space! Did you remember to play some Amen Breaks before entering? >:3CCC",
        typingImage: "/assets/art/Andy-(Jul-3-2026).png", 
        gifImage: "/assets/art/Sugar-(Jul-3-2026).gif",    
        choices: [
            { text: "Yes, loud and glitchy!", nextNode: "happyResponse" },
            { text: "No, it's completely quiet...", nextNode: "madResponse" }
        ]
    },
    happyResponse: {
        text: "YAAAS! Absolute optimization! Let's overload the network with infinite colors together!!! ✨💖⚡",
        typingImage: "sugar_hyped.png",
        gifImage: "/assets/art/Sugar-(Jul-3-2026).gif",
        choices: [
            { text: "Keep blasting tracks!", nextNode: "start" }
        ]
    },
    madResponse: {
        text: "CRITICAL SYSTEM ERROR!!! How dare you browse my neon reality in silence?! Go turn on some Sewerslvt right now! 💢⚡🌀",
        typingImage: "sugar_angry.png",
        gifImage: "/assets/art/Sugar-(Jul-3-2026).gif",
        choices: [
            { text: "Sorry! I'm putting it on now!", nextNode: "start" }
        ]
    }
};

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
    const node = dialogueTree[nodeKey];
    const textElement = document.getElementById("dialogue-box");
    const optionsElement = document.getElementById("options-box");
    const avatarImg = document.getElementById("sugar-avatar");

    clearTimeout(currentTypingTimer);
    textElement.innerHTML = "";
    optionsElement.innerHTML = "";

    avatarImg.src = node.typingImage;

    typeWriterEffect(node.text, 0, textElement, () => {
        avatarImg.src = node.gifImage;

        node.choices.forEach(choice => {
            const button = document.createElement("button");
            button.className = "dialogue-choice";
            button.innerText = `► ${choice.text}`;
            button.onclick = () => loadNode(choice.nextNode);
            optionsElement.appendChild(button);
        });
    });
}

window.onload = () => {
    loadNode('start');
};

async function fetchLatestPost() {
    try {
        // Fetches your journal file relative to your new site root
        const res = await fetch('/output/journal.json');
        if (!res.ok) throw new Error("No posts found yet!");
        
        const posts = await res.json();
        const latest = posts[0]; 
        const container = document.getElementById('latest-post-content');

        container.innerHTML = `
            <article class="post-card" style="width: 100%; margin: 0; font-family: inherit;">
                <div class="post-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <!-- Your new avatar path -->
                    <img src="/assets/art/Andy-(Jul-3-2026).png" style="width: 40px; height: 40px; border: 2px solid var(--hot-pink);" alt="PFP">
                    <div class="post-meta" style="display: flex; flex-direction: column;">
                        <span class="username" style="font-weight: 900; color: var(--hot-pink);">† SugarOverdose-chan †</span>
                        <span class="date" style="font-size: 0.8rem; color: var(--deep-ink); opacity: 0.8;">${latest.date}</span>
                    </div>
                </div>
                ${latest.title ? `<h3 class="post-title" style="margin: 5px 0; color: var(--cyan); text-shadow: 1px 1px var(--deep-ink);">${latest.title}</h3>` : ''}
                <div class="post-content" style="font-size: 0.95rem; line-height: 1.3; color: var(--deep-ink);">
                    <p style="margin: 0; white-space: pre-wrap;">${latest.content}</p>
                </div>
            </article>
        `;
    } catch (e) {
        console.error("Could not load latest post:", e);
        document.getElementById('latest-post-content').innerHTML = `
            <div style="text-align: center; color: var(--hot-pink); font-weight: bold; padding: 10px;">
                STATUS: WAITING FOR FIRST BROADCAST...
            </div>
        `;
    }
}

// Fire it off when the page loads
fetchLatestPost();