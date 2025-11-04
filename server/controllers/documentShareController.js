import Document from "../models/Document.js";
import User from "../models/User.js";

export const shareDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    // Validate input
    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    // ✅ Validate role
    const validRoles = ["viewer", "editor"];
    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Must be 'viewer' or 'editor'." });
    }

    // Fetch the document
    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // Only owner can share
    if (doc.owner.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Only the owner can share this document" });
    }

    // Find the user to share with
    const userToShare = await User.findOne({ email });
    if (!userToShare)
      return res.status(404).json({ message: "User not found" });

    // Check if user already has permission
    const existing = doc.permissions.find(
      (p) => p.user.toString() === userToShare._id.toString()
    );

    if (existing) {
      existing.role = role; // Update existing role
    } else {
      doc.permissions.push({ user: userToShare._id, role });
    }

    await doc.save();

    res.json({ message: "Document shared successfully" });
  } catch (err) {
    console.error("❌ Error in shareDocument:", err);
    next(err);
  }
};

// Revoke access
export const revokeAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (doc.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Only owner can revoke" });
    }

    doc.permissions = doc.permissions.filter(
      (p) => p.user.toString() !== userId
    );
    await doc.save();
    res.json({ message: "Access revoked" });
  } catch (err) {
    next(err);
  }
};

// Get shared users of a document
export const listSharedUsers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id).populate(
      "permissions.user",
      "name email role"
    );
    if (!doc) return res.status(404).json({ message: "Document not found" });

    res.json({ sharedWith: doc.permissions });
  } catch (err) {
    next(err);
  }
};
