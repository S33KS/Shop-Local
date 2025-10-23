// Script2.js - Creators Section Implementation

// Creators Management Functions
function getTopCreators() {
    const shops = getShopsFromStorage();
    const users = getUsers();
    const itemLikes = getItemLikes();
    
    // Calculate scores for each user
    const creatorScores = {};
    
    users.forEach(user => {
        // Get user's shops
        const userShops = shops.filter(shop => shop.owner === user.username);
        
        // Calculate total upvotes from user's shops
        const totalUpvotes = userShops.reduce((sum, shop) => sum + (shop.upvotes || 0), 0);
        
        // Calculate total item likes from user's shops
        let totalItemLikes = 0;
        userShops.forEach(shop => {
            if (shop.items) {
                shop.items.forEach((item, index) => {
                    const itemKey = `${shop.id}_${index}`;
                    totalItemLikes += itemLikes[itemKey] || 0;
                });
            }
        });
        
        // Calculate score (you can adjust the weighting)
        const score = (userShops.length * 2) + totalUpvotes + totalItemLikes;
        
        creatorScores[user.username] = {
            username: user.username,
            city: user.city,
            shopCount: userShops.length,
            totalUpvotes: totalUpvotes,
            totalItemLikes: totalItemLikes,
            score: score,
            joinedDate: user.joinedDate
        };
    });
    
    // Convert to array and sort by score
    const creatorsArray = Object.values(creatorScores)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10 creators
    
    return creatorsArray;
}

function renderCreatorsSection(creators, containerId) {
    const container = document.getElementById(containerId);
    
    if (creators.length === 0) {
        container.innerHTML = `
            <div style="color: #666; text-align: center; padding: 40px;">
                <i class="fas fa-users" style="font-size: 40px; color: #88cfc8; margin-bottom: 15px;"></i>
                <p>No creators yet</p>
                <p style="font-size: 12px;">Be the first to create shops and become a top creator!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = creators.map((creator, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        
        return `
            <div class="creator-card" onclick="viewCreatorProfile('${creator.username}')">
                <div class="creator-rank ${rankClass}">
                    ${rank <= 3 ? getRankIcon(rank) : rank}
                </div>
                <div class="creator-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="creator-info">
                    <div class="creator-username">${creator.username}</div>
                    <div class="creator-city">
                        <i class="fas fa-map-marker-alt"></i>
                        ${creator.city}
                    </div>
                    <div class="creator-stats">
                        <div class="creator-stat">
                            <i class="fas fa-store"></i>
                            <span>${creator.shopCount} shops</span>
                        </div>
                        <div class="creator-stat">
                            <i class="fas fa-arrow-up"></i>
                            <span>${formatVoteCount(creator.totalUpvotes)}</span>
                        </div>
                        <div class="creator-stat">
                            <i class="fas fa-heart"></i>
                            <span>${formatVoteCount(creator.totalItemLikes)}</span>
                        </div>
                    </div>
                </div>
                <div class="creator-score">
                    <div class="score-value">${formatVoteCount(creator.score)}</div>
                    <div class="score-label">points</div>
                </div>
            </div>
        `;
    }).join('');
}

function getRankIcon(rank) {
    const icons = {
        1: '',
        2: '', 
        3: ''
    };
    return icons[rank] || rank;
}

function viewCreatorProfile(username) {
    const currentUser = getCurrentUser();
    
    if (currentUser && currentUser.username === username) {
        // Navigate to own profile
        navigateTo('profile');
    } else {
        // Navigate to creator's profile (you might want to create a public profile view)
        alert(`Viewing ${username}'s profile\n\nNote: You might want to implement a public profile view page`);
        // For now, just show a message. You can implement a dedicated creator profile page later.
    }
}

