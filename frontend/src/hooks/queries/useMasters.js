import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import masterService from '../../services/master.service';
import { normalizeListResponse } from '../../utils/apiParams';
import { useSnackbar } from 'notistack';

const createMasterHooks = (key, service) => {
  const useList = (params) =>
    useQuery({
      queryKey: [key, params],
      queryFn: async () => {
        const { data } = await service.list(params);
        return normalizeListResponse(data);
      },
    });

  const useMutationHooks = () => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: [key] });

    return {
      create: useMutation({
        mutationFn: (payload) => service.create(payload),
        onSuccess: () => {
          invalidate();
          enqueueSnackbar('Created successfully', { variant: 'success' });
        },
        onError: (err) =>
          enqueueSnackbar(err?.response?.data?.message || 'Create failed', { variant: 'error' }),
      }),
      update: useMutation({
        mutationFn: ({ id, data, ...payload }) =>
          service.update(id, data !== undefined ? data : payload),
        onSuccess: () => {
          invalidate();
          enqueueSnackbar('Updated successfully', { variant: 'success' });
        },
        onError: (err) =>
          enqueueSnackbar(err?.response?.data?.message || 'Update failed', { variant: 'error' }),
      }),
      updateStatus: useMutation({
        mutationFn: ({ id, ...payload }) =>
          service.updateStatus ? service.updateStatus(id, payload) : service.update(id, payload),
        onSuccess: () => {
          invalidate();
          enqueueSnackbar('Status updated successfully', { variant: 'success' });
        },
        onError: (err) =>
          enqueueSnackbar(err?.response?.data?.message || 'Status update failed', {
            variant: 'error',
          }),
      }),
      remove: useMutation({
        mutationFn: (id) => service.remove(id),
        onSuccess: () => {
          invalidate();
          enqueueSnackbar('Deleted successfully', { variant: 'success' });
        },
        onError: (err) =>
          enqueueSnackbar(err?.response?.data?.message || 'Delete failed', { variant: 'error' }),
      }),
    };
  };

  return { useList, useMutationHooks };
};

export const branches = createMasterHooks('branches', masterService.branches);
export const destinations = createMasterHooks('destinations', masterService.destinations);
export const packages = createMasterHooks('packages', masterService.packages);
export const hotels = createMasterHooks('hotels', masterService.hotels);
export const vehicles = createMasterHooks('vehicles', masterService.vehicles);
export const suppliers = createMasterHooks('suppliers', masterService.suppliers);
export const leadStatuses = createMasterHooks('leadStatuses', masterService.leadStatuses);
export const leadSourceTypes = createMasterHooks('leadSourceTypes', masterService.leadSourceTypes);
export const agents = createMasterHooks('agents', masterService.agents);
export const corporates = createMasterHooks('corporates', masterService.corporates);
export const packageTerms = createMasterHooks('packageTerms', masterService.packageTerms);
export const inclusionExclusions = createMasterHooks(
  'inclusionExclusions',
  masterService.inclusionExclusions
);
export const currencies = createMasterHooks('currencies', masterService.currencies);
export const countries = createMasterHooks('countries', masterService.countries);
export const states = createMasterHooks('states', masterService.states);
export const cities = createMasterHooks('cities', masterService.cities);
export const paymentModes = createMasterHooks('paymentModes', masterService.paymentModes);
export const taxes = createMasterHooks('taxes', masterService.taxes);
export const seasonPricing = createMasterHooks('seasonPricing', masterService.seasonPricing);
export const expensesTypes = createMasterHooks('expensesTypes', masterService.expensesTypes);
export const departments = createMasterHooks('departments', masterService.departments);
export const designations = createMasterHooks('designations', masterService.designations);
export const drivers = createMasterHooks('drivers', masterService.drivers);
export const guides = createMasterHooks('guides', masterService.guides);

export const useBranches = branches.useList;
export const useBranchMutation = branches.useMutationHooks;
export const useDestinations = destinations.useList;
export const useDestinationMutation = destinations.useMutationHooks;
export const usePackages = packages.useList;
export const usePackageMutation = packages.useMutationHooks;
export const useHotels = hotels.useList;
export const useHotelMutation = hotels.useMutationHooks;
export const useVehicles = vehicles.useList;
export const useVehicleMutation = vehicles.useMutationHooks;
export const useSuppliers = suppliers.useList;
export const useSupplierMutation = suppliers.useMutationHooks;
export const useLeadStatuses = leadStatuses.useList;
export const useLeadStatusMutation = leadStatuses.useMutationHooks;
export const useLeadSourceTypes = leadSourceTypes.useList;
export const useLeadSourceTypeMutation = leadSourceTypes.useMutationHooks;
export const useAgents = agents.useList;
export const useAgentMutation = agents.useMutationHooks;
export const useCorporates = corporates.useList;
export const useCorporateMutation = corporates.useMutationHooks;
export const usePackageTerms = packageTerms.useList;
export const usePackageTermsMutation = packageTerms.useMutationHooks;
export const useInclusionExclusions = inclusionExclusions.useList;
export const useInclusionExclusionMutation = inclusionExclusions.useMutationHooks;
export const useCurrencies = currencies.useList;
export const useCurrencyMutation = currencies.useMutationHooks;
export const useCountries = countries.useList;
export const useCountryMutation = countries.useMutationHooks;
export const useStates = states.useList;
export const useStateMutation = states.useMutationHooks;
export const useCities = cities.useList;
export const useCityMutation = cities.useMutationHooks;
export const usePaymentModes = paymentModes.useList;
export const usePaymentModeMutation = paymentModes.useMutationHooks;
export const useTaxes = taxes.useList;
export const useTaxMutation = taxes.useMutationHooks;
export const useSeasonPricing = seasonPricing.useList;
export const useSeasonPricingMutation = seasonPricing.useMutationHooks;
export const useExpensesTypes = expensesTypes.useList;
export const useExpensesTypeMutation = expensesTypes.useMutationHooks;
export const useDepartments = departments.useList;
export const useDepartmentMutation = departments.useMutationHooks;
export const useDesignations = designations.useList;
export const useDesignationMutation = designations.useMutationHooks;
export const useDrivers = drivers.useList;
export const useDriverMutation = drivers.useMutationHooks;
export const useGuides = guides.useList;
export const useGuideMutation = guides.useMutationHooks;
