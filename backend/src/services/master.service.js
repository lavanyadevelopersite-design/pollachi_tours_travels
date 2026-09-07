const { Op } = require('sequelize');
const {
  Branch,
  Destination,
  Package,
  Hotel,
  Vehicle,
  Supplier,
  LeadStatus,
  LeadSourceType,
  Agent,
  Corporate,
  PackageTerms,
  InclusionExclusion,
  Currency,
  Country,
  State,
  City,
  PaymentMode,
  Tax,
  SeasonPricing,
  ExpensesType,
  Department,
  Designation,
  Driver,
  DriverProof,
  Guide,
  User,
  Setting,
} = require('../models');
const createCrudService = require('./crud.factory');
const AppError = require('../utils/AppError');
const { deleteFile } = require('./file.service');

const branchService = createCrudService(Branch, {
  searchFields: ['name', 'code', 'city', 'email'],
  codeField: 'code',
  codePrefix: 'BR',
});

const destinationService = createCrudService(Destination, {
  searchFields: ['name', 'code', 'city', 'country'],
  codeField: 'code',
  codePrefix: 'DST',
});

const packageService = createCrudService(Package, {
  searchFields: ['name', 'code'],
  defaultIncludes: [{ model: Destination, as: 'destination' }],
  codeField: 'code',
  codePrefix: 'PKG',
});

const hotelService = createCrudService(Hotel, {
  searchFields: ['name', 'code', 'address'],
  defaultIncludes: [{ model: Destination, as: 'destination' }],
  codeField: 'code',
  codePrefix: 'HTL',
});

const vehicleService = createCrudService(Vehicle, {
  searchFields: ['name', 'code', 'registration_number'],
  defaultIncludes: [{ model: Supplier, as: 'supplier' }],
  codeField: 'code',
  codePrefix: 'VEH',
});

const supplierService = createCrudService(Supplier, {
  searchFields: ['name', 'code', 'email', 'address', 'phone'],
  codeField: 'code',
  codePrefix: 'SUP',
});

const leadStatusService = createCrudService(LeadStatus, {
  searchFields: ['lead_status'],
  defaultIncludes: [
    {
      model: User,
      as: 'creator',
      attributes: ['id', 'first_name', 'last_name', 'email'],
    },
  ],
});

const leadSourceTypeService = createCrudService(LeadSourceType, {
  searchFields: ['lead_source_type', 'description'],
  defaultIncludes: [
    {
      model: User,
      as: 'creator',
      attributes: ['id', 'first_name', 'last_name', 'email'],
    },
  ],
});

const agentService = createCrudService(Agent, {
  searchFields: ['agent_name'],
  defaultIncludes: [
    {
      model: User,
      as: 'creator',
      attributes: ['id', 'first_name', 'last_name', 'email'],
    },
  ],
});

const corporateService = createCrudService(Corporate, {
  searchFields: ['corporate_name'],
  defaultIncludes: [
    {
      model: User,
      as: 'creator',
      attributes: ['id', 'first_name', 'last_name', 'email'],
    },
  ],
});

const packageTermsService = createCrudService(PackageTerms, {
  searchFields: ['heading', 'description'],
  defaultIncludes: [
    {
      model: User,
      as: 'creator',
      attributes: ['id', 'first_name', 'last_name', 'email'],
    },
  ],
});

const inclusionExclusionService = createCrudService(InclusionExclusion, {
  searchFields: ['heading', 'description'],
  defaultIncludes: [
    {
      model: User,
      as: 'creator',
      attributes: ['id', 'first_name', 'last_name', 'email'],
    },
  ],
});

const emptyToNull = (value) => (value === '' || value === undefined ? null : value);

const normalizeOptionalFields = (payload, fields = []) => {
  const data = { ...payload };
  fields.forEach((field) => {
    if (field in data) data[field] = emptyToNull(data[field]);
  });
  return data;
};

const ensureDefaultCurrency = async (recordId) => {
  await Currency.update(
    { is_default: false },
    {
      where: {
        id: { [Op.ne]: recordId },
        is_default: true,
      },
    }
  );
};

