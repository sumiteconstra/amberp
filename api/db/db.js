const { Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});
try {
    sequelize.authenticate();
    console.log("connection has been established");
    //sequelize.sync({ alter: true })
} catch (err) {
    console.log(`unable to connect database ${err}`);
}


module.exports = sequelize;



