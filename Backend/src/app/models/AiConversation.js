const mongoose = require('mongoose');
const { withBaseSchemaOptions, objectIdRef } = require('./_shared');

const AiConversationSchema = new mongoose.Schema(
  {
    userId: objectIdRef('User'),
    title: { type: String, trim: true },
    startedAt: { type: Date, default: Date.now, index: true },
    lastActivity: { type: Date, default: Date.now, index: true },
    model: { type: String, default: 'gpt-4o-mini' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  withBaseSchemaOptions({ collection: 'ai_conversations' })
);

AiConversationSchema.index({ userId: 1, lastActivity: -1 });

module.exports = mongoose.model('AiConversation', AiConversationSchema);
