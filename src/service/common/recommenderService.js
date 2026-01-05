const path = require('path');

// ✅ Dynamic model loading with proper error handling
let Action, Social, User;

try {
    // Try to load models - adjust path according to your project structure
    const models = require('../../models');
    Action = models.Action;
    Social = models.Social; 
    User = models.User;
    console.log('✅ Models loaded successfully');
} catch (error) {
    console.log('⚠️ Models not found, running in fallback mode:', error.message);
    // Continue without models for now
}

class SimpleRecommender {
    constructor(likeWeight = 1.0, viewWeight = 0.2, cfWeight = 0.7, popWeight = 0.3) {
        this.likeWeight = likeWeight;
        this.viewWeight = viewWeight;
        this.cfWeight = cfWeight;
        this.popWeight = popWeight;
        this.userItemScores = {};
        this.itemPopularity = {};
        this.users = new Set();
        this.items = new Set();
        this.lastUpdateTime = null;
        this.modelsAvailable = !!(Action && Social && User);
    }

    _eventToScore(eventType) {
        if (eventType === "like") return this.likeWeight;
        if (eventType === "view") return this.viewWeight;
        if (eventType === "bookmark") return 0.5;
        if (eventType === "share") return 0.8;
        if (eventType === "comment") return 0.6;
        return 0.1;
    }

    fit(interactions) {
        this.userItemScores = {};
        this.itemPopularity = {};
        this.users = new Set();
        this.items = new Set();

        for (const [userId, itemId, eventType] of interactions) {
            this.users.add(userId);
            this.items.add(itemId);

            const score = this._eventToScore(eventType);

            if (!this.userItemScores[userId]) this.userItemScores[userId] = {};
            if (!this.userItemScores[userId][itemId]) this.userItemScores[userId][itemId] = 0;
            this.userItemScores[userId][itemId] += score;

            if (!this.itemPopularity[itemId]) this.itemPopularity[itemId] = 0;
            this.itemPopularity[itemId] += (eventType === "like" ? 1.0 : 0.2);
        }

        const popValues = Object.values(this.itemPopularity);
        if (popValues.length > 0) {
            const maxPop = Math.max(...popValues);
            if (maxPop > 0) {
                for (const itemId of Object.keys(this.itemPopularity)) {
                    this.itemPopularity[itemId] /= maxPop;
                }
            }
        }

        this.lastUpdateTime = new Date();
        
        console.log(`✅ Recommender fitted with ${interactions.length} interactions`);
        console.log(`📊 Users: ${this.users.size}, Items: ${this.items.size}`);
    }

    _cosineSimilarity(userA, userB) {
        const itemsA = this.userItemScores[userA] || {};
        const itemsB = this.userItemScores[userB] || {};

        const keysA = Object.keys(itemsA);
        const keysB = Object.keys(itemsB);

        if (keysA.length === 0 || keysB.length === 0) return 0;

        let dot = 0;
        for (const itemId of keysA) {
            if (itemsB[itemId] !== undefined) dot += itemsA[itemId] * itemsB[itemId];
        }

        const normA = Math.sqrt(Object.values(itemsA).reduce((s, x) => s + x * x, 0));
        const normB = Math.sqrt(Object.values(itemsB).reduce((s, x) => s + x * x, 0));

        if (normA === 0 || normB === 0) return 0;
        return dot / (normA * normB);
    }

    _cfScoresForUser(userId) {
        if (!this.users.has(userId)) return {};

        const targetItems = this.userItemScores[userId] || {};
        const cfScores = {};

        for (const otherUser of this.users) {
            if (otherUser === userId) continue;

            const sim = this._cosineSimilarity(userId, otherUser);
            if (sim <= 0) continue;

            const otherItems = this.userItemScores[otherUser] || {};
            for (const [itemId, score] of Object.entries(otherItems)) {
                if (targetItems[itemId] !== undefined) continue;
                if (!cfScores[itemId]) cfScores[itemId] = 0;
                cfScores[itemId] += sim * score;
            }
        }

        const values = Object.values(cfScores);
        if (values.length > 0) {
            const maxScore = Math.max(...values);
            if (maxScore > 0) {
                for (const itemId of Object.keys(cfScores)) {
                    cfScores[itemId] /= maxScore;
                }
            }
        }

        return cfScores;
    }

