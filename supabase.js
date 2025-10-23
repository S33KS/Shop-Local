// supabase.js - Fixed Backend Service for Shop Local

class SupabaseService {
    constructor() {
        this.supabaseUrl = 'https://otimpuymsvjliiexhwds.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aW1wdXltc3ZqbGlpZXhod2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDQxMjUsImV4cCI6MjA3NjcyMDEyNX0.m8ONAXzDDF_afc-lE5hX73g8Np4azvqnzIntQEMQ4Ak';
        this.supabase = null;
        this.initializeSupabase();
    }

    initializeSupabase() {
        if (window.supabase) {
            this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('Supabase initialized successfully');
        } else {
            console.warn('Supabase client not found. Falling back to localStorage.');
        }
    }

    // Check if Supabase is available and working
    async checkConnection() {
        if (!this.supabase) {
            console.log('Supabase not initialized');
            return false;
        }
        
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('count')
                .limit(1);
            
            if (error) {
                console.error('Supabase connection error:', error);
                return false;
            }
            console.log('Supabase connection successful');
            return true;
        } catch (error) {
            console.error('Supabase connection check failed:', error);
            return false;
        }
    }

    // User Management - FIXED
    async createUser(userData) {
        console.log('Creating user in Supabase:', userData.username);
        
        if (!this.supabase) {
            console.log('Supabase not available, using localStorage fallback');
            return this.fallbackCreateUser(userData);
        }
        
        try {
            // First check if user already exists
            const { data: existingUser, error: checkError } = await this.supabase
                .from('users')
                .select('*')
                .eq('username', userData.username)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking existing user:', checkError);
            }

            if (existingUser) {
                console.log('User already exists, updating:', userData.username);
                // Update existing user
                const { data, error } = await this.supabase
                    .from('users')
                    .update({
                        password: userData.password,
                        city: userData.city,
                        joined_date: userData.joinedDate || new Date().toISOString()
                    })
                    .eq('username', userData.username)
                    .select()
                    .single();
                
                if (error) {
                    console.error('Error updating user in Supabase:', error);
                    return this.fallbackCreateUser(userData);
                }
                console.log('User updated successfully in Supabase');
                return {
                    username: data.username,
                    password: data.password,
                    city: data.city,
                    joinedDate: data.joined_date,
                    id: data.id
                };
            } else {
                // Create new user
                console.log('Creating new user in Supabase');
                const { data, error } = await this.supabase
                    .from('users')
                    .insert([{
                        username: userData.username,
                        password: userData.password,
                        city: userData.city,
                        joined_date: userData.joinedDate || new Date().toISOString()
                    }])
                    .select()
                    .single();
                
                if (error) {
                    console.error('Error creating user in Supabase:', error);
                    console.log('Error details:', error.message, error.details, error.hint);
                    return this.fallbackCreateUser(userData);
                }
                console.log('User created successfully in Supabase:', data);
                return {
                    username: data.username,
                    password: data.password,
                    city: data.city,
                    joinedDate: data.joined_date,
                    id: data.id
                };
            }
        } catch (error) {
            console.error('Error in createUser:', error);
            return this.fallbackCreateUser(userData);
        }
    }

    async getUserByUsername(username) {
        console.log('Getting user from Supabase:', username);
        
        if (!this.supabase) {
            console.log('Supabase not available, using localStorage fallback');
            return this.fallbackGetUserByUsername(username);
        }
        
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    console.log('User not found in Supabase:', username);
                    return null;
                }
                console.error('Error getting user from Supabase:', error);
                return this.fallbackGetUserByUsername(username);
            }
            
            console.log('User found in Supabase:', data);
            // Transform to match frontend format
            return {
                username: data.username,
                password: data.password,
                city: data.city,
                joinedDate: data.joined_date,
                id: data.id
            };
        } catch (error) {
            console.error('Error in getUserByUsername:', error);
            return this.fallbackGetUserByUsername(username);
        }
    }

    async getAllUsers() {
        if (!this.supabase) return this.fallbackGetAllUsers();
        
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*');
            
            if (error) {
                console.error('Error getting all users:', error);
                return this.fallbackGetAllUsers();
            }
            
            return data.map(user => ({
                username: user.username,
                password: user.password,
                city: user.city,
                joinedDate: user.joined_date,
                id: user.id
            }));
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            return this.fallbackGetAllUsers();
        }
    }

    // Shop Management
    async createShop(shopData) {
        console.log('Creating shop in Supabase:', shopData.name);
        
        if (!this.supabase) {
            console.log('Supabase not available, using localStorage fallback');
            return this.fallbackCreateShop(shopData);
        }
        
        try {
            // First, create the shop
            const { data: shop, error: shopError } = await this.supabase
                .from('shops')
                .insert([{
                    name: shopData.name,
                    address: shopData.address,
                    contact: shopData.contact,
                    image_url: shopData.image,
                    owner_username: shopData.owner,
                    city: shopData.city,
                    open_time: shopData.openTime,
                    close_time: shopData.closeTime,
                    is_open: shopData.isOpen !== false,
                    details: shopData.details,
                    upvotes: shopData.upvotes || 0,
                    downvotes: shopData.downvotes || 0
                }])
                .select()
                .single();
            
            if (shopError) {
                console.error('Error creating shop in Supabase:', shopError);
                return this.fallbackCreateShop(shopData);
            }

            console.log('Shop created successfully, ID:', shop.id);

            // Add categories if they exist
            if (shopData.categories && shopData.categories.length > 0) {
                const categories = shopData.categories.map(category => ({
                    shop_id: shop.id,
                    category: category
                }));
                
                const { error: categoryError } = await this.supabase
                    .from('shop_categories')
                    .insert(categories);
                
                if (categoryError) {
                    console.warn('Error adding categories:', categoryError);
                } else {
                    console.log('Categories added successfully');
                }
            }

            // Add items if they exist
            if (shopData.items && shopData.items.length > 0) {
                const items = shopData.items.map(item => ({
                    shop_id: shop.id,
                    name: item.name,
                    price: item.price,
                    image_url: item.image
                }));
                
                const { error: itemError } = await this.supabase
                    .from('items')
                    .insert(items);
                
                if (itemError) {
                    console.warn('Error adding items:', itemError);
                } else {
                    console.log('Items added successfully');
                }
            }

            // Return formatted shop data
            const result = {
                ...shopData,
                id: shop.id,
                createdAt: shop.created_at
            };
            console.log('Shop creation completed:', result);
            return result;
        } catch (error) {
            console.error('Error in createShop:', error);
            return this.fallbackCreateShop(shopData);
        }
    }

    async getShops(filters = {}) {
        console.log('Getting shops from Supabase with filters:', filters);
        
        if (!this.supabase) {
            console.log('Supabase not available, using localStorage fallback');
            return this.fallbackGetShops(filters);
        }
        
        try {
            let query = this.supabase
                .from('shops')
                .select(`
                    *,
                    shop_categories(category),
                    items(*)
                `)
                .order('created_at', { ascending: false });

            // Apply city filter
            if (filters.city) {
                query = query.eq('city', filters.city);
            }

            const { data, error } = await query;
            
            if (error) {
                console.error('Error getting shops from Supabase:', error);
                return this.fallbackGetShops(filters);
            }

            console.log('Shops retrieved from Supabase:', data.length);

            // Transform data and apply category filter client-side
            const transformedShops = data.map(shop => ({
                id: shop.id,
                name: shop.name,
                address: shop.address,
                contact: shop.contact,
                image: shop.image_url,
                owner: shop.owner_username,
                city: shop.city,
                categories: shop.shop_categories?.map(sc => sc.category) || [],
                openTime: shop.open_time,
                closeTime: shop.close_time,
                isOpen: shop.is_open,
                details: shop.details,
                upvotes: shop.upvotes || 0,
                downvotes: shop.downvotes || 0,
                items: shop.items || [],
                createdAt: shop.created_at
            }));

            // Apply category filter client-side
            if (filters.categories && filters.categories.length > 0) {
                const filtered = transformedShops.filter(shop => 
                    shop.categories.some(cat => filters.categories.includes(cat))
                );
                console.log('After category filtering:', filtered.length);
                return filtered;
            }

            return transformedShops;
        } catch (error) {
            console.error('Error in getShops:', error);
            return this.fallbackGetShops(filters);
        }
    }

    async getShopById(shopId) {
        console.log('Getting shop by ID from Supabase:', shopId);
        
        if (!this.supabase) {
            console.log('Supabase not available, using localStorage fallback');
            return this.fallbackGetShopById(shopId);
        }
        
        try {
            const { data, error } = await this.supabase
                .from('shops')
                .select(`
                    *,
                    shop_categories(category),
                    items(*)
                `)
                .eq('id', shopId)
                .single();
            
            if (error) {
                console.error('Error getting shop from Supabase:', error);
                return this.fallbackGetShopById(shopId);
            }

            console.log('Shop found in Supabase:', data.name);

            return {
                id: data.id,
                name: data.name,
                address: data.address,
                contact: data.contact,
                image: data.image_url,
                owner: data.owner_username,
                city: data.city,
                categories: data.shop_categories?.map(sc => sc.category) || [],
                openTime: data.open_time,
                closeTime: data.close_time,
                isOpen: data.is_open,
                details: data.details,
                upvotes: data.upvotes || 0,
                downvotes: data.downvotes || 0,
                items: data.items || [],
                createdAt: data.created_at
            };
        } catch (error) {
            console.error('Error in getShopById:', error);
            return this.fallbackGetShopById(shopId);
        }
    }

    // Update shop votes
    async updateShopVotes(shopId, upvotes, downvotes) {
        console.log('Updating shop votes in Supabase:', shopId, {upvotes, downvotes});
        
        if (!this.supabase) {
            console.log('Supabase not available, using localStorage fallback');
            return this.fallbackUpdateShopVotes(shopId, upvotes, downvotes);
        }
        
        try {
            const { error } = await this.supabase
                .from('shops')
                .update({ 
                    upvotes: upvotes,
                    downvotes: downvotes 
                })
                .eq('id', shopId);
                
            if (error) {
                console.error('Error updating shop votes in Supabase:', error);
                this.fallbackUpdateShopVotes(shopId, upvotes, downvotes);
            } else {
                console.log('Shop votes updated successfully in Supabase');
            }
        } catch (error) {
            console.error('Error in updateShopVotes:', error);
            this.fallbackUpdateShopVotes(shopId, upvotes, downvotes);
        }
    }

    // Fallback methods using localStorage
    fallbackCreateUser(userData) {
        console.log('Using localStorage fallback for createUser');
        const users = JSON.parse(localStorage.getItem('shopLocal_users') || '[]');
        
        // Check if user already exists
        const existingIndex = users.findIndex(u => u.username === userData.username);
        if (existingIndex !== -1) {
            users[existingIndex] = userData;
        } else {
            users.push(userData);
        }
        
        localStorage.setItem('shopLocal_users', JSON.stringify(users));
        return userData;
    }

    fallbackGetUserByUsername(username) {
        console.log('Using localStorage fallback for getUserByUsername');
        const users = JSON.parse(localStorage.getItem('shopLocal_users') || '[]');
        return users.find(user => user.username === username);
    }

    fallbackGetAllUsers() {
        console.log('Using localStorage fallback for getAllUsers');
        return JSON.parse(localStorage.getItem('shopLocal_users') || '[]');
    }

    fallbackCreateShop(shopData) {
        console.log('Using localStorage fallback for createShop');
        let shops = JSON.parse(localStorage.getItem('shopLocal_shops') || '[]');
        shopData.id = Date.now().toString();
        shopData.createdAt = new Date().toISOString();
        shopData.upvotes = shopData.upvotes || 0;
        shopData.downvotes = shopData.downvotes || 0;
        shops.unshift(shopData);
        localStorage.setItem('shopLocal_shops', JSON.stringify(shops));
        return shopData;
    }

    fallbackGetShops(filters = {}) {
        console.log('Using localStorage fallback for getShops');
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

    fallbackGetShopById(shopId) {
        console.log('Using localStorage fallback for getShopById');
        const shops = JSON.parse(localStorage.getItem('shopLocal_shops') || '[]');
        return shops.find(shop => shop.id === shopId);
    }

    fallbackUpdateShopVotes(shopId, upvotes, downvotes) {
        console.log('Using localStorage fallback for updateShopVotes');
        let shops = JSON.parse(localStorage.getItem('shopLocal_shops') || '[]');
        const shopIndex = shops.findIndex(shop => shop.id === shopId);
        if (shopIndex !== -1) {
            shops[shopIndex].upvotes = upvotes;
            shops[shopIndex].downvotes = downvotes;
            localStorage.setItem('shopLocal_shops', JSON.stringify(shops));
        }
    }
}

// Create global instance
const supabaseService = new SupabaseService();

// Make it globally available
window.supabaseService = supabaseService;