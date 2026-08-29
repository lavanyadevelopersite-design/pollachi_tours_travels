import { z } from 'zod';
import { to24HourTime, toAmPmTime } from '../utils/timeFormat';

export const FOLLOW_UP_TYPES = ['task', 'call', 'meeting', 'email', 'visit', 'whatsapp', 'other'];

export const followUpSchema = z.object({
  relatedType: z.enum(['lead', 'enquiry']).default('lead'),
  relatedId: z.union([z.string(), z.number()]).refine((v) => v !== '' && v !== null, {
    message: 'Related record is required',
  }),
  followUpDate: z.string().min(1, 'Follow-up date is required'),
  followUpTime: z.string().optional().or(z.literal('')),
  type: z.enum(['task', 'call', 'meeting', 'email', 'visit', 'whatsapp', 'other']).default('task'),
  status: z.string().default('pending'),
  notes: z.string().optional().or(z.literal('')),
  outcome: z.string().optional().or(z.literal('')),
  assignedTo: z.union([z.string(), z.number()]).optional().nullable(),
  reminder: z.boolean().default(false),
});

export const mapFollowUpToApi = (values) => {
  const date = values.followUpDate;
  const time = to24HourTime(values.followUpTime, '09:00');
  const followUpDate = date.includes('T') ? date : `${date}T${time}:00`;

  return {
    lead_id: values.relatedType === 'lead' ? values.relatedId : null,
    enquiry_id: values.relatedType === 'enquiry' ? values.relatedId : null,
    follow_up_date: followUpDate,
    type: values.type,
    status: values.status,
    notes: values.notes || null,
    outcome: values.outcome || null,
    assigned_to: values.assignedTo || null,
    reminder: values.reminder === true || values.reminder === 'yes' || values.reminder === 1,
  };
};

export const mapFollowUpFromApi = (row) => {
  if (!row) return null;
  const relatedType = row.lead_id ? 'lead' : 'enquiry';
  const relatedId = row.lead_id || row.enquiry_id || '';
  const raw = row.follow_up_date || row.followUpDate || '';
  const [datePart, timePart] = String(raw).replace(' ', 'T').split('T');
  return {
    ...row,
    relatedType,
    relatedId,
    followUpDate: datePart || '',
    followUpTime: timePart ? toAmPmTime(timePart.slice(0, 5)) : '',
    assignedTo: row.assigned_to || row.assignedTo || row.assignee?.id || null,
    reminder: Boolean(row.reminder),
  };
};
