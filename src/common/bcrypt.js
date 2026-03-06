import bcrypt from 'bcrypt';
import env from '../config/env.js';
import logger from '../logs/logger.js';
//import {encriptar} from '../common/bcrypt.js';
/**
 * Encripta un texto plano (contraseña)
 */
export const encriptar = async (text) => {
    try {
        const saltRounds = env.bcrypt_salt_rounds;
        return await bcrypt.hash(text, saltRounds);
    } catch (error) {
        logger.error(error);
        throw new Error('Error al encriptar el texto');
    }
};

/**
 * Compara un texto plano con un hash encriptado
 */
export const comparar = async (text, hash) => {
    try {
        return await bcrypt.compare(text, hash);
    } catch (error) {
        logger.error(error);
        throw new Error('Error al comparar el texto');
    }
};
