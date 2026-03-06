import Joi from 'joi';

export const Schema = Joi.object({
  username: Joi.string().alphanum().min(3).max(36).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,}$')),
});