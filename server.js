import express from 'express'
import cors from 'cors'
import authRoutes from './router/authRoutes.js'
import dotenv from  'dotenv'
import connectDB from './config/connectDB.js'

dotenv.config()
const app = express()

connectDB()
app.use(express.json())
app.use(cors())
app.use('/api/auth',authRoutes)


app.listen(process.env.PORT,() => {
    console.log('Server is running on port 5000')
})