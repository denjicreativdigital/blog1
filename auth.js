import express from "express"
import jwt from "jsonwebtoken"

const router = express.Router()

const ADMIN_USER = "admin"
const ADMIN_PASS = "123456"
const JWT_SECRET = "SECRET_KEY_INTERNAL"

router.post("/login", (req, res) => {
  const { username, password } = req.body

  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ msg: "verifikasi tidak cocok" })
  }

  const token = jwt.sign(
    { username, role: "admin" },
    JWT_SECRET,
    { expiresIn: "1h" }
  )

  res.json({ token })
})

export default router
