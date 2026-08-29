import { z } from 'zod';

export const BLOOD_GROUP_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().optional().or(z.literal('')),
  roleId: z.union([z.string(), z.number()]).refine((v) => v !== '' && v !== null, {
    message: 'Role is required',
  }),
  branchId: z.union([z.string(), z.number()]).optional().nullable(),
  departmentId: z.union([z.string(), z.number()]).optional().nullable(),
  designationId: z.union([z.string(), z.number()]).optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
  password: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  bloodGroup: z.string().optional().or(z.literal('')),
  aadhar: z.string().optional().or(z.literal('')),
  permanentAddress: z.string().optional().or(z.literal('')),
  hasWorkExperience: z.enum(['yes', 'no']).default('no'),
  workExperienceYears: z.union([z.string(), z.number()]).optional().or(z.literal('')),
  previousCompanyName: z.string().optional().or(z.literal('')),
  previousCompanyDesignation: z.string().optional().or(z.literal('')),
  previousCompanyDuration: z.string().optional().or(z.literal('')),
  avatar: z.any().optional().nullable(),
});

export const userCreateSchema = userSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const emptyToNull = (value) => (value === '' || value === undefined ? null : value);

const buildUserPayload = (values) => {
  const hasWorkExperience = values.hasWorkExperience === 'yes';
  const payload = {
    first_name: values.firstName,
    last_name: values.lastName,
    email: values.email,
    phone: emptyToNull(values.phone),
    role_id: emptyToNull(values.roleId),
    branch_id: emptyToNull(values.branchId),
    department_id: emptyToNull(values.departmentId),
    designation_id: emptyToNull(values.designationId),
    is_active: values.status !== 'inactive',
    gender: emptyToNull(values.gender),
    blood_group: emptyToNull(values.bloodGroup),
    aadhar: emptyToNull(values.aadhar),
    permanent_address: emptyToNull(values.permanentAddress),
    has_work_experience: hasWorkExperience,
    work_experience_years: hasWorkExperience
      ? values.workExperienceYears === '' || values.workExperienceYears == null
        ? null
        : Number(values.workExperienceYears)
      : null,
    previous_company_name: hasWorkExperience ? emptyToNull(values.previousCompanyName) : null,
    previous_company_designation: hasWorkExperience
      ? emptyToNull(values.previousCompanyDesignation)
      : null,
    previous_company_duration: hasWorkExperience ? emptyToNull(values.previousCompanyDuration) : null,
  };
  if (values.password) payload.password = values.password;
  return payload;
};

export const mapUserToApi = (values) => {
  const payload = buildUserPayload(values);

  if (values.avatar instanceof File) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      formData.append(key, String(value));
    });
    formData.append('avatar', values.avatar);
    return formData;
  }

  return payload;
};

export const mapUserFromApi = (row) => {
  if (!row) return null;
  const hasWorkExperience = row.has_work_experience === true || row.hasWorkExperience === true;
  return {
    ...row,
    firstName: row.first_name || row.firstName || '',
    lastName: row.last_name || row.lastName || '',
    roleId: row.role_id || row.roleId || '',
    branchId: row.branch_id || row.branchId || '',
    departmentId: row.department_id || row.departmentId || '',
    designationId: row.designation_id || row.designationId || '',
    status: row.is_active === false || row.status === 'inactive' ? 'inactive' : 'active',
    gender: row.gender || '',
    bloodGroup: row.blood_group || row.bloodGroup || '',
    aadhar: row.aadhar || '',
    permanentAddress: row.permanent_address || row.permanentAddress || '',
    hasWorkExperience: hasWorkExperience ? 'yes' : 'no',
    workExperienceYears:
      row.work_experience_years ?? row.workExperienceYears ?? '',
    previousCompanyName: row.previous_company_name || row.previousCompanyName || '',
    previousCompanyDesignation:
      row.previous_company_designation || row.previousCompanyDesignation || '',
    previousCompanyDuration: row.previous_company_duration || row.previousCompanyDuration || '',
    avatar: null,
  };
};
