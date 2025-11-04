import Document from '../models/Document.js';

// Verify that the current user can access the document
export const canAccessDocument = (requiredRoles = ['viewer', 'editor', 'owner']) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params; // document ID
      const doc = await Document.findById(id).populate('permissions.user');
      if (!doc) return res.status(404).json({ message: 'Document not found' });

      // owner always has full access
      if (doc.owner.toString() === req.userId) {
        req.document = doc;
        return next();
      }

      // check if user is shared with required role
      const perm = doc.permissions.find((p) => p.user._id.toString() === req.userId);
      if (!perm || !requiredRoles.includes(perm.role)) {
        return res.status(403).json({ message: 'Forbidden: no permission' });
      }

      req.document = doc;
      next();
    } catch (err) {
      next(err);
    }
  };
};
