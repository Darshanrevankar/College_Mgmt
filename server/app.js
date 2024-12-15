import express from "express";
import cors from 'cors'

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRoute from './routes/auth.route.js';
import adminRoute from './routes/admin.route.js'
import userRoute from './routes/user.route.js'
import mainRoute from './routes/main.route.js'


// =========== Routes Declarations ============
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/admin',adminRoute);
app.use('/api/v1/user',userRoute);
app.use('/api/v1/main', mainRoute);


export { app };