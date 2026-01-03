const mongoose = require('mongoose');

function withBaseSchemaOptions(options = {}) {
  return {
    timestamps: true,
    minimize: false,
    ...options,
    toJSON: {
      virtuals: true,
      ...options.toJSON,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      ...options.toObject,
    },
  };
}

function objectIdRef(modelName, required = true) {
  const field = { type: mongoose.Schema.Types.ObjectId, ref: modelName };
  return required ? { ...field, required: true } : field;
}

module.exports = {
  withBaseSchemaOptions,
  objectIdRef,
};
