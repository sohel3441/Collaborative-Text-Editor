// import express from 'express';
// import authMiddleware from '../middlewares/authMiddleware.js';
// import { canAccessDocument } from '../middlewares/permissionMiddleware.js';
// import {
//   createDocument,
//   getDocuments,
//   getDocumentById,
//   updateDocument,
//   deleteDocument,
//   getSharedWithMe 
// } from '../controllers/documentController.js';

// const router = express.Router();
// router.use(authMiddleware);

// router.get('/', getDocuments); // list own + shared docs
// router.post('/', createDocument);
// router.get('/:id', canAccessDocument(['viewer', 'editor', 'owner']), getDocumentById);
// router.put('/:id', canAccessDocument(['editor', 'owner']), updateDocument);
// router.delete('/:id', canAccessDocument(['owner']), deleteDocument);

// router.get("/shared-with-me", getSharedWithMe);


// export default router;  



import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { canAccessDocument } from '../middlewares/permissionMiddleware.js';
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getSharedWithMe
} from '../controllers/documentController.js';

const router = express.Router();
router.use(authMiddleware);

// ✅ Always keep this route before `/:id`
router.get("/shared-with-me", getSharedWithMe);

// ✅ Get only owned documents
router.get("/", getDocuments);

// ✅ Create, Update, Delete, etc.
router.post("/", createDocument);
router.get("/:id", canAccessDocument(['viewer', 'editor', 'owner']), getDocumentById);
router.put("/:id", canAccessDocument(['editor', 'owner']), updateDocument);
router.delete("/:id", canAccessDocument(['owner']), deleteDocument);

export default router;


