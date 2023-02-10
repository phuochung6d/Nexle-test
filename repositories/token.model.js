import jwt from 'jsonwebtoken';
import { builder } from "../utils";
import { dateFormat } from "../utils";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";
import { TABLE_TOKENS, KEY_RT, EXPIRATION_RT } from '../utils/constants';

const getToken = async (body) => {
  let error = null;
  let total = [{ TOTAL: 0 }];
  let pIndex = 1;
  let pSize = 20;
  let tokenList = [];

  try {
    let filter = body || {};
    let { pageIndex, pageSize, id, userId, refreshToken } = filter;
    pIndex = parseInt(pageIndex, 10) || 1;
    pSize = parseInt(pageSize, 10) || 20;
    id = id ? id : "";
    userId = userId ? userId.trim() : "";
    refreshToken = refreshToken ? refreshToken.trim() : "";

    let ret = builder(TABLE_TOKENS).select('id', 'userId', 'refreshToken', 'expiresIn');
    let counter = builder(TABLE_TOKENS).count('* as TOTAL');
    let check = 0;

    if (id) {
      check++;
      ret = ret.where('id', '=', id);
      counter = counter.where('id', '=', id);
    }
    if (userId) {
      ret = check ? ret.andWhere('userId', '=', userId) : ret.where('userId', '=', userId);
      counter = check ? counter.andWhere('userId', '=', userId) : counter.where('userId', '=', userId);
    }
    if (refreshToken) {
      ret = check ? ret.andWhere('refreshToken', '=', refreshToken) : ret.where('refreshToken', '=', refreshToken);
      counter = check ? counter.andWhere('refreshToken', '=', refreshToken) : counter.where('refreshToken', '=', refreshToken);
    }

    total = await counter;
    const data = await ret.limit(pSize).offset(pSize * (pIndex - 1));
    for (let i = 0; i < data.length; i++) {
      const {...filteredObj} = data[i];
      tokenList.push(filteredObj);
    }
  } catch(err) {
    error = err;
  }

  return new Promise((resolve, reject) => {
    if (!error) {
      resolve({
        data: tokenList,
        total: total[0].TOTAL,
        pageIndex: pIndex,
        pageSize: pSize
      })
    }
    reject(error);
  })
}

const insertToken = async (input) => {
  const { userId, refreshToken, expiresIn } = input;

  const now = dateFormat(new Date());

  const result = await builder(TABLE_TOKENS).insert({
    userId,
    refreshToken,
    expiresIn,
    createdAt: now,
    updatedAt: now
  });

  const token = await getToken({ id: result[0] });

  return token;
};

const updateToken = async (input) => {
  const { id, userId, newRefreshToken, expiresIn } = input;

  const now = dateFormat(new Date());

  await builder(TABLE_TOKENS)
    .where({ id, userId })
    .update({
      refreshToken: newRefreshToken,
      expiresIn,
      updatedAt: now
    });
};

const deleteToken = async (rtToken) => {
  let error = null;

  try {
    await builder(TABLE_TOKENS)
    .where('refreshToken', rtToken)
    .del();
  }
  catch(err) {
    error = err;
  }

  return new Promise((resolve, reject) => {
    if (!error) {
      resolve()
    }
    reject(error);
  });
}

const requestRefreshToken = async (tokenInfo) => {
  let error = null;
  let [newAccessToken, newRefreshToken] = [null, null];

  try {
    jwt.verify(
      tokenInfo.refreshToken,
      KEY_RT,
      async (err, data) => {
        if (err) {
          error = err;
          return;
        };
        
        newAccessToken = generateAccessToken(data);
        newRefreshToken = generateRefreshToken(data);
        await updateToken({...tokenInfo, expiresIn: EXPIRATION_RT, newRefreshToken});
      }
    )
  }
  catch(err) {
    error = err
  }

  return new Promise((resolve, reject) => {
    if (!error) {
      resolve({
        token: newAccessToken,
        refreshToken: newRefreshToken
      })
    }
    reject(error);
  });
}

export {
  getToken,
  insertToken,
  deleteToken,
  requestRefreshToken
}