const express = require('express');
const masterController = require('../controllers/master.controller');
const validate = require('../middleware/validate.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const upload = require('../middleware/upload.middleware');
const {
  createLeadStatusSchema,
  updateLeadStatusSchema,
} = require('../validators/leadStatus.validator');
const {
  createLeadSourceTypeSchema,
  updateLeadSourceTypeSchema,
} = require('../validators/leadSourceType.validator');
const {
  createPackageTermsSchema,
  updatePackageTermsSchema,
} = require('../validators/packageTerms.validator');
const {
  createInclusionExclusionSchema,
  updateInclusionExclusionSchema,
} = require('../validators/inclusionExclusion.validator');
const {
  createCurrencySchema,
  updateCurrencySchema,
  createCountrySchema,
  updateCountrySchema,
  createStateSchema,
  updateStateSchema,
  createCitySchema,
  updateCitySchema,
  createPaymentModeSchema,
  updatePaymentModeSchema,
  createTaxSchema,
  updateTaxSchema,
  createSeasonPricingSchema,
  updateSeasonPricingSchema,
  createExpensesTypeSchema,
  updateExpensesTypeSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  createDesignationSchema,
  updateDesignationSchema,
  createDriverSchema,
  updateDriverSchema,
  createGuideSchema,
  updateGuideSchema,
} = require('../validators/commonMasters.validator');

const router = express.Router();

const masterUploadFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'proof_document', maxCount: 1 },
]);

/** Drivers: dynamic proof_N_images fields need upload.any() */
const driverUploadFields = upload.any();

/** Coerce multipart string fields before Zod validation */
const coerceMultipartMasterBody = (req, _res, next) => {
  if (!req.body || typeof req.body !== 'object') return next();
  const data = req.body;
  if (data.is_active !== undefined && data.is_active !== null && data.is_active !== '') {
    data.is_active = data.is_active === true || data.is_active === 'true' || data.is_active === '1';
  }
  ['experience_years', 'daily_rate', 'capacity'].forEach((field) => {
    if (data[field] === '') data[field] = null;
  });
  ['vehicle_id', 'email', 'code', 'supplier_id'].forEach((field) => {
    if (data[field] === '') data[field] = null;
  });
  if (typeof data.proofs === 'string') {
    try {
      data.proofs = JSON.parse(data.proofs || '[]');
    } catch {
      data.proofs = [];
    }
  }
  next();
};

const mountCrud = (path, module, ctrl, options = {}) => {
  const { createSchema, updateSchema, statusHandler, withUploads = false, uploadMiddleware } =
    options;
  const uploader = uploadMiddleware || masterUploadFields;
  const createMiddleware = [
    ...(withUploads ? [uploader, coerceMultipartMasterBody] : []),
    ...(createSchema ? [validate(createSchema)] : []),
  ];
  const updateMiddleware = [
    ...(withUploads ? [uploader, coerceMultipartMasterBody] : []),
    ...(updateSchema ? [validate(updateSchema)] : []),
  ];

  router.get(`/${path}`, authorize(`${module}.view`), ctrl.list);
  router.get(`/${path}/:id`, authorize(`${module}.view`), ctrl.getById);
  router.post(`/${path}`, authorize(`${module}.create`), ...createMiddleware, ctrl.create);
  router.put(`/${path}/:id`, authorize(`${module}.edit`), ...updateMiddleware, ctrl.update);
  if (statusHandler) {
    router.patch(`/${path}/:id/status`, authorize(`${module}.edit`), statusHandler);
  }
  router.delete(`/${path}/:id`, authorize(`${module}.delete`), ctrl.remove);
};