    recommend(userId, k = 10) {
        if (!this.users.has(userId)) {
            console.log(`🎯 User ${userId} not found, returning popular items`);
            return Array.from(this.items)
                .sort((a, b) => (this.itemPopularity[b] || 0) - (this.itemPopularity[a] || 0))
                .slice(0, k);
        }

        const seenItems = new Set(Object.keys(this.userItemScores[userId] || {}));
        const cfScores = this._cfScoresForUser(userId);

        const finalScores = {};
        for (const itemId of this.items) {
            if (seenItems.has(itemId)) continue;

            const popScore = this.itemPopularity[itemId] || 0;
            const cfScore = cfScores[itemId] || 0;
            finalScores[itemId] = this.cfWeight * cfScore + this.popWeight * popScore;
        }

        const recommendations = Object.keys(finalScores)
            .sort((a, b) => finalScores[b] - finalScores[a])
            .slice(0, k);

        console.log(`🎯 Recommendations for user ${userId}:`, recommendations);
        return recommendations;
    }

    // ✅ Add real-time interaction
    addInteraction(userId, itemId, eventType) {
        console.log(`📥 Adding interaction: ${userId} ${eventType} ${itemId}`);
        
        this.users.add(userId.toString());
        this.items.add(itemId.toString());

        const score = this._eventToScore(eventType);

        // Update user-item scores
        if (!this.userItemScores[userId]) this.userItemScores[userId] = {};
        if (!this.userItemScores[userId][itemId]) this.userItemScores[userId][itemId] = 0;
        this.userItemScores[userId][itemId] += score;

        // Update item popularity
        if (!this.itemPopularity[itemId]) this.itemPopularity[itemId] = 0;
        this.itemPopularity[itemId] += (eventType === "like" ? 1.0 : 0.2);

        this.lastUpdateTime = new Date();
        console.log(`✅ Interaction added successfully`);
    }

    // ✅ Get system status
    getStatus() {
        return {
            users_count: this.users.size,
            items_count: this.items.size,
            last_update: this.lastUpdateTime,
            models_available: this.modelsAvailable,
            userItemScores_count: Object.keys(this.userItemScores).length,
            itemPopularity_count: Object.keys(this.itemPopularity).length
        };
    }
}

// ✅ Initialize with fallback data first
const FALLBACK_INTERACTIONS = [
    ['53', '102', 'view'],
    ['53', '107', 'view'], 
    ['53', '101', 'view'],
    ['53', '102', 'like'],
    ['53', '107', 'like'],
    ['53', '109', 'view'],
    ['53', '108', 'view'],
    ['53', '100', 'view'],
    ['53', '103', 'view'],
    ['53', '104', 'view'],
    ['53', '105', 'view'],
    ['53', '106', 'view'],
];

const recommender = new SimpleRecommender();
recommender.fit(FALLBACK_INTERACTIONS);

// ✅ Dynamic INTERACTIONS array (compatible with your existing controller)
const INTERACTIONS = [...FALLBACK_INTERACTIONS];

