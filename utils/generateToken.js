import jwt from 'jsonwebtoken';
import { EXPIRATION_AT,EXPIRATION_RT, KEY_AT, KEY_RT } from './constants';

const generateAccessToken = (user) => {
  const payload = { id: user.id }
  return jwt.sign(
    payload,
    KEY_AT,
    { expiresIn: EXPIRATION_AT }
  );
}

const generateRefreshToken = (user) => {
  const payload = { id: user.id }
  return jwt.sign(
    payload,
    KEY_RT,
    { expiresIn: EXPIRATION_RT }
  );
}

export {
  generateAccessToken,
  generateRefreshToken
}