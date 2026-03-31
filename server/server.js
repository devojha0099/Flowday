require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')

connectDB();


const app = express();

//Middleware

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : true,  // Allow all origins in development
  credentials: true
}))

app.use(express.json());
app.use(cookieParser());

//Routes

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/entries', require('./routes/entryRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.get('/', (req , res) => {
  res.json({message: 'Flowday API is running'})
})

const PORT = process.env.PORT || 5001;
app.listen(PORT,()=>{
  console.log(`Server is running at ${PORT}`)
})