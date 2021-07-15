const db = require('../init');
const faker = require('faker');
faker.seed(Date.now());

module.exports = db.sequelize.define('user', {
    id: {
        type: db.dataTypes.UUID,
        defaultValue: db.dataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: db.dataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: db.dataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true,
        }
    },
    password: {
        type: db.dataTypes.STRING,
        allowNull: false,
    },
    alias: {
        type: db.dataTypes.STRING,
        allowNull: false,
        defaultValue: `${faker.hacker.adjective().replace(' ', '-')}-${faker.name.firstName().toLowerCase()}-${faker.random.alphaNumeric(4)}`
    },
    plan: {
        type: db.dataTypes.ENUM('BASIC', 'PRO', 'CUSTOM'),
        allowNull: false,
        defaultValue: 'BASIC',
    },
    banned: {
        type: db.dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    gender: {
        type: db.dataTypes.ENUM('MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED'),
        allowNull: false,
        defaultValue: 'UNDISCLOSED',
    },
    dob: {
        type: db.dataTypes.DATEONLY,
        allowNull: true,
    },
})