const masterService = require('../services/master.service');
const { ensureUpload, deleteFile } = require('../services/file.service');
const createCrudController = require('./crud.factory');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const branches = createCrudController(masterService.branchService, 'Branch');
const destinations = createCrudController(masterService.destinationService, 'Destination');
const packages = createCrudController(masterService.packageService, 'Package');
const hotels = createCrudController(masterService.hotelService, 'Hotel');
const vehiclesBase = createCrudController(masterService.vehicleService, 'Vehicle');
const suppliers = createCrudController(masterService.supplierService, 'Supplier');
const leadStatuses = createCrudController(masterService.leadStatusService, 'Lead status');
const leadSourceTypes = createCrudController(
  masterService.leadSourceTypeService,
  'Lead source type'
);
const agents = createCrudController(masterService.agentService, 'Agent');
const corporates = createCrudController(masterService.corporateService, 'Corporate');
const packageTerms = createCrudController(masterService.packageTermsService, 'Package terms');
const inclusionExclusions = createCrudController(
  masterService.inclusionExclusionService,
  'Inclusion / Exclusion'
);
const currencies = createCrudController(masterService.currencyService, 'Currency');
const countries = createCrudController(masterService.countryService, 'Country');
const states = createCrudController(masterService.stateService, 'State');
const cities = createCrudController(masterService.cityService, 'City');
const paymentModes = createCrudController(masterService.paymentModeService, 'Payment mode');
const taxes = createCrudController(masterService.taxService, 'Tax');
const seasonPricing = createCrudController(masterService.seasonPricingService, 'Season pricing');
const expensesTypes = createCrudController(masterService.expensesTypeService, 'Expenses type');
const departments = createCrudController(masterService.departmentService, 'Department');
const designations = createCrudController(masterService.designationService, 'Designation');
const driversBase = createCrudController(masterService.driverService, 'Driver');
const guidesBase = createCrudController(masterService.guideService, 'Guide');

const coerceMultipartFlags = (body = {}) => {
  const data = { ...body };
  if (data.is_active !== undefined) {
    data.is_active = data.is_active === true || data.is_active === 'true' || data.is_active === '1';
  }
  ['experience_years', 'daily_rate'].forEach((field) => {
    if (data[field] === '' || data[field] === undefined) {
      if (data[field] === '') data[field] = null;
    } else if (data[field] != null) {
      data[field] = Number(data[field]);
    }
  });
  ['vehicle_id', 'email', 'code', 'photo', 'proof_document', 'supplier_id'].forEach((field) => {
    if (data[field] === '') data[field] = null;
  });
  return data;
};

const attachMasterUploads = (req) => {
  const data = coerceMultipartFlags(req.body);
  const files = req.files || {};
  const photoFile = Array.isArray(files)
    ? files.find((f) => f.fieldname === 'photo')
    : files.photo?.[0];
  const proofDocFile = Array.isArray(files)
    ? files.find((f) => f.fieldname === 'proof_document')
    : files.proof_document?.[0];
  if (photoFile) data.photo = ensureUpload(photoFile).url;
  if (proofDocFile) data.proof_document = ensureUpload(proofDocFile).url;
  return data;
};

const parseProofsField = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const attachDriverUploads = (req) => {
  const data = attachMasterUploads(req);
  data.driver_type = String(data.driver_type || 'own').toLowerCase() === 'vendor' ? 'vendor' : 'own';
  if (data.supplier_id === '') data.supplier_id = null;
  if (data.driver_type !== 'vendor') data.supplier_id = null;
  const proofs = parseProofsField(data.proofs);
  const files = Array.isArray(req.files) ? req.files : [];

  data.proofs = proofs.map((proof, index) => {
    const existingImages = Array.isArray(proof.existing_images)
      ? proof.existing_images
      : Array.isArray(proof.existingImages)
        ? proof.existingImages
        : Array.isArray(proof.images)
          ? proof.images.filter((img) => typeof img === 'string')
          : [];

    const uploaded = files
      .filter((file) => file.fieldname === `proof_${index}_images`)
      .map((file) => ensureUpload(file).url);

    return {
      id: proof.id || null,
      proof_type: proof.proof_type || proof.proofType || '',
      proof_number: proof.proof_number || proof.proofNumber || null,
      license_type: proof.license_type || proof.licenseType || null,
      expiry_date: proof.expiry_date || proof.expiryDate || null,
      notes: proof.notes || null,
      display_order: proof.display_order ?? proof.displayOrder ?? index,
      images: [...existingImages.filter(Boolean), ...uploaded],
    };
  });

  return data;
};

