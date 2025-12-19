import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime.js"
import "dayjs/locale/id.js"
import express from "express"
import Table from "./tabledb.js"
import FileUpload from "express-fileupload"
import path from "path"
import cors from "cors"
import { verifyToken } from "./verify.js"

import fs from "fs"
// import { Sequelize } from "sequelize"
import {Op} from "sequelize"
import authRoutes from "./auth.js"



dayjs.extend(relativeTime)
dayjs.locale("id")
const app = express()
const port = 5000
app.use(cors())
app.use(express.json())
app.use(FileUpload())
app.use("/auth", authRoutes)
app.use('/images', express.static('./images'))

app.get("/berita", async (req, res) => {
  try {
    const { search, kategori } = req.query;

    const where = {};

    // filter kategori (optional)
    if (kategori) {
      where.kategori = kategori;
    }

    // filter search judul (optional)
    if (search) {
      where.judul = {
        [Op.like]: `%${search}%`,
      };
    }

    const data = await Table.findAll({
      where,
      order: [["id", "DESC"]], // 🔥 SINGLE RULE: TERBARU DULU
    });

    const result = data.map((item) => ({
      ...item.toJSON(),
      last_update: dayjs(item.updated_at).fromNow(),
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
});


app.get("/berita/:id", async(req,res) => {
    const respon = await Table.findOne({
        where:{
            id: req.params.id
        }
    })
    res.json({
        ...respon.toJSON(),
        last_update: dayjs(respon.updated_at).fromNow()
    })
})

app.post("/post",verifyToken, async(req, res) =>{
    const name = req.body.file
    const cat = req.body.cate
    const image = req.files.img
    const text = req.body.tulis
const ext = path.extname(image.name)
const filename = image.md5 + Math.random() + ext
const url = `${req.protocol}://${req.get("host")}/images/${filename}`
const allow = ['.jpg', '.jpeg', '.png']

if(!allow.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid image"})

    image.mv(`./images/${filename}`, async() =>{
        await Table.create({judul:name, image: filename, url:url, teks:text, kategori:cat })
        res.status(200).json({msg: "file terkirim"})
    })
})

app.patch("/berita/:id", verifyToken, async (req, res) => {
    try {
      const foto = await Table.findOne({
        where: { id: req.params.id }
      });
  
      if (!foto) {
        return res.status(404).json({ msg: "Berita tidak ditemukan" });
      }
  
      const name = req.body.file;
      const teks = req.body.tulis;
      const cat = req.body.cate;
  
      // DEFAULT: pakai data lama
      let filename = foto.image;
      let url = foto.url;
  
      // OPTIONAL IMAGE UPDATE
      if (req.files?.img) {
        const image = req.files.img;
        const ext = path.extname(image.name);
        const allow = ['.jpg', '.jpeg', '.png'];
  
        if (!allow.includes(ext.toLowerCase())) {
          return res.status(422).json({ msg: "Invalid image" });
        }
  
        filename = image.md5 + ext;
        url = `${req.protocol}://${req.get("host")}/images/${filename}`;
  
        const oldPath = `./images/${foto.image}`;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
  
        await image.mv(`./images/${filename}`);
      }
  
      await Table.update(
        {
          judul: name,
          teks: teks,
          kategori: cat,
          image: filename,
          url: url
        },
        {
          where: { id: req.params.id }
        }
      );
  
      return res.status(200).json({ msg: "Berita berhasil diupdate" });
    
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });
  


app.delete("/berita/:id", verifyToken, async(req, res) =>{
const berita = await Table.findOne({
    where:{
        id: req.params.id
    }
})
if(!berita) return res.status(404).json({msg: "tidak ada berita"})

    const tempat = `./images/${berita.image}`
    fs.unlinkSync(tempat)

    await Table.destroy({
        where:{
            id: req.params.id
        }
    })
    res.status(200).json({msg: "table berhasil dihapus"})

})





app.listen(port, () =>{
    console.log("server terhubung")
})