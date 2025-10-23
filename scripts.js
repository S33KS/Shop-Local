// scripts.js - FIXED VERSION WITH WORKING NAVIGATION

// Indian Cities Data
const indianCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", 
    "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", 
    "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", 
    "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", 
    "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", 
    "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Chandigarh", "Guwahati", 
    "Solapur", "Hubli-Dharwad", "Bareilly", "Moradabad", "Mysore", "Tiruchirappalli", "Bhilai", 
    "Jalandhar", "Warangal", "Salem", "Gorakhpur", "Bikaner", "Amravati", "Noida", "Jamshedpur", 
    "Bhilwara", "Cuttack", "Firozabad", "Kochi", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", 
    "Nanded", "Kolhapur", "Ajmer", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi", 
    "Ulhasnagar", "Jammu", "Sangli-Miraj", "Mangalore", "Erode", "Belgaum", "Ambattur", "Tirunelveli", 
    "Malegaon", "Gaya", "Jalgaon", "Udaipur", "Maheshtala", "Davanagere", "Kozhikode", "Akola", 
    "Kurnool", "Rajpur Sonarpur", "Bokaro", "South Dumdum", "Bellary", "Patiala", "Gopalpur", "Agartala"
];

// Shop Categories Data
const shopCategories = [
    "Food & Dining", "Clothing & Fashion", "Electronics", "Home & Garden",
    "Beauty & Wellness", "Health & Pharmacy", "Sports & Fitness", "Books & Stationery",
    "Arts & Crafts", "Jewelry & Accessories", "Toys & Games", "Automotive",
    "Pet Supplies", "Baby & Kids", "Grocery", "Furniture", 
    "Services", "Education", "Entertainment", "Other"
];

// Global variables
let isCategoryDropdownOpen = false;
let isDiscoverDropdownOpen = false;
let currentFilters = [];

// User Management
async function getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('shopLocal_currentUser') || 'null');
    return user;
}

function setCurrentUser(user) {
    localStorage.setItem('shopLocal_currentUser', JSON.stringify(user));
}

async function getUsers() {
    return JSON.parse(localStorage.getItem('shopLocal_users') || '[]');
}

async function saveUser(user) {
    const users = await getUsers();
    const existingUserIndex = users.findIndex(u => u.username === user.username);
    
    if (existingUserIndex !== -1) {
        users[existingUserIndex] = user;
    } else {
        users.push(user);
    }
    
    localStorage.setItem('shopLocal_users', JSON.stringify(users));
    return user;
}

// Shop Management
async function saveShopToStorage(shopData) {
    let shops = JSON.parse(localStorage.getItem('shopLocal_shops') || '[]');
    shopData.id = Date.now().toString();
    shopData.createdAt = new Date().toISOString();
    shopData.upvotes = shopData.upvotes || 0;
    shopData.downvotes = shopData.downvotes || 0;
    shops.unshift(shopData);
    localStorage.setItem('shopLocal_shops', JSON.stringify(shops));
    return shopData;
}

async function getShopsFromStorage(filters = {}) {
    let shops = JSON.parse(localStorage.getItem('shopLocal_shops') || '[]');
    
    if (filters.city) {
        shops = shops.filter(shop => shop.city === filters.city);
    }
    
    if (filters.categories && filters.categories.length > 0) {
        shops = shops.filter(shop => 
            shop.categories && shop.categories.some(cat => filters.categories.includes(cat))
        );
    }
    
    return shops.sort((a, b) => {
        const aVotes = (a.upvotes || 0) - (a.downvotes || 0);
        const bVotes = (b.upvotes || 0) - (b.downvotes || 0);
        return bVotes - aVotes;
    });
}

async function getShopById(shopId) {
    const shops = JSON.parse(localStorage.getItem('shopLocal_shops') || '[]');
    return shops.find(shop => shop.id === shopId);
}

async function updateShopVotes(shopId, upvotes, downvotes) {
    let shops = JSON.parse(localStorage.getItem('shopLocal_shops') || '[]');
    const shopIndex = shops.findIndex(shop => shop.id === shopId);
    if (shopIndex !== -1) {
        shops[shopIndex].upvotes = upvotes;
        shops[shopIndex].downvotes = downvotes;
        localStorage.setItem('shopLocal_shops', JSON.stringify(shops));
    }
}

// Voting System
async function getUserVotes() {
    return JSON.parse(localStorage.getItem('shopLocal_userVotes') || '{}');
}

async function saveUserVote(shopId, voteType) {
    const userVotes = JSON.parse(localStorage.getItem('shopLocal_userVotes') || '{}');
    if (voteType === null) {
        delete userVotes[shopId];
    } else {
        userVotes[shopId] = voteType;
    }
    localStorage.setItem('shopLocal_userVotes', JSON.stringify(userVotes));
}

// Item Like Management
async function getItemLikes() {
    return JSON.parse(localStorage.getItem('shopLocal_itemLikes') || '{}');
}

async function isItemLikedByUser(shopId, itemIndex) {
    const user = await getCurrentUser();
    if (!user) return false;
    
    const userItemLikes = JSON.parse(localStorage.getItem('shopLocal_userItemLikes') || '{}');
    const itemKey = `${shopId}_${itemIndex}`;
    return userItemLikes[user.username] && userItemLikes[user.username].includes(itemKey);
}

async function toggleItemLike(shopId, itemIndex, event) {
    if (event) event.stopPropagation();
    
    const user = await getCurrentUser();
    if (!user) {
        alert('Please login to like items');
        navigateTo('login');
        return;
    }
    
    const isCurrentlyLiked = await isItemLikedByUser(shopId, itemIndex);
    const itemLikes = await getItemLikes();
    const userItemLikes = JSON.parse(localStorage.getItem('shopLocal_userItemLikes') || '{}');
    const itemKey = `${shopId}_${itemIndex}`;
    const currentLikes = itemLikes[itemKey] || 0;
    
    if (isCurrentlyLiked) {
        // Unlike
        itemLikes[itemKey] = Math.max(0, currentLikes - 1);
        if (userItemLikes[user.username]) {
            userItemLikes[user.username] = userItemLikes[user.username].filter(key => key !== itemKey);
        }
    } else {
        // Like
        itemLikes[itemKey] = currentLikes + 1;
        if (!userItemLikes[user.username]) {
            userItemLikes[user.username] = [];
        }
        if (!userItemLikes[user.username].includes(itemKey)) {
            userItemLikes[user.username].push(itemKey);
        }
    }
    
    localStorage.setItem('shopLocal_itemLikes', JSON.stringify(itemLikes));
    localStorage.setItem('shopLocal_userItemLikes', JSON.stringify(userItemLikes));
    
    // Refresh display
    if (window.location.hash.includes('shop-detail')) {
        const currentShopId = window.location.hash.split('/')[1];
        if (currentShopId === shopId) {
            loadShopDetail(shopId);
        }
    }
    
    if (window.location.hash === '#home' || !window.location.hash) {
        loadHomePage();
    }
}

// Save Shop Functionality
async function getSavedShops() {
    const user = await getCurrentUser();
    if (!user) return [];
    
    const saved = JSON.parse(localStorage.getItem('shopLocal_savedShops') || '{}');
    return saved[user.username] || [];
}

async function toggleSaveShop(shopId, button) {
    const user = await getCurrentUser();
    if (!user) {
        alert('Please login to save shops');
        navigateTo('login');
        return;
    }
    
    const savedShops = await getSavedShops();
    const isCurrentlySaved = savedShops.includes(shopId);
    const saved = JSON.parse(localStorage.getItem('shopLocal_savedShops') || '{}');
    const userSaved = saved[user.username] || [];
    
    if (isCurrentlySaved) {
        // Remove from saved
        saved[user.username] = userSaved.filter(id => id !== shopId);
        if (button) {
            button.classList.remove('saved');
            button.innerHTML = '<i class="fas fa-bookmark"></i> Save';
        }
    } else {
        // Add to saved
        saved[user.username] = [...userSaved, shopId];
        if (button) {
            button.classList.add('saved');
            button.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
        }
    }
    
    localStorage.setItem('shopLocal_savedShops', JSON.stringify(saved));
}

// Formatting function
function formatVoteCount(count) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
}

// Category Management Functions
function getSelectedCategories() {
    return JSON.parse(localStorage.getItem('shopLocal_selectedCategories') || '[]');
}

function saveSelectedCategories(categories) {
    localStorage.setItem('shopLocal_selectedCategories', JSON.stringify(categories));
}