// ✅ Dynamic data load from database (only if models available)
const loadDataFromDatabase = async () => {
    if (!recommender.modelsAvailable) {
        console.log('⚠️ Models not available, using fallback data');
        return;
    }

    try {
        console.log('🔄 Loading interactions from database...');
        
        const actions = await Action.findAll({
            include: [
                {
                    model: User,
                    attributes: ['user_id']
                },
                {
                    model: Social, 
                    attributes: ['social_id']
                }
            ],
            limit: 1000 // Limit for performance
        });

        // Clear existing interactions
        INTERACTIONS.length = 0;

        actions.forEach(action => {
            const userId = action.action_by?.toString();
            const socialId = action.social_id?.toString();
            
            if (!userId || !socialId) return;

            if (action.like) {
                INTERACTIONS.push([userId, socialId, 'like']);
            }
            if (action.view) {
                INTERACTIONS.push([userId, socialId, 'view']);
            }
            if (action.bookmark) {
                INTERACTIONS.push([userId, socialId, 'bookmark']);
            }
        });

        console.log(`📊 Loaded ${INTERACTIONS.length} interactions from database`);
        
        if (INTERACTIONS.length > 0) {
            recommender.fit(INTERACTIONS);
            console.log(`✅ Recommender trained with ${INTERACTIONS.length} interactions`);
        } else {
            console.log('⚠️ No interactions found in database, using fallback data');
            // Restore fallback data
            INTERACTIONS.push(...FALLBACK_INTERACTIONS);
            recommender.fit(INTERACTIONS);
        }

    } catch (error) {
        console.error('❌ Error loading data from database:', error);
        // Restore fallback data on error
        INTERACTIONS.push(...FALLBACK_INTERACTIONS);
        recommender.fit(INTERACTIONS);
    }
};

// ✅ Add new interaction (compatible with your existing controller)
const addInteraction = async (userId, itemId, eventType) => {
    try {
        // Add to INTERACTIONS array (for your existing controller compatibility)
        const eventData = [userId.toString(), itemId.toString(), eventType];
        INTERACTIONS.push(eventData);
        
        // Update recommender in real-time
        recommender.addInteraction(userId.toString(), itemId.toString(), eventType);
        
        // Save to database if models available
        if (recommender.modelsAvailable) {
            console.log(`💾 Saving interaction to database: ${userId} ${eventType} ${itemId}`);
            
            const actionData = {
                action_by: parseInt(userId),
                social_id: parseInt(itemId),
                like: eventType === 'like',
                view: eventType === 'view',
                bookmark: eventType === 'bookmark'
            };

            await Action.create(actionData);
            console.log('✅ Interaction saved to database');
        }
        
        return { success: true, message: 'Interaction recorded' };
        
    } catch (error) {
        console.error('❌ Error saving interaction:', error);
        return { success: false, error: error.message };
    }
};

// ✅ Get recommendations
const getRecommendations = async (userId, k = 10) => {
    try {
        console.log(`🎯 Getting ${k} recommendations for user: ${userId}`);
        
        const recommendations = recommender.recommend(userId.toString(), k);
        
        console.log(`✅ Returning ${recommendations.length} recommendations`);
        return recommendations;
        
    } catch (error) {
        console.error('❌ Error getting recommendations:', error);
        return [];
    }
};

// ✅ Get popular items
const getPopular = () => {
    return Object.entries(recommender.itemPopularity)
        .sort((a, b) => b[1] - a[1])
        .map(x => x[0])
        .slice(0, 20);
};

// ✅ Get recommender status
const getRecommenderStatus = () => {
    return {
        interaction_count: INTERACTIONS.length,
        available_users: recommender.users.size,
        available_items: recommender.items.size,
        last_update: recommender.lastUpdateTime,
        models_available: recommender.modelsAvailable
    };
};

// ✅ Get debug info
const getDebugInfo = () => {
    return {
        interactions: INTERACTIONS,
        users: Array.from(recommender.users),
        items: Array.from(recommender.items),
        userItemScores: recommender.userItemScores,
        itemPopularity: recommender.itemPopularity
    };
};

// ✅ Initialize with database data on startup
loadDataFromDatabase();

// ✅ Auto-refresh every 30 minutes
setInterval(loadDataFromDatabase, 30 * 60 * 1000);

module.exports = { 
    recommender, 
    INTERACTIONS, // ✅ Export INTERACTIONS for your existing controller
    loadDataFromDatabase,
    addInteraction,
    getRecommendations,
    getPopular,
    getRecommenderStatus,
    getDebugInfo
};