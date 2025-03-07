import express from 'express'
import cors from 'cors'
import authRoutes from './router/authRoutes.js'
authRoutes

const app = express()

app.use(express.json())
app.use(cors())
app.use('api/auth/',authRoutes)


app.listen(process.env.PORT,() => {
    console.log('Server is running on port 5000')
})