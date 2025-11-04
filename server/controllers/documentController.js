import Document from '../models/Document.js';

// ✅ Create a new document
export const createDocument = async (req, res, next) => {
  try {
    const owner = req.userId;
    const { title, content } = req.body;
    const doc = await Document.create({
      title: title || 'Untitled Document',
      content: typeof content === "string" ? content : JSON.stringify(content || {}),
      owner
    });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

// ✅ Return only documents owned by the logged-in user
export const getDocuments = async (req, res, next) => {
  try {
    const docs = await Document.find({ owner: req.userId })
      .populate('owner', 'name email');
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

// ✅ Return a specific document (with access control handled in middleware)
export const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

// ✅ Return only documents shared with the logged-in user
export const getSharedWithMe = async (req, res) => {
  try {
    const docs = await Document.find({
      "permissions.user": req.userId,
    })
      .populate("owner", "email name")
      .select("title updatedAt owner permissions");

    const filtered = docs.map((doc) => {
      const userPerm = doc.permissions.find(
        (p) => p.user.toString() === req.userId
      );
      return {
        _id: doc._id,
        title: doc.title,
        updatedAt: doc.updatedAt,
        ownerEmail: doc.owner?.email || "Unknown",
        role: userPerm?.role || "viewer",
      };
    });

    res.json(filtered);
  } catch (err) {
    console.error("❌ Failed to load shared documents:", err);
    res.status(500).json({ message: "Failed to load shared documents" });
  }
};

// ✅ Update a document
export const updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const doc = await Document.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

// ✅ Delete a document
export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Document.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};