function initializeCategorySelection() {
    const dropdownContainer = document.getElementById('categoryDropdownContainer');
    if (!dropdownContainer) return;
    
    const selectedCategories = getSelectedCategories();
    
    dropdownContainer.innerHTML = `
        <div class="category-dropdown-container">
            <div class="category-dropdown-header" id="categoryDropdownHeader" onclick="toggleCategoryDropdown()">
                <div class="category-dropdown-title">
                    Select Categories (${selectedCategories.length}/2)
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${selectedCategories.length > 0 ? `
                        <div class="category-dropdown-count">${selectedCategories.length}</div>
                    ` : ''}
                    <i class="fas fa-chevron-down category-dropdown-arrow" id="categoryDropdownArrow"></i>
                </div>
            </div>
            <div class="category-dropdown-content" id="categoryDropdownContent">
                ${shopCategories.map(category => {
                    const isSelected = selectedCategories.includes(category);
                    const isDisabled = selectedCategories.length >= 2 && !isSelected;
                    
                    return `
                        <div class="category-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" 
                             onclick="selectCategoryOption('${category}')">
                            <span>${category}</span>
                            <div class="category-checkbox"></div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    updateSelectedCategoriesDisplay();
}

function toggleCategoryDropdown() {
    const dropdownContent = document.getElementById('categoryDropdownContent');
    const dropdownHeader = document.getElementById('categoryDropdownHeader');
    const dropdownArrow = document.getElementById('categoryDropdownArrow');
    
    isCategoryDropdownOpen = !isCategoryDropdownOpen;
    
    if (dropdownContent) {
        dropdownContent.classList.toggle('active', isCategoryDropdownOpen);
        dropdownHeader.classList.toggle('active', isCategoryDropdownOpen);
        dropdownArrow.classList.toggle('active', isCategoryDropdownOpen);
    }
}

function selectCategoryOption(category) {
    let selectedCategories = getSelectedCategories();
    
    if (selectedCategories.includes(category)) {
        selectedCategories = selectedCategories.filter(cat => cat !== category);
    } else {
        if (selectedCategories.length < 2) {
            selectedCategories.push(category);
        } else {
            alert('You can select maximum 2 categories only');
            return;
        }
    }
    
    saveSelectedCategories(selectedCategories);
    initializeCategorySelection();
    updateSelectedCategoriesDisplay();
    
    setTimeout(() => {
        isCategoryDropdownOpen = false;
        const dropdownContent = document.getElementById('categoryDropdownContent');
        const dropdownHeader = document.getElementById('categoryDropdownHeader');
        const dropdownArrow = document.getElementById('categoryDropdownArrow');
        
        if (dropdownContent) {
            dropdownContent.classList.remove('active');
            dropdownHeader.classList.remove('active');
            dropdownArrow.classList.remove('active');
        }
    }, 300);
}

function updateSelectedCategoriesDisplay() {
    const selectedContainer = document.getElementById('selectedCategories');
    if (!selectedContainer) return;
    
    const selectedCategories = getSelectedCategories();
    
    if (selectedCategories.length === 0) {
        selectedContainer.innerHTML = '<p style="color: #666; font-size: 14px; text-align: center; padding: 10px;">No categories selected</p>';
        return;
    }
    
    selectedContainer.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong style="font-size: 14px; color: #333;">Selected Categories:</strong>
        </div>
        <div class="selected-categories">
            ${selectedCategories.map(category => `
                <div class="selected-category">
                    ${category}
                    <button class="remove-category" onclick="removeCategory('${category}')">×</button>
                </div>
            `).join('')}
        </div>
    `;
}

function removeCategory(category) {
    let selectedCategories = getSelectedCategories();
    selectedCategories = selectedCategories.filter(cat => cat !== category);
    saveSelectedCategories(selectedCategories);
    initializeCategorySelection();
    updateSelectedCategoriesDisplay();
}

function clearAllCategories() {
    saveSelectedCategories([]);
    initializeCategorySelection();
    updateSelectedCategoriesDisplay();
}

// Routes - USING YOUR ORIGINAL CONTENT
const routes = {
    'home': {
        title: 'Home',
        content: `
            <div class="home-container">
                <div class="section-header">
                    <div class="section-title">🔥 Most Popular Shops</div>
                    <button class="view-all-btn" onclick="navigateTo('discover')">View All</button>
                </div>
                <div class="horizontal-scroll" id="mostPopularSection">
                    <div style="color: #666; text-align: center; padding: 40px;">
                        <i class="fas fa-store" style="font-size: 40px; color: #88cfc8; margin-bottom: 15px;"></i>
                        <p>Loading popular shops...</p>
                    </div>
                </div>

                <div class="section-header">
                    <div class="section-title">❤️ Trending Items</div>
                    <button class="view-all-btn" onclick="navigateTo('discover')">View All</button>
                </div>
                <div class="horizontal-scroll" id="trendingSection">
                    <div style="color: #666; text-align: center; padding: 40px;">
                        <i class="fas fa-heart" style="font-size: 40px; color: #88cfc8; margin-bottom: 15px;"></i>
                        <p>Loading trending items...</p>
                    </div>
                </div>

                <div class="section-header">
                    <div class="section-title">⭐ Top Creators</div>
                </div>
                <div class="horizontal-scroll" id="creatorsSection">
                    <div style="color: #666; text-align: center; padding: 40px;">
                        <i class="fas fa-users" style="font-size: 40px; color: #88cfc8; margin-bottom: 15px;"></i>
                        <p>Loading top creators...</p>
                    </div>
                </div>
            </div>
        `
    },
    'discover': {
        title: 'Discover Shops',
        content: `
            <div class="discover-container">
                <div class="sticky-search">
                    <div style="display: flex; gap: 15px; align-items: flex-start; flex-wrap: wrap;">
                        <div class="search-container" style="flex: 1; min-width: 250px;">
                            <div class="search-bar">
                                <i class="fas fa-search"></i>
                                <input type="text" placeholder="Search shops by name or location..." id="searchInput">
                            </div>
                        </div>
                        <div class="filter-section" style="flex: 1; min-width: 250px;">
                            <div id="discoverCategoryDropdown"></div>
                            <div class="selected-categories-container" id="discoverSelectedCategories"></div>
                        </div>
                    </div>
                </div>
                <div class="shops-grid" id="shopsGrid">
                    <div class="empty-state">
                        <i class="fas fa-store" style="font-size: 50px; color: #88cfc8; margin-bottom: 15px;"></i>
                        <h3>Loading shops...</h3>
                    </div>
                </div>
            </div>
        `
    },
'login': {
    title: 'Login',
    content: `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-tabs">
                    <button class="auth-tab active" onclick="switchAuthTab('login')">Login</button>
                    <button class="auth-tab" onclick="switchAuthTab('signup')">Sign Up</button>
                </div>
                
                <form class="auth-form active" id="loginForm">
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input type="text" class="form-input" placeholder="Enter username" required id="loginUsername">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-input" placeholder="Enter password" required id="loginPassword">
                    </div>
                    
                    <button type="submit" class="auth-btn">Login</button>
                </form>
                
                <form class="auth-form" id="signupForm">
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input type="text" class="form-input" placeholder="Choose username" required id="signupUsername">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-input" placeholder="Create password" required id="signupPassword">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">City</label>
                        <select class="form-select" id="signupCity" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;">
                            <option value="">Select your city</option>
                            ${indianCities.map(city => `<option value="${city}">${city}</option>`).join('')}
                        </select>
                    </div>
                    
                    <button type="submit" class="auth-btn">Create Account</button>
                </form>
            </div>
        </div>
    `
},
    'profile': {
        title: 'Profile',
        content: `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="profile-username" id="profileUsername">Username</div>
                    <div class="profile-city" id="profileCity">City</div>
                </div>
                
                <div class="profile-tabs">
                    <button class="profile-tab active" onclick="switchProfileTab('myShops')">My Shops</button>
                    <button class="profile-tab" onclick="switchProfileTab('savedShops')">Saved Shops</button>
                </div>
                
                <div class="tab-content active" id="myShopsTab">
                    <div class="user-shops-section">
                        <h2>My Shops</h2>
                        <div class="shops-grid" id="userShopsGrid">
                            <div class="empty-state">
                                <i class="fas fa-store" style="font-size: 50px; color: #88cfc8; margin-bottom: 15px;"></i>
                                <h3>Loading your shops...</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-content" id="savedShopsTab">
                    <div class="user-shops-section">
                        <h2>Saved Shops</h2>
                        <div class="shops-grid" id="savedShopsGrid">
                            <div class="empty-state">
                                <i class="fas fa-bookmark" style="font-size: 50px; color: #88cfc8; margin-bottom: 15px;"></i>
                                <h3>Loading saved shops...</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    'online': {
        title: 'Post Your Shop',
        content: `
            <div class="post-shop-container">
                <h2 style="color: #88cfc8; text-align: center; margin-bottom: 20px;">Post Your Shop</h2>
                
                <form class="shop-form" id="shopForm">
                    <div class="form-section">
                        <label class="form-label">Shop Categories (Select 1-2 categories)</label>
                        <div id="categoryDropdownContainer"></div>
                        <div class="selected-categories-container" id="selectedCategories"></div>
                    </div>

                    <div class="form-section">
                        <label class="form-label">Shop Image</label>
                        <div class="image-upload-container">
                            <input type="file" id="shopImage" accept="image/*" hidden>
                            <div class="image-upload-area" id="imageUploadArea">
                                <i class="fas fa-camera"></i>
                                <p>Tap to upload shop image</p>
                            </div>
                            <div class="image-preview" id="imagePreview" hidden>
                                <img id="previewImage" src="" alt="Shop preview">
                                <button type="button" class="remove-image" id="removeImage">×</button>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <label class="form-label">Shop Name</label>
                        <input type="text" class="form-input" placeholder="Enter shop name" required id="shopName">
                    </div>

                    <div class="form-section">
                        <label class="form-label">Address</label>
                        <div class="address-group">
                            <div class="custom-select-container">
                                <div class="custom-select" id="shopCitySelect" onclick="toggleCitySelect('shop')">
                                    <div class="select-selected" id="shopCitySelected">Select city</div>
                                    <div class="select-arrow">▼</div>
                                </div>
                                <div class="select-items" id="shopCityDropdown">
                                    <div class="search-container">
                                        <input type="text" class="search-input" placeholder="Search cities..." id="shopCitySearch" oninput="filterCities('shop')">
                                    </div>
                                    <div class="options-container" id="shopCityOptions">
                                        ${indianCities.map(city => `
                                            <div class="select-option" onclick="selectCity('${city}', 'shop')">${city}</div>
                                        `).join('')}
                                    </div>
                                </div>
                                <input type="hidden" id="shopCity" required>
                            </div>
                            <input type="text" class="form-input" placeholder="Street address" required id="shopAddress">
                        </div>
                    </div>

                    <div class="form-section">
                        <label class="form-label">Contact Info</label>
                        <input type="text" class="form-input" placeholder="Phone number or email" required id="shopContact">
                    </div>

                    <div class="form-section">
                        <label class="form-label">Shop Open Time</label>
                        <div class="time-input-group">
                            <input type="time" class="time-input" id="shopOpenTime">
                            <span class="time-separator">to</span>
                            <input type="time" class="time-input" id="shopCloseTime">
                        </div>
                        <div class="toggle-container">
                            <span class="toggle-label">Shop Status:</span>
                            <label class="toggle-switch">
                                <input type="checkbox" id="shopStatusToggle" checked>
                                <span class="toggle-slider"></span>
                            </label>
                            <span id="statusText" style="font-weight: 600; color: #27ae60;">Open</span>
                        </div>
                    </div>

                    <div class="form-section">
                        <label class="form-label">Additional Details</label>
                        <textarea class="textarea-input" placeholder="Special offers, sales, events, or any additional information..." id="shopDetails"></textarea>
                    </div>

                    <div class="form-section">
                        <div class="section-header">
                            <label class="form-label">Items for Sale</label>
                            <button type="button" class="add-item-btn" id="addItemBtn">
                                <i class="fas fa-plus"></i> Add Item
                            </button>
                        </div>
                        
                        <div class="items-container" id="itemsContainer"></div>
                    </div>

                    <button type="submit" class="submit-btn">Post Shop</button>
                </form>
            </div>
        `
    },
    'settings': {
        title: 'Settings',
        content: '<div style="text-align: center; padding: 20px;"><h2 style="color: #88cfc8;">Settings</h2><p>"Its a free app and you expect everything to be functional... support us and unlock this feature for everyone"</p><br><div style="background: #f0f0f0; padding: 40px; border-radius: 12px; margin: 20px 0;"><i class="fas fa-lock" style="font-size: 50px; color: #88cfc8; margin-bottom: 15px;"></i><p>Premium feature locked</p></div></div>'
    },
    'shop-detail': {
        title: 'Shop Details',
        content: `
            <div class="shop-detail-container" id="shopDetailContainer">
                <div class="empty-state">
                    <i class="fas fa-store" style="font-size: 50px; color: #88cfc8; margin-bottom: 15px;"></i>
                    <h3>Loading shop details...</h3>
                </div>
            </div>
            <button class="back-btn" onclick="navigateTo('discover')">
                <i class="fas fa-arrow-left"></i> Back
            </button>
        `
    }
};