// Enhanced Home Page Route with Creators Section
// Updated Home Page Route with Creators Section at the bottom
function enhanceHomePageRoute() {
    // Update the home route to include creators section at the bottom
    routes.home.content = `
        <div class="home-container">
            <div class="section-header">
                <div class="section-title">️📈 Most Popular Shops</div>
                <button class="view-all-btn" onclick="navigateTo('discover')">View All</button>
            </div>
            <div class="horizontal-scroll" id="mostPopularSection">
                <!-- Most popular shops will be loaded here -->
            </div>

            <div class="section-header">
                <div class="section-title">🔥️trending Items</div>
                <button class="view-all-btn" onclick="navigateTo('discover')">View All</button>
            </div>
            <div class="horizontal-scroll" id="trendingSection">
                <!-- Trending items will be loaded here -->
            </div>

            <div class="section-header">
                <div class="section-title">❤️ Top Creators</div>
            </div>
            <div class="horizontal-scroll" id="creatorsSection">
                <!-- Top creators will be loaded here -->
            </div>
        </div>
    `;
}

function viewAllCreators() {
    // For now, just show a message. You can implement a dedicated creators page later.
    alert('Top Creators - Full List\n\nYou can implement a dedicated creators page showing all top creators with more details.');
}

// Enhanced Home Page Loader
function enhancedLoadHomePage() {
    const shops = getShopsFromStorage();
    const user = getCurrentUser();
    
    // Load creators section
    const topCreators = getTopCreators();
    renderCreatorsSection(topCreators, 'creatorsSection');
    
    // Most Popular (highest votes) - shops
    const mostPopular = [...shops].sort((a, b) => {
        const aVotes = (a.upvotes || 0) - (a.downvotes || 0);
        const bVotes = (b.upvotes || 0) - (b.downvotes || 0);
        return bVotes - aVotes;
    }).slice(0, 10);
    
    // Trending Items (most liked items)
    const trendingItems = getTrendingItems().slice(0, 10);
    
    renderHorizontalShops(mostPopular, 'mostPopularSection');
    renderTrendingItems(trendingItems, 'trendingSection');
}

// Initialize the enhanced home page
function initializeCreatorsSection() {
    // Enhance the home page route
    enhanceHomePageRoute();
    
    // Replace the original loadHomePage function
    window.loadHomePage = enhancedLoadHomePage;
}

// CSS for Creators Section (add this to your styles.css)
const creatorsCSS = `
/* Creators Section Styles */
.creator-card {
    background: white;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    min-width: 280px;
    flex-shrink: 0;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
}

.creator-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.creator-rank {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
}

.rank-1 {
    background: linear-gradient();
    color: black;
}

.rank-2 {
    background: linear-gradient();
    color: black;
}

.rank-3 {
    background: linear-gradient();
    color: black;
}

.creator-rank:not(.rank-1):not(.rank-2):not(.rank-3) {
    background: #f0f0f0;
    color: #666;
}

.creator-avatar {
    width: 50px;
    height: 50px;
    background: #88cfc8;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    flex-shrink: 0;
}

.creator-info {
    flex: 1;
    min-width: 0;
}

.creator-username {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.creator-city {
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.creator-stats {
    display: flex;
    gap: 10px;
}

.creator-stat {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: #666;
}

.creator-stat i {
    color: #88cfc8;
    font-size: 10px;
}

.creator-score {
    text-align: center;
    flex-shrink: 0;
}

.score-value {
    font-size: 16px;
    font-weight: 700;
    color: #88cfc8;
}

.score-label {
    font-size: 10px;
    color: #666;
    text-transform: uppercase;
}
`;

// Inject CSS into the page
function injectCreatorsCSS() {
    if (!document.getElementById('creators-css')) {
        const style = document.createElement('style');
        style.id = 'creators-css';
        style.textContent = creatorsCSS;
        document.head.appendChild(style);
    }
}

// Initialize everything when the script loads
document.addEventListener('DOMContentLoaded', function() {
    injectCreatorsCSS();
    initializeCreatorsSection();
});

// Make functions globally available
window.getTopCreators = getTopCreators;
window.renderCreatorsSection = renderCreatorsSection;
window.viewCreatorProfile = viewCreatorProfile;
window.enhancedLoadHomePage = enhancedLoadHomePage;