import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Select, MenuItem,
  TextField, Badge, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Popover, ListItem, useMediaQuery, useTheme, InputAdornment, Divider, Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, Warning as WarningIcon, Assignment as AssignmentIcon,
  MenuBook as MenuBookIcon, Settings as SettingsIcon,
  SmartToy as AiIcon, Notifications as NotifIcon, Search as SearchIcon,
  Menu as MenuIcon, RestartAlt as ResetIcon,
} from '@mui/icons-material';
import { useStore } from './app/store';
import AIPanel from './components/AIPanel/AIPanel';

const NAV_WIDTH = 200;
const AI_WIDTH = 380;

const navItems = [
  { label: 'Overview', icon: <DashboardIcon />, path: '/' },
  { label: 'Process Health', icon: <WarningIcon />, path: '/anomalies' },
  { label: 'Actions', icon: <AssignmentIcon />, path: '/actions' },
  { label: 'Specs & Standards', icon: <MenuBookIcon />, path: '/specs' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function App() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const navigate = useNavigate();
  const location = useLocation();

  const {
    facilities, currentFacilityId, setFacility,
    users, currentUserId, setCurrentUser,
    timeRange, setTimeRange,
    searchQuery, setSearchQuery,
    notifications, resetDemoData,
  } = useStore();

  const [aiOpen, setAiOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navContent = (
    <Box sx={{ width: NAV_WIDTH, pt: 1 }}>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)}
            onClick={() => { navigate(item.path); setMobileNavOpen(false); }}
            sx={{ borderRadius: 1, mx: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ px: 2 }}>
        <Button size="small" startIcon={<ResetIcon />} onClick={resetDemoData} color="warning" fullWidth>
          Reset Demo Data
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ── App Bar ── */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }} elevation={0}>
        <Toolbar variant="dense" sx={{ gap: 1.5 }}>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setMobileNavOpen(true)}><MenuIcon /></IconButton>
          )}
          {/* PlantPulse AI Logo */}
          <Box component="img" src="/plantpulse-logo.svg" alt="PlantPulse AI" sx={{ height: 28, width: 28, mr: 0.5 }} />
          <Typography variant="h6" noWrap sx={{ mr: 1.5, color: 'primary.main', fontWeight: 700, letterSpacing: '-0.02em' }}>
            PlantPulse AI
          </Typography>
          {/* Facility */}
          <Select size="small" value={currentFacilityId} onChange={(e) => setFacility(e.target.value as string)}
            sx={{ minWidth: 170, fontSize: '0.8rem' }}>
            {facilities.map((f) => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
          </Select>

          {/* Time range */}
          <Select size="small" value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}
            sx={{ minWidth: 90, fontSize: '0.8rem' }}>
            {['1h', '8h', '24h', '7d', 'custom'].map((t) => <MenuItem key={t} value={t}>{t === 'custom' ? 'Custom' : `Last ${t}`}</MenuItem>)}
          </Select>

          {/* Search */}
          <TextField size="small" placeholder="Search…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 180 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />

          <Box sx={{ flex: 1 }} />

          {/* User selector */}
          <Select size="small" value={currentUserId} onChange={(e) => setCurrentUser(e.target.value as string)}
            sx={{ minWidth: 150, fontSize: '0.8rem' }}>
            {users.map((u) => <MenuItem key={u.id} value={u.id}>{u.name} ({u.role})</MenuItem>)}
          </Select>

          {/* Notifications */}
          <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)}>
            <Badge badgeContent={unreadCount} color="error"><NotifIcon /></Badge>
          </IconButton>
          <Popover open={!!notifAnchor} anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Box sx={{ width: 320, maxHeight: 360, overflow: 'auto' }}>
              <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 0.5 }}>Notifications</Typography>
              <List dense>
                {notifications.map((n) => (
                  <ListItem key={n.id} sx={{ opacity: n.read ? 0.6 : 1 }}>
                    <ListItemText primary={n.title} primaryTypographyProps={{ fontSize: '0.8rem' }} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Popover>

          {/* AI toggle (non-desktop) */}
          {!isDesktop && (
            <IconButton color="primary" onClick={() => setAiOpen(!aiOpen)}><AiIcon /></IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* ── Mobile nav drawer ── */}
      <Drawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} sx={{ '& .MuiDrawer-paper': { top: 48, width: NAV_WIDTH } }}>
        {navContent}
      </Drawer>

      {/* ── Main layout ── */}
      <Box sx={{ display: 'flex', mt: '48px', flex: 1 }}>
        {/* Left nav (desktop) */}
        {isDesktop && (
          <Box sx={{ width: NAV_WIDTH, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            {navContent}
          </Box>
        )}

        {/* Content area */}
        <Box sx={{ flex: 1, display: 'flex', minWidth: 0, height: 'calc(100vh - 48px)' }}>
          {/* Main content — 2/3 */}
          <Box sx={{ flex: '1 1 0%', overflow: 'auto', p: 2 }}>
            <Outlet />
          </Box>
          {/* Desktop AI panel — 1/3 */}
          {isDesktop && (
            <Box sx={{
              width: '33.33%', maxWidth: 460, minWidth: 340, flexShrink: 0,
              overflow: 'auto',
              borderLeft: '1px solid', borderColor: 'divider',
              bgcolor: '#DDD9D3',
            }}>
              <AIPanel />
            </Box>
          )}
        </Box>
      </Box>

      {/* Tablet/mobile AI drawer */}
      {!isDesktop && (
        <Drawer anchor={isTablet ? 'right' : 'bottom'} open={aiOpen} onClose={() => setAiOpen(false)}
          sx={{ '& .MuiDrawer-paper': { bgcolor: '#DDD9D3', ...(isTablet ? { width: AI_WIDTH, top: 48 } : { height: '70vh' }) } }}>
          <AIPanel />
        </Drawer>
      )}
    </Box>
  );
}
