import { Box, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { APP_NAME, resolveMediaUrl } from '../../utils/constants';
import { toAmPmTime } from '../../utils/timeFormat';
import { formatInr, summarizePricing } from '../../utils/itineraryPricing';
import { getItineraryThemeId } from '../../utils/itineraryThemes';
import { useBranding } from '../../hooks/queries/useBranding';
import CompanyBankSignatureBlock from '../common/CompanyBankSignatureBlock';
import ThemeCoverScreen from './ThemeCoverScreen';
import ThemeAnimRoot from './ThemeAnimRoot';
import { withEnquiryTripFields } from '../../utils/tripDates';

const TEAL = '#00838f';
const GOLD = '#e0b86a';
const CREAM = '#f4ead4';
const NAVY = '#070b14';

function sortDays(data) {
  return [...(data?.itineraryDays || [])].sort((a, b) => a.day_number - b.day_number);
}

function sortEvents(day) {
  return [...(day?.events || [])].sort((a, b) => {
    if (a.event_time && b.event_time) return String(a.event_time).localeCompare(String(b.event_time));
    return (a.display_order || 0) - (b.display_order || 0);
  });
}

function personName(user) {
  if (!user) return '';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '';
}

function durationShort(data) {
  return `${data?.nights || 0}N / ${data?.days || 0}D`;
}

function durationLong(data) {
  const n = data?.nights || 0;
  const d = data?.days || 0;
  return `${n} Night${n === 1 ? '' : 's'} / ${d} Day${d === 1 ? '' : 's'}`;
}

function routeLabel(data) {
  return (data?.destinations || []).map((d) => d.name).filter(Boolean).join(' · ') || data?.title || '—';
}

function eventText(event) {
  const time = event.event_time ? `${toAmPmTime(event.event_time)} — ` : '';
  const desc = event.description ? ` (${event.description})` : '';
  return `${time}${event.name}${desc}`;
}

function galleryImages(data, days) {
  const urls = [];
  const cover = resolveMediaUrl(data?.cover_image);
  if (cover) urls.push(cover);
  days.forEach((day) => {
    sortEvents(day).forEach((event) => {
      const url = resolveMediaUrl(event.image_url);
      if (url && !urls.includes(url)) urls.push(url);
    });
  });
  return urls;
}

function hotelsFromEvents(days) {
  const hotels = [];
  days.forEach((day) => {
    sortEvents(day).forEach((event) => {
      if (String(event.event_type || '').toLowerCase() !== 'accommodation') return;
      hotels.push({
        id: event.id,
        name: event.details?.hotelName || event.details?.hotel_name || event.name,
        city: event.details?.city || event.details?.location || day.destination || '',
        stars: event.details?.star_rating || event.details?.stars || '',
        room: event.details?.roomType || event.details?.room_type || event.details?.room_count || '',
        image: resolveMediaUrl(event.image_url),
        detail: event.description || '',
      });
    });
  });
  return hotels;
}

function NumberedList({ items, color = '#1a1a1a' }) {
  if (!items?.length) return null;
  return (
    <Box component="ol" sx={{ m: 0, pl: 2.6, color }}>
      {items.map((item, i) => (
        <Box component="li" key={item.id || i} sx={{ mb: 0.85, pl: 0.35 }}>
          <Typography sx={{ fontSize: 14.5, lineHeight: 1.55, fontWeight: 600 }}>
            {item.heading}
            {item.description ? (
              <Box component="span" sx={{ fontWeight: 500, color: '#4b5563' }}>
                {` — ${item.description}`}
              </Box>
            ) : null}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function InclusionExclusionStack({ inclusions, exclusions }) {
  const ins = Array.isArray(inclusions) ? inclusions : [];
  const outs = Array.isArray(exclusions) ? exclusions : [];
  if (!ins.length && !outs.length) return null;

  const renderCard = (title, items, tone) => {
    const isIn = tone === 'in';
    return (
      <Box
        className="theme-policy-card print-break-avoid"
        sx={{
          overflow: 'hidden',
          borderRadius: { xs: 2, md: 2.5 },
          border: `1px solid ${isIn ? '#b7e4c7' : '#fecaca'}`,
          boxShadow: isIn ? '0 12px 28px rgba(45,106,79,0.10)' : '0 12px 28px rgba(159,18,57,0.10)',
        }}
      >
        <Box
          sx={{
            px: { xs: 1.75, md: 2.25 },
            py: 1.2,
            background: isIn
              ? 'linear-gradient(90deg,#1b4332,#2d6a4f 55%,#40916c)'
              : 'linear-gradient(90deg,#9f1239,#be123c 55%,#e11d48)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {isIn ? <CheckCircleOutlinedIcon /> : <HighlightOffIcon />}
          <Typography fontWeight={800} letterSpacing={1.4}>
            {title}
          </Typography>
        </Box>
        <Stack>
          {items.map((item, i) => (
            <Box
              key={item.id || i}
              className="theme-stagger-item"
              sx={{
                display: 'flex',
                gap: 1.25,
                px: { xs: 1.5, md: 2 },
                py: 1.2,
                bgcolor: i % 2 ? (isIn ? '#f3fff6' : '#fff7f7') : '#fff',
                borderBottom: '1px solid',
                borderColor: isIn ? '#e8f5e9' : '#fee2e2',
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  flexShrink: 0,
                  bgcolor: isIn ? '#d8f3dc' : '#fecdd3',
                  color: isIn ? '#1b4332' : '#9f1239',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                {i + 1}
              </Box>
              <Typography fontWeight={700} sx={{ fontSize: { xs: 13.5, md: 14.5 }, lineHeight: 1.5, pt: 0.2 }}>
                {item.heading}
                {item.description ? ` — ${item.description}` : ''}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  };

  return (
    <Stack spacing={2.25} sx={{ mb: 3, mt: 1 }}>
      {ins.length > 0 && renderCard('INCLUSIONS', ins, 'in')}
      {outs.length > 0 && renderCard('EXCLUSIONS', outs, 'out')}
    </Stack>
  );
}

function PhotoTile({ src, position = 'center', minHeight = 140, fallback }) {
  return (
    <Box
      sx={{
        minHeight,
        height: '100%',
        background: src
          ? `url(${src}) ${position} / cover no-repeat`
          : fallback || 'linear-gradient(160deg,#134e4a,#0f172a 55%,#1e3a5f)',
      }}
    />
  );
}

function CoverMosaic({ photos }) {
  const a = photos[0] || null;
  const b = photos[1] || photos[0] || null;
  const c = photos[2] || photos[0] || null;
  return (
    <Box sx={{ display: 'grid', gridTemplateRows: '1.55fr 1fr', height: '100%', minHeight: 430 }}>
      <PhotoTile src={a} position="center 28%" />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <PhotoTile src={b} position="left center" />
        <PhotoTile src={c} position="right bottom" />
      </Box>
    </Box>
  );
}

function ScenicSpread({ photos, minHeight = 280 }) {
  if (!photos?.length) return null;
  const list = photos.slice(0, 3);
  let inner = <PhotoTile src={list[0]} minHeight={minHeight} position="center" />;
  if (list.length === 2) {
    inner = (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.15fr 0.85fr' }, minHeight }}>
        <PhotoTile src={list[0]} minHeight={minHeight} position="center" />
        <PhotoTile src={list[1]} minHeight={minHeight} position="right center" />
      </Box>
    );
  } else if (list.length > 2) {
    inner = (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1.35fr 0.85fr' },
          gridTemplateRows: { sm: '1fr 1fr' },
          minHeight,
        }}
      >
        <Box sx={{ gridRow: { sm: 'span 2' } }}>
          <PhotoTile src={list[0]} minHeight={minHeight} position="center" />
        </Box>
        <PhotoTile src={list[1]} minHeight={minHeight / 2} position="right top" />
        <PhotoTile src={list[2]} minHeight={minHeight / 2} position="right bottom" />
      </Box>
    );
  }
  return (
    <Box data-theme-anim className="print-break-avoid">
      {inner}
    </Box>
  );
}

function CostingRow({ summary, title, subtitle }) {
  const gst = summary.cgst + summary.sgst + summary.igst;
  return (
    <Box className="print-break-avoid theme-reveal" sx={{ mb: 2, border: '1px solid #b7d9dc' }}>
      <Box sx={{ px: 2, py: 1, bgcolor: TEAL, color: '#fff' }}>
        <Typography fontWeight={800} letterSpacing={0.3}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        {subtitle && (
          <Typography fontWeight={800} sx={{ mb: 1.25, fontSize: 16, lineHeight: 1.35 }}>
            {subtitle}
          </Typography>
        )}
        <Typography variant="caption" fontWeight={800} sx={{ color: TEAL, letterSpacing: 0.4 }}>
          Amount Payable Per Adult
        </Typography>
        <Box
          sx={{
            mt: 1,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 1,
            mb: 1.5,
          }}
        >
          {[
            ['Package cost', formatInr(summary.taxable)],
            ['GST', formatInr(gst)],
            ['TCS', formatInr(summary.tcs)],
          ].map(([label, value]) => (
            <Box key={label} sx={{ px: 1.25, py: 1, bgcolor: '#f3fafa' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {label}
              </Typography>
              <Typography fontWeight={800} fontSize={16}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography fontWeight={800} fontSize={22} color={TEAL}>
          Total Payable {formatInr(summary.grandTotal)}
        </Typography>
      </Box>
    </Box>
  );
}

function DreamVacayDocument({ data, branding }) {
  const days = sortDays(data);
  const photos = galleryImages(data, days);
  const hotels = hotelsFromEvents(days);
  const summary = data?.pricing ? summarizePricing(data.pricing) : null;
  const adults = Math.max(Number(data?.adults) || 1, 1);
  const consultant = [personName(data?.enquiry?.assignee), data?.enquiry?.assignee?.phone || data?.enquiry?.phone]
    .filter(Boolean)
    .join(', ');
  const logo = resolveMediaUrl(branding?.company_logo);
  const company = branding?.company_name || APP_NAME;
  const kids = Number(data?.children ?? 0) + Number(data?.infants ?? 0);

  return (
    <Box sx={{ bgcolor: '#fff', color: '#1a1a1a', fontFamily: 'Outfit, Public Sans, sans-serif' }}>
      <ThemeCoverScreen branding={branding} data={data} variant="dream_vacay" />

      <Box
        className="print-break-avoid theme-reveal"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '0.92fr 1.08fr' },
          minHeight: { xs: 320, md: 460 },
          bgcolor: NAVY,
          color: CREAM,
        }}
      >
        <Box sx={{ p: { xs: 3.2, md: 4.6 }, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 3, opacity: 0.88 }}>
            {logo && (
              <Box
                component="img"
                src={logo}
                alt=""
                sx={{ height: 34, width: 34, objectFit: 'contain', filter: 'brightness(1.15)' }}
              />
            )}
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: 12, letterSpacing: 3.2, fontWeight: 700 }}>
              {String(company).toUpperCase()}
            </Typography>
          </Stack>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: 56, md: 92 },
              fontWeight: 700,
              lineHeight: 0.78,
              fontStyle: 'italic',
              color: CREAM,
            }}
          >
            hola!
          </Typography>
          <Typography sx={{ mt: 2.4, fontSize: { xs: 22, md: 30 }, fontWeight: 700, color: '#fff', letterSpacing: 0.2 }}>
            {data?.enquiry?.customer_name || 'Traveller'}
          </Typography>
          <Typography
            sx={{
              mt: 0.6,
              fontFamily: '"Great Vibes", cursive',
              fontSize: { xs: 30, md: 40 },
              color: GOLD,
              lineHeight: 1.1,
            }}
          >
            get ready for your dream vacay
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'block' }, minHeight: 460 }}>
          <CoverMosaic photos={photos} />
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 2.4, md: 4 } }}>
        <Box
          className="print-break-avoid theme-reveal"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.45fr 0.85fr' },
            gap: 2,
            mb: 3.5,
          }}
        >
          <Box sx={{ p: 2.5, bgcolor: '#f3fafa', borderLeft: `6px solid ${TEAL}` }}>
            <Typography sx={{ color: TEAL, fontWeight: 800, letterSpacing: 1.8, mb: 1.4, fontSize: 15 }}>
              SUMMARY
            </Typography>
            {[
              ['Consultant', consultant || company],
              ['ID', data?.enquiry?.enquiry_code || data?.id?.slice(0, 8)],
              ['Name', data?.enquiry?.customer_name],
              ['Trip To', routeLabel(data)],
              ['No. of Nights', durationShort(data)],
              ['Start Date', data?.from_date ? dayjs(data.from_date).format('ddd MMM DD YYYY') : ''],
              ['End Date', data?.to_date ? dayjs(data.to_date).format('ddd MMM DD YYYY') : ''],
              ['Total Adults', String(data?.adults ?? 1)],
              ['Total Kids', String(kids)],
            ]
              .filter(([, value]) => value !== '' && value != null)
              .map(([label, value]) => (
                <Box key={label} sx={{ display: 'grid', gridTemplateColumns: { xs: '110px 10px 1fr', sm: '132px 12px 1fr' }, py: 0.32 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#64748b' }}>{label}</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#64748b' }}>:</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 800 }}>{value}</Typography>
                </Box>
              ))}
          </Box>
          <Box
            sx={{
              p: 2.5,
              bgcolor: NAVY,
              color: CREAM,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 96,
                height: 96,
                flexShrink: 0,
                borderRadius: '50%',
                border: `3px solid ${GOLD}`,
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
                px: 1,
              }}
            >
              <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, lineHeight: 1.25, color: GOLD }}>
                MOST
                <br />
                TRUSTED
                <br />
                BRAND
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: 26, fontWeight: 700, lineHeight: 1.08 }}>
                the most
                <br />
                trusted travel brand
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.72, fontWeight: 600 }}>
                Handcrafted itinerary by {company}
              </Typography>
            </Box>
          </Box>
        </Box>

        {hotels.length > 0 && (
          <Box className="print-break-avoid theme-reveal" sx={{ mb: 3.5 }}>
            <Typography sx={{ color: TEAL, fontWeight: 800, letterSpacing: 1.4, mb: 1.5 }}>
              HOTEL DETAILS
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: `repeat(${Math.min(hotels.length, 2)}, 1fr)` },
                gap: 1.5,
              }}
            >
              {hotels.map((hotel, i) => (
                <Box key={hotel.id} className="theme-stagger-item" sx={{ border: '1px solid #d7ecee', overflow: 'hidden', bgcolor: '#fff' }}>
                  <Box sx={{ height: 168 }}>
                    <PhotoTile src={hotel.image} minHeight={168} fallback="linear-gradient(160deg,#0f766e,#134e4a)" />
                  </Box>
                  <Box sx={{ p: 1.75 }}>
                    <Typography variant="caption" fontWeight={800} sx={{ color: TEAL, letterSpacing: 0.6 }}>
                      Option {i + 1}
                    </Typography>
                    <Typography fontWeight={800} fontSize={18} sx={{ mt: 0.2 }}>
                      {hotel.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={700}>
                      {[hotel.city, hotel.stars ? `(${hotel.stars} star)` : '', hotel.room].filter(Boolean).join(' ')}
                    </Typography>
                    {hotel.detail && (
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {hotel.detail}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {days.map((day) => {
          const events = sortEvents(day);
          return (
            <Box
              key={day.id}
              className="print-break-avoid theme-reveal"
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '210px 1fr' },
                mb: 2.4,
                borderTop: '1px solid #e2e8f0',
                pt: 2.1,
              }}
            >
              <Box sx={{ pr: 2, mb: { xs: 1, md: 0 } }}>
                <Typography variant="caption" fontWeight={800} sx={{ color: TEAL, letterSpacing: 0.8 }}>
                  Day Wise
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 26,
                    fontWeight: 700,
                    lineHeight: 1.12,
                    mt: 0.2,
                  }}
                >
                  Itinerary
                  <br />
                  Day {String(day.day_number).padStart(2, '0')}
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#64748b" mt={0.75}>
                  {day.date ? dayjs(day.date).format('ddd, DD MMM') : ''}
                </Typography>
                {day.subject && (
                  <Typography variant="body2" fontWeight={700} mt={0.5}>
                    {day.subject}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography fontWeight={800} sx={{ mb: 0.85, color: '#0b1220' }}>
                  Daywise Plan
                </Typography>
                {events.length === 0 ? (
                  <Typography variant="body2" color="text.disabled">
                    Plan to be confirmed.
                  </Typography>
                ) : (
                  <Box component="ul" sx={{ m: 0, pl: 2.3 }}>
                    {events.map((event) => (
                      <Box component="li" key={event.id} sx={{ mb: 0.7, color: '#334155' }}>
                        <Typography sx={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.5 }}>
                          {eventText(event)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}

        <Box
          className="print-break-avoid theme-reveal"
          sx={{
            my: 3.5,
            px: 3,
            py: 2.4,
            bgcolor: TEAL,
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: { xs: 22, md: 28 }, fontWeight: 700, lineHeight: 1 }}>
              travel now pay later
            </Typography>
            <Typography sx={{ mt: 0.4, fontWeight: 700, opacity: 0.92, letterSpacing: 0.3 }}>
              easy emi options
            </Typography>
          </Box>
          <Box
            sx={{
              px: 2.2,
              py: 1,
              bgcolor: '#fff',
              color: TEAL,
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: 0.3,
            }}
          >
            Check Now
          </Box>
        </Box>

        {summary && (
          <CostingRow
            summary={summary}
            title="Costing Details"
            subtitle={[
              hotels[0]?.name,
              hotels[0]?.city?.toUpperCase?.() || hotels[0]?.city,
              hotels[0]?.stars ? `(${hotels[0].stars} star)` : '',
              hotels[0]?.room,
              `${durationShort(data)} · ${adults} Adult${adults === 1 ? '' : 's'}`,
            ]
              .filter(Boolean)
              .join('  ')}
          />
        )}

        <InclusionExclusionStack inclusions={data?.inclusions} exclusions={data?.exclusions} />

        {(data?.package_terms || []).length > 0 && (
          <Box className="print-break-avoid" sx={{ mb: 2 }}>
            <Typography fontWeight={800} sx={{ mb: 1.1, color: '#0b1220' }}>
              Notes
            </Typography>
            <NumberedList items={data.package_terms} />
          </Box>
        )}

        <Box className="print-break-avoid">
          <CompanyBankSignatureBlock branding={branding} companyName={company} />
        </Box>
      </Box>
    </Box>
  );
}

function ScenicEscapeDocument({ data, branding }) {
  const days = sortDays(data);
  const photos = galleryImages(data, days);
  const extraPhotos = photos.slice(1);
  const midPhotos = extraPhotos.slice(0, 3);
  const closingPhotos = extraPhotos.slice(3, 6);

  return (
    <Box sx={{ bgcolor: '#f4efe4', color: '#1b4332', fontFamily: 'Outfit, Public Sans, sans-serif' }}>
      <ThemeCoverScreen branding={branding} data={data} variant="scenic_escape" />

      <ScenicSpread photos={midPhotos} minHeight={300} />

      <Box sx={{ p: { xs: 2, sm: 2.6, md: 4.6 } }}>
        <Stack spacing={3.2}>
          {days.map((day) => {
            const events = sortEvents(day);
            const dayPhotos = events.map((e) => resolveMediaUrl(e.image_url)).filter(Boolean);
            return (
              <Box key={day.id} className="print-break-avoid theme-reveal">
                <Typography
                  sx={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: { xs: 30, md: 36 },
                    fontWeight: 700,
                    color: '#1b4332',
                    mb: 1,
                    letterSpacing: 0.4,
                  }}
                >
                  DAY {day.day_number}:
                </Typography>
                {(day.subject || day.destination) && (
                  <Typography fontWeight={700} sx={{ mb: 1.1, fontSize: 16 }}>
                    {[day.subject, day.destination].filter(Boolean).join(' · ')}
                  </Typography>
                )}
                <Stack spacing={0.85} sx={{ pl: 0.2 }}>
                  {events.length === 0 ? (
                    <Typography color="text.disabled">Plan to be confirmed.</Typography>
                  ) : (
                    events.map((event) => (
                      <Typography
                        key={event.id}
                        className="theme-stagger-item"
                        sx={{ fontWeight: 700, fontSize: 16, color: '#1f2937', lineHeight: 1.45 }}
                      >
                        → {eventText(event)}
                      </Typography>
                    ))
                  )}
                </Stack>
                {dayPhotos.length > 0 && (
                  <Box
                    sx={{
                      mt: 1.8,
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: `repeat(${Math.min(dayPhotos.length, 3)}, 1fr)` },
                      gap: 1,
                    }}
                  >
                    {dayPhotos.slice(0, 3).map((src) => (
                      <Box
                        key={src}
                        component="img"
                        src={src}
                        alt=""
                        sx={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      {closingPhotos.length > 0 && <ScenicSpread photos={closingPhotos} minHeight={260} />}

      <Box sx={{ p: { xs: 2, sm: 2.6, md: 4.6 }, pt: closingPhotos.length ? 0 : undefined }}>
        <InclusionExclusionStack inclusions={data?.inclusions} exclusions={data?.exclusions} />

        {data?.pricing && (
          <Box className="print-break-avoid" sx={{ mt: 3, p: 2.4, bgcolor: '#1b4332', color: '#fff' }}>
            <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: 1.6, opacity: 0.8 }}>
              PACKAGE COST
            </Typography>
            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 700 }}>
              {formatInr(summarizePricing(data.pricing).grandTotal)}
            </Typography>
          </Box>
        )}

        {(data?.package_terms || []).length > 0 && (
          <Box className="print-break-avoid" sx={{ mt: 3 }}>
            <Typography fontWeight={800} sx={{ mb: 1 }}>
              Notes
            </Typography>
            <NumberedList items={data.package_terms} color="#1b4332" />
          </Box>
        )}
      </Box>
    </Box>
  );
}

function ClassicVoyageDocument({ data, branding }) {
  const days = sortDays(data);
  const photos = galleryImages(data, days);
  const coverUrl = photos[0];
  const summary = data?.pricing ? summarizePricing(data.pricing) : null;
  const logo = resolveMediaUrl(branding?.company_logo);
  const company = branding?.company_name || APP_NAME;

  return (
    <Box sx={{ bgcolor: '#f7f3ea', color: '#152238', fontFamily: 'Outfit, Public Sans, sans-serif' }}>
      <ThemeCoverScreen branding={branding} data={data} variant="classic_voyage" />

      <Box
        className="print-break-avoid theme-reveal"
        sx={{
          px: { xs: 2.2, md: 4.2 },
          pt: 3,
          pb: 2.2,
          borderBottom: '3px solid #c9a227',
          background: 'linear-gradient(180deg,#fffaf0 0%, #f7f3ea 100%)',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Stack direction="row" spacing={1.2} alignItems="center">
              {logo && (
                <Box component="img" src={logo} alt="" sx={{ height: 36, width: 36, objectFit: 'contain' }} />
              )}
              <Typography
                sx={{
                  fontFamily: '"Cinzel", "Playfair Display", serif',
                  letterSpacing: 3.2,
                  fontWeight: 700,
                  color: '#c9a227',
                  fontSize: 12,
                }}
              >
                {String(company).toUpperCase()}
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontSize: { xs: 26, md: 40 },
                fontWeight: 800,
                mt: 1,
                lineHeight: 1.1,
              }}
            >
              {data?.title}
            </Typography>
            <Typography fontWeight={700} color="text.secondary" sx={{ mt: 0.6 }}>
              {durationLong(data)}
              {data?.from_date
                ? ` · ${dayjs(data.from_date).format('DD MMM YYYY')} – ${dayjs(data.to_date).format('DD MMM YYYY')}`
                : ''}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="caption" sx={{ letterSpacing: 2, fontWeight: 800, color: '#c9a227' }}>
              CLASSIC VOYAGE
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              Travel dossier
            </Typography>
          </Box>
        </Stack>
      </Box>

      {coverUrl && (
        <Box
          component="img"
          src={coverUrl}
          alt=""
          sx={{ width: '100%', height: { xs: 180, md: 280 }, objectFit: 'cover', display: 'block' }}
        />
      )}

      <Box sx={{ p: { xs: 2, sm: 2.5, md: 4.2 } }}>
        <Box className="print-break-avoid" sx={{ mb: 3, p: 2, bgcolor: '#fff', border: '1px solid #e8e0d0' }}>
          <Typography variant="body2" fontWeight={700}>
            Route: {routeLabel(data)}
            {data?.enquiry ? ` · ${data.enquiry.customer_name} (${data.enquiry.enquiry_code})` : ''}
          </Typography>
        </Box>

        <Stack spacing={0}>
          {days.map((day, idx) => {
            const events = sortEvents(day);
            const dayPhoto = events.map((e) => resolveMediaUrl(e.image_url)).find(Boolean);
            return (
              <Box
                key={day.id}
                className="print-break-avoid theme-reveal"
                sx={{ display: 'grid', gridTemplateColumns: { xs: '44px 1fr', sm: '56px 1fr' }, gap: 1.5, mb: 0 }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
                      borderRadius: '50%',
                      bgcolor: '#152238',
                      color: CREAM,
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontFamily: '"Playfair Display", serif',
                      border: '2px solid #c9a227',
                      zIndex: 1,
                    }}
                  >
                    {idx + 1}
                  </Box>
                  {idx < days.length - 1 && (
                    <Box sx={{ flex: 1, width: 2, bgcolor: '#e0d3b0', minHeight: 24 }} />
                  )}
                </Box>
                <Box sx={{ bgcolor: '#fff', border: '1px solid #e8e0d0', p: 1.85, mb: 2 }}>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#c9a227', letterSpacing: 0.6 }}>
                    DAY {day.day_number} {day.date ? `· ${dayjs(day.date).format('dddd, DD MMM YYYY')}` : ''}
                  </Typography>
                  <Typography fontWeight={800} sx={{ fontFamily: '"Playfair Display", serif', fontSize: 18 }}>
                    {day.subject || `Day ${day.day_number}`}
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: dayPhoto ? { xs: '1fr', sm: '1fr 140px' } : '1fr',
                      gap: 1.5,
                      mt: 0.8,
                    }}
                  >
                    <Box component="ul" sx={{ m: 0, pl: 2.1 }}>
                      {events.map((event) => (
                        <Box component="li" key={event.id} sx={{ mb: 0.45 }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                            {eventText(event)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    {dayPhoto && (
                      <Box
                        component="img"
                        src={dayPhoto}
                        alt=""
                        sx={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Stack>

        <InclusionExclusionStack inclusions={data?.inclusions} exclusions={data?.exclusions} />

        {summary && (
          <Box className="print-break-avoid" sx={{ mt: 3, p: 2.4, bgcolor: '#152238', color: CREAM }}>
            <Typography variant="caption" sx={{ letterSpacing: 1.8, color: '#c9a227', fontWeight: 800 }}>
              COSTING DETAILS
            </Typography>
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: 32, fontWeight: 700 }}>
              {formatInr(summary.grandTotal)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.82, mt: 0.4 }}>
              Package {formatInr(summary.taxable)} · GST {formatInr(summary.cgst + summary.sgst + summary.igst)} · TCS{' '}
              {formatInr(summary.tcs)}
            </Typography>
          </Box>
        )}

        {(data?.package_terms || []).length > 0 && (
          <Box className="print-break-avoid" sx={{ mt: 3 }}>
            <Typography fontWeight={800} mb={1}>
              Notes
            </Typography>
            <NumberedList items={data.package_terms} />
          </Box>
        )}

        <Box className="print-break-avoid">
          <CompanyBankSignatureBlock branding={branding} companyName={company} />
        </Box>
      </Box>
    </Box>
  );
}

export default function ThemedItineraryDocument({ data, branding: brandingProp }) {
  const displayData = withEnquiryTripFields(data, data?.enquiry);
  const { data: fetchedBranding } = useBranding({ enabled: !brandingProp });
  const branding = brandingProp || fetchedBranding;
  const themeId = getItineraryThemeId(displayData);
  const body =
    themeId === 'dream_vacay' ? (
      <DreamVacayDocument data={displayData} branding={branding} />
    ) : themeId === 'scenic_escape' ? (
      <ScenicEscapeDocument data={displayData} branding={branding} />
    ) : (
      <ClassicVoyageDocument data={displayData} branding={branding} />
    );
  return <ThemeAnimRoot>{body}</ThemeAnimRoot>;
}