const currencyBase = createCrudService(Currency, {
  searchFields: ['name', 'code', 'symbol'],
  codeField: 'code',
  codePrefix: 'CUR',
});

const currencyService = {
  ...currencyBase,
  create: async (payload, userId = null) => {
    const data = normalizeOptionalFields(payload, ['description', 'code', 'symbol']);
    if (data.code) data.code = String(data.code).toUpperCase();
    if (!data.symbol) {
      data.symbol = String(data.name || 'C').trim().charAt(0).toUpperCase() || 'C';
    }
    const record = await currencyBase.create(data, userId);
    if (record.is_default) await ensureDefaultCurrency(record.id);
    return record;
  },
  update: async (id, payload, userId = null) => {
    const data = normalizeOptionalFields(payload, ['description', 'code', 'symbol']);
    if (data.code) data.code = String(data.code).toUpperCase();
    const record = await currencyBase.update(id, data, userId);
    if (record.is_default) await ensureDefaultCurrency(record.id);
    return record;
  },
};

const countryBase = createCrudService(Country, {
  searchFields: ['name', 'code', 'nationality', 'phone_code'],
  defaultIncludes: [{ model: Currency, as: 'currency', attributes: ['id', 'name', 'code', 'symbol'] }],
  codeField: 'code',
  codePrefix: 'CTY',
});

const resolveCountryCurrency = async (data) => {
  if (!data.currency_code) return data;
  const code = String(data.currency_code).trim().toUpperCase();
  const currency = await Currency.findOne({ where: { code } });
  if (!currency) throw new AppError('Currency code does not exist', 400);
  data.currency_id = currency.id;
  delete data.currency_code;
  return data;
};

const countryService = {
  ...countryBase,
  create: async (payload, userId = null) => {
    const data = normalizeOptionalFields(payload, [
      'iso_numeric_code',
      'nationality',
      'phone_code',
      'description',
    ]);
    if (data.code) data.code = String(data.code).toUpperCase();
    await resolveCountryCurrency(data);
    return countryBase.create(data, userId);
  },
  update: async (id, payload, userId = null) => {
    const data = normalizeOptionalFields(payload, [
      'iso_numeric_code',
      'nationality',
      'phone_code',
      'description',
    ]);
    if (data.code) data.code = String(data.code).toUpperCase();
    await resolveCountryCurrency(data);
    return countryBase.update(id, data, userId);
  },
};

const assertUniqueState = async ({ country_id, name }, excludeId = null) => {
  const where = { country_id, name };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  const existing = await State.findOne({ where });
  if (existing) throw new AppError('State already exists for the selected country', 409);
};

const removeSoftDeletedStateConflict = async ({ country_id, name }, excludeId = null) => {
  const where = { country_id, name };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  const deleted = await State.findOne({ where, paranoid: false });
  if (deleted?.deleted_at) {
    await deleted.destroy({ force: true });
  }
};

const stateBase = createCrudService(State, {
  searchFields: ['name', 'code', 'description'],
  defaultIncludes: [{ model: Country, as: 'country', attributes: ['id', 'name', 'code'] }],
  codeField: 'code',
  codePrefix: 'ST',
});

const stateService = {
  ...stateBase,
  create: async (payload, userId = null) => {
    const data = normalizeOptionalFields(payload, ['code', 'description']);
    const country = await Country.findByPk(data.country_id);
    if (!country) throw new AppError('Selected country does not exist', 400);

    const existing = await State.findOne({
      where: { country_id: data.country_id, name: data.name },
      paranoid: false,
    });

    if (existing) {
      if (!existing.deleted_at) {
        throw new AppError('State already exists for the selected country', 409);
      }
      await existing.restore();
      await existing.update({ ...data, updated_by: userId });
      return stateBase.getById(existing.id);
    }

    return stateBase.create(data, userId);
  },
  update: async (id, payload, userId = null) => {
    const data = normalizeOptionalFields(payload, ['code', 'description']);
    const existing = await stateBase.getById(id);
    const countryId = data.country_id || existing.country_id;
    const name = data.name || existing.name;
    if (data.country_id) {
      const country = await Country.findByPk(data.country_id);
      if (!country) throw new AppError('Selected country does not exist', 400);
    }
    await removeSoftDeletedStateConflict({ country_id: countryId, name }, id);
    await assertUniqueState({ country_id: countryId, name }, id);
    return stateBase.update(id, data, userId);
  },
};

