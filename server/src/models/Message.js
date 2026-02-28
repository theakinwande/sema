const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    prompt: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient inbox queries
messageSchema.index({ recipient: 1, createdAt: -1 });

// TTL index to automatically delete expired messages
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Message', messageSchema);