// Auth Functions
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.auth-tab:nth-child(1)').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelector('.auth-tab:nth-child(2)').classList.add('active');
        document.getElementById('signupForm').classList.add('active');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = await getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        setCurrentUser(user);
        alert('Login successful!');
        navigateTo('profile');
    } else {
        alert('Invalid username or password');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const city = document.getElementById('signupCity').value;
    
    if (!city) {
        alert('Please select your city');
        return;
    }
    
    const users = await getUsers();
    if (users.find(u => u.username === username)) {
        alert('Username already exists');
        return;
    }
    
    const newUser = {
        username,
        password,
        city,
        joinedDate: new Date().toISOString()
    };
    
    await saveUser(newUser);
    setCurrentUser(newUser);
    alert('Account created successfully!');
    navigateTo('profile');
}
// Custom Select Dropdown Functions
let activeCitySelect = null;

function toggleCitySelect(type) {
    console.log('Toggle city select:', type);
    
    const dropdown = document.getElementById(`${type}CityDropdown`);
    const selectElement = document.getElementById(`${type}CitySelect`);
    const allDropdowns = document.querySelectorAll('.select-items');
    const allSelects = document.querySelectorAll('.custom-select');
    
    // Close all other dropdowns and remove active classes
    allDropdowns.forEach(dd => {
        if (dd !== dropdown) {
            dd.classList.remove('select-show');
        }
    });
    allSelects.forEach(sel => {
        if (sel !== selectElement) {
            sel.classList.remove('active');
        }
    });
    
    // Toggle current dropdown
    if (dropdown && selectElement) {
        const isShowing = dropdown.classList.contains('select-show');
        
        if (isShowing) {
            dropdown.classList.remove('select-show');
            selectElement.classList.remove('active');
            activeCitySelect = null;
        } else {
            dropdown.classList.add('select-show');
            selectElement.classList.add('active');
            activeCitySelect = type;
            
            // Focus search input when opening
            setTimeout(() => {
                const searchInput = document.getElementById(`${type}CitySearch`);
                if (searchInput) {
                    searchInput.focus();
                    searchInput.value = ''; // Clear search
                    filterCities(type); // Reset filter
                }
            }, 100);
        }
    }
}

function filterCities(type) {
    const searchTerm = document.getElementById(`${type}CitySearch`).value.toLowerCase();
    const optionsContainer = document.getElementById(`${type}CityOptions`);
    const options = optionsContainer.getElementsByClassName('select-option');
    
    let hasVisibleOptions = false;
    
    for (let option of options) {
        const text = option.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            option.style.display = 'block';
            hasVisibleOptions = true;
        } else {
            option.style.display = 'none';
        }
    }
    
    // Show message if no results
    if (!hasVisibleOptions) {
        optionsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No cities found</div>';
    }
}

function selectCity(city, type) {
    console.log('Selected city:', city, 'for type:', type);
    
    // Update selected display
    const selectedElement = document.getElementById(`${type}CitySelected`);
    if (selectedElement) {
        selectedElement.textContent = city;
        selectedElement.classList.add('has-value');
    }
    
    // Update hidden input
    const hiddenInput = document.getElementById(`${type}City`);
    if (hiddenInput) {
        hiddenInput.value = city;
    }
    
    // Close dropdown
    const dropdown = document.getElementById(`${type}CityDropdown`);
    const selectElement = document.getElementById(`${type}CitySelect`);
    if (dropdown && selectElement) {
        dropdown.classList.remove('select-show');
        selectElement.classList.remove('active');
    }
    
    activeCitySelect = null;
    
    console.log('City selected successfully:', city);
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.custom-select-container')) {
        const allDropdowns = document.querySelectorAll('.select-items');
        const allSelects = document.querySelectorAll('.custom-select');
        
        allDropdowns.forEach(dd => {
            dd.classList.remove('select-show');
        });
        allSelects.forEach(sel => {
            sel.classList.remove('active');
        });
        activeCitySelect = null;
    }
});