const assertUniqueCity = async ({ state_id, name }, excludeId = null) => {
  const where = { state_id, name };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  const existing = await City.findOne({ where });
  if (existing) throw new AppError('City already exists for the selected state', 409);
};

const cityBase = createCrudService(City, {
  searchFields: ['name', 'code', 'airport_code', 'description'],
  defaultIncludes: [
    { model: Country, as: 'country', attributes: ['id', 'name', 'code'] },
    { model: State, as: 'state', attributes: ['id', 'name', 'code', 'country_id'] },
  ],
  codeField: 'code',
  codePrefix: 'CIT',
});

const cityService = {
  ...cityBase,
  create: async (payload, userId = null) => {
    const data = normalizeOptionalFields(payload, ['code', 'airport_code', 'description']);
    if (data.airport_code) data.airport_code = String(data.airport_code).toUpperCase();
    const country = await Country.findByPk(data.country_id);
    if (!country) throw new AppError('Selected country does not exist', 400);
    const state = await State.findByPk(data.state_id);
    if (!state) throw new AppError('Selected state does not exist', 400);
    if (state.country_id !== data.country_id) {
      throw new AppError('Selected state does not belong to the selected country', 400);
    }
    await assertUniqueCity(data);
    return cityBase.create(data, userId);
  },
  update: async (id, payload, userId = null) => {
    const data = normalizeOptionalFields(payload, ['code', 'airport_code', 'description']);
    if (data.airport_code) data.airport_code = String(data.airport_code).toUpperCase();
    const existing = await cityBase.getById(id);
    const countryId = data.country_id || existing.country_id;
    const stateId = data.state_id || existing.state_id;
    const name = data.name || existing.name;
    if (data.country_id) {
      const country = await Country.findByPk(data.country_id);
      if (!country) throw new AppError('Selected country does not exist', 400);
    }
    if (data.state_id || data.country_id) {
      const state = await State.findByPk(stateId);
      if (!state) throw new AppError('Selected state does not exist', 400);
      if (state.country_id !== countryId) {
        throw new AppError('Selected state does not belong to the selected country', 400);
      }
    }
    await assertUniqueCity({ state_id: stateId, name }, id);
    return cityBase.update(id, data, userId);
  },
};

const paymentModeService = createCrudService(PaymentMode, {
  searchFields: ['name', 'code', 'description'],
  codeField: 'code',
  codePrefix: 'PM',
});

const taxService = createCrudService(Tax, {
  searchFields: ['name', 'code', 'tax_type', 'applicable_on', 'description'],
  codeField: 'code',
  codePrefix: 'TAX',
});

const seasonPricingService = createCrudService(SeasonPricing, {
  searchFields: ['name', 'code'],
  codeField: 'code',
  codePrefix: 'SEA',
});

const expensesTypeService = createCrudService(ExpensesType, {
  searchFields: ['name', 'code', 'description'],
  codeField: 'code',
  codePrefix: 'EXP',
});

const assertUniqueDepartment = async ({ department_name, department_code }, excludeId = null) => {
  const nameWhere = { department_name };
  if (excludeId) nameWhere.id = { [Op.ne]: excludeId };
  const existingName = await Department.findOne({ where: nameWhere });
  if (existingName) throw new AppError('Department name already exists', 409);

  const code = department_code == null ? '' : String(department_code).trim();
  if (!code) return;
  const codeWhere = { department_code: code };
  if (excludeId) codeWhere.id = { [Op.ne]: excludeId };
  const existingCode = await Department.findOne({ where: codeWhere });
  if (existingCode) throw new AppError('Department code already exists', 409);
};

