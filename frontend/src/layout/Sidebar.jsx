import { useEffect, useState } from 'react';
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { NavLink, useLocation } from 'react-router-dom';
import { menuConfig } from '../routes/menuConfig';
import { usePermissions } from '../hooks/usePermission';
import { useBranding } from '../hooks/queries/useBranding';
import { APP_NAME, resolveMediaUrl } from '../utils/constants';
import { useUiStore } from '../store/uiStore';

function brandLogoSrc(path) {
  const url = resolveMediaUrl(path);
  if (!url) return null;
  const version = encodeURIComponent(String(path).split('/').pop() || '1');
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
}

const MENU_ICON_COLORS = {
  dashboard: '#64b5f6',
  enquiries: '#4fc3f7',
  followups: '#26c6da',
  itinerary: '#66bb6a',
  quotations: '#9ccc65',
  bookings: '#26a69a',
  calendar: '#80cbc4',
  finance: '#ffb74d',
  invoices: '#ffa726',
  receipts: '#ffca28',
  expenses: '#ff8a65',
  refunds: '#ef5350',
  masters: '#ba68c8',
  branches: '#ab47bc',
  destinations: '#7e57c2',
  packages: '#5c6bc0',
  hotels: '#42a5f5',
  vehicles: '#29b6f6',
  drivers: '#26c6da',
  guides: '#26a69a',
  suppliers: '#66bb6a',
  'lead-statuses': '#9ccc65',
  'lead-source-types': '#d4e157',
  agents: '#29b6f6',
  corporates: '#7e57c2',
  'package-terms': '#ffee58',
  'inclusion-exclusions': '#81c784',
  countries: '#29b6f6',
  states: '#7e57c2',
  cities: '#26a69a',
  'payment-modes': '#ffa726',
  currencies: '#8bc34a',
  taxes: '#ef5350',
  'season-pricing': '#ffca28',
  'expenses-types': '#ff8a65',
  admin: '#ff8a65',
  users: '#ec407a',
  roles: '#ab47bc',
  departments: '#7e57c2',
  designations: '#5c6bc0',
  feedback: '#42a5f5',
  reports: '#26c6da',
  'report-tours': '#42a5f5',
  'report-mis': '#42a5f5',
  'report-profit-loss': '#26a69a',
  'report-enquiries': '#4fc3f7',
  'report-expenses': '#ff8a65',
  'report-customers': '#ab47bc',
  'report-vehicles': '#29b6f6',
  'report-drivers': '#26c6da',
  'report-followups': '#ffa726',
  'report-attendance': '#90a4ae',
  notifications: '#29b6f6',
  audit: '#78909c',
  'login-history': '#90a4ae',
  settings: '#b0bec5',
};

const DEFAULT_ICON_COLOR = '#90caf9';
const ACTIVE_MENU_BG = '#ffa726';

