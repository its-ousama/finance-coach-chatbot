const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// register new user
const register = async (req, res) => {
  try {
    const { email, password, name, salary } = req.body;

    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    
    const user = await User.create({
      email,
      password,
      name,
      salary: salary || 0
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get user profile
const getProfile = async (req, res) => {
  res.json(req.user);
};

//update user salary
const updateSalary = async (req, res) => {
  try {
    const { salary } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { salary: parseFloat(salary) },
      { new: true }
    ).select('-password');
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      salary: user.salary,
      message: 'Salary updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, getProfile, updateSalary };