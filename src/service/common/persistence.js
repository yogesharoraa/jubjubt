// service/common/persistence.js
const fs = require('fs');
const path = require('path');

const INTERACTIONS_FILE = path.join(__dirname, 'interactions.json');

function saveInteractions(interactions) {
    try {
        fs.writeFileSync(INTERACTIONS_FILE, JSON.stringify(interactions, null, 2));
        console.log(`💾 Interactions saved to file: ${interactions.length} records`);
    } catch (error) {
        console.error('❌ Error saving interactions:', error);
    }
}

function loadInteractions() {
    try {
        if (fs.existsSync(INTERACTIONS_FILE)) {
            const data = fs.readFileSync(INTERACTIONS_FILE, 'utf8');
            const interactions = JSON.parse(data);
            console.log(`📂 Interactions loaded from file: ${interactions.length} records`);
            return interactions;
        }
    } catch (error) {
        console.error('❌ Error loading interactions:', error);
    }
    return [];
}

module.exports = { saveInteractions, loadInteractions };