const attachVehicleUploads = (req) => {
  const data = coerceMultipartFlags(req.body);
  const files = req.files || {};
  const imageFile = Array.isArray(files)
    ? files.find((f) => f.fieldname === 'image' || f.fieldname === 'photo')
    : files.image?.[0] || files.photo?.[0];
  if (imageFile) data.image = ensureUpload(imageFile).url;

  if (data.capacity === '' || data.capacity == null) {
    data.capacity = null;
  } else {
    data.capacity = Number(data.capacity);
  }

  data.ownership = String(data.ownership || 'own').toLowerCase() === 'vendor' ? 'vendor' : 'own';
  if (data.supplier_id === '') data.supplier_id = null;
  if (data.ownership !== 'vendor') data.supplier_id = null;

  return data;
};

const validateVehiclePayload = (data) => {
  if (data.capacity == null || !Number.isFinite(Number(data.capacity)) || Number(data.capacity) < 1) {
    throw new AppError('Seating capacity is required', 400);
  }
  if (data.ownership === 'vendor' && !data.supplier_id) {
    throw new AppError('Vendor name is required', 400);
  }
};

const vehicles = {
  ...vehiclesBase,
  create: asyncHandler(async (req, res) => {
    const payload = attachVehicleUploads(req);
    validateVehiclePayload(payload);
    const record = await masterService.vehicleService.create(payload, req.user.id);
    res.status(201).json(ApiResponse.success('Vehicle created', record));
  }),
  update: asyncHandler(async (req, res) => {
    const payload = attachVehicleUploads(req);
    validateVehiclePayload(payload);
    const record = await masterService.vehicleService.update(req.params.id, payload, req.user.id);
    res.json(ApiResponse.success('Vehicle updated', record));
  }),
};

const drivers = {
  ...driversBase,
  create: asyncHandler(async (req, res) => {
    const payload = attachDriverUploads(req);
    const record = await masterService.driverService.create(payload, req.user.id);
    res.status(201).json(ApiResponse.success('Driver created', record));
  }),
  update: asyncHandler(async (req, res) => {
    const payload = attachDriverUploads(req);
    const record = await masterService.driverService.update(req.params.id, payload, req.user.id);
    res.json(ApiResponse.success('Driver updated', record));
  }),
  preparePortalShare: asyncHandler(async (req, res) => {
    const driverPortalService = require('../services/driverPortal.service');
    const data = await driverPortalService.preparePortalShare(req.params.id, {
      portalPassword: req.body?.portal_password || null,
      resetPassword: req.body?.reset_password !== false,
    });
    res.json(ApiResponse.success('Driver portal credentials ready', data));
  }),
};

const guides = {
  ...guidesBase,
  create: asyncHandler(async (req, res) => {
    const payload = attachMasterUploads(req);
    const record = await masterService.guideService.create(payload, req.user.id);
    res.status(201).json(ApiResponse.success('Guide created', record));
  }),
  update: asyncHandler(async (req, res) => {
    const payload = attachMasterUploads(req);
    const record = await masterService.guideService.update(req.params.id, payload, req.user.id);
    res.json(ApiResponse.success('Guide updated', record));
  }),
};

const updateStatus = (service, resourceName) =>
  asyncHandler(async (req, res) => {
    const isActive =
      req.body.is_active !== undefined
        ? req.body.is_active === true || req.body.is_active === 'true'
        : req.body.status === 'active';
    const record = await service.update(req.params.id, { is_active: isActive }, req.user.id);
    res.json(ApiResponse.success(`${resourceName} status updated`, record));
  });

