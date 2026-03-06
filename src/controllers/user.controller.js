import { User } from '../models/user.js';
import { Task } from '../models/task.js';
import logger from '../logs/logger.js';
import { Status } from '../constants/index.js';
import { encriptar } from '../common/bcrypt.js';
import { Op } from 'sequelize';

async function create(req, res) {
    const { username, password } = req.body;
    try {
        const newUser = await User.create({
            username,
            password
        });
        return res.json(newUser);
    } catch (error) {
        logger.error(error);
        return res.status(500).json(error);
    }
}

async function get(req, res) {
    try {
        const users = await User.findAndCountAll({
            attributes: ['id', 'username', 'password', 'status'],
            order: [['id', 'DESC']],
            where: {
                status: Status.ACTIVE
            }
        });
        res.json({
            total: users.count,
            data: users.rows
        }
        )
    } catch (error) {
        logger.error(error);
        return res.status(500).json(error);
    }
}
async function find(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findOne({
    attributes: ['username', 'status'],
    where: {
    id,
    },
    });
    if(!user)
    return res.status(404) .json({message:'Usuario no encontrado'});
    res.json(user)
    } catch (error) {
    logger.error(error);
    return res.json(error);
    }
}

const update = async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  const passwordHash = await encriptar(password)
  try {
    const user = await User.update(
      {
        username,
        password : passwordHash,
      },
      { where: { id } },
    );
    return res.json(user);
  } catch (error) {
    logger.error(error);
    return res.json(error);
  }
};
const activateInactivate = async(req, res) =>{
  const { id } = req.params;
  const { status} = req.body;
  
  if(!status) return res.status(400).json({message:'No existe el status'})
  try {
    const user= await User.findByPk(id);
    if(!user) return res.status(400).json({message:'No existe el usuario'})
    if(user.status===status) return res.status(409).json({message:`El usuario ya se encuentra ${status}`})
        user.status=status;
        await user.save();
        res.json(user);
  } catch (error) {
    logger.error(error);
    
    return res.json(error);
  }
}
const eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    await Task.destroy({
      where: {
        userId:id,
      },
    });
    await User.destroy({
      where: {
        id,
      },
    });
    return res.sendStatus(204);
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
};

// Qodo: Test this function
const getTasks = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      attributes: ['username'],
      include: [
        {
          model: Task,
          attributes: ['name', 'done'],
        },
      ],
      where: { id },
    });
    return res.json(user);
  } catch (error) {
    logger.error(error);
    return res.json(error.message);
  }
};

//Para la paginación
async function pagination(req, res) {
    // 1. Definir valores por defecto según el PDF y tu solicitud
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const search = req.query.search || '';
    const orderBy = req.query.orderBy || 'id';
    const orderDir = req.query.orderDir || 'DESC';
    const status = req.query.status || Status.ACTIVE; // Valor por defecto 'active'

    
    const offset = (page - 1) * limit;

    try {
        
        const users = await User.findAndCountAll({
            attributes: ['id', 'username', 'status'],
            where: {
                
                username: {
                    [Op.iLike]: `%${search}%`
                },
                
                status: status
            },
            order: [[orderBy, orderDir]],
            limit: limit,
            offset: offset
        });

        
        const totalPages = Math.ceil(users.count / limit);

        
        res.json({
            total: users.count,
            page: page,
            pages: totalPages,
            data: users.rows
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: error.message });
    }
}

export default {
    create,
    get,
    find,
    update,
    eliminar,
    activateInactivate,
    getTasks,
    pagination,
};