import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import validate from '../validators/validate.js';
import { Schema } from '../validators/user.validate.js';
const router = Router();

router.post('/', validate(Schema),authController.login)

export default router