const listSettings = asyncHandler(async (req, res) => {
  const data = await masterService.listSettings(req.query);
  res.json(ApiResponse.success('Settings retrieved', data));
});

const getSetting = asyncHandler(async (req, res) => {
  const data = await masterService.getSetting(req.params.key);
  res.json(ApiResponse.success('Setting retrieved', data));
});

const upsertSetting = asyncHandler(async (req, res) => {
  const data = await masterService.upsertSetting(
    req.params.key || req.body.key,
    req.body.value,
    req.body,
    req.user.id
  );
  res.json(ApiResponse.success('Setting saved', data));
});

const updateSettingsBulk = asyncHandler(async (req, res) => {
  const data = await masterService.updateSettingsBulk(req.body.settings || [], req.user.id);
  res.json(ApiResponse.success('Settings updated', data));
});

const uploadLogo = asyncHandler(async (req, res) => {
  const file = ensureUpload(req.file);

  try {
    const existing = await masterService.getSetting('company_logo');
    if (existing?.value && existing.value !== file.url) {
      await deleteFile(existing.value);
    }
  } catch {
    // no previous logo
  }

  const setting = await masterService.upsertSetting(
    'company_logo',
    file.url,
    { type: 'string', group: 'general', description: 'Company logo path' },
    req.user.id
  );

  res.json(
    ApiResponse.success('Logo uploaded', {
      key: setting.key,
      value: setting.value,
      url: file.url,
    })
  );
});

const uploadSignature = asyncHandler(async (req, res) => {
  const file = ensureUpload(req.file);

  try {
    const existing = await masterService.getSetting('digital_signature');
    if (existing?.value && existing.value !== file.url) {
      await deleteFile(existing.value);
    }
  } catch {
    // no previous signature
  }

  const setting = await masterService.upsertSetting(
    'digital_signature',
    file.url,
    { type: 'string', group: 'general', description: 'Digital signature image path' },
    req.user.id
  );

  res.json(
    ApiResponse.success('Signature uploaded', {
      key: setting.key,
      value: setting.value,
      url: file.url,
    })
  );
});

module.exports = {
  branches,
  destinations,
  packages,
  hotels,
  vehicles,
  suppliers,
  leadStatuses,
  leadSourceTypes,
  agents,
  corporates,
  packageTerms,
  inclusionExclusions,
  currencies,
  countries,
  states,
  cities,
  paymentModes,
  taxes,
  seasonPricing,
  expensesTypes,
  departments,
  designations,
  drivers,
  guides,
  currencyStatus: updateStatus(masterService.currencyService, 'Currency'),
  countryStatus: updateStatus(masterService.countryService, 'Country'),
  stateStatus: updateStatus(masterService.stateService, 'State'),
  cityStatus: updateStatus(masterService.cityService, 'City'),
  paymentModeStatus: updateStatus(masterService.paymentModeService, 'Payment mode'),
  taxStatus: updateStatus(masterService.taxService, 'Tax'),
  seasonPricingStatus: updateStatus(masterService.seasonPricingService, 'Season pricing'),
  expensesTypeStatus: updateStatus(masterService.expensesTypeService, 'Expenses type'),
  leadStatusStatus: updateStatus(masterService.leadStatusService, 'Lead status'),
  leadSourceTypeStatus: updateStatus(masterService.leadSourceTypeService, 'Lead source type'),
  agentStatus: updateStatus(masterService.agentService, 'Agent'),
  corporateStatus: updateStatus(masterService.corporateService, 'Corporate'),
  packageTermsStatus: updateStatus(masterService.packageTermsService, 'Package terms'),
  inclusionExclusionStatus: updateStatus(
    masterService.inclusionExclusionService,
    'Inclusion / Exclusion'
  ),
  departmentStatus: updateStatus(masterService.departmentService, 'Department'),
  designationStatus: updateStatus(masterService.designationService, 'Designation'),
  driverStatus: updateStatus(masterService.driverService, 'Driver'),
  guideStatus: updateStatus(masterService.guideService, 'Guide'),
  listSettings,
  getSetting,
  upsertSetting,
  updateSettingsBulk,
  uploadLogo,
  uploadSignature,
};
