const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign({ id: userId, role: 'user' }, secret, { expiresIn: '1hr' });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    user.isActive = true;
    await user.save();
    const token = generateToken(user._id);
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.googleAuthCallback = async(req,res)=>{
  const token = generateToken(req.user._id);
  res.cookie('token',token,{
    maxAge: 60*60*1000
  });

  res.json({
    success: true,
    message: "User logged in through google successfully",
    token: token
  });
}

exports.logout = async(req,res)=>{
  try{
    // User is already fetched in the middleware, use req.user directly
    const user = req.user;
    if(user && user.isActive === true){
      user.isActive = false;
      await user.save();
      res.clearCookie('token');
      return res.json({message: "User logged out successfully"});
    }
    return res.json({message: "User already logged out"});
  }catch(err){
    console.error('Logout error:', err);
    res.status(500).json({message: "Server error"});
  }
}
