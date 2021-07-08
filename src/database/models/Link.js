const db = require('../init');
const faker = require('faker');
faker.seed(Date.now());

module.exports = db.sequelize.define('link',{
    id: {
        type: db.dataTypes.UUID,
        defaultValue: db.dataTypes.UUIDV4,
        primaryKey: true,
    },
    owner: {
        type: db.dataTypes.UUID,
        allowNull: false,
    },
    slug: {
        type: db.dataTypes.STRING,
        allowNull: false,
    },
    destination: {
        type: db.dataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true,
        },
    },
    redirects: {
        type: db.dataTypes.BIGINT,
        defaultValue: 0,
        allowNull: false,
    },
    status: {
        type: db.dataTypes.ENUM('ACTIVE', 'INACTIVE', "DISABLED"),
        defaultValue: "ACTIVE",
        allowNull: true,
    },
    metric_id: {
        type: db.dataTypes.UUID,
    }
},
    {
        indexes: [
            {
                unique: true,
                fields: ['owner', 'slug'],
            }
        ]
    }
);