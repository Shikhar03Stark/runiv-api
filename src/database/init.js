const {Sequelize, Op, DataTypes} = require('sequelize');

const sequelize = new Sequelize({
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'runiv_development',
    dialect: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    define: {
        underscored: true,
        freezeTableName: true,
    },
    logging: (process.env.NODE_ENV === 'development') ? true : false,
});

module.exports = {
    sequelize,
    dataTypes: DataTypes,
    Op,
    connect : async () => {
        try {
            await sequelize.authenticate();
            console.log(`Connected to DB`)
        } catch (error) {
            console.log(`Error Connecting to Database`);
        }
    }
}