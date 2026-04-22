import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from "./config/mongodb.js"
import connectCloudinary from './config/cloundinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import { stripeWebhook } from './controllers/paymentController.js';

// app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// Stripe webhook route MUST use raw body (before express.json())
app.post('/api/webhook', express.raw({type: 'application/json'}), stripeWebhook);


// middlewares
app.use(express.json())

// middlewares
app.use(express.json())

// --- NEW CORS CONFIGURATION START ---
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174', 
  'http://localhost:5175',
  'https://appointment-api-nine.vercel.app', 
  'https://appointment-management-system-six.vercel.app', 
  'https://appointment-management-system-admin-two.vercel.app' 
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// ADD THIS LINE: Explicitly tell Express to answer Preflight/OPTIONS requests
app.options('*', cors(corsOptions)); 
// --- NEW CORS CONFIGURATION END ---


// api endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);



app.get('/', (req, res)=>{
res.send('API working')
})


app.listen(port, ()=>console.log("Server started", port));


