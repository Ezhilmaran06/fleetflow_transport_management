const express = require('express');
const router = express.Router();
const { getDocuments, uploadDocument, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', checkPermission('documents', 'view'), getDocuments);
router.post('/upload', checkPermission('documents', 'create'), upload.single('documentFile'), uploadDocument);
router.delete('/:id', checkPermission('documents', 'delete'), deleteDocument);

module.exports = router;
