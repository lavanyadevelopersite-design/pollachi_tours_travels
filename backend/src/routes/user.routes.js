const express = require('express');
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { createUserSchema, updateUserSchema } = require('../validators/user.validator');

const router = express.Router();

const coerceUserMultipartBody = (req, res, next) => {
  if (req.body.is_active !== undefined) {
    req.body.is_active =
      req.body.is_active === true || req.body.is_active === 'true' || req.body.is_active === '1';
  }
  if (req.body.has_work_experience !== undefined) {
    req.body.has_work_experience =
      req.body.has_work_experience === true ||
      req.body.has_work_experience === 'true' ||
      req.body.has_work_experience === '1';
  }
  [
    'role_id',
    'branch_id',
    'department_id',
    'designation_id',
    'phone',
    'gender',
    'blood_group',
    'aadhar',
    'permanent_address',
    'previous_company_name',
    'previous_company_designation',
    'previous_company_duration',
    'work_experience_years',
  ].forEach((field) => {
    if (req.body[field] === '') req.body[field] = null;
  });
  next();
};

const userUpload = upload.single('avatar');
const createMiddleware = [userUpload, coerceUserMultipartBody, validate(createUserSchema)];
const updateMiddleware = [userUpload, coerceUserMultipartBody, validate(updateUserSchema)];

router.get('/', authorize('users.view'), userController.list);
router.get('/:id', authorize('users.view'), userController.getById);
router.post('/', authorize('users.create'), ...createMiddleware, userController.create);
router.put('/:id', authorize('users.edit'), ...updateMiddleware, userController.update);
router.delete('/:id', authorize('users.delete'), userController.remove);

module.exports = router;
