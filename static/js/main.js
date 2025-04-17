/**
 * SEO PRO - Professional Hugo Blogger Template
 * Main JavaScript - Enhanced Version
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Toggle search overlay with live search capabilities
    const searchToggle = document.querySelector('.search-toggle');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearch = document.getElementById('close-search');
    const searchInput = document.querySelector('.search-form input[type="search"]');
    const searchForm = document.querySelector('.search-form');

    if (searchToggle && searchOverlay && closeSearch) {
        // Initialize search overlay
        searchToggle.addEventListener('click', function(e) {
            e.preventDefault();
            searchOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                searchOverlay.querySelector('input').focus();
            }, 200);
        });

        closeSearch.addEventListener('click', function() {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close search on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Live search functionality
        if (searchInput && searchForm) {
            // Add live search results container
            const liveSearchResults = document.createElement('div');
            liveSearchResults.className = 'live-search-results';
            searchForm.appendChild(liveSearchResults);

            // Add styles for live search
            const style = document.createElement('style');
            style.textContent = `
                .live-search-results {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border-radius: 0 0 5px 5px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    max-height: 300px;
                    overflow-y: auto;
                    display: none;
                    z-index: 100;
                    margin-top: 5px;
                }
                .live-search-item {
                    padding: 12px 15px;
                    border-bottom: 1px solid #f1f1f1;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                .live-search-item:hover {
                    background: #f8f9fa;
                }
                .live-search-item:last-child {
                    border-bottom: none;
                }
                .live-search-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #343a40;
                }
                .live-search-excerpt {
                    font-size: 0.85rem;
                    color: #6c757d;
                    margin-bottom: 0;
                }
                .live-search-meta {
                    display: flex;
                    font-size: 0.8rem;
                    color: #adb5bd;
                    margin-top: 5px;
                }
                .live-search-meta span {
                    margin-right: 10px;
                }
                .live-search-loader {
                    padding: 15px;
                    text-align: center;
                }
                .live-search-no-results {
                    padding: 15px;
                    text-align: center;
                    color: #6c757d;
                }
                .search-form {
                    position: relative;
                }
            `;
            document.head.appendChild(style);

            let searchTimeout;
            let searchCache = {};
            
            // Handle input in search box
            searchInput.addEventListener('input', function() {
                const query = this.value.trim();
                
                clearTimeout(searchTimeout);
                
                if (query.length < 3) {
                    liveSearchResults.style.display = 'none';
                    return;
                }
                
                liveSearchResults.style.display = 'block';
                liveSearchResults.innerHTML = '<div class="live-search-loader">Searching...</div>';
                
                // Debounce search to avoid too many requests
                searchTimeout = setTimeout(() => {
                    performLiveSearch(query);
                }, 300);
            });
            
            // Hide live search results when clicking outside
            document.addEventListener('click', function(e) {
                if (!searchForm.contains(e.target)) {
                    liveSearchResults.style.display = 'none';
                }
            });
            
            // Perform live search
            function performLiveSearch(query) {
                // Check if we have cached results
                if (searchCache[query]) {
                    displayLiveSearchResults(searchCache[query], query);
                    return;
                }
                
                // Fetch search index
                fetch('/index.json')
                    .then(response => response.json())
                    .then(data => {
                        const results = searchInData(data.items, query);
                        searchCache[query] = results; // Cache results
                        displayLiveSearchResults(results, query);
                    })
                    .catch(error => {
                        console.error('Error fetching search data:', error);
                        liveSearchResults.innerHTML = '<div class="live-search-no-results">Error loading search results</div>';
                    });
            }
            
            // Search in JSON data
            function searchInData(items, query) {
                query = query.toLowerCase();
                
                return items.filter(item => {
                    const titleMatch = item.title.toLowerCase().includes(query);
                    const contentMatch = item.content_html.toLowerCase().includes(query);
                    const summaryMatch = item.summary.toLowerCase().includes(query);
                    const tagsMatch = item.tags && item.tags.some(tag => 
                        tag.toLowerCase().includes(query)
                    );
                    const categoriesMatch = item.categories && item.categories.some(category => 
                        category.toLowerCase().includes(query)
                    );
                    
                    return titleMatch || contentMatch || summaryMatch || tagsMatch || categoriesMatch;
                }).slice(0, 5); // Limit to top 5 results for quick display
            }
            
            // Display live search results
            function displayLiveSearchResults(results, query) {
                if (results.length === 0) {
                    liveSearchResults.innerHTML = '<div class="live-search-no-results">No results found</div>';
                    return;
                }
                
                let resultsHTML = '';
                
                results.forEach(item => {
                    const date = new Date(item.date_published);
                    const formattedDate = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    
                    // Highlight matching text in title and excerpt
                    let title = highlightText(item.title, query);
                    let excerpt = item.summary;
                    excerpt = excerpt.length > 120 ? excerpt.substring(0, 120) + '...' : excerpt;
                    excerpt = highlightText(excerpt, query);
                    
                    resultsHTML += `
                        <a href="${item.url}" class="live-search-item">
                            <div class="live-search-title">${title}</div>
                            <div class="live-search-excerpt">${excerpt}</div>
                            <div class="live-search-meta">
                                <span>${formattedDate}</span>
                                ${item.categories ? `<span>${item.categories.join(', ')}</span>` : ''}
                            </div>
                        </a>
                    `;
                });
                
                liveSearchResults.innerHTML = resultsHTML;
                
                // Add click handler
                liveSearchResults.querySelectorAll('.live-search-item').forEach(item => {
                    item.addEventListener('click', function(e) {
                        e.preventDefault();
                        window.location.href = this.getAttribute('href');
                    });
                });
            }
            
            // Highlight matching text
            function highlightText(text, query) {
                if (!query || !text) return text;
                
                const regex = new RegExp('(' + query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + ')', 'gi');
                return text.replace(regex, '<mark>$1</mark>');
            }
            
            // Add keyboard navigation for search results
            searchInput.addEventListener('keydown', function(e) {
                const items = liveSearchResults.querySelectorAll('.live-search-item');
                const activeItem = liveSearchResults.querySelector('.live-search-item.active');
                let index = -1;
                
                if (items.length === 0) return;
                
                if (activeItem) {
                    for (let i = 0; i < items.length; i++) {
                        if (items[i] === activeItem) {
                            index = i;
                            break;
                        }
                    }
                }
                
                // Arrow down
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (index < items.length - 1) {
                        if (activeItem) activeItem.classList.remove('active');
                        items[index + 1].classList.add('active');
                        ensureVisible(items[index + 1], liveSearchResults);
                    }
                }
                
                // Arrow up
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (index > 0) {
                        if (activeItem) activeItem.classList.remove('active');
                        items[index - 1].classList.add('active');
                        ensureVisible(items[index - 1], liveSearchResults);
                    }
                }
                
                // Enter
                if (e.key === 'Enter' && activeItem) {
                    e.preventDefault();
                    window.location.href = activeItem.getAttribute('href');
                }
            });
            
            // Ensure element is visible in scrollable container
            function ensureVisible(element, container) {
                const containerTop = container.scrollTop;
                const containerBottom = containerTop + container.clientHeight;
                const elementTop = element.offsetTop;
                const elementBottom = elementTop + element.clientHeight;
                
                if (elementTop < containerTop) {
                    container.scrollTop = elementTop;
                } else if (elementBottom > containerBottom) {
                    container.scrollTop = elementBottom - container.clientHeight;
                }
            }
        }
    }

    // Initialize Feather Icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Comment form validation
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const comment = document.getElementById('comment').value.trim();
            
            if (name === '' || email === '' || comment === '') {
                alert('Please fill in all required fields.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Here you would normally submit the form with AJAX
            alert('Comment submitted successfully! It will be visible after review.');
            commentForm.reset();
        });
    }

    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Subscribe form validation
    const subscribeForm = document.querySelector('.subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value.trim();
            
            if (email === '') {
                alert('Please enter your email address.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Here you would normally submit the form with AJAX
            alert('Thank you for subscribing!');
            subscribeForm.reset();
        });
    }

    // Add table class to all tables in post content
    document.querySelectorAll('.post-content table').forEach(table => {
        table.classList.add('table', 'table-bordered');
    });

    // Add active class to current menu item
    const currentLocation = window.location.pathname;
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        if (link.getAttribute('href') === currentLocation) {
            link.classList.add('active');
        }
    });
});
