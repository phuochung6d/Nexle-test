import { builder } from "../utils";
import bcrypt from 'bcrypt';
import { insertToken } from "./token.model";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";
import { TABLE_USERS, saltRounds, EXPIRATION_RT } from "../utils/constants";

const getUser = async (body, columns) => {
  let error = null;
  let total = [{ TOTAL: 0 }];
  let pIndex = 1;
  let pSize = 20;
  let userList = [];

  try {
    let filter = body || {};
    let { pageIndex, pageSize, email } = filter;
    pIndex = parseInt(pageIndex, 10) || 1;
    pSize = parseInt(pageSize, 10) || 20;
    email = email ? email.trim() : "";

    if (columns.indexOf('displayName'))
      columns[columns.indexOf('displayName')] = builder.raw('CONCAT(firstName, " ", lastName) as displayName');
    
    let ret = builder(TABLE_USERS).select(columns);
    let counter = builder(TABLE_USERS).count('* as TOTAL');

    if (email) {
      ret = ret.where('email', '=', email);
      counter = counter.where('email', '=', email);
    }

    total = await counter;
    const data = await ret.limit(pSize).offset(pSize * (pIndex - 1));
    for (let i = 0; i < data.length; i++) {
      const {...filteredObj} = data[i];
      userList.push(filteredObj);
    }
  } catch(err) {
    error = err;
  }

  return new Promise((resolve, reject) => {
    if (!error) {
      resolve({
        data: userList,
        total: total[0].TOTAL,
        pageIndex: pIndex,
        pageSize: pSize
      })
    }
    reject(error);
  })
}

const insertUser = async (input) => {
  let error = null;
  let userCreated = null;

  try {
    const { password, ...data } = input;
    const hashed = await bcrypt.hash(password, saltRounds);

    const result = await builder(TABLE_USERS).insert({...data, password: hashed});

    [userCreated] = await builder(TABLE_USERS)
      .where({
        id: result[0]
      })
      .select([
        'id',
        'firstName',
        'lastName',
        'email',
        builder.raw('CONCAT(firstName, " ", lastName) as displayName')
      ]);
  }
  catch(err) {
    error = err;
  }

  return new Promise((resolve, reject) => {
    if (!error) {
      resolve(userCreated);
    }
    reject(error);
  })
}

const loginUser = async (input, user) => {
  let error = null;
  let [accessToken, refreshToken] = [null, null];

  try {
    const { email, password } = input;
    
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );
    if (!validPassword)
      return {
        sucess: false,
        message: 'Validation error. Wrong password.',
        data: null
      }
    
    accessToken = generateAccessToken(user)
    refreshToken = generateRefreshToken(user)
    
    await insertToken({ userId: user.id, refreshToken, expiresIn: EXPIRATION_RT });

    delete user.id;
    delete user.password;
  }
  catch(err) {
    error = err;
  }

  return new Promise((resolve, reject) => {
    if (!error) {
      resolve({
        user,
        token: accessToken,
        refreshToken
      });
    }
    reject(error);
  })

}

export {
  getUser,
  insertUser,
  loginUser,
}
