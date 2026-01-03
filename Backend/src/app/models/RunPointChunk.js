const mongoose = require('mongoose');
const { withBaseSchemaOptions, objectIdRef } = require('./_shared');

const RunPointChunkSchema = new mongoose.Schema(
  {
    runId: objectIdRef('Run'),
    chunkIndex: { type: Number, required: true, min: 0 },

    encodedPolyline: { type: String },
    pointsCount: { type: Number, min: 0 },

    chunkStartAt: { type: Date },
    chunkEndAt: { type: Date },

    minLat: { type: Number },
    maxLat: { type: Number },
    minLng: { type: Number },
    maxLng: { type: Number },

    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  withBaseSchemaOptions({ collection: 'run_point_chunks' })
);

RunPointChunkSchema.index({ runId: 1, chunkIndex: 1 }, { unique: true });
RunPointChunkSchema.index({ runId: 1 });

module.exports = mongoose.model('RunPointChunk', RunPointChunkSchema);
