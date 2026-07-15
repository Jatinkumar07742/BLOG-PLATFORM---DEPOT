const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  { timestamps: true }
);

// Virtual for a short preview/excerpt of the content
postSchema.virtual('excerpt').get(function () {
  const plainText = this.content.replace(/<[^>]*>/g, '');
  return plainText.length > 200 ? plainText.slice(0, 200) + '...' : plainText;
});

postSchema.set('toObject', { virtuals: true });
postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
