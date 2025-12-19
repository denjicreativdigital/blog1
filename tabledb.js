import { Sequelize } from "sequelize";
import db from "./database.js"

const {DataTypes} = Sequelize

const Table = db.define('web',{
    judul:{
        type: DataTypes.STRING 
    },
    image:{
        type: DataTypes.STRING 
    },
    url:{
        type: DataTypes.STRING 
    },
    teks:{
        type: DataTypes.STRING 
    },
    kategori:{
        type: DataTypes.STRING 
    }
},{
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    freezeTableName: true
}
)

export default  Table