mountCrud('branches', 'branches', masterController.branches);
mountCrud('destinations', 'destinations', masterController.destinations);
mountCrud('packages', 'packages', masterController.packages);
mountCrud('hotels', 'hotels', masterController.hotels);
mountCrud('vehicles', 'vehicles', masterController.vehicles, { withUploads: true });
mountCrud('suppliers', 'suppliers', masterController.suppliers);
mountCrud('lead-statuses', 'lead_statuses', masterController.leadStatuses, {
  createSchema: createLeadStatusSchema,
  updateSchema: updateLeadStatusSchema,
  statusHandler: masterController.leadStatusStatus,
});
mountCrud('lead-source-types', 'lead_source_types', masterController.leadSourceTypes, {
  createSchema: createLeadSourceTypeSchema,
  updateSchema: updateLeadSourceTypeSchema,
  statusHandler: masterController.leadSourceTypeStatus,
});
mountCrud('package-terms', 'package_terms', masterController.packageTerms, {
  createSchema: createPackageTermsSchema,
  updateSchema: updatePackageTermsSchema,
  statusHandler: masterController.packageTermsStatus,
});
mountCrud('inclusion-exclusions', 'inclusion_exclusions', masterController.inclusionExclusions, {
  createSchema: createInclusionExclusionSchema,
  updateSchema: updateInclusionExclusionSchema,
  statusHandler: masterController.inclusionExclusionStatus,
});

mountCrud('currencies', 'currencies', masterController.currencies, {
  createSchema: createCurrencySchema,
  updateSchema: updateCurrencySchema,
  statusHandler: masterController.currencyStatus,
});
mountCrud('countries', 'countries', masterController.countries, {
  createSchema: createCountrySchema,
  updateSchema: updateCountrySchema,
  statusHandler: masterController.countryStatus,
});
mountCrud('states', 'states', masterController.states, {
  createSchema: createStateSchema,
  updateSchema: updateStateSchema,
  statusHandler: masterController.stateStatus,
});
mountCrud('cities', 'cities', masterController.cities, {
  createSchema: createCitySchema,
  updateSchema: updateCitySchema,
  statusHandler: masterController.cityStatus,
});
mountCrud('payment-modes', 'payment_modes', masterController.paymentModes, {
  createSchema: createPaymentModeSchema,
  updateSchema: updatePaymentModeSchema,
  statusHandler: masterController.paymentModeStatus,
});
mountCrud('taxes', 'taxes', masterController.taxes, {
  createSchema: createTaxSchema,
  updateSchema: updateTaxSchema,
  statusHandler: masterController.taxStatus,
});
mountCrud('season-pricing', 'season_pricing', masterController.seasonPricing, {
  createSchema: createSeasonPricingSchema,
  updateSchema: updateSeasonPricingSchema,
  statusHandler: masterController.seasonPricingStatus,
});
mountCrud('expenses-types', 'expenses_types', masterController.expensesTypes, {
  createSchema: createExpensesTypeSchema,
  updateSchema: updateExpensesTypeSchema,
  statusHandler: masterController.expensesTypeStatus,
});
mountCrud('departments', 'departments', masterController.departments, {
  createSchema: createDepartmentSchema,
  updateSchema: updateDepartmentSchema,
  statusHandler: masterController.departmentStatus,
});
mountCrud('designations', 'designations', masterController.designations, {
  createSchema: createDesignationSchema,
  updateSchema: updateDesignationSchema,
  statusHandler: masterController.designationStatus,
});
mountCrud('drivers', 'drivers', masterController.drivers, {
  createSchema: createDriverSchema,
  updateSchema: updateDriverSchema,
  statusHandler: masterController.driverStatus,
  withUploads: true,
  uploadMiddleware: driverUploadFields,
});
router.post(
  '/drivers/:id/portal-share',
  authorize('drivers.edit', 'enquiries.edit'),
  masterController.drivers.preparePortalShare
);
mountCrud('guides', 'guides', masterController.guides, {
  createSchema: createGuideSchema,
  updateSchema: updateGuideSchema,
  statusHandler: masterController.guideStatus,
  withUploads: true,
});

router.get('/settings', authorize('settings.view'), masterController.listSettings);
router.post(
  '/settings/logo',
  authorize('settings.edit'),
  upload.single('logo'),
  masterController.uploadLogo
);
router.post(
  '/settings/signature',
  authorize('settings.edit'),
  upload.single('signature'),
  masterController.uploadSignature
);
router.get('/settings/:key', authorize('settings.view'), masterController.getSetting);
router.put('/settings/:key', authorize('settings.edit'), masterController.upsertSetting);
router.put('/settings', authorize('settings.edit'), masterController.updateSettingsBulk);

module.exports = router;
