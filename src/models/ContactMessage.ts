import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactMessage extends Document {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [120, 'Full name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      maxlength: [200, 'Email address cannot exceed 200 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [4000, 'Message cannot exceed 4000 characters'],
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ContactMessageSchema.index({ createdAt: -1 });

const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

export default ContactMessage;

