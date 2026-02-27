// --- 1. DATA MANAGEMENT ---
const retrieveEntries = () => JSON.parse(localStorage.getItem('entriesDatabase')) || [];

const saveToDatabase = (entries) => {
    localStorage.setItem('entriesDatabase', JSON.stringify(entries));
};

// --- 2. UI UPDATES & RENDERING ---
function updateWall() {
    const entries = retrieveEntries();
    const isHomePage = window.location.pathname.includes("index.html");

    // Main Feed: Newest first
    const allEntries = [...entries].sort((a, b) => b.createdAt - a.createdAt);
    
    // If on home page, only show the latest 4
    const entriesToShow = isHomePage ? allEntries.slice(0, 2) : allEntries;
    
    renderToContainer('.mainFeed .grid', entriesToShow, false);

    // Sidebar: Top 3
    const rankedEntries = [...entries].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 3);
    renderToContainer('.sidebarRight .grid', rankedEntries, true);
}

function renderToContainer(selector, items, isRankedList) {
    const container = document.querySelector(selector);
    if (!container) return;
    container.innerHTML = '';

    const HomePage = window.location.pathname.includes("index.html");
    let specificClass = selector.includes('.mainFeed') ? 'feed-card' : 'sidebar-card';
    
    // FIX: Added a space before 'home-card' so it becomes a separate class
    if (HomePage && specificClass === 'feed-card') {
        specificClass += ' home-card';
    }

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `card ${specificClass} mb-3`;    

        const yearNo = item.year;

        switch (item.year) {
            case 1: item.year = "1st Year"; break;
            case 2: item.year = "2nd Year"; break;
            case 3: item.year = "3rd Year"; break;
            default: item.year = item.year+"th Year"; break;
        }

        // Show Top Post badge only for the #1 spot in the sidebar
        const rankingBadge = (isRankedList && index === 0 || isRankedList && index === 1 || isRankedList && index || 2) ? 
            `<span class="badge" style="background: #91ff00 !important; margin-right: 10px;">TOP POST</span>` : '';

        card.innerHTML = `
            <div class="card-body" style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div class="card-content-left" style="flex: 1;">
                    <h5 class="card-title">${rankingBadge}${item.username || "Anonymous"}</h5>
                    <p class="card-text" style="color: white;">${item.entries}</p>
                    <div class="tag-container" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-bottom: 5px;">
                        <span class="badge">${item.department || 'N/A'}</span>
                        <span class="badge">${item.year || 'N/A'}</span>
                        <span class="badge">${item.campus || 'N/A'}</span>
                    </div>
                </div>
                <div class="sidebarVote">
                    <button class="voteButton" onclick="handleVote(${item.createdAt}, 1)">↑</button>
                    <span class="voteCount">${item.votes || 0}</span>
                    <button class="voteButton" onclick="handleVote(${item.createdAt}, -1)">↓</button>
                </div>
            </div>
            <div class="card-footer" style="background: #2a2a2a; color: #ccc; font-size: 0.8rem; padding: 10px 20px; border-top: 1px solid #555;">
                Posted on: ${new Date(item.createdAt).toLocaleDateString()}
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 3. EVENT HANDLERS ---
function handleSaveData(event) {
    event.preventDefault();
    const getData = new FormData(event.target);
    const entries = retrieveEntries();

    const entry = {
        username: getData.get("username") || "Anonymous",
        entries: getData.get("entries"),
        department: getData.get("department") || "N/A",
        campus: getData.get("campus") || "N/A",
        year: getData.get("year") || "N/A",
        votes: 0,
        createdAt: new Date().getTime()
    };

    entries.unshift(entry);
    saveToDatabase(entries);
    window.location.href = "forms.html"; // Redirect after saving
}

window.handleVote = function(id, amount) {
    let entries = retrieveEntries();
    const index = entries.findIndex(item => item.createdAt == id);
    if (index !== -1) {
        entries[index].votes = (entries[index].votes || 0) + amount;
        saveToDatabase(entries);
        updateWall(); // Refresh the UI immediately
    }
};

// --- 4. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Form Submission
    const entryForm = document.getElementById('entryForm');
    if (entryForm) {
        entryForm.addEventListener("submit", handleSaveData);
    }

    // Clear Wall
    const clearBtn = document.getElementById("clearWall");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to wipe the entire Mapuan Wall?")) {
                localStorage.removeItem("entriesDatabase");
                window.location.reload();
            }
        });
    }

    // Submit Entry Button Text (Home Page)
    const homeBtn = document.getElementById('homeButton');
    if (homeBtn) {
        homeBtn.textContent = 'Submit an Entry';
    }

    // Initial Render
    updateWall();
});

