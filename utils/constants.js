const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const TABLE_USERS = 'Users';
const TABLE_TOKENS = 'Tokens';
const saltRounds = 10;
// const EXPIRATION_AT = '3600s';
// const EXPIRATION_RT = '30d';
const EXPIRATION_AT = '15s';
const EXPIRATION_RT = '30s';

const KEY_AT = 'simple_key_at';
const KEY_RT = 'simple_key_rt';

export {
  emailRegex,
  TABLE_USERS,
  TABLE_TOKENS,
  saltRounds,
  EXPIRATION_AT,
  EXPIRATION_RT,
  KEY_AT,
  KEY_RT
}