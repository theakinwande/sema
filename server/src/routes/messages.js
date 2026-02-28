const express = require('express');
const User = require('../models/User');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /messages/{username}:
 *   post:
 *     summary: Send an anonymous message (public)
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         example: johndoe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 500
 *                 example: You're honestly one of the coolest people I know
 *               prompt:
 *                 type: string
 *                 example: send me anonymous messages 👀
 *     responses:
 *       201:
 *         description: Message sent
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
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

    const messageData = {
      recipient: recipient._id,
      content: content.trim(),
      prompt: prompt || '',
    };

    if (recipient.isExpiringMode) {
      messageData.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    await Message.create(messageData);

    res.status(201).json({ message: 'Sent!' });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /messages/inbox:
 *   get:
 *     summary: Get inbox messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       401:
 *         description: Not authenticated
 */
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

/**
 * @swagger
 * /messages/unread-count:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Not authenticated
 */
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

/**
 * @swagger
 * /messages/{id}/read:
 *   patch:
 *     summary: Mark message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message marked as read
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Message not found
 */
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

/**
 * @swagger
 * /messages/{id}/favorite:
 *   patch:
 *     summary: Toggle message favorite
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite toggled
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Message not found
 */
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

/**
 * @swagger
 * /messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Message not found
 */
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
