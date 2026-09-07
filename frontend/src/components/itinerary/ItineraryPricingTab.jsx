import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {
  calcLineGross,
  coercePricing,
  formatInr,
  round2,
  summarizePricing,
  resolveLineItems,
} from '../../utils/itineraryPricing';
import { getEventTypeMeta } from './EventCard';
import { EVENT_TYPE_OPTIONS } from '../../schemas/itinerary.schema';
import { withEnquiryTripFields } from '../../utils/tripDates';

const moneyFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#fff',
    borderRadius: 2,
  },
};

export default function ItineraryPricingTab({
  data,
  days = [],
  canEdit,
  saving,
  onSave,
  allowManualItems = false,
}) {
  const display = withEnquiryTripFields(data, data?.enquiry);
  const [pricing, setPricing] = useState(() => {
    const base = coercePricing(data?.pricing);
    return {
      ...base,
      line_items: resolveLineItems(days, base.line_items || []),
    };
  });
  const [editingKey, setEditingKey] = useState(null);
  const [draft, setDraft] = useState({ item: '', event_type: '', net: 0, markup_percent: 0 });
  const [itemMenuAnchor, setItemMenuAnchor] = useState(null);

  useEffect(() => {
    const base = coercePricing(data?.pricing);
    base.line_items = resolveLineItems(days, base.line_items || []);
    setPricing(base);
  }, [data?.id, data?.pricing, days]);

  const summary = useMemo(() => summarizePricing(pricing), [pricing]);

  const routeLabel = (data?.destinations || []).map((d) => d.name).join(', ') || '—';

  const updateField = (key, value) => {
    setPricing((prev) => ({ ...prev, [key]: value }));
  };

  const eventMeta = (eventType) =>
    EVENT_TYPE_OPTIONS.find((o) => o.value === eventType) || null;

  const startEdit = (item) => {
    setEditingKey(item.key);
    setDraft({
      item: item.item || '',
      event_type: item.event_type || '',
      net: item.net || 0,
      markup_percent: item.markup_percent || 0,
    });
  };

  const applyEventTypeToItem = (item, eventType) => {
    const opt = eventMeta(eventType);
    return {
      ...item,
      event_type: eventType,
      item: opt?.label || item.item || 'Service item',
      type: opt?.label || item.type || 'Other',
    };
  };

  const applyEdit = () => {
    if (allowManualItems && !draft.event_type) return;
    setPricing((prev) => ({
      ...prev,
      line_items: (prev.line_items || []).map((item) => {
        if (item.key !== editingKey) return item;
        const net = round2(draft.net);
        const markup_percent = round2(draft.markup_percent);
        const next = allowManualItems ? applyEventTypeToItem(item, draft.event_type) : item;
        return {
          ...next,
          net,
          markup_percent,
          gross: calcLineGross(net, markup_percent),
        };
      }),
    }));
    setEditingKey(null);
  };

  const addManualItem = (eventType) => {
    const opt = eventMeta(eventType);
    if (!opt) return;
    const key = `manual:${Date.now()}`;
    const next = {
      key,
      item: opt.label,
      option: '',
      type: opt.label,
      event_type: opt.value,
      net: 0,
      markup_percent: 0,
      gross: 0,
    };
    setPricing((prev) => ({
      ...prev,
      line_items: [...(prev.line_items || []), next],
    }));
    setEditingKey(key);
    setDraft({ item: opt.label, event_type: opt.value, net: 0, markup_percent: 0 });
    setItemMenuAnchor(null);
  };

  const removeManualItem = (key) => {
    setPricing((prev) => ({
      ...prev,
      line_items: (prev.line_items || []).filter((item) => item.key !== key),
    }));
    if (editingKey === key) setEditingKey(null);
  };

  const handleSave = () => {
    let items = pricing.line_items || [];
    if (editingKey) {
      if (allowManualItems && !draft.event_type) return;
      const net = round2(draft.net);
      const markup_percent = round2(draft.markup_percent);
      items = items.map((item) => {
        if (item.key !== editingKey) return item;
        const next = allowManualItems ? applyEventTypeToItem(item, draft.event_type) : item;
        return {
          ...next,
          net,
          markup_percent,
          gross: calcLineGross(net, markup_percent),
        };
      });
      setEditingKey(null);
    }
    const nextItems = (allowManualItems ? items : resolveLineItems(days, items)).map((item) => ({
      ...item,
      gross: calcLineGross(item.net, item.markup_percent),
    }));
    const next = {
      ...pricing,
      line_items: nextItems,
    };
    setPricing(next);
    onSave?.(next);
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 2.5,
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f766e 0%, #0ea5e9 55%, #6366f1 120%)',
          color: '#fff',
          boxShadow: '0 14px 36px rgba(14,165,233,0.28)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={1.5}
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.9, fontWeight: 800 }}>
              Pricing
            </Typography>
            <Typography variant="h5" fontWeight={800}>
              {data?.title || 'Itinerary'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.95, mt: 0.5 }}>
              {routeLabel} · Adult: {display?.adults ?? 1} | Child: {display?.children ?? 0}
            </Typography>
          </Box>
          <Chip
            icon={<SavingsOutlinedIcon sx={{ color: '#fff !important' }} />}
            label={`Grand Total ${formatInr(summary.grandTotal)}`}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 800,
              height: 36,
              '& .MuiChip-label': { px: 1.5 },
            }}
          />
        </Stack>
      </Box>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: alpha('#0ea5e9', 0.25),
              bgcolor: '#fff',
              mb: 2.5,
              boxShadow: '0 10px 28px rgba(15,23,42,0.06)',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.25,
                background: alpha('#0ea5e9', 0.08),
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Typography fontWeight={800} color="#0369a1">
                  {allowManualItems ? 'Cost Items' : 'Cost Items (from events)'}
                </Typography>
                {canEdit && allowManualItems && (
                  <>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={(e) => setItemMenuAnchor(e.currentTarget)}
                      sx={{ textTransform: 'none', fontWeight: 800 }}
                    >
                      Add item
                    </Button>
                    <Menu
                      anchorEl={itemMenuAnchor}
                      open={Boolean(itemMenuAnchor)}
                      onClose={() => setItemMenuAnchor(null)}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                      {EVENT_TYPE_OPTIONS.map((opt) => {
                        const { Icon } = getEventTypeMeta(opt.value);
                        return (
                          <MenuItem key={opt.value} onClick={() => addManualItem(opt.value)}>
                            <ListItemIcon>
                              <Icon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>{opt.label}</ListItemText>
                          </MenuItem>
                        );
                      })}
                    </Menu>
                  </>
                )}
              </Stack>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha('#152238', 0.03) }}>
                  <TableCell sx={{ fontWeight: 800 }}>Item</TableCell>
                  {!allowManualItems && (
                    <TableCell sx={{ fontWeight: 800 }}>Option</TableCell>
                  )}
                  {!allowManualItems && (
                    <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Net
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Markup
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Gross
                  </TableCell>
                  {canEdit && <TableCell width={90} />}
                </TableRow>
              </TableHead>
              <TableBody>
                {(pricing.line_items || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={(allowManualItems ? 4 : 6) + (canEdit ? 1 : 0)}>
                      <Typography variant="body2" color="text.secondary" py={2} textAlign="center">
                        {allowManualItems
                          ? 'No cost items yet. Click Add item and choose an event type.'
                          : 'No events yet. Add events in the Build tab to price them here.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  (pricing.line_items || []).map((item) => {
                    const { Icon } = getEventTypeMeta(item.event_type);
                    const editing = editingKey === item.key;
                    return (
                      <TableRow key={item.key} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1.5,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: alpha('#0ea5e9', 0.12),
                                color: '#0284c7',
                              }}
                            >
                              <Icon sx={{ fontSize: 18 }} />
                            </Box>
                            {editing && allowManualItems ? (
                              <TextField
                                select
                                required
                                size="small"
                                label="Item"
                                value={draft.event_type || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const opt = eventMeta(value);
                                  setDraft((d) => ({
                                    ...d,
                                    event_type: value,
                                    item: opt?.label || d.item,
                                  }));
                                }}
                                sx={{ minWidth: 180, ...moneyFieldSx }}
                              >
                                {EVENT_TYPE_OPTIONS.map((opt) => (
                                  <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            ) : (
                              <Typography fontWeight={700}>{item.item}</Typography>
                            )}
                          </Stack>
                        </TableCell>
                        {!allowManualItems && (
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {item.option || '—'}
                            </Typography>
                          </TableCell>
                        )}
                        {!allowManualItems && (
                          <TableCell>
                            <Chip size="small" label={item.type} sx={{ fontWeight: 700 }} />
                          </TableCell>
                        )}
                        <TableCell align="right">
                          {editing ? (
                            <TextField
                              size="small"
                              type="number"
                              value={draft.net}
                              onChange={(e) =>
                                setDraft((d) => ({ ...d, net: e.target.value }))
                              }
                              sx={{ width: 100, ...moneyFieldSx }}
                            />
                          ) : (
                            formatInr(item.net)
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {editing ? (
                            <TextField
                              size="small"
                              type="number"
                              value={draft.markup_percent}
                              onChange={(e) =>
                                setDraft((d) => ({ ...d, markup_percent: e.target.value }))
                              }
                              sx={{ width: 90, ...moneyFieldSx }}
                              InputProps={{ endAdornment: '%' }}
                            />
                          ) : (
                            `${round2(item.markup_percent)}%`
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#0f766e' }}>
                          {formatInr(
                            editing
                              ? calcLineGross(draft.net, draft.markup_percent)
                              : item.gross
                          )}
                        </TableCell>
                        {canEdit && (
                          <TableCell align="right">
                            {editing ? (
                              <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                <IconButton size="small" color="success" onClick={applyEdit}>
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => setEditingKey(null)}>
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            ) : (
                              <Stack direction="row" spacing={0.25} justifyContent="flex-end">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => startEdit(item)}
                                  sx={{
                                    bgcolor: alpha('#f59e0b', 0.15),
                                    '&:hover': { bgcolor: alpha('#f59e0b', 0.25) },
                                  }}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                                {allowManualItems && (
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => removeManualItem(item.key)}
                                  >
                                    <DeleteOutlinedIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Stack>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha('#f59e0b', 0.08),
              border: '1px solid',
              borderColor: alpha('#f59e0b', 0.25),
              mb: 2.5,
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', md: 'center' }}
            >
              <TextField
                select
                size="small"
                label="Tax Mode"
                value={pricing.gst_mode || 'gst_on_total'}
                onChange={(e) => updateField('gst_mode', e.target.value)}
                disabled={!canEdit}
                sx={{ minWidth: 180, ...moneyFieldSx }}
              >
                <MenuItem value="gst_on_total">GST On Total</MenuItem>
                <MenuItem value="gst_on_markup">GST On Markup</MenuItem>
                <MenuItem value="no_gst">No GST</MenuItem>
              </TextField>
              <TextField
                size="small"
                type="number"
                label="Base Markup %"
                value={pricing.base_markup_percent}
                onChange={(e) => updateField('base_markup_percent', e.target.value)}
                disabled={!canEdit}
                sx={{ width: 150, ...moneyFieldSx }}
              />
              <TextField
                size="small"
                type="number"
                label="Extra Markup (INR)"
                value={pricing.extra_markup}
                onChange={(e) => updateField('extra_markup', e.target.value)}
                disabled={!canEdit}
                sx={{ width: 170, ...moneyFieldSx }}
              />
              {canEdit && (
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    ml: { md: 'auto' },
                    fontWeight: 800,
                    px: 3,
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  }}
                >
                  {saving ? 'Saving...' : 'Update Pricing'}
                </Button>
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#fff',
            }}
          >
            <Box sx={{ px: 2, py: 1.25, bgcolor: alpha('#6366f1', 0.08) }}>
              <Typography fontWeight={800} color="#4338ca">
                Tax & Discount Breakdown
              </Typography>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Service</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    Price
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    Markup
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    CGST
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    SGST
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    IGST
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    TCS
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    Discount
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Tour Package Services</TableCell>
                  <TableCell align="right">{formatInr(summary.subtotalNet)}</TableCell>
                  <TableCell align="right">
                    {formatInr(summary.baseMarkupAmount + summary.extraMarkup)}
                  </TableCell>
                  <TableCell align="right">{formatInr(summary.cgst)}</TableCell>
                  <TableCell align="right">{formatInr(summary.sgst)}</TableCell>
                  <TableCell align="right">{formatInr(summary.igst)}</TableCell>
                  <TableCell align="right">{formatInr(summary.tcs)}</TableCell>
                  <TableCell align="right">{formatInr(summary.discount)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#0f766e' }}>
                    {formatInr(summary.grandTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: 'linear-gradient(180deg, #fff7ed 0%, #fff 40%)',
              border: '1px solid',
              borderColor: alpha('#f97316', 0.3),
              boxShadow: '0 12px 30px rgba(249,115,22,0.12)',
              position: { lg: 'sticky' },
              top: 16,
            }}
          >
            <Typography variant="h6" fontWeight={800} color="#c2410c">
              Adjustments
            </Typography>
            <br />
            <Stack spacing={1.5} sx={{ mt: 0.5 }}>
              {[
                ['cgst_percent', 'CGST %'],
                ['sgst_percent', 'SGST %'],
                ['igst_percent', 'IGST %'],
                ['tcs_percent', 'TCS %'],
                ['discount', 'Discount (INR)'],
              ].map(([key, label]) => (
                <TextField
                  key={key}
                  size="small"
                  type="number"
                  label={label}
                  value={pricing[key]}
                  onChange={(e) => updateField(key, e.target.value)}
                  disabled={!canEdit}
                  fullWidth
                  sx={moneyFieldSx}
                />
              ))}
            </Stack>

            <Box
              sx={{
                mt: 2.5,
                p: 2,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #152238 0%, #1e3a5f 100%)',
                color: '#fff',
              }}
            >
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    Subtotal (Net)
                  </Typography>
                  <Typography fontWeight={700}>{formatInr(summary.subtotalNet)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    Tax
                  </Typography>
                  <Typography fontWeight={700}>{formatInr(summary.taxTotal)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    Discount
                  </Typography>
                  <Typography fontWeight={700}>{formatInr(summary.discount)}</Typography>
                </Stack>
                <Box sx={{ borderTop: '1px dashed rgba(255,255,255,0.25)', my: 0.5 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={800}>Grand Total</Typography>
                  <Typography variant="h6" fontWeight={800} color="#86efac">
                    {formatInr(summary.grandTotal)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
