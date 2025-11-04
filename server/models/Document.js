import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  permissions: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["viewer", "editor"], default: "viewer" },
    },
  ],
  content: { type: Object, default: {} }
}, { timestamps: true });


const Document = mongoose.model('Document', DocumentSchema);
export default Document;
