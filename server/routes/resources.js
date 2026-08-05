const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Uploads dir: /tmp on Vercel (serverless), local for dev
const uploadDir = process.env.NODE_ENV === 'production'
  ? '/tmp'
  : path.join(__dirname, '../uploads/resources');
if (uploadDir !== '/tmp' && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for PDF upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Serve uploaded files
router.use('/files', express.static(uploadDir));

// @route   GET /api/resources
router.get('/', async (req, res) => {
  try {
    const { cluster, category, search } = req.query;
    const query = { approved: true };
    if (cluster) query.cluster = cluster;
    if (category) query.category = category;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    const resources = await Resource.find(query)
      .populate('addedBy', 'name college profilePhoto')
      .sort({ createdAt: -1 });
    res.json({ resources });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/resources (with optional PDF upload)
router.post('/', protect, upload.single('pdf'), async (req, res) => {
  try {
    const { title, description, link, cluster, category } = req.body;
    let resourceData = { title, description, cluster, category, addedBy: req.user._id };

    if (req.file) {
      // PDF uploaded
      resourceData.fileType = 'pdf';
      resourceData.fileName = req.file.originalname;
      resourceData.link = `/api/resources/files/${req.file.filename}`;
      resourceData.filePath = req.file.filename;
    } else {
      resourceData.fileType = 'link';
      resourceData.link = link;
    }

    const resource = await Resource.create(resourceData);
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.resourcesShared': 1 } });
    res.status(201).json({ resource, message: 'Resource submitted for admin approval ✅' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/resources/pending (Admin only)
router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const resources = await Resource.find({ approved: false })
      .populate('addedBy', 'name email college');
    res.json({ resources });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/resources/:id/approve (Admin only)
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id, { approved: true }, { new: true }
    );
    res.json({ resource });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/resources/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (resource && resource.filePath) {
      const fp = path.join(uploadDir, resource.filePath);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
