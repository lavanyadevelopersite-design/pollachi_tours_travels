const { Op } = require('sequelize');
const { Role, Permission, RolePermission } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { buildSearchWhere } = require('../utils/helpers');

const list = async (query = {}) => {
  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
  const where = { ...buildSearchWhere(query.search, ['name', 'code'], Op) };
  if (query.is_active !== undefined && query.is_active !== '') {
    where.is_active = query.is_active === 'true' || query.is_active === true;
  }

  const { rows, count } = await Role.findAndCountAll({
    where,
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
    limit,
    offset,
    order: [[sortBy, sortOrder]],
    distinct: true,
  });

  return { data: rows, pagination: buildPaginationMeta(count, page, limit) };
};

const getById = async (id) => {
  const role = await Role.findByPk(id, {
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
  });
  if (!role) throw new AppError('Role not found', 404);
  return role;
};

const create = async (payload, actorId = null) => {
  const { permission_ids: permissionIds = [], ...roleData } = payload;
  const role = await Role.create({ ...roleData, created_by: actorId, updated_by: actorId });

  if (permissionIds.length) {
    await RolePermission.bulkCreate(
      permissionIds.map((permission_id) => ({ role_id: role.id, permission_id }))
    );
  }
  return getById(role.id);
};

const update = async (id, payload, actorId = null) => {
  const role = await getById(id);
  const { permission_ids: permissionIds, ...roleData } = payload;
  await role.update({ ...roleData, updated_by: actorId });

  if (Array.isArray(permissionIds)) {
    await RolePermission.destroy({ where: { role_id: id } });
    if (permissionIds.length) {
      await RolePermission.bulkCreate(
        permissionIds.map((permission_id) => ({ role_id: id, permission_id }))
      );
    }
  }
  return getById(id);
};

const remove = async (id) => {
  const role = await getById(id);
  if (role.code === 'super_admin') {
    throw new AppError('Cannot delete Super Admin role', 400);
  }
  await RolePermission.destroy({ where: { role_id: id } });
  await role.destroy();
  return true;
};

const listPermissions = async (query = {}) => {
  const where = {};
  if (query.module) where.module = query.module;
  return Permission.findAll({ where, order: [['module', 'ASC'], ['action', 'ASC']] });
};

module.exports = { list, getById, create, update, remove, listPermissions };
