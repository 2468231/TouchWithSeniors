const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, maxlength: 2000 },
  category: {
    type: String, required: true,
    enum: ['Books', 'Electronics', 'Clothing', 'Stationery', 'Lab Equipment', 'Sports', 'Furniture', 'Hostel Essentials', 'Notes/Study Material', 'Other']
  },
  condition: { type: String, required: true, enum: ['New', 'Like New', 'Good', 'Fair'] },
  originalPrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  college: { type: String, required: true },
  status: { type: String, enum: ['Available', 'Sold'], default: 'Available' },
  wishlistedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ college: 1, status: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
