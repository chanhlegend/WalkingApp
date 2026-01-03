const mongoose = require('mongoose');
const { withBaseSchemaOptions, objectIdRef } = require('./_shared');

const AiMessageSchema = new mongoose.Schema(
  {
    conversationId: objectIdRef('AiConversation'),
    role: { type: String, required: true, enum: ['user', 'assistant', 'system'] },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    tokensIn: { type: Number, default: 0, min: 0 },
    tokensOut: { type: Number, default: 0, min: 0 },
    costVnd: { type: Number, default: 0, min: 0 },
  },
  withBaseSchemaOptions({ collection: 'ai_messages' })
);

AiMessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('AiMessage', AiMessageSchema);
