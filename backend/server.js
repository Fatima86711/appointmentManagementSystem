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
app.use(cors())

// api endpoints
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res)=>{
res.send('API working')
})


app.listen(port, ()=>console.log("Server started", port));


