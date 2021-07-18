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
        defaultValue: () => {
            faker.seed(Date.now());
            return `${faker.hacker.adjective().replace(' ', '-').substr(0,4)}-${faker.name.firstName().toLowerCase().substr(0,4)}-${faker.random.alphaNumeric(4)}`},
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
    status: {
        type: db.dataTypes.ENUM('VERIFIED', 'PENDING', 'SUSPENDED'),
        allowNull: false,
        defaultValue: 'PENDING',
    },
    token: {
        type: db.dataTypes.STRING,
        allowNull: true,
    },
})