const departmentBase = createCrudService(Department, {
  searchFields: ['department_name', 'department_code', 'description'],
});

const departmentService = {
  ...departmentBase,
  create: async (payload, userId = null) => {
    const data = normalizeOptionalFields(payload, [
      'department_head',
      'description',
      'display_order',
      'department_code',
    ]);
    if (data.department_code) data.department_code = String(data.department_code).toUpperCase();
    await assertUniqueDepartment(data);
    return departmentBase.create(data, userId);
  },
  update: async (id, payload, userId = null) => {
    const data = normalizeOptionalFields(payload, [
      'department_head',
      'description',
      'display_order',
      'department_code',
    ]);
    if (data.department_code) data.department_code = String(data.department_code).toUpperCase();
    const existing = await departmentBase.getById(id);
    await assertUniqueDepartment(
      {
        department_name: data.department_name || existing.department_name,
        department_code:
          data.department_code !== undefined ? data.department_code : existing.department_code,
      },
      id
    );
    return departmentBase.update(id, data, userId);
  },
};

const assertUniqueDesignation = async (
  { department_id, designation_name, designation_code },
  excludeId = null
) => {
  const nameWhere = { department_id, designation_name };
  const codeWhere = { designation_code };
  if (excludeId) {
    nameWhere.id = { [Op.ne]: excludeId };
    codeWhere.id = { [Op.ne]: excludeId };
  }
  const existingName = await Designation.findOne({ where: nameWhere });
  if (existingName) {
    throw new AppError('Designation name already exists for the selected department', 409);
  }
  const existingCode = await Designation.findOne({ where: codeWhere });
  if (existingCode) throw new AppError('Designation code already exists', 409);
};

const designationBase = createCrudService(Designation, {
  searchFields: ['designation_name', 'designation_code', 'description'],
  defaultIncludes: [
    { model: Department, as: 'department', attributes: ['id', 'department_name', 'department_code'] },
  ],
  codeField: 'designation_code',
  codePrefix: 'DES',
});

const designationService = {
  ...designationBase,
  create: async (payload, userId = null) => {
    const data = normalizeOptionalFields(payload, ['hierarchy_level', 'description']);
    if (data.designation_code) data.designation_code = String(data.designation_code).toUpperCase();
    const department = await Department.findByPk(data.department_id);
    if (!department) throw new AppError('Selected department does not exist', 400);
    await assertUniqueDesignation(data);
    return designationBase.create(data, userId);
  },
  update: async (id, payload, userId = null) => {
    const data = normalizeOptionalFields(payload, ['hierarchy_level', 'description']);
    if (data.designation_code) data.designation_code = String(data.designation_code).toUpperCase();
    const existing = await designationBase.getById(id);
    const departmentId = data.department_id || existing.department_id;
    const designationName = data.designation_name || existing.designation_name;
    const designationCode = data.designation_code || existing.designation_code;
    if (data.department_id) {
      const department = await Department.findByPk(data.department_id);
      if (!department) throw new AppError('Selected department does not exist', 400);
    }
    await assertUniqueDesignation(
      {
        department_id: departmentId,
        designation_name: designationName,
        designation_code: designationCode,
      },
      id
    );
    return designationBase.update(id, data, userId);
  },
};

const assertUniqueDriverLicense = async (license_number, excludeId = null) => {
  if (!license_number) return;
  const where = { license_number };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  const existing = await Driver.findOne({ where });
  if (existing) throw new AppError('License number already exists', 409);
};

const driverOptionalFields = [
  'code',
  'photo',
  'license_type',
  'license_expiry',
  'id_proof_type',
  'id_proof_number',
  'proof_document',
  'alternate_phone',
  'email',
  'address',
  'city',
  'emergency_contact_name',
  'emergency_contact_phone',
  'emergency_contact_relation',
  'employment_type',
  'experience_years',
  'joining_date',
  'blood_group',
  'vehicle_id',
  'driver_type',
  'supplier_id',
  'availability_status',
  'notes',
];

const parseProofImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images.filter(Boolean);
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : images ? [images] : [];
    } catch {
      return images ? [images] : [];
    }
  }
  return [];
};

const normalizeProofsPayload = (proofs = []) => {
  if (!Array.isArray(proofs)) return [];
  return proofs
    .map((proof, index) => {
      const proofType = String(proof.proof_type || proof.proofType || '').trim();
      if (!proofType) return null;
      return {
        id: proof.id || null,
        proof_type: proofType,
        proof_number: emptyToNull(proof.proof_number ?? proof.proofNumber),
        license_type: emptyToNull(proof.license_type ?? proof.licenseType),
        expiry_date: emptyToNull(proof.expiry_date ?? proof.expiryDate),
        notes: emptyToNull(proof.notes),
        display_order:
          proof.display_order != null && proof.display_order !== ''
            ? Number(proof.display_order)
            : index,
        images: parseProofImages(proof.images ?? proof.existing_images ?? proof.existingImages),
      };
    })
    .filter(Boolean);
};

const syncDriverProofs = async (driverId, proofsPayload = [], userId = null) => {
  const incoming = normalizeProofsPayload(proofsPayload);
  const existingRows = await DriverProof.findAll({ where: { driver_id: driverId } });
  const existingById = new Map(existingRows.map((row) => [row.id, row]));
  const keepIds = new Set(incoming.filter((p) => p.id).map((p) => p.id));

  for (const row of existingRows) {
    if (!keepIds.has(row.id)) {
      const images = parseProofImages(row.images);
      for (const url of images) await deleteFile(url);
      await row.destroy();
    }
  }

  for (const proof of incoming) {
    const previous = proof.id ? existingById.get(proof.id) : null;
    const previousImages = previous ? parseProofImages(previous.images) : [];
    const nextImages = parseProofImages(proof.images);

    for (const url of previousImages) {
      if (!nextImages.includes(url)) await deleteFile(url);
    }

    const data = {
      driver_id: driverId,
      proof_type: proof.proof_type,
      proof_number: proof.proof_number,
      license_type: proof.license_type,
      expiry_date: proof.expiry_date,
      notes: proof.notes,
      display_order: proof.display_order,
      images: nextImages,
      updated_by: userId,
    };

    if (previous) {
      await previous.update(data);
    } else {
      await DriverProof.create({ ...data, created_by: userId });
    }
  }
};

const driverBase = createCrudService(Driver, {
  searchFields: [
    'full_name',
    'code',
    'phone',
    'license_number',
    'email',
    'city',
    'emergency_contact_name',
  ],
  defaultIncludes: [
    { model: Vehicle, as: 'vehicle', attributes: ['id', 'name', 'code', 'registration_number', 'ownership'] },
    { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'code'] },
    {
      model: DriverProof,
      as: 'proofs',
      separate: true,
      order: [
        ['display_order', 'ASC'],
        ['created_at', 'ASC'],
      ],
    },
  ],
  codeField: 'code',
  codePrefix: 'DRV',
});

const decorateDriverPortalMeta = async (record) => {
  if (!record) return record;
  const data = record.toJSON ? record.toJSON() : { ...record };
  const portalUser = await User.findOne({
    where: { driver_id: data.id },
    attributes: ['id', 'email', 'phone', 'is_active', 'last_login_at'],
  });
  data.has_portal_access = Boolean(portalUser);
  data.portal_login = portalUser
    ? portalUser.phone || portalUser.email || data.phone
    : data.phone || data.email || null;
  return data;
};

