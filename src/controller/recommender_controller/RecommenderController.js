const { 
    recommender, 
    INTERACTIONS, 
    addInteraction, 
    getRecommendations, 
    getPopular, 
    getRecommenderStatus,
    getDebugInfo 
} = require("../../service/common/recommenderService");

exports.addEvent = async (req, res) => {
    try {
        const { user_id, item_id, event_type } = req.body;

        if (!user_id || !item_id) {
            return res.status(400).json({ error: "user_id and item_id required" });
        }

        // Use the new addInteraction function
        const result = await addInteraction(user_id, item_id, event_type || "view");

        console.log(`✅ Event tracked: ${user_id}, ${item_id}, ${event_type}`);
        console.log(`📊 Total interactions: ${INTERACTIONS.length}`);
        
        res.json({ 
            status: "event_saved", 
            interaction_count: INTERACTIONS.length,
            ...result
        });
    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.addBatchEvents = async (req, res) => {
    try {
        const list = req.body.interactions || [];
        let addedCount = 0;
        
        for (const e of list) {
            if (e.user_id && e.item_id) {
                await addInteraction(e.user_id, e.item_id, e.event_type || "view");
                addedCount++;
            }
        }

        console.log(`✅ Batch added ${addedCount} events, total: ${INTERACTIONS.length}`);
        
        res.json({ 
            status: "batch_saved", 
            added_count: addedCount,
            total_interactions: INTERACTIONS.length 
        });
    } catch (error) {
        console.error('Error adding batch events:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.params.userId;
        const k = parseInt(req.query.k) || 10;

        console.log(`🎯 Getting recommendations for user: ${userId}`);
        
        const recs = await getRecommendations(userId, k);
        const status = getRecommenderStatus();
        
        console.log(`📋 Recommendations for ${userId}:`, recs);
        
        res.json({ 
            user_id: userId, 
            recommendations: recs,
            ...status
        });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getPopular = (req, res) => {
    try {
        const popular = getPopular();

        res.json({ 
            popular,
            interaction_count: INTERACTIONS.length
        });
    } catch (error) {
        console.error('Error getting popular items:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getStatus = (req, res) => {
    try {
        const status = getRecommenderStatus();
        res.json({
            status: 'operational',
            ...status
        });
    } catch (error) {
        console.error('Error getting status:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getDebugInfo = (req, res) => {
    try {
        const debugInfo = getDebugInfo();
        res.json(debugInfo);
    } catch (error) {
        console.error('Error getting debug info:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};