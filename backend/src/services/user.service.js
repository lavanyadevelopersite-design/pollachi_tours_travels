const { Op } = require('sequelize');
const { User, Role, Branch, Department, Designation } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { buildSearchWhere, sanitizeUser } = require('../utils/helpers');
const { deleteFile } = require('./file.service');

const userIncludes = [
  { model: Role, as: 'role', attributes: ['id', 'name', 'code'] },
  { model: Branch, as: 'branch', attributes: ['id', 'name', 'code'] },
  {
    model: Department,
    as: 'department',
    attributes: ['id', 'department_name', 'department_code'],
  },
  {
    model: Designation,
    as: 'designation',
    attributes: ['id', 'designation_name', 'designation_code', 'department_id'],
  },
];

const emptyToNull = (value) => (value === '' || value === undefined ? null : value);

const profileStringFields = [
  'gender',
  'blood_group',
  'aadhar',
  'permanent_address',
  'previous_company_name',
  'previous_company_designation',
  'previous_company_duration',
];

const normalizeUserPayload = (payload = {}) => {
  const data = { ...payload };
  ['role_id', 'branch_id', 'department_id', 'designation_id', 'phone', ...profileStringFields].forEach(
    (field) => {
      if (field in data) data[field] = emptyToNull(data[field]);
    }
  );
  if ('has_work_experience' in data) {
    if (data.has_work_experience === 'false' || data.has_work_experience === '0') {
      data.has_work_experience = false;
    } else if (data.has_work_experience === 'true' || data.has_work_experience === '1') {
      data.has_work_experience = true;
    }
    if (!data.has_work_experience) {
      data.work_experience_years = null;
      data.previous_company_name = null;
      data.previous_company_designation = null;
      data.previous_company_duration = null;
    } else if (data.work_experience_years === '' || data.work_experience_years == null) {
      data.work_experience_years = null;
    } else {
      data.work_experience_years = Number(data.work_experience_years);
    }
  } else if ('work_experience_years' in data) {
    if (data.work_experience_years === '' || data.work_experience_years == null) {
      data.work_experience_years = null;
    } else {
      data.work_experience_years = Number(data.work_experience_years);
    }
  }
  return data;
};

const assertDepartmentDesignation = async ({ department_id, designation_id }) => {
  if (department_id) {
    const department = await Department.findByPk(department_id);
    if (!department) throw new AppError('Selected department does not exist', 400);
  }
  if (designation_id) {
    const designation = await Designation.findByPk(designation_id);
    if (!designation) throw new AppError('Selected designation does not exist', 400);
    if (department_id && designation.department_id !== department_id) {
      throw new AppError('Selected designation does not belong to the selected department', 400);
    }
  }
};

const list = async (query = {}) => {
  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
  const where = { ...buildSearchWhere(query.search, ['first_name', 'last_name', 'email', 'phone'], Op) };
  if (query.is_active !== undefined) {
    where.is_active = query.is_active === 'true' || query.is_active === true;
  }
  if (query.role_id) where.role_id = query.role_id;
  if (query.branch_id) where.branch_id = query.branch_id;
  if (query.department_id) where.department_id = query.department_id;
  if (query.designation_id) where.designation_id = query.designation_id;

  const { rows, count } = await User.findAndCountAll({
    where,
    include: userIncludes,
    attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] },
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    distinct: true,
  });

  return { data: rows, pagination: buildPaginationMeta(count, page, limit) };
};

const getById = async (id) => {
  const user = await User.findByPk(id, {
    include: userIncludes,
    attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const create = async (payload, actorId = null) => {
  const data = normalizeUserPayload(payload);
  const existing = await User.findOne({ where: { email: data.email } });
  if (existing) throw new AppError('Email already registered', 409);

  await assertDepartmentDesignation(data);

  const user = await User.create({
    ...data,
    created_by: actorId,
    updated_by: actorId,
  });
  return getById(user.id);
};

const removeAvatarIfReplaced = async (existing, nextAvatar) => {
  if (nextAvatar && existing.avatar && nextAvatar !== existing.avatar) {
    await deleteFile(existing.avatar);
  }
};

const update = async (id, payload, actorId = null) => {
  const user = await User.findByPk(id);
  if (!user) throw new AppError('User not found', 404);

  const data = normalizeUserPayload(payload);

  if (data.avatar) {
    await removeAvatarIfReplaced(user, data.avatar);
  }

  if (data.email && data.email !== user.email) {
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) throw new AppError('Email already registered', 409);
  }

  await assertDepartmentDesignation({
    department_id: data.department_id !== undefined ? data.department_id : user.department_id,
    designation_id: data.designation_id !== undefined ? data.designation_id : user.designation_id,
  });

  if (
    !data.password ||
    String(data.password).trim() === '' ||
    data.password === '********' ||
    data.password === '••••••••'
  ) {
    delete data.password;
  }

  await user.update({ ...data, updated_by: actorId });
  return getById(id);
};

const remove = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new AppError('User not found', 404);
  await user.destroy();
  return true;
};

module.exports = { list, getById, create, update, remove, sanitizeUser };
