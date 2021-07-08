const db = require('../init');
const faker = require('faker');
faker.seed(Date.now());

module.exports = db.sequelize.define('metric',{
    id: {
        type: db.dataTypes.UUID,
        defaultValue: db.dataTypes.UUIDV4,
        primaryKey: true,
    },
    timestamps: {
        type: db.dataTypes.ARRAY(db.dataTypes.DATE),
    }
}
);