// Shop Form Functions
function initializeShopForm() {
    // Shop image upload
    const imageUploadArea = document.getElementById('imageUploadArea');
    const shopImageInput = document.getElementById('shopImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const removeImage = document.getElementById('removeImage');

    if (imageUploadArea && shopImageInput) {
        imageUploadArea.addEventListener('click', () => shopImageInput.click());

        shopImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.src = e.target.result;
                    imagePreview.hidden = false;
                    imageUploadArea.hidden = true;
                };
                reader.readAsDataURL(file);
            }
        });

        removeImage.addEventListener('click', () => {
            shopImageInput.value = '';
            imagePreview.hidden = true;
            imageUploadArea.hidden = false;
        });
    }

    // Items
    const addItemBtn = document.getElementById('addItemBtn');
    const itemsContainer = document.getElementById('itemsContainer');

    if (addItemBtn && itemsContainer) {
        addItemBtn.addEventListener('click', addNewItem);
        addNewItem();
    }

    // Form submission
    const shopForm = document.getElementById('shopForm');
    if (shopForm) {
        shopForm.addEventListener('submit', handleShopCreation);
    }

    // Status toggle listener
    const statusToggle = document.getElementById('shopStatusToggle');
    if (statusToggle) {
        statusToggle.addEventListener('change', function() {
            const statusText = document.getElementById('statusText');
            if (this.checked) {
                statusText.textContent = 'Open';
                statusText.style.color = '#27ae60';
            } else {
                statusText.textContent = 'Closed';
                statusText.style.color = '#e74c3c';
            }
        });
    }

    // Initialize category selection
    initializeCategorySelection();
}

function addNewItem() {
    const itemsContainer = document.getElementById('itemsContainer');
    if (!itemsContainer) return;
    
    const itemId = Date.now();
    
    const itemHTML = `
        <div class="item-card" data-item-id="${itemId}">
            <div class="item-header">
                <div class="item-image-upload" onclick="this.querySelector('.item-image-input').click()">
                    <i class="fas fa-camera"></i>
                    <input type="file" class="item-image-input" accept="image/*" hidden 
                           onchange="handleItemImageUpload(this)">
                </div>
                <div class="item-details">
                    <input type="text" class="item-input" placeholder="Item name" required>
                    <input type="text" class="item-input price-input" placeholder="Price" required>
                </div>
            </div>
            <button type="button" class="remove-item" onclick="this.parentElement.remove()">
                Remove Item
            </button>
        </div>
    `;
    
    itemsContainer.insertAdjacentHTML('beforeend', itemHTML);
}

function handleItemImageUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUpload = input.parentElement;
            imageUpload.innerHTML = `
                <img src="${e.target.result}" alt="Item image">
                <input type="file" class="item-image-input" accept="image/*" hidden 
                       onchange="handleItemImageUpload(this)">
            `;
        };
        reader.readAsDataURL(file);
    }
}

async function handleShopCreation(e) {
    e.preventDefault();
    console.log('Starting shop creation...');
    
    const user = await getCurrentUser();
    if (!user) {
        alert('Please login to create a shop');
        navigateTo('login');
        return;
    }
    
    const selectedCategories = getSelectedCategories();
    if (selectedCategories.length === 0) {
        alert('Please select at least one category for your shop');
        return;
    }
    
    // Get form values
    const shopName = document.getElementById('shopName').value;
    const shopCity = document.getElementById('shopCity').value;
    const shopAddress = document.getElementById('shopAddress').value;
    const shopContact = document.getElementById('shopContact').value;
    const shopOpenTime = document.getElementById('shopOpenTime').value;
    const shopCloseTime = document.getElementById('shopCloseTime').value;
    const shopStatus = document.getElementById('shopStatusToggle').checked;
    const shopDetails = document.getElementById('shopDetails').value;
    const shopImage = document.getElementById('previewImage').src || null;
    
    if (!shopName || !shopCity || !shopAddress || !shopContact) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (!indianCities.includes(shopCity)) {
        alert('Please select a valid Indian city');
        return;
    }
    
    // Get items
    const items = [];
    document.querySelectorAll('.item-card').forEach(itemCard => {
        const itemName = itemCard.querySelector('.item-input[placeholder="Item name"]')?.value;
        const itemPrice = itemCard.querySelector('.price-input')?.value;
        const itemImage = itemCard.querySelector('.item-image-upload img');
        const itemImageSrc = itemImage && itemImage.src ? itemImage.src : null;
        
        if (itemName && itemPrice) {
            items.push({ 
                name: itemName, 
                price: itemPrice, 
                image: itemImageSrc 
            });
        }
    });
    
    const shopData = {
        name: shopName,
        address: `${shopAddress}, ${shopCity}`,
        contact: shopContact,
        image: shopImage,
        items: items,
        owner: user.username,
        city: shopCity,
        categories: selectedCategories,
        openTime: shopOpenTime,
        closeTime: shopCloseTime,
        isOpen: shopStatus,
        details: shopDetails,
        upvotes: 0,
        downvotes: 0
    };
    
    console.log('Saving shop:', shopData);
    
    try {
        const savedShop = await saveShopToStorage(shopData);
        console.log('Shop saved successfully:', savedShop);
        alert('Shop posted successfully!');
        
        // Reset form
        e.target.reset();
        document.getElementById('itemsContainer').innerHTML = '';
        addNewItem();
        if (document.getElementById('imagePreview')) {
            document.getElementById('imagePreview').hidden = true;
        }
        if (document.getElementById('imageUploadArea')) {
            document.getElementById('imageUploadArea').hidden = false;
        }
        if (document.getElementById('statusText')) {
            document.getElementById('statusText').textContent = 'Open';
            document.getElementById('statusText').style.color = '#27ae60';
        }
        clearAllCategories();
        
        // Navigate to profile to see the new shop
        navigateTo('profile');
        
    } catch (error) {
        console.error('Error saving shop:', error);
        alert('Error creating shop. Please try again.');
    }
}

// Home Page Functions - FIXED
// Home Page Functions - FIXED VERSION
async function loadHomePage() {
    console.log('Loading home page...');
    try {
        const shops = await getShopsFromStorage();
        console.log('Total shops found:', shops.length);
        
        // Most Popular (highest net votes)
        const mostPopular = [...shops].sort((a, b) => {
            const aVotes = (a.upvotes || 0) - (a.downvotes || 0);
            const bVotes = (b.upvotes || 0) - (b.downvotes || 0);
            return bVotes - aVotes;
        }).slice(0, 10);
        
        console.log('Most popular shops:', mostPopular.length);
        
        // Trending Items (most liked items)
        const trendingItems = await getTrendingItems();
        console.log('Trending items found:', trendingItems.length);
        
        // Top Creators
        const topCreators = getTopCreators();
        console.log('Top creators found:', topCreators.length);
        
        // Render sections
        renderHorizontalShops(mostPopular, 'mostPopularSection');
        renderTrendingItems(trendingItems, 'trendingSection');
        renderCreatorsSection(topCreators, 'creatorsSection');
        
    } catch (error) {
        console.error('Error loading home page:', error);
        showHomePageError();
    }
}

// Function to get trending items
// Function to get trending items - FIXED VERSION
async function getTrendingItems() {
    try {
        const shops = await getShopsFromStorage();
        const itemLikes = JSON.parse(localStorage.getItem('shopLocal_itemLikes') || '{}');
        
        console.log('Getting trending items...');
        console.log('Total shops:', shops.length);
        console.log('Item likes data:', itemLikes);
        
        const allItems = [];
        
        shops.forEach(shop => {
            if (shop.items && shop.items.length > 0) {
                shop.items.forEach((item, index) => {
                    const itemKey = `${shop.id}_${index}`;
                    const likes = itemLikes[itemKey] || 0;
                    
                    // Only include items with at least 1 like
                    if (likes > 0) {
                        allItems.push({
                            id: itemKey,
                            name: item.name,
                            price: item.price,
                            image: item.image_url || item.image,
                            likes: likes,
                            shopId: shop.id,
                            shopName: shop.name,
                            itemIndex: index
                        });
                    }
                });
            }
        });
        
        console.log('All trending items found:', allItems.length);
        
        // Sort by likes and return top items
        const trending = allItems.sort((a, b) => b.likes - a.likes).slice(0, 10);
        console.log('Top trending items:', trending);
        
        return trending;
        
    } catch (error) {
        console.error('Error getting trending items:', error);
        return [];
    }
}

