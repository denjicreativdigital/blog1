import { Sequelize } from "sequelize";

const db = new Sequelize('revolusi', 'root', '', {
    host : "localhost",
    dialect: "mysql"
})

export default db