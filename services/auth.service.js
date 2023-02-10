import { emailRegex, dateFormat } from "../utils/index";
import { getUser, insertUser, loginUser } from "../repositories/user.model";
import { getToken, deleteToken, requestRefreshToken } from "../repositories/token.model";

const getTest = async (req, res, next) => {
  try {
    const { pageIndex, pageSize, email } = req.query;
    const user = await getUser({ pageIndex, pageSize, email }, ['id', 'email']);

    res.send(user);
  }
  catch (error) {
    console.log('Error happened: ', error);
    res.send({
      status: false,
      message: 'Internal error.',
      data: error
    })
  }
}

const signUp = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName)
      return res.status(400).json({
        success: false,
        message: 'Validation error. All fields must be filled in.',
        data: null
      });

    const existed = await getUser({ email }, ['id', 'email']);
    if (existed.data.length > 0)
      return res.status(400).json({
        success: false,
        message: 'Validation error. This email is not available.',
        data: null
      });

    if (!String(email).toLowerCase().match(emailRegex))
      return res.status(400).json({
        success: false,
        message: 'Validation error. Wrong email format.',
        data: null
      });

    if (!(String(password).length >= 8 && String(password).length <= 20)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error. Password must be between 8-20 characters.',
        data: null
      });
    };

    const now = dateFormat(new Date());
    
    const user = await insertUser({ email, password, firstName, lastName, createdAt: now, updatedAt: now });

    return res.status(201).json(user);
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Error',
      data: error
    })
  }
}

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: 'Validation error. All fields must be filled in.',
        data: null
      });

    if (!String(email).toLowerCase().match(emailRegex))
      return res.status(400).json({
        success: false,
        message: 'Validation error. Wrong email format.',
        data: null
      });

    if (!(String(password).length >= 8 && String(password).length <= 20)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error. Password must be between 8-20 characters.'
      });
    };

    const existed = await getUser({ email }, ['id', 'firstName', 'lastName', 'email', 'displayName', 'password']);
    if (existed.data.length <= 0)
      return res.status(400).json({
        success: false,
        message: 'Validation error. This email is not existed.',
        data: null
      });

    const user = await loginUser({ email, password }, existed.data[0]);

    return res.status(200).json(user);
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Error',
      data: error
    })
  }
}

const signOut = async (req, res, next) => {
  try {
    let cookieRtToken = '';
    req.headers?.cookie?.split(' ')?.forEach(item => { if (item?.indexOf('token') >= 0) cookieRtToken = item });

    const refreshToken =
      cookieRtToken?.replace('token=', '')?.replace(';', '')
      || req.body.refreshToken
      || req.user.refreshToken
      || req.cookies.refreshToken;

    await deleteToken(refreshToken);
    
    return res.status(204).send();
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Error',
      data: error
    })
  }
}

const getNewRefreshToken = async (req, res, next) => {
  try {
    let cookieRtToken = '';
    req.headers?.cookie?.split(' ')?.forEach(item => { if (item?.indexOf('token') >= 0) cookieRtToken = item });

    const refreshToken =
      cookieRtToken?.replace('token=', '')?.replace(';', '')
      || req.body.refreshToken
      || req.user.refreshToken
      || req.cookies.refreshToken;

    if (!refreshToken)
      return res.status(400).json({
        success: false,
        message: 'Validation error. Not found refresh token.',
        data: null
      });

    const existed = await getToken({ refreshToken });
    if (existed.data.length <= 0)
      return res.status(404).json({
        success: false,
        message: 'Not found. Supplied refreshToken is not found',
        data: null
      });

    const newTokens = await requestRefreshToken(existed.data[0]);
    
    return res.status(200).send(newTokens);
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Error',
      data: error
    })
  }
}

export {
  getTest,
  signUp,
  signIn,
  signOut,
  getNewRefreshToken,
}