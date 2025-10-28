const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Ngo = require('../models/Ngo');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];
  }
  else if(req.cookies && req.cookies.token){
    token = req.cookies.token
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Try to find user or NGO
    let user = await User.findById(decoded.id).select('-password');
    if (!user) {
      user = await Ngo.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    req.user = user
    req.user.role = decoded.role || 'user';
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};