// Function to get top creators
// Function to get top creators - FIXED VERSION
function getTopCreators() {
    try {
        const users = JSON.parse(localStorage.getItem('shopLocal_users') || '[]');
        const shops = JSON.parse(localStorage.getItem('shopLocal_shops') || '[]');
        const itemLikes = JSON.parse(localStorage.getItem('shopLocal_itemLikes') || '{}');
        
        console.log('Getting top creators...');
        console.log('Total users:', users.length);
        console.log('Total shops:', shops.length);
        
        const creatorScores = {};
        
        users.forEach(user => {
            const userShops = shops.filter(shop => shop.owner === user.username);
            
            // Calculate total upvotes from user's shops
            const totalUpvotes = userShops.reduce((sum, shop) => sum + (shop.upvotes || 0), 0);
            const totalDownvotes = userShops.reduce((sum, shop) => sum + (shop.downvotes || 0), 0);
            const netVotes = totalUpvotes - totalDownvotes;
            
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
            
            // Calculate score (weighted: shops * 20 + netVotes * 5 + item likes * 3)
            const score = (userShops.length * 20) + (netVotes * 5) + (totalItemLikes * 3);
            
            // Only include creators with shops
            if (userShops.length > 0) {
                creatorScores[user.username] = {
                    username: user.username,
                    city: user.city,
                    shopCount: userShops.length,
                    totalUpvotes: totalUpvotes,
                    totalDownvotes: totalDownvotes,
                    netVotes: netVotes,
                    totalItemLikes: totalItemLikes,
                    score: score,
                    joinedDate: user.joinedDate
                };
            }
        });
        
        // Convert to array and sort by score
        const creatorsArray = Object.values(creatorScores)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        
        console.log('Top creators found:', creatorsArray);
        
        return creatorsArray;
            
    } catch (error) {
        console.error('Error getting top creators:', error);
        return [];
    }
}

// Discover Page Filtering - ADD THESE FUNCTIONS
function initializeDiscoverFilters() {
    const dropdownContainer = document.getElementById('discoverCategoryDropdown');
    if (!dropdownContainer) return;
    
    dropdownContainer.innerHTML = `
        <div class="category-dropdown-container">
            <div class="category-dropdown-header" id="discoverDropdownHeader" onclick="toggleDiscoverDropdown()">
                <div class="category-dropdown-title">
                    Filter by Category ${currentFilters.length > 0 ? `(${currentFilters.length})` : ''}
                </div>
                <i class="fas fa-chevron-down category-dropdown-arrow" id="discoverDropdownArrow"></i>
            </div>
            <div class="category-dropdown-content" id="discoverDropdownContent">
                ${shopCategories.map(category => {
                    const isSelected = currentFilters.includes(category);
                    return `
                        <div class="category-option ${isSelected ? 'selected' : ''}" 
                             onclick="selectDiscoverFilter('${category}')">
                            <span>${category}</span>
                            <div class="category-checkbox"></div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    updateDiscoverSelectedFilters();
}

function toggleDiscoverDropdown() {
    const dropdownContent = document.getElementById('discoverDropdownContent');
    const dropdownHeader = document.getElementById('discoverDropdownHeader');
    const dropdownArrow = document.getElementById('discoverDropdownArrow');
    
    isDiscoverDropdownOpen = !isDiscoverDropdownOpen;
    
    if (dropdownContent) {
        dropdownContent.classList.toggle('active', isDiscoverDropdownOpen);
        dropdownHeader.classList.toggle('active', isDiscoverDropdownOpen);
        dropdownArrow.classList.toggle('active', isDiscoverDropdownOpen);
    }
}

function selectDiscoverFilter(category) {
    if (currentFilters.includes(category)) {
        currentFilters = currentFilters.filter(cat => cat !== category);
    } else {
        currentFilters.push(category);
    }
    
    initializeDiscoverFilters();
    updateDiscoverSelectedFilters();
    loadDiscoverPage();
    
    setTimeout(() => {
        isDiscoverDropdownOpen = false;
        const dropdownContent = document.getElementById('discoverDropdownContent');
        const dropdownHeader = document.getElementById('discoverDropdownHeader');
        const dropdownArrow = document.getElementById('discoverDropdownArrow');
        
        if (dropdownContent) {
            dropdownContent.classList.remove('active');
            dropdownHeader.classList.remove('active');
            dropdownArrow.classList.remove('active');
        }
    }, 300);
}

function updateDiscoverSelectedFilters() {
    const selectedContainer = document.getElementById('discoverSelectedCategories');
    if (!selectedContainer) return;
    
    if (currentFilters.length === 0) {
        selectedContainer.innerHTML = '<p style="color: #666; font-size: 12px; text-align: center;">All categories</p>';
        return;
    }
    
    selectedContainer.innerHTML = `
        <div style="margin-bottom: 8px;">
            <strong style="font-size: 12px; color: #333;">Active Filters:</strong>
        </div>
        <div class="selected-categories">
            ${currentFilters.map(category => `
                <div class="selected-category">
                    ${category}
                    <button class="remove-category" onclick="removeDiscoverFilter('${category}')">×</button>
                </div>
            `).join('')}
        </div>
    `;
}

function removeDiscoverFilter(category) {
    currentFilters = currentFilters.filter(cat => cat !== category);
    initializeDiscoverFilters();
    loadDiscoverPage();
}

function clearDiscoverFilters() {
    currentFilters = [];
    initializeDiscoverFilters();
    loadDiscoverPage();
}

// Close dropdowns when clicking outside - ADD THIS
document.addEventListener('click', (e) => {
    const discoverDropdown = document.getElementById('discoverCategoryDropdown');
    if (discoverDropdown && !discoverDropdown.contains(e.target)) {
        isDiscoverDropdownOpen = false;
        const dropdownContent = document.getElementById('discoverDropdownContent');
        const dropdownHeader = document.getElementById('discoverDropdownHeader');
        const dropdownArrow = document.getElementById('discoverDropdownArrow');
        
        if (dropdownContent) {
            dropdownContent.classList.remove('active');
            dropdownHeader.classList.remove('active');
            dropdownArrow.classList.remove('active');
        }
    }
});

