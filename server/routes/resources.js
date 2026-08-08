const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const Resource = require('../models/Resource');
const User     = require('../models/User');
const { protect }   = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { createStorage, deleteFromCloudinary } = require('../config/cloudinary');

// ── Cloudinary storage for PDF / resource files ───────────────────────────
const upload = multer({
  storage: createStorage('tws/resources', {
    resource_type:   'raw',       // allows PDFs and non-image files
    allowed_formats: ['pdf'],
  }),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ── GET /api/resources ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { cluster, category, search } = req.query;
    const query = { approved: true };
    if (cluster)  query.cluster  = cluster;
    if (category) query.category = category;
    if (search)   query.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const resources = await Resource.find(query)
      .populate('addedBy', 'name college profilePhoto')
      .sort({ createdAt: -1 });

    res.json({ resources });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/resources  (submit with optional PDF) ───────────────────────
router.post('/', protect, upload.single('pdf'), async (req, res) => {
  try {
    const { title, description, link, cluster, category } = req.body;
    const resourceData = { title, description, cluster, category, addedBy: req.user._id };

    if (req.file) {
      // PDF uploaded to Cloudinary
      resourceData.fileType = 'pdf';
      resourceData.fileName = req.file.originalname;
      resourceData.link     = req.file.path;        // secure Cloudinary URL
      resourceData.filePath = req.file.filename;    // Cloudinary public_id
    } else {
      resourceData.fileType = 'link';
      resourceData.link     = link;
    }

    // Admin posts are auto-approved and published immediately
    if (req.user.role === 'admin') {
      resourceData.approved = true;
    }

    const resource = await Resource.create(resourceData);
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.resourcesShared': 1 } });

    const message = req.user.role === 'admin'
      ? 'Resource published successfully ✅'
      : 'Resource submitted for admin approval ✅';

    res.status(201).json({ resource, message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/resources/pending  (Admin) ───────────────────────────────────
router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const resources = await Resource.find({ approved: false })
      .populate('addedBy', 'name email college');
    res.json({ resources });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/resources/:id/approve  (Admin) ───────────────────────────────
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

// ── DELETE /api/resources/:id  (Admin) ────────────────────────────────────
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    // Remove PDF from Cloudinary if it was a file upload
    if (resource && resource.fileType === 'pdf' && resource.filePath) {
      await deleteFromCloudinary(resource.filePath, 'raw');
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