function isPathMatch(path, pathname) {
  if (!path) return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function menuHasActivePath(item, pathname) {
  if (isPathMatch(item.path, pathname)) return true;
  return Boolean(item.children?.some((child) => menuHasActivePath(child, pathname)));
}

function collectActiveIds(items, pathname, acc = []) {
  items.forEach((item) => {
    if (menuHasActivePath(item, pathname)) acc.push(item.id);
    if (item.children?.length) collectActiveIds(item.children, pathname, acc);
  });
  return acc;
}

function isMenuVisible(item, can) {
  if (item.children?.length) {
    const visibleKids = item.children.filter((child) => isMenuVisible(child, can));
    if (!visibleKids.length) return false;
    if (item.permission && !can(item.permission)) return false;
    return true;
  }
  return !item.permission || can(item.permission);
}

function topLevelGroupIds() {
  return menuConfig.filter((item) => Array.isArray(item.children) && item.children.length).map((item) => item.id);
}

function MenuItem({ item, collapsed, depth = 0, expandedIds, onToggle }) {
  const location = useLocation();
  const { can } = usePermissions();

  if (!isMenuVisible(item, can)) return null;

  const visibleChildren = item.children?.filter((c) => isMenuVisible(c, can));
  const resolvedIconColor = MENU_ICON_COLORS[item.id] || DEFAULT_ICON_COLOR;
  const open = Boolean(expandedIds?.[item.id]);

  if (item.children) {
    if (!visibleChildren?.length) return null;

    const nestedList = (
      <List
        disablePadding
        sx={
          depth > 0
            ? {
                ml: 2,
                mr: 1,
                pl: 0.75,
                borderLeft: '1px solid rgba(255,255,255,0.12)',
              }
            : undefined
        }
      >
        {visibleChildren.map((child) => (
          <MenuItem
            key={child.id}
            item={child}
            collapsed={collapsed}
            depth={depth + 1}
            expandedIds={expandedIds}
            onToggle={onToggle}
          />
        ))}
      </List>
    );

    return (
      <Box>
        <ListItemButton
          onClick={() => onToggle(item.id, depth)}
          sx={{
            mx: 1,
            mb: 0.5,
            borderRadius: 2,
            pl: collapsed ? 2 : 2 + depth * 1.25,
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { bgcolor: alpha('#fff', 0.08), color: '#fff' },
          }}
        >
          <ListItemIcon
            sx={{
              color: resolvedIconColor,
              minWidth: collapsed ? 0 : 36,
              transition: 'color 0.2s ease',
              filter: `drop-shadow(0 0 4px ${alpha(resolvedIconColor, 0.35)})`,
            }}
          >
            {item.icon && <item.icon fontSize="small" />}
          </ListItemIcon>
          {!collapsed && (
            <>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{ fontSize: depth ? 13 : 13.5, fontWeight: 500 }}
              />
              {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </>
          )}
        </ListItemButton>
        {!collapsed &&
          (depth === 0 ? (
            <Collapse in={open} timeout="auto" unmountOnExit={false}>
              {nestedList}
            </Collapse>
          ) : (
            open && nestedList
          ))}
      </Box>
    );
  }

  const active = isPathMatch(item.path, location.pathname);

  return (
    <ListItemButton
      component={NavLink}
      to={item.path}
      selected={active}
      sx={{
        mx: 1,
        mb: 0.5,
        borderRadius: 2.5,
        pl: collapsed ? 2 : 2 + depth * 1.25,
        color: active ? '#fff' : 'rgba(255,255,255,0.65)',
        bgcolor: active ? alpha(ACTIVE_MENU_BG, 0.18) : 'transparent',
        boxShadow: active ? `0 0 18px ${alpha(ACTIVE_MENU_BG, 0.28)}` : 'none',
        borderLeft: active ? `3px solid ${resolvedIconColor}` : '3px solid transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: active ? alpha(ACTIVE_MENU_BG, 0.26) : 'rgba(255,255,255,0.08)',
          color: '#fff',
        },
        '&.Mui-selected': {
          bgcolor: alpha(ACTIVE_MENU_BG, 0.18),
          '&:hover': { bgcolor: alpha(ACTIVE_MENU_BG, 0.26) },
        },
      }}
    >
      <ListItemIcon
        sx={{
          color: resolvedIconColor,
          minWidth: collapsed ? 0 : 36,
          filter: active
            ? `drop-shadow(0 0 7px ${alpha(resolvedIconColor, 0.65)})`
            : `drop-shadow(0 0 3px ${alpha(resolvedIconColor, 0.25)})`,
          opacity: active ? 1 : 0.92,
          transition: 'color 0.2s ease, filter 0.2s ease',
        }}
      >
        {item.icon && <item.icon fontSize="small" />}
      </ListItemIcon>
      {!collapsed && (
        <ListItemText
          primary={item.title}
          primaryTypographyProps={{ fontSize: depth ? 13 : 13.5, fontWeight: active ? 600 : 500 }}
        />
      )}
    </ListItemButton>
  );
}

export default function Sidebar({ collapsed = false }) {
  const location = useLocation();
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const isCollapsed = collapsed || sidebarCollapsed;
  const { data: branding } = useBranding();
  const logoUrl = brandLogoSrc(branding?.company_logo);
  const [logoFailed, setLogoFailed] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => {
    const ids = collectActiveIds(menuConfig, location.pathname);
    return Object.fromEntries(ids.map((id) => [id, true]));
  });
  const companyName = branding?.company_name || APP_NAME;
  const showLogo = Boolean(logoUrl) && !logoFailed;

  useEffect(() => {
    setLogoFailed(false);
  }, [logoUrl]);

  useEffect(() => {
    const ids = collectActiveIds(menuConfig, location.pathname);
    if (!ids.length) return;
    setExpandedIds((prev) => {
      const next = { ...prev };
      const activeTop = menuConfig.find(
        (item) => Array.isArray(item.children) && menuHasActivePath(item, location.pathname)
      );
      if (activeTop) {
        topLevelGroupIds().forEach((groupId) => {
          next[groupId] = groupId === activeTop.id;
        });
      }
      ids.forEach((id) => {
        next[id] = true;
      });
      return next;
    });
  }, [location.pathname]);

  const onToggle = (id, depth = 0) => {
    setExpandedIds((prev) => {
      const willOpen = !prev[id];
      const next = { ...prev };
      if (depth === 0 && willOpen) {
        topLevelGroupIds().forEach((groupId) => {
          next[groupId] = groupId === id;
        });
        return next;
      }
      next[id] = willOpen;
      return next;
    });
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'var(--color-sidebar-bg)',
        color: '#fff',
      }}
    >
      <Box
        sx={{
          height: 'var(--topbar-height)',
          display: 'flex',
          alignItems: 'center',
          px: isCollapsed ? 1.5 : 2.5,
          gap: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Box
          sx={{
            width: showLogo && !isCollapsed ? 44 : 36,
            height: 36,
            borderRadius: 2,
            background: showLogo
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            boxShadow: showLogo ? 'none' : '0 4px 12px rgba(33,150,243,0.35)',
          }}
        >
          {showLogo ? (
            <Box
              component="img"
              src={logoUrl}
              alt={companyName}
              onError={() => setLogoFailed(true)}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center',
                display: 'block',
                p: 0.25,
              }}
            />
          ) : (
            <FlightTakeoffIcon sx={{ fontSize: 20, color: '#fff' }} />
          )}
        </Box>
        {!isCollapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2} noWrap>
              {companyName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.65, fontSize: 11 }}>
              Tour & Travels
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        <List disablePadding>
          {menuConfig.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              collapsed={isCollapsed}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </List>
      </Box>
    </Box>
  );
}