function renderTrendingItems(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = `
            <div style="color: #666; text-align: center; padding: 40px;">
                <i class="fas fa-heart" style="font-size: 40px; color: #88cfc8; margin-bottom: 15px;"></i>
                <p>No trending items yet</p>
                <p style="font-size: 12px;">Like some items to see them here!</p>
                <button class="auth-btn" onclick="navigateTo('discover')" style="margin-top: 15px; padding: 10px 20px;">
                    Discover Shops
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = items.map((item, index) => {
        return `
            <div class="trending-item-card" onclick="viewShopDetail('${item.shopId}', ${item.itemIndex})">
                <div class="trending-item-image">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.name}">` : 
                        `<div class="placeholder"><i class="fas fa-shopping-bag"></i></div>`
                    }
                    <div style="position: absolute; top: 8px; left: 8px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #333;">
                        #${index + 1}
                    </div>
                </div>
                <div class="trending-item-content">
                    <div class="trending-item-name">${item.name}</div>
                    <div class="trending-item-price">${item.price}</div>
                    <div class="trending-item-shop">
                        <i class="fas fa-store"></i> ${item.shopName}
                    </div>
                    <div class="trending-item-likes">
                        <i class="fas fa-heart" style="color: #ff4757;"></i>
                        <span>${item.likes} ${item.likes === 1 ? 'like' : 'likes'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderCreatorsSection(creators, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
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
        const rankIcon = rank <= 3 ? ['🥇', '🥈', '🥉'][rank-1] : rank;
        
        return `
            <div class="creator-card" onclick="viewCreatorProfile('${creator.username}')">
                <div class="creator-rank ${rankClass}" style="width: 30px; height: 30px; border-radius: 50%; background: ${rank <= 3 ? '#88cfc8' : '#f0f0f0'}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: ${rank <= 3 ? 'white' : '#666'}; flex-shrink: 0;">
                    ${rankIcon}
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
                            <i class="fas fa-arrow-up" style="color: #27ae60;"></i>
                            <span>${formatVoteCount(creator.totalUpvotes)}</span>
                        </div>
                        <div class="creator-stat">
                            <i class="fas fa-heart" style="color: #ff4757;"></i>
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

async function renderHorizontalShops(shops, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const userSavedShops = await getSavedShops();
    
    if (shops.length === 0) {
        container.innerHTML = `
            <div style="color: #666; text-align: center; padding: 40px;">
                <i class="fas fa-store" style="font-size: 40px; color: #88cfc8; margin-bottom: 15px;"></i>
                <p>No shops yet</p>
                <p style="font-size: 12px;">Be the first to create a shop!</p>
                <button class="auth-btn" onclick="navigateTo('online')" style="margin-top: 15px; padding: 10px 20px;">
                    Create Shop
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = shops.map((shop, index) => {
        const isSaved = userSavedShops.includes(shop.id);
        const isOpen = shop.isOpen !== false;
        const netVotes = (shop.upvotes || 0) - (shop.downvotes || 0);
        
        return `
            <div class="shop-card-horizontal" onclick="viewShopDetail('${shop.id}')">
                <div class="shop-image-horizontal">
                    ${shop.image_url || shop.image ? 
                        `<img src="${shop.image_url || shop.image}" alt="${shop.name}">` : 
                        `<div class="placeholder"><i class="fas fa-store"></i></div>`
                    }
                    <div style="position: absolute; top: 8px; left: 8px; background: rgba(255,255,255,0.9); padding: 4px 8px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #333;">
                        #${index + 1}
                    </div>
                    <button class="save-shop-btn ${isSaved ? 'saved' : ''}" onclick="event.stopPropagation(); toggleSaveShop('${shop.id}', this)">
                        <i class="fas fa-bookmark"></i>
                        ${isSaved ? 'Saved' : 'Save'}
                    </button>
                </div>
                <div class="shop-content-horizontal">
                    <div class="shop-status ${isOpen ? 'status-open' : 'status-closed'}">
                        ${isOpen ? '🟢 Open' : '🔴 Closed'}
                    </div>
                    <div class="shop-name-horizontal">${shop.name}</div>
                    <div class="shop-address-horizontal">
                        <i class="fas fa-map-marker-alt"></i>
                        ${shop.address.split(',')[0]}
                    </div>
                    <div style="margin-top: 8px; display: flex; align-items: center; gap: 10px; font-size: 12px; color: #666;">
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <i class="fas fa-arrow-up" style="color: #27ae60;"></i>
                            <span>${shop.upvotes || 0}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <i class="fas fa-arrow-down" style="color: #e74c3c;"></i>
                            <span>${shop.downvotes || 0}</span>
                        </div>
                        <div style="margin-left: auto; font-weight: 600; color: #88cfc8;">
                            ${netVotes} votes
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Error handler for home page
function showHomePageError() {
    const sections = ['mostPopularSection', 'trendingSection', 'creatorsSection'];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.innerHTML = `
                <div style="color: #666; text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 40px; color: #ff6b6b; margin-bottom: 15px;"></i>
                    <p>Error loading content</p>
                    <button onclick="loadHomePage()" style="background: #88cfc8; color: white; border: none; padding: 8px 16px; border-radius: 6px; margin-top: 10px; cursor: pointer;">
                        Try Again
                    </button>
                </div>
            `;
        }
    });
}

// Profile Tabs
function switchProfileTab(tab) {
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    if (tab === 'myShops') {
        document.querySelector('.profile-tab:nth-child(1)').classList.add('active');
        document.getElementById('myShopsTab').classList.add('active');
        loadUserShops();
    } else {
        document.querySelector('.profile-tab:nth-child(2)').classList.add('active');
        document.getElementById('savedShopsTab').classList.add('active');
        loadSavedShops();
    }
}

// Voting function
async function vote(shopId, voteType, event) {
    if (event) event.stopPropagation();
    
    const user = await getCurrentUser();
    if (!user) {
        alert('Please login to vote');
        navigateTo('login');
        return;
    }
    
    const shops = await getShopsFromStorage();
    const shop = shops.find(s => s.id === shopId);
    const userVotes = await getUserVotes();
    const currentVote = userVotes[shopId];
    
    let newUpvotes = shop.upvotes || 0;
    let newDownvotes = shop.downvotes || 0;
    
    console.log('Current vote:', currentVote, 'New vote:', voteType);
    
    // Remove previous vote if exists
    if (currentVote === 'up') newUpvotes--;
    if (currentVote === 'down') newDownvotes--;
    
    // Add new vote (toggle if same button clicked)
    if (currentVote === voteType) {
        // Same button clicked, remove vote
        await saveUserVote(shopId, null);
    } else {
        // Different vote type
        if (voteType === 'up') newUpvotes++;
        if (voteType === 'down') newDownvotes++;
        await saveUserVote(shopId, voteType);
    }
    
    // Update shop votes
    await updateShopVotes(shopId, newUpvotes, newDownvotes);
    console.log('Votes updated - Up:', newUpvotes, 'Down:', newDownvotes);
    
    // INSTANT UPDATE - Refresh current view
    const currentHash = window.location.hash;
    
    if (currentHash === '#home' || currentHash === '' || !currentHash) {
        // Refresh home page
        loadHomePage();
    } else if (currentHash.includes('shop-detail')) {
        // Refresh shop detail page
        const currentShopId = currentHash.split('/')[1];
        loadShopDetail(currentShopId);
    } else if (currentHash === '#discover') {
        // Refresh discover page
        loadDiscoverPage();
    } else if (currentHash === '#profile') {
        // Refresh profile page
        loadUserProfile();
    }
}

// Profile Functions
async function loadUserProfile() {
    const user = await getCurrentUser();
    if (!user) {
        navigateTo('login');
        return;
    }
    
    document.getElementById('profileUsername').textContent = user.username;
    document.getElementById('profileCity').textContent = user.city;
    loadUserShops();
}

// Discover Page - ENHANCED VERSION WITH SAVE BUTTONS AND FILTERS
async function loadDiscoverPage() {
    const user = await getCurrentUser();
    const filters = {};
    
    if (user) {
        filters.city = user.city;
    }
    
    if (currentFilters.length > 0) {
        filters.categories = currentFilters;
    }
    
    const shops = await getShopsFromStorage(filters);
    const userSavedShops = await getSavedShops();
    
    const shopsGrid = document.getElementById('shopsGrid');
    if (!shopsGrid) return;
    
    // Initialize discover filters
    initializeDiscoverFilters();
    
    if (shops.length === 0) {
        shopsGrid.innerHTML = `
            <div class="empty-state" id="emptyState">
                <i class="fas fa-store" style="font-size: 50px; color: #88cfc8; margin-bottom: 15px;"></i>
                <h3>No shops found</h3>
                <p>Try different search terms or create your own shop!</p>
                <button class="auth-btn" onclick="navigateTo('online')" style="margin-top: 15px;">
                    Create Shop
                </button>
            </div>
        `;
        return;
    }
    
    shopsGrid.innerHTML = shops.map(shop => {
        const isSaved = userSavedShops.includes(shop.id);
        const isOpen = shop.isOpen !== false;
        const userVotes = getUserVotes();
        const userVote = userVotes[shop.id];
        const upvoteClass = userVote === 'up' ? 'voted' : '';
        const downvoteClass = userVote === 'down' ? 'voted' : '';
        
        return `
            <div class="shop-card" onclick="viewShopDetail('${shop.id}')">
                <div class="shop-image-container">
                    <div class="shop-image">
                        ${shop.image_url || shop.image ? 
                            `<img src="${shop.image_url || shop.image}" alt="${shop.name}">` : 
                            `<div class="placeholder"><i class="fas fa-store"></i></div>`
                        }
                    </div>
                    <button class="save-shop-btn ${isSaved ? 'saved' : ''}" onclick="event.stopPropagation(); toggleSaveShop('${shop.id}', this)">
                        <i class="fas fa-bookmark"></i>
                        ${isSaved ? 'Saved' : 'Save'}
                    </button>
                    <div class="vote-container" onclick="event.stopPropagation()">
                        <button class="vote-btn upvote-btn ${upvoteClass}" onclick="vote('${shop.id}', 'up', event)">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <div class="vote-count">${formatVoteCount(shop.upvotes || 0)}</div>
                        <div class="vote-separator">|</div>
                        <div class="vote-count">${formatVoteCount(shop.downvotes || 0)}</div>
                        <button class="vote-btn downvote-btn ${downvoteClass}" onclick="vote('${shop.id}', 'down', event)">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
                </div>
                <div class="shop-content">
                    <div class="shop-name">${shop.name}</div>
                    <div class="shop-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${shop.address}
                    </div>
                    <div class="shop-contact">
                        <i class="fas fa-phone"></i>
                        ${shop.contact}
                    </div>
                    ${shop.categories && shop.categories.length > 0 ? `
                        <div class="shop-categories">
                            ${shop.categories.map(cat => `
                                <div class="shop-category-badge">${cat}</div>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="shop-status ${isOpen ? 'status-open' : 'status-closed'}" style="margin-top: 5px;">
                        ${isOpen ? '🟢 Open' : '🔴 Closed'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Setup search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const shopCards = shopsGrid.querySelectorAll('.shop-card');
            
            shopCards.forEach(card => {
                const shopName = card.querySelector('.shop-name').textContent.toLowerCase();
                const shopAddress = card.querySelector('.shop-address').textContent.toLowerCase();
                const categories = card.querySelector('.shop-categories')?.textContent.toLowerCase() || '';
                
                if (shopName.includes(searchTerm) || shopAddress.includes(searchTerm) || categories.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Show empty state if no results
            const visibleShops = Array.from(shopCards).filter(card => card.style.display !== 'none');
            if (visibleShops.length === 0) {
                shopsGrid.innerHTML = `
                    <div class="empty-state" id="emptyState">
                        <i class="fas fa-search" style="font-size: 50px; color: #88cfc8; margin-bottom: 15px;"></i>
                        <h3>No shops found</h3>
                        <p>Try different search terms</p>
                    </div>
                `;
            }
        });
    }
}

async function loadUserShops() {
    const user = await getCurrentUser();
    const shops = await getShopsFromStorage();
    const userShops = shops.filter(shop => shop.owner === user.username);
    
    const shopsGrid = document.getElementById('userShopsGrid');
    if (!shopsGrid) return;
    
    if (userShops.length === 0) {
        shopsGrid.innerHTML = `
            <div class="empty-state" id="userEmptyState">
                <i class="fas fa-store" style="font-size: 50px; color: #88cfc8; margin-bottom: 15px;"></i>
                <h3>No shops yet</h3>
                <p>Create your first shop to get started!</p>
                <button class="auth-btn" onclick="navigateTo('online')" style="margin-top: 15px;">
                    Create Shop
                </button>
            </div>
        `;
        return;
    }
    
    shopsGrid.innerHTML = userShops.map(shop => {
        const isOpen = shop.isOpen !== false;
        
        return `
            <div class="shop-card" onclick="viewShopDetail('${shop.id}')">
                <div class="shop-image-container">
                    <div class="shop-image">
                        ${shop.image_url || shop.image ? 
                            `<img src="${shop.image_url || shop.image}" alt="${shop.name}">` : 
                            `<div class="placeholder"><i class="fas fa-store"></i></div>`
                        }
                    </div>
                </div>
                <div class="shop-content">
                    <div class="shop-name">${shop.name}</div>
                    <div class="shop-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${shop.address}
                    </div>
                    <div class="shop-contact">
                        <i class="fas fa-phone"></i>
                        ${shop.contact}
                    </div>
                    ${shop.categories && shop.categories.length > 0 ? `
                        <div class="shop-categories">
                            ${shop.categories.map(cat => `
                                <div class="shop-category-badge">${cat}</div>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="shop-status ${isOpen ? 'status-open' : 'status-closed'}" style="margin-top: 5px;">
                        ${isOpen ? '🟢 Open' : '🔴 Closed'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function loadSavedShops() {
    const user = await getCurrentUser();
    const savedShopIds = await getSavedShops();
    const allShops = await getShopsFromStorage();
    const savedShops = allShops.filter(shop => savedShopIds.includes(shop.id));
    
    const savedGrid = document.getElementById('savedShopsGrid');
    const emptyState = document.getElementById('savedEmptyState');
    
    if (!savedGrid) return;
    
    if (savedShops.length === 0) {
        savedGrid.innerHTML = `
            <div class="empty-state" id="savedEmptyState">
                <i class="fas fa-bookmark" style="font-size: 50px; color: #88cfc8; margin-bottom: 15px;"></i>
                <h3>No saved shops</h3>
                <p>Start saving shops you like from the Discover page!</p>
                <button class="auth-btn" onclick="navigateTo('discover')" style="margin-top: 15px;">
                    Discover Shops
                </button>
            </div>
        `;
        return;
    }
    
    savedGrid.innerHTML = savedShops.map(shop => {
        const isOpen = shop.isOpen !== false;
        
        return `
            <div class="shop-card" onclick="viewShopDetail('${shop.id}')">
                <div class="shop-image-container">
                    <div class="shop-image">
                        ${shop.image_url || shop.image ? 
                            `<img src="${shop.image_url || shop.image}" alt="${shop.name}">` : 
                            `<div class="placeholder"><i class="fas fa-store"></i></div>`
                        }
                    </div>
                </div>
                <div class="shop-content">
                    <div class="shop-name">${shop.name}</div>
                    <div class="shop-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${shop.address}
                    </div>
                    <div class="shop-contact">
                        <i class="fas fa-phone"></i>
                        ${shop.contact}
                    </div>
                    ${shop.categories && shop.categories.length > 0 ? `
                        <div class="shop-categories">
                            ${shop.categories.map(cat => `
                                <div class="shop-category-badge">${cat}</div>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="shop-status ${isOpen ? 'status-open' : 'status-closed'}" style="margin-top: 5px;">
                        ${isOpen ? '🟢 Open' : '🔴 Closed'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Shop Detail Function
function viewShopDetail(shopId, itemIndex = null) {
    if (itemIndex !== null) {
        // Store which item to highlight
        sessionStorage.setItem('highlightItem', itemIndex);
    }
    navigateTo('shop-detail', shopId);
}

function viewCreatorProfile(username) {
    const currentUser = getCurrentUser();
    
    if (currentUser && currentUser.username === username) {
        // Navigate to own profile
        navigateTo('profile');
    } else {
        // For now, just show creator's shops in discover with filter
        alert(`Showing shops by ${username}`);
        // You can implement a proper creator profile page later
        navigateTo('discover');
    }
}

async function loadShopDetail(shopId) {
    const shop = await getShopById(shopId);
    if (!shop) {
        alert('Shop not found');
        navigateTo('discover');
        return;
    }
    
    const container = document.getElementById('shopDetailContainer');
    if (!container) return;
    
    const isOpen = shop.isOpen !== false;
    const userVotes = await getUserVotes();
    const userVote = userVotes[shopId];
    const upvoteClass = userVote === 'up' ? 'voted' : '';
    const downvoteClass = userVote === 'down' ? 'voted' : '';
    
    container.innerHTML = `
        <div class="shop-detail-header">
            <div class="shop-detail-image">
                ${shop.image_url || shop.image ? 
                    `<img src="${shop.image_url || shop.image}" alt="${shop.name}">` : 
                    `<div class="placeholder" style="font-size: 50px;"><i class="fas fa-store"></i></div>`
                }
            </div>
            <div class="shop-detail-name">${shop.name}</div>
            <div class="shop-status ${isOpen ? 'status-open' : 'status-closed'}" style="display: inline-block; margin-bottom: 15px;">
                ${isOpen ? '🟢 Open' : '🔴 Closed'}
            </div>
            <div class="vote-container" style="position: relative; display: inline-flex; margin: 0 15px;">
                <button class="vote-btn upvote-btn ${upvoteClass}" onclick="vote('${shop.id}', 'up', event)">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <div class="vote-count">${formatVoteCount(shop.upvotes || 0)}</div>
                <div class="vote-separator">|</div>
                <div class="vote-count">${formatVoteCount(shop.downvotes || 0)}</div>
                <button class="vote-btn downvote-btn ${downvoteClass}" onclick="vote('${shop.id}', 'down', event)">
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
        </div>
        
        <div class="shop-detail-info">
            <div class="shop-detail-card">
                <h3><i class="fas fa-map-marker-alt"></i> Address</h3>
                <p>${shop.address}</p>
            </div>
            
            <div class="shop-detail-card">
                <h3><i class="fas fa-phone"></i> Contact</h3>
                <p>${shop.contact}</p>
            </div>
            
            <div class="shop-detail-card">
                <h3><i class="fas fa-clock"></i> Timing</h3>
                <p>${shop.openTime || 'Not specified'} - ${shop.closeTime || 'Not specified'}</p>
            </div>
            
            <div class="shop-detail-card">
                <h3><i class="fas fa-user"></i> Owner</h3>
                <p>${shop.owner}</p>
            </div>
        </div>
        
        ${shop.categories && shop.categories.length > 0 ? `
            <div class="shop-detail-card">
                <h3><i class="fas fa-tags"></i> Categories</h3>
                <div class="shop-categories">
                    ${shop.categories.map(cat => `
                        <div class="shop-category-badge">${cat}</div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${shop.details ? `
            <div class="shop-detail-card">
                <h3><i class="fas fa-info-circle"></i> Additional Details</h3>
                <p>${shop.details}</p>
            </div>
        ` : ''}
        
        <div class="shop-detail-items">
            <h2>Items for Sale</h2>
            ${shop.items && shop.items.length > 0 ? `
                <div class="items-grid">
                    ${shop.items.map((item, index) => {
                        const isLiked = isItemLikedByUser(shopId, index);
                        const itemLikes = getItemLikes();
                        const itemKey = `${shopId}_${index}`;
                        const likeCount = itemLikes[itemKey] || 0;
                        
                        return `
                            <div class="item-card-detail">
                                <div class="item-image-detail">
                                    ${item.image_url || item.image ? 
                                        `<img src="${item.image_url || item.image}" alt="${item.name}">` : 
                                        `<i class="fas fa-shopping-bag" style="color: #88cfc8; font-size: 24px;"></i>`
                                    }
                                </div>
                                <div class="item-name-detail">${item.name}</div>
                                <div class="item-price-detail">${item.price}</div>
                                <div class="item-like-container">
                                    <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleItemLike('${shopId}', ${index}, event)">
                                        <i class="fas fa-heart"></i>
                                    </button>
                                    <span class="like-count">${likeCount}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag" style="font-size: 50px; color: #88cfc8; margin-bottom: 15px;"></i>
                    <h3>No items listed</h3>
                    <p>This shop hasn't added any items yet.</p>
                </div>
            `}
        </div>
    `;
}

// Navigation System - FIXED WORKING VERSION
function navigateTo(route, param) {
    console.log('Navigating to:', route, 'param:', param);
    
    const user = getCurrentUser();
    
    // Redirect to login if not authenticated (except home, discover, login)
    if (!user && route !== 'login' && route !== 'home' && route !== 'discover') {
        route = 'login';
    }
    
    const contentArea = document.getElementById('contentArea');
    const currentRouteData = routes[route];
    
    if (!currentRouteData || !contentArea) {
        console.error('Route not found:', route);
        return;
    }
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-route') === route) {
            item.classList.add('active');
        }
    });
    
    // Update content
    contentArea.innerHTML = currentRouteData.content;
    document.title = `${currentRouteData.title} - Shop Local`;
    
    // Update URL
    window.location.hash = param ? `${route}/${param}` : route;
    
    // Initialize page after a short delay
    setTimeout(() => {
        console.log('Initializing page:', route);
        try {
            switch(route) {
                case 'login':
                    document.getElementById('loginForm').onsubmit = handleLogin;
                    document.getElementById('signupForm').onsubmit = handleSignup;
                    break;
                    
                case 'profile':
                    loadUserProfile();
                    break;
                    
                case 'online':
                    initializeShopForm();
                    break;
                    
                case 'home':
                    loadHomePage();
                    break;
                    
                  case 'discover':
              loadDiscoverPage();
            initializeDiscoverFilters(); // Add this line
            break;
                    
                case 'shop-detail':
                    if (param) loadShopDetail(param);
                    break;
                    
                default:
                    break;
            }
        } catch (error) {
            console.error('Error initializing page:', error);
        }
    }, 50);
}

// Function to create sample data for testing - ADD THIS
function createSampleData() {
    console.log('Creating sample data...');
    
    // Create sample users
    const sampleUsers = [
        { username: 'john_doe', password: '123', city: 'Mumbai', joinedDate: new Date().toISOString() },
        { username: 'jane_smith', password: '123', city: 'Delhi', joinedDate: new Date().toISOString() },
        { username: 'rohit_sharma', password: '123', city: 'Bangalore', joinedDate: new Date().toISOString() }
    ];
    
    sampleUsers.forEach(user => {
        const users = JSON.parse(localStorage.getItem('shopLocal_users') || '[]');
        if (!users.find(u => u.username === user.username)) {
            users.push(user);
            localStorage.setItem('shopLocal_users', JSON.stringify(users));
        }
    });
    
    // Create sample shops with items
    const sampleShops = [
        {
            name: 'Tech Gadgets Store',
            address: '123 MG Road, Mumbai',
            contact: '9876543210',
            owner: 'john_doe',
            city: 'Mumbai',
            categories: ['Electronics'],
            items: [
                { name: 'Wireless Earbuds', price: '₹2,499' },
                { name: 'Smart Watch', price: '₹5,999' },
                { name: 'Phone Case', price: '₹499' }
            ],
            upvotes: 15,
            downvotes: 2,
            isOpen: true
        },
        {
            name: 'Fashion Boutique',
            address: '45 Connaught Place, Delhi',
            contact: '9876543211',
            owner: 'jane_smith',
            city: 'Delhi',
            categories: ['Clothing & Fashion'],
            items: [
                { name: 'Designer Dress', price: '₹3,999' },
                { name: 'Handbag', price: '₹2,499' },
                { name: 'Sunglasses', price: '₹1,299' }
            ],
            upvotes: 12,
            downvotes: 1,
            isOpen: true
        },
        {
            name: 'Book Haven',
            address: '78 Brigade Road, Bangalore',
            contact: '9876543212',
            owner: 'rohit_sharma',
            city: 'Bangalore',
            categories: ['Books & Stationery'],
            items: [
                { name: 'Best Seller Novel', price: '₹499' },
                { name: 'Notebook Set', price: '₹299' },
                { name: 'Art Pens', price: '₹199' }
            ],
            upvotes: 8,
            downvotes: 0,
            isOpen: true
        }
    ];
    
    let shops = JSON.parse(localStorage.getItem('shopLocal_shops') || '[]');
    
    sampleShops.forEach(shop => {
        if (!shops.find(s => s.name === shop.name)) {
            shop.id = Date.now().toString() + Math.random();
            shop.createdAt = new Date().toISOString();
            shops.unshift(shop);
        }
    });
    
    localStorage.setItem('shopLocal_shops', JSON.stringify(shops));
    
    // Add some sample likes
    const itemLikes = {
        [shops[0].id + '_0']: 5,  // Wireless Earbuds - 5 likes
        [shops[0].id + '_1']: 3,  // Smart Watch - 3 likes
        [shops[1].id + '_0']: 7,  // Designer Dress - 7 likes
        [shops[1].id + '_1']: 4,  // Handbag - 4 likes
        [shops[2].id + '_0']: 2   // Best Seller Novel - 2 likes
    };
    
    localStorage.setItem('shopLocal_itemLikes', JSON.stringify(itemLikes));
    
    console.log('Sample data created!');
    alert('Sample data created! Refresh the home page to see the sections populated.');
}

// Add this to your global functions at the bottom:
window.createSampleData = createSampleData;

// Initialize app - FIXED SIMPLE VERSION
function initializeApp() {
    console.log('Initializing app...');
    
    // Set up navigation with direct click handlers
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const route = this.getAttribute('data-route');
            console.log('Nav clicked:', route);
            navigateTo(route);
        });
    });
    
    // Handle initial route
    const handleInitialRoute = () => {
        const user = getCurrentUser();
        let initialRoute = 'home';
        
        // Check URL hash first
        if (window.location.hash) {
            const hash = window.location.hash.replace('#', '');
            const [route, param] = hash.split('/');
            console.log('Hash found:', route, param);
            if (routes[route]) {
                navigateTo(route, param);
                return;
            }
        }
        
        // Default route based on auth
        if (!user) {
            initialRoute = 'login';
        }
        
        console.log('Default route:', initialRoute);
        navigateTo(initialRoute);
    };
    
    // Initialize
    handleInitialRoute();
}

// Start the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting app...');
    initializeApp();
});

// Make functions globally available
window.navigateTo = navigateTo;
window.viewShopDetail = viewShopDetail;
window.toggleSaveShop = toggleSaveShop;
window.vote = vote;
window.toggleItemLike = toggleItemLike;
window.switchAuthTab = switchAuthTab;
window.switchProfileTab = switchProfileTab;
window.toggleCitySelect = toggleCitySelect;
window.filterCities = filterCities;
window.selectCity = selectCity;
window.toggleCategoryDropdown = toggleCategoryDropdown;
window.selectCategoryOption = selectCategoryOption;
window.removeCategory = removeCategory;
window.clearAllCategories = clearAllCategories;
window.addNewItem = addNewItem;
window.handleItemImageUpload = handleItemImageUpload;
window.viewCreatorProfile = viewCreatorProfile;

// Make functions globally available
window.navigateTo = navigateTo;
window.viewShopDetail = viewShopDetail;
window.toggleSaveShop = toggleSaveShop;
window.vote = vote;
window.toggleItemLike = toggleItemLike;
window.switchAuthTab = switchAuthTab;
window.switchProfileTab = switchProfileTab;
window.toggleCitySelect = toggleCitySelect;
window.filterCities = filterCities;
window.selectCity = selectCity;
window.toggleCategoryDropdown = toggleCategoryDropdown;
window.selectCategoryOption = selectCategoryOption;
window.removeCategory = removeCategory;
window.clearAllCategories = clearAllCategories;
window.addNewItem = addNewItem;
window.handleItemImageUpload = handleItemImageUpload;
window.viewCreatorProfile = viewCreatorProfile;

// ADD THESE NEW FUNCTIONS:
window.toggleDiscoverDropdown = toggleDiscoverDropdown;
window.selectDiscoverFilter = selectDiscoverFilter;
window.removeDiscoverFilter = removeDiscoverFilter;
window.clearDiscoverFilters = clearDiscoverFilters;

// Make sure these are in your global functions list:
window.renderHorizontalShops = renderHorizontalShops;
window.renderTrendingItems = renderTrendingItems;
window.renderCreatorsSection = renderCreatorsSection;
window.createSampleData = createSampleData;