const driverService = {
  ...driverBase,
  getById: async (id) => decorateDriverPortalMeta(await driverBase.getById(id)),
  create: async (payload, userId = null) => {
    const { proofs, portal_password, ...rest } = payload;
    const data = normalizeOptionalFields(rest, driverOptionalFields);
    if (data.code) data.code = String(data.code).toUpperCase();
    if (data.license_number) data.license_number = String(data.license_number).trim().toUpperCase();
    await assertUniqueDriverLicense(data.license_number);
    if (data.vehicle_id) {
      const vehicle = await Vehicle.findByPk(data.vehicle_id);
      if (!vehicle) throw new AppError('Selected vehicle does not exist', 400);
    }
    data.driver_type = String(data.driver_type || 'own').toLowerCase() === 'vendor' ? 'vendor' : 'own';
    if (data.driver_type !== 'vendor') data.supplier_id = null;
    if (data.driver_type === 'vendor' && !data.supplier_id) {
      throw new AppError('Vendor name is required', 400);
    }
    const record = await driverBase.create(data, userId);
    if (Array.isArray(proofs)) {
      await syncDriverProofs(record.id, proofs, userId);
    }
    if (portal_password) {
      const driverPortalService = require('./driverPortal.service');
      await driverPortalService.syncDriverPortalUser(record, String(portal_password));
    }
    return driverService.getById(record.id);
  },
  update: async (id, payload, userId = null) => {
    const existing = await driverBase.getById(id);
    const { proofs, portal_password, ...rest } = payload;
    const data = normalizeOptionalFields(rest, driverOptionalFields);
    if (data.code) data.code = String(data.code).toUpperCase();
    if (data.license_number) data.license_number = String(data.license_number).trim().toUpperCase();
    await assertUniqueDriverLicense(data.license_number || existing.license_number, id);
    if (data.vehicle_id) {
      const vehicle = await Vehicle.findByPk(data.vehicle_id);
      if (!vehicle) throw new AppError('Selected vehicle does not exist', 400);
    }
    data.driver_type =
      String(data.driver_type || existing.driver_type || 'own').toLowerCase() === 'vendor'
        ? 'vendor'
        : 'own';
    if (data.driver_type !== 'vendor') {
      data.supplier_id = null;
    } else {
      const vendorId = data.supplier_id !== undefined ? data.supplier_id : existing.supplier_id;
      if (!vendorId) throw new AppError('Vendor name is required', 400);
      data.supplier_id = vendorId;
    }
    if (data.photo && existing.photo && data.photo !== existing.photo) {
      await deleteFile(existing.photo);
    }
    if (data.proof_document && existing.proof_document && data.proof_document !== existing.proof_document) {
      await deleteFile(existing.proof_document);
    }
    await driverBase.update(id, data, userId);
    if (Array.isArray(proofs)) {
      await syncDriverProofs(id, proofs, userId);
    }
    const updated = await driverBase.getById(id);
    if (portal_password || (await User.findOne({ where: { driver_id: id } }))) {
      const driverPortalService = require('./driverPortal.service');
      await driverPortalService.syncDriverPortalUser(
        updated,
        portal_password ? String(portal_password) : null
      );
    }
    return driverService.getById(id);
  },
  remove: async (id) => {
    const existing = await driverBase.getById(id);
    const proofRows = existing.proofs || [];
    for (const proof of proofRows) {
      for (const url of parseProofImages(proof.images)) await deleteFile(url);
    }
    await DriverProof.destroy({ where: { driver_id: id } });
    await User.update({ driver_id: null, is_active: false }, { where: { driver_id: id } });
    await driverBase.remove(id);
    if (existing.photo) await deleteFile(existing.photo);
    if (existing.proof_document) await deleteFile(existing.proof_document);
    return true;
  },
};

const guideOptionalFields = [
  'code',
  'photo',
  'alternate_phone',
  'whatsapp',
  'email',
  'address',
  'city',
  'emergency_phone',
  'languages',
  'specialization',
  'license_number',
  'license_expiry',
  'id_proof_type',
  'id_proof_number',
  'proof_document',
  'experience_years',
  'daily_rate',
  'joining_date',
  'destination_ids',
  'coverage_areas',
  'availability_status',
  'bio',
  'notes',
];

const guideBase = createCrudService(Guide, {
  searchFields: [
    'full_name',
    'code',
    'phone',
    'whatsapp',
    'email',
    'city',
    'languages',
    'specialization',
    'coverage_areas',
  ],
  codeField: 'code',
  codePrefix: 'GUD',
});

const guideService = {
  ...guideBase,
  create: async (payload, userId = null) => {
    const data = normalizeOptionalFields(payload, guideOptionalFields);
    if (data.code) data.code = String(data.code).toUpperCase();
    if (data.license_number) data.license_number = String(data.license_number).trim().toUpperCase();
    return guideBase.create(data, userId);
  },
  update: async (id, payload, userId = null) => {
    const existing = await guideBase.getById(id);
    const data = normalizeOptionalFields(payload, guideOptionalFields);
    if (data.code) data.code = String(data.code).toUpperCase();
    if (data.license_number) data.license_number = String(data.license_number).trim().toUpperCase();
    if (data.photo && existing.photo && data.photo !== existing.photo) {
      await deleteFile(existing.photo);
    }
    if (data.proof_document && existing.proof_document && data.proof_document !== existing.proof_document) {
      await deleteFile(existing.proof_document);
    }
    return guideBase.update(id, data, userId);
  },
  remove: async (id) => {
    const existing = await guideBase.getById(id);
    await guideBase.remove(id);
    if (existing.photo) await deleteFile(existing.photo);
    if (existing.proof_document) await deleteFile(existing.proof_document);
    return true;
  },
};

const listSettings = async (query = {}) => {
  const where = {};
  if (query.group) where.group = query.group;
  return Setting.findAll({ where, order: [['group', 'ASC'], ['key', 'ASC']] });
};

const getSetting = async (key) => {
  const setting = await Setting.findOne({ where: { key } });
  if (!setting) throw new AppError('Setting not found', 404);
  return setting;
};

const upsertSetting = async (key, value, meta = {}, actorId = null) => {
  const [setting] = await Setting.findOrCreate({
    where: { key },
    defaults: {
      value: String(value),
      type: meta.type || 'string',
      group: meta.group || 'general',
      description: meta.description || null,
      updated_by: actorId,
    },
  });
  if (!setting.isNewRecord) {
    await setting.update({
      value: String(value),
      ...(meta.type && { type: meta.type }),
      ...(meta.group && { group: meta.group }),
      ...(meta.description !== undefined && { description: meta.description }),
      updated_by: actorId,
    });
  }
  return setting;
};

const updateSettingsBulk = async (items = [], actorId = null) => {
  const results = [];
  for (const item of items) {
    results.push(await upsertSetting(item.key, item.value, item, actorId));
  }
  return results;
};

const getBranding = async () => {
  const rows = await Setting.findAll({
    where: {
      key: {
        [Op.in]: [
          'company_name',
          'company_logo',
          'company_address',
          'company_email',
          'company_phone',
          'gstin',
          'bank_name',
          'bank_account_name',
          'bank_account_number',
          'bank_ifsc',
          'upi_id',
          'digital_signature',
          'invoice_note',
        ],
      },
    },
  });
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    company_name: map.company_name || 'Pollachi Tours and Travels',
    company_logo: map.company_logo || null,
    company_address: map.company_address || null,
    company_email: String(map.company_email || '').trim() || null,
    company_phone: String(map.company_phone || map.contact_phone || '').trim() || null,
    gstin: map.gstin || null,
    bank_name: map.bank_name || null,
    bank_account_name: map.bank_account_name || null,
    bank_account_number: map.bank_account_number || null,
    bank_ifsc: map.bank_ifsc || null,
    upi_id: map.upi_id || null,
    digital_signature: map.digital_signature || null,
    invoice_note: map.invoice_note || null,
  };
};

module.exports = {
  branchService,
  destinationService,
  packageService,
  hotelService,
  vehicleService,
  supplierService,
  leadStatusService,
  leadSourceTypeService,
  agentService,
  corporateService,
  packageTermsService,
  inclusionExclusionService,
  currencyService,
  countryService,
  stateService,
  cityService,
  paymentModeService,
  taxService,
  seasonPricingService,
  expensesTypeService,
  departmentService,
  designationService,
  driverService,
  guideService,
  listSettings,
  getSetting,
  upsertSetting,
  updateSettingsBulk,
  getBranding,
};
