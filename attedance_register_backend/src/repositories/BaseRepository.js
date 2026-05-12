const db = require('../config/database');

class BaseRepository {
    async query(sql, params) {
        try {
            const [results] = await db.query(sql, params);
            return results;
        } catch (error) {
            console.error(`Database Error: ${error.message}`);
            throw error;
        }
    }

    async execute(sql, params) {
        try {
            const [results] = await db.execute(sql, params);
            return results;
        } catch (error) {
            console.error(`Execution Error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = BaseRepository;
