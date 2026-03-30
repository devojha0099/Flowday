require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')

connectDB();


const app = express();

//Middleware

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))

app.use(express.json());
app.use(cookieParser());

//Routes

app.use('/api/auth',require('./routes/authRoutes'));
app.get('/', (req , res) => {
  res.json({message: 'Flowday API is running'})
})

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
  console.log(`Server is running at ${PORT}`)
})