const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  },
  {
    id: 2,
    username: 'customer',
    email: 'customer@example.com',
    password: bcrypt.hashSync('customer123', 10),
    role: 'customer'
  }
];

let products = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 99.99,
    category: 'Electronics',
    description: 'High-quality wireless headphones with noise cancellation',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500',
    stock: 50
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 199.99,
    category: 'Electronics',
    description: 'Feature-rich smartwatch with health tracking',
    image: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=500',
    stock: 30
  },
  {
    id: 3,
    name: 'Laptop Stand',
    price: 49.99,
    category: 'Accessories',
    description: 'Ergonomic laptop stand for better posture',
    image: 'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=500',
    stock: 25
  },
  {
    id: 4,
    name: 'Bluetooth Speaker',
    price: 79.99,
    category: 'Electronics',
    description: 'Portable Bluetooth speaker with excellent sound quality',
    image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=500',
    stock: 40
  }
];

let carts = {};
let orders = [];
let nextUserId = 3;
let nextProductId = 5;
let nextOrderId = 1;


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};


app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role = 'customer' } = req.body;
    
    
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

  
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: nextUserId++,
      username,
      email,
      password: hashedPassword,
      role
    };
    
    users.push(newUser);
    
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
  
    const user = users.find(u => u.username === username || u.email === username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
  
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/products', (req, res) => {
  const { page = 1, limit = 10, search, category } = req.query;
  let filteredProducts = [...products];
  
  
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    total: filteredProducts.length,
    page: parseInt(page),
    totalPages: Math.ceil(filteredProducts.length / limit)
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

app.post('/api/products', authenticateToken, requireAdmin, (req, res) => {
  const { name, price, category, description, image, stock } = req.body;
  
  const newProduct = {
    id: nextProductId++,
    name,
    price: parseFloat(price),
    category,
    description,
    image,
    stock: parseInt(stock)
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const { name, price, category, description, image, stock } = req.body;
  
  products[productIndex] = {
    ...products[productIndex],
    name,
    price: parseFloat(price),
    category,
    description,
    image,
    stock: parseInt(stock)
  };
  
  res.json(products[productIndex]);
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  products.splice(productIndex, 1);
  res.json({ message: 'Product deleted successfully' });
});

app.get('/api/cart', authenticateToken, (req, res) => {
  const userCart = carts[req.user.userId] || [];
  res.json(userCart);
});

app.post('/api/cart', authenticateToken, (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === parseInt(productId));
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  if (quantity > product.stock) {
    return res.status(400).json({ message: 'Insufficient stock' });
  }
  
  if (!carts[req.user.userId]) {
    carts[req.user.userId] = [];
  }
  
  const existingItem = carts[req.user.userId].find(item => item.productId === parseInt(productId));
  
  if (existingItem) {
    existingItem.quantity += parseInt(quantity);
  } else {
    carts[req.user.userId].push({
      productId: parseInt(productId),
      quantity: parseInt(quantity),
      product
    });
  }
  
  res.json(carts[req.user.userId]);
});

app.put('/api/cart/:productId', authenticateToken, (req, res) => {
  const { quantity } = req.body;
  const productId = parseInt(req.params.productId);
  
  if (!carts[req.user.userId]) {
    return res.status(404).json({ message: 'Cart not found' });
  }
  
  const itemIndex = carts[req.user.userId].findIndex(item => item.productId === productId);
  
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }
  
  if (quantity <= 0) {
    carts[req.user.userId].splice(itemIndex, 1);
  } else {
    carts[req.user.userId][itemIndex].quantity = parseInt(quantity);
  }
  
  res.json(carts[req.user.userId]);
});

app.delete('/api/cart/:productId', authenticateToken, (req, res) => {
  const productId = parseInt(req.params.productId);
  
  if (!carts[req.user.userId]) {
    return res.status(404).json({ message: 'Cart not found' });
  }
  
  carts[req.user.userId] = carts[req.user.userId].filter(item => item.productId !== productId);
  res.json(carts[req.user.userId]);
});


app.post('/api/orders', authenticateToken, (req, res) => {
  const userCart = carts[req.user.userId] || [];
  
  if (userCart.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }
  

  const total = userCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  

  const order = {
    id: nextOrderId++,
    userId: req.user.userId,
    items: userCart.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    })),
    total: total.toFixed(2),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(order);
  
  
  carts[req.user.userId] = [];
  
  
  userCart.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.quantity;
    }
  });
  
  res.status(201).json(order);
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const userOrders = orders.filter(order => order.userId === req.user.userId);
  res.json(userOrders);
});

app.get('/api/orders/all', authenticateToken, requireAdmin, (req, res) => {
  res.json(orders);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});