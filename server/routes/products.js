const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const Product  = require('../models/Product');
const { protect } = require('../middleware/auth');
const { createStorage, deleteFromCloudinary } = require('../config/cloudinary');

// ── Cloudinary storage for product images ─────────────────────────────────
const upload = multer({
  storage: createStorage('tws/products', {
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per image
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

// ── GET /api/products ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      search, category, condition, college,
      status = 'Available', sort = 'newest',
      page = 1, limit = 24,
    } = req.query;

    const q = {};
    if (status)                      q.status   = status;
    if (category && category !== 'All') q.category = category;
    if (condition)                   q.condition = condition;
    if (college)                     q.college   = college;
    if (search)                      q.$text     = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let sortObj = { createdAt: -1 };
    if (sort === 'price_low')  sortObj = { sellingPrice: 1 };
    if (sort === 'price_high') sortObj = { sellingPrice: -1 };
    if (sort === 'popular')    sortObj = { views: -1 };

    const [products, total] = await Promise.all([
      Product.find(q)
        .populate('seller', 'name email college department')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(q),
    ]);

    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/products/:id ─────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('seller', 'name email college department passoutYear');

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/products  (create listing with up to 4 images) ─────────────
router.post('/', protect, upload.array('images', 4), async (req, res) => {
  try {
    const { title, description, category, condition, originalPrice, sellingPrice, tags } = req.body;

    if (!title || !description || !category || !condition || !originalPrice || !sellingPrice) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Cloudinary gives us secure_url and public_id on each uploaded file
    const images = (req.files || []).map(f => ({
      url:      f.path,        // secure Cloudinary URL
      publicId: f.filename,    // Cloudinary public_id (for deletion later)
    }));

    const product = await Product.create({
      title,
      description,
      category,
      condition,
      originalPrice: parseFloat(originalPrice),
      sellingPrice:  parseFloat(sellingPrice),
      images,
      seller:  req.user._id,
      college: req.user.college,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });

    await product.populate('seller', 'name email college');
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/products/:id  (update listing) ────────────────────────────
router.patch('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const isOwner = product.seller.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const allowed = ['title', 'description', 'sellingPrice', 'status', 'condition'];
    allowed.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
    await product.save();
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/products/:id  (remove listing + Cloudinary images) ────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const isOwner = product.seller.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete images from Cloudinary
    const deletes = (product.images || [])
      .filter(img => img.publicId)
      .map(img => deleteFromCloudinary(img.publicId));
    await Promise.allSettled(deletes);

    await product.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/products/:id/wishlist  (toggle wishlist) ────────────────────
router.post('/:id/wishlist', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const uid = req.user._id.toString();
    const idx = product.wishlistedBy.map(w => w.toString()).indexOf(uid);
    if (idx > -1) product.wishlistedBy.splice(idx, 1);
    else          product.wishlistedBy.push(req.user._id);

    await product.save();
    res.json({ wishlisted: idx === -1, count: product.wishlistedBy.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
