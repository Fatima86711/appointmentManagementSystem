import express from 'express';
import {addDoctor} from '../controllers/adminController.js';
import upload from '../middlewares/multer.js';
import { doctorList } from '../controllers/doctorController.js';

const doctorRouter = express.Router();

doctorRouter.get('/list', doctorList);

export default doctorRouter;



