document.addEventListener('DOMContentLoaded', () => {
    const docsGrid = document.getElementById('docsGrid');
    const loading = document.getElementById('loading');
    const searchInput = document.getElementById('searchInput');
    const filtersContainer = document.getElementById('filters');
    const noResults = document.getElementById('noResults');

    let allDocs = [];
    let currentCategory = 'All';

function calculateReadingTime(markdown) {
    const text = markdown
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/<[^>]*>/g, ' ');

    const words = text.match(/\b[\w'-]+\b/g) || [];
    const minutes = Math.max(1, Math.ceil(words.length / 200));

    return `${minutes} min read`;
}


    // 1. Fetch the data from data.json
    async function fetchDocs() {
        try {
            // Added cache busting for local dev
            const response = await fetch('data.json?t=' + new Date().getTime());
            if (!response.ok) throw new Error('Failed to fetch data');

            allDocs = await response.json();

            // Initial Render
            loading.classList.add('hidden');
            setupFilters();
            renderDocs(allDocs);
        } catch (error) {
            console.error('Error fetching docs:', error);
            loading.innerHTML = `<span style="color: #ef4444;">Failed to load documentation data. Please ensure you are running this via a local server.</span>`;
        }
    }

    // 2. Setup Category Filters dynamically based on data
    function setupFilters() {
        // Extract unique categories
        const categories = ['All', ...new Set(allDocs.map(doc => doc.category))];

        filtersContainer.innerHTML = categories.map(cat => `
            <button class="filter-btn ${cat === 'All' ? 'active' : ''}" data-category="${cat}">
                ${cat}
            </button>
        `).join('');

        // Add event listeners to filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Set current category and filter
                currentCategory = e.target.getAttribute('data-category');
                filterAndRender();
            });
        });
    }

    // 3. Render function
    function renderDocs(docs) {
        if (docs.length === 0) {
            docsGrid.innerHTML = '';
            noResults.classList.remove('hidden');
            return;
        }

        noResults.classList.add('hidden');


docsGrid.innerHTML = docs.map(doc => `
    <a href="${doc.url}" target="_blank" rel="noopener noreferrer" class="card">
        <div class="card-category">${doc.category}</div>
        <h3 class="card-title">${doc.title}</h3>
        <p class="card-desc">${doc.description}</p>
        <span class="reading-time">${calculateReadingTime(
            doc.content || doc.markdown || doc.description || ''
        )}</span>
        <div class="card-tags">
            ${(doc.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('')}
        </div>
    </a>
`).join('');

    }

    // 4. Combined Filter and Search Logic
    function filterAndRender() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        const filteredDocs = allDocs.filter(doc => {
            // Category match
            const matchesCategory = currentCategory === 'All' || doc.category === currentCategory;

            // Search match (title, description, tags)
            const matchesSearch =
                doc.title.toLowerCase().includes(searchTerm) ||
                doc.description.toLowerCase().includes(searchTerm) ||
                doc.tags.some(tag => tag.toLowerCase().includes(searchTerm));

            return matchesCategory && matchesSearch;
        });

        renderDocs(filteredDocs);
    }

    // 5. Search Event Listener (with debounce for performance)
    let timeoutId;
    searchInput.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            filterAndRender();
        }, 300); // 300ms delay
    });

    // Initialize App
    fetchDocs();
});
