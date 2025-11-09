import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().port().default(3000),

  JWT_SECRET: Joi.string().required(),
  JWT_TTL: Joi.number(),
  JWT_REFRES_TTL: Joi.number(),

  DATABASE_URL: Joi.string().required(),

  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_AVATAR_BUCKET: Joi.string().required(),
  AWS_MEDIA_BUCKET: Joi.string().required(),
});
