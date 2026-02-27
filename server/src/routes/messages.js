const express = require('express');
const User = require('../models/User');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/messages/:username — send anonymous message (public)
router.post('/:username', async (req, res) => {
  try {
    const { content, prompt } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    if (content.length > 500) {
      return res.status(400).json({ error: 'Message must be under 500 characters' });
    }

    const recipient = await User.findOne({
      username: req.params.username.toLowerCase(),
    });

    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    const message = await Message.create({
      recipient: recipient._id,
      content: content.trim(),
      prompt: prompt || '',
    });

    res.status(201).json({ message: 'Sent!' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages/inbox — get inbox (protected)
router.get('/inbox', auth, async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ messages });
  } catch (error) {
    console.error('Inbox error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages/unread-count — unread count (protected)
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.userId,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/messages/:id/read — mark as read (protected)
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/messages/:id/favorite — toggle favorite (protected)
router.patch('/:id/favorite', auth, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      recipient: req.userId,
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.isFavorite = !message.isFavorite;
    await message.save();

    res.json({ message });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/messages/:id — delete message (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      recipient: req.userId,
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
