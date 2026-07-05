const dialogueTree = {
    start: {
        text: "HIIII!!! Welcome! I'm Sugar. I like breakcore, hyperpop, alt fashion and Nintendo games!",
        typingImage: "/assets/art/Sugar-(Jul-3-2026).png", 
        gifImage: "/assets/art/Sugar-2-(Jul-3-2026).gif",    
        choices: [
            { text: "Breakcore?", nextNode: "breakcore" },
            { text: "Nintendo games?", nextNode: "nintendoGames" },
        ]
    },
    breakcore: {
        text: "Uhhhh, I don't really know how to explain it... I think the best way to put it is to give a 12-year-old unlimited access to Bandcamp LOL! That's basically Breakcore.",
        typingImage: "sugar_angry.png",
        gifImage: "/assets/art/Sugar-(Jul-3-2026).gif",
        choices: [
            { text: "Oh, ok!", nextNode: "start" }
        ]
    },
    nintendoGames: {
        text: "Yeah! Like, Splatoon and Pokemon 'n shit. My favorite game right now is probz Splat 3.",
        typingImage: "sugar_hyped.png",
        gifImage: "/assets/art/Sugar-(Jul-3-2026).gif",
        choices: [
            { text: "Nice!", nextNode: "start" }
        ]
    },
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
            <article class="post-card" style="border: 1px solid red; width: 100%; padding: 10px; margin: 0;">
                <div class="post-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <!-- Your new avatar path -->
                    <img src="/assets/art/Sugar-3-(Jul-4-2026).png" style="width: 40px; height: 40px; border: 1px solid red;" alt="PFP">
                    <div class="post-meta" style="display: flex; flex-direction: column;">
                        <span class="username" style="font-weight: 900; color: var(--hot-pink);">X-SugarOverdose-X</span>
                        <span class="date" style="font-size: 0.8rem; color: dodgerblue; opacity: 0.8;">${latest.date}</span>
                    </div>
                </div>
                ${latest.title ? `<h3 class="post-title" style="margin: 5px 0;">${latest.title}</h3>` : ''}
                <div class="post-content" style="font-size: 0.95rem; line-height: 1.3;">
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