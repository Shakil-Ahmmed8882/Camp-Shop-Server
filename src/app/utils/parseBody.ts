import { RequestHandler } from 'express';

export const parseBody: RequestHandler = (req, res, next) => {
  try {

    req.body = JSON.parse(req.body.data);
    next();
  } catch (error) {
    res.status(400).send({ message: 'Invalid JSON' });
  }
};
