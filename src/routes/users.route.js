import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import validate from '../validators/validate.js';
import { Schema } from '../validators/user.validate.js';
import { authenticateToken } from '../middlewares/authenticate.middlewares.js';
const router = Router();

router.route('/')
.get(userController.get)
.post(validate(Schema), userController.create)

router.route('/:id')
.get(authenticateToken, userController.find)
.put(authenticateToken,validate(Schema), userController.update)
.patch(authenticateToken,userController.activateInactivate)
.delete(authenticateToken,userController.eliminar)

router.get('/:id/tasks',authenticateToken,userController.getTasks)

//ruta paginación
router.get('/list/pagination', authenticateToken, userController.pagination);
export default router