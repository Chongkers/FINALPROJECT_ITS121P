const retrieveEntries = () => JSON.parse(localStorage.getItem('entriesDatabase')) || [];

const saveToDatabase = (entries) => {
    localStorage.setItem('entriesDatabase', JSON.stringify(entries));
};

function updateWall() {
    const entries = retrieveEntries();
    const isHomePage = window.location.pathname.includes("index.html");

    const allEntries = [...entries].sort((a, b) => b.createdAt - a.createdAt);
    
    const entriesToShow = isHomePage ? allEntries.slice(0, 2) : allEntries;
    
    renderToContainer('.mainFeed .grid', entriesToShow, false);

    const rankedEntries = [...entries].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 3);
    renderToContainer('.sidebarRight .grid', rankedEntries, true);

}

function renderToContainer(selector, items, isRankedList) {
    const container = document.querySelector(selector);
    if (!container) return;
    container.innerHTML = '';   

    const HomePage = window.location.pathname.includes("index.html");
    let specificClass = selector.includes('.mainFeed') ? 'feed-card' : 'sidebar-card';
    
    if (HomePage && specificClass === 'feed-card') {
        specificClass += ' home-card';
    }

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `card ${specificClass} mb-3`;    

        const rankingBadge = (isRankedList && index === 0 || isRankedList && index === 1 || isRankedList && index || 2) ? 
            `<span class="rank-badge" style="background: #91ff00 !important; margin-right: 10px;">TOP POST</span>` : '';

        card.innerHTML = `
            <div class="card-body">
                <div class="card-content-row">
                    <div class="card-content-left" style="flex: 1; min-width: 0;">
                        <h5 class="card-title">${rankingBadge}${item.username || "Anonymous"}</h5>
                        <p class="card-text" style="color: white;">${item.entries}</p>
                    </div>
                    <div class="sidebarVote">
                        <button class="voteButton" onclick="handleVote(${item.createdAt}, 1)">↑</button>
                        <span class="voteCount">${item.votes || 0}</span>
                        <button class="voteButton" onclick="handleVote(${item.createdAt}, -1)">↓</button>
                    </div>
                </div>
            </div>
            <div class="card-footer" style="background: #2a2a2a; color: #ccc; font-size: 0.8rem; padding: 10px 20px; border-top: 1px solid #555; display: flex; justify-content: space-between; align-items: center;">
                <span>Posted on: ${new Date(item.createdAt).toLocaleDateString()}</span>
                <div class="tag-container">
                    <span class="badge">${item.department || 'N/A'}</span>
                    <span class="badge">${item.year || 'N/A'}</span>
                    <span class="badge">${item.campus || 'N/A'}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function handleSaveData(event) {
    event.preventDefault();
    const getData = new FormData(event.target);
    const entries = retrieveEntries();

    window.location.href = "entryforms.html";

    const rawValue = getData.get("year"); 
    const yearNo = parseInt(rawValue);    
    let studentYear = "N/A";
    if (!isNaN(yearNo)) {
        switch (yearNo) {
            case 1: studentYear = yearNo+"st Year"; break;
            case 2: studentYear = yearNo+"nd Year"; break;
            case 3: studentYear = yearNo+"rd Year"; break;
            default: studentYear = yearNo+"th Year"; break;
        }
    }

    const entry = {
        username: getData.get("username") || "Anonymous",
        entries: getData.get("entries"),
        department: getData.get("department") || "N/A",
        campus: getData.get("campus") || "N/A",
        year: studentYear,
        votes: 0,
        createdAt: new Date().getTime()
    };

    entries.unshift(entry);
    saveToDatabase(entries);
}

window.handleVote = function(id, amount) {
    let entries = retrieveEntries();
    const index = entries.findIndex(item => item.createdAt == id);
    if (index !== -1) {
        let currentVotes = entries[index].votes || 0
        if (currentVotes + amount >= 0){
        entries[index].votes = currentVotes + amount;
        saveToDatabase(entries);
        updateWall();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const entryForm = document.getElementById('entryForm');
    if (entryForm) {
        entryForm.addEventListener("submit", handleSaveData);
    }
    const clearBtn = document.getElementById("clearWall");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to wipe the entire Mapuan Wall?")) {
                localStorage.removeItem("entriesDatabase");
                window.location.reload();
            }
        });
    }
    const homeBtn = document.getElementById('homeButton');
    if (homeBtn) {
        homeBtn.textContent = 'Submit an Entry';
    }
    
    updateWall();
});

function successfulEntry() {
    const entryUploaded = document.getElementById('submitEntry');
    const form = document.getElementById("entryForm")
    if (form.reportValidity()) {
        if(entryUploaded){
            alert("Entry submitted, thank you!");
        }
    }
    
}
