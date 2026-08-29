import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import SyncIcon from '@mui/icons-material/Sync';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import {
  useWhatsAppConversations,
  useWhatsAppInboxMutation,
  useWhatsAppInboxStatus,
  useWhatsAppMessages,
} from '../../hooks/queries/useWhatsAppInbox';

const WA_BG = '#efeae2';
const WA_HEADER = '#008069';
const WA_PANEL = '#ffffff';
const WA_SENT = '#d9fdd3';
const WA_RECEIVED = '#ffffff';
const WA_LIST_HOVER = '#f5f6f6';
const WA_ACTIVE = '#f0f2f5';

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

const displayName = (conversation) =>
  conversation?.contact_name ||
  conversation?.enquiry?.customer_name ||
  conversation?.phone_number ||
  'Unknown';

const initials = (name) => {
  const parts = String(name || '?').trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '?';
};

function ChatListItem({ conversation, active, onClick }) {
  const name = displayName(conversation);
  const unread = Number(conversation?.unread_count || 0);

  return (
    <Box
      onClick={onClick}
      sx={{
        px: 2,
        py: 1.5,
        display: 'flex',
        gap: 1.5,
        cursor: 'pointer',
        bgcolor: active ? WA_ACTIVE : WA_PANEL,
        '&:hover': { bgcolor: active ? WA_ACTIVE : WA_LIST_HOVER },
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Avatar src={conversation?.profile_image_url || undefined} sx={{ width: 48, height: 48, bgcolor: '#dfe5e7', color: '#54656f' }}>
        {initials(name)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography noWrap fontWeight={700} fontSize={15} color="#111b21">
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            {formatTime(conversation?.last_message_at)}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography noWrap variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            {conversation?.last_message_preview || conversation?.phone_number || 'Start chatting'}
          </Typography>
          {unread > 0 && (
            <Box
              sx={{
                minWidth: 20,
                height: 20,
                px: 0.75,
                borderRadius: 999,
                bgcolor: '#25D366',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {unread}
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

function MessageBubble({ message }) {
  const outbound = message.direction === 'outbound';
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: outbound ? 'flex-end' : 'flex-start',
        mb: 1,
        px: { xs: 1.5, md: 3 },
      }}
    >
      <Box
        sx={{
          maxWidth: '72%',
          px: 1.5,
          py: 1,
          borderRadius: 2,
          boxShadow: '0 1px 0.5px rgba(11,20,26,0.13)',
          bgcolor: outbound ? WA_SENT : WA_RECEIVED,
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#111b21' }}>
          {message.body}
        </Typography>
        <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center" sx={{ mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {formatTime(message.sent_at || message.created_at)}
          </Typography>
          {outbound && <DoneAllIcon sx={{ fontSize: 14, color: message.status === 'read' ? '#53bdeb' : '#8696a0' }} />}
        </Stack>
      </Box>
    </Box>
  );
}

export default function WhatsAppInboxPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: status, isLoading: statusLoading } = useWhatsAppInboxStatus();
  const { data: conversationsData, isLoading: listLoading } = useWhatsAppConversations(search, { poll: true });
  const { data: threadData, isLoading: messagesLoading } = useWhatsAppMessages(selectedId, { poll: Boolean(selectedId) });
  const { syncInbox, sendMessage, markRead } = useWhatsAppInboxMutation();

  const conversations = conversationsData?.rows || [];
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) || threadData?.conversation,
    [conversations, selectedId, threadData?.conversation]
  );
  const messages = threadData?.messages || [];

  useEffect(() => {
    if (!selectedId && conversations.length) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    if (status?.connected && !listLoading && conversations.length === 0 && !syncInbox.isPending) {
      syncInbox.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.connected, listLoading]);

  useEffect(() => {
    if (!selectedId) return;
    markRead.mutate(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedId]);

  const handleSelect = (id) => {
    setSelectedId(id);
    if (isMobile) setShowMobileChat(true);
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !selectedId || sendMessage.isPending) return;
    setDraft('');
    await sendMessage.mutateAsync({ conversationId: selectedId, message: text });
  };

  if (statusLoading) return <Loader message="Loading WhatsApp inbox..." />;

  if (!status?.connected) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <WhatsAppIcon sx={{ fontSize: 64, color: '#25D366', mb: 2 }} />
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Connect WhatsApp first
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 420, mx: 'auto' }}>
          Link your WhatsApp number to view and reply to customer chats inside the CRM.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/integrations/whatsapp')} sx={{ bgcolor: '#25D366' }}>
          Go to WhatsApp Integration
        </Button>
      </Box>
    );
  }

  const listPanel = (
    <Box
      sx={{
        width: { xs: '100%', md: 380 },
        flexShrink: 0,
        bgcolor: WA_PANEL,
        borderRight: '1px solid rgba(0,0,0,0.08)',
        display: isMobile && showMobileChat ? 'none' : 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ px: 2, py: 1.5, bgcolor: WA_HEADER, color: '#fff' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <WhatsAppIcon />
            <Box>
              <Typography fontWeight={800} lineHeight={1.2}>
                WhatsApp Inbox
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {status?.linkedPhone || 'Connected'}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row">
            <IconButton size="small" sx={{ color: '#fff' }} onClick={() => syncInbox.mutate()} disabled={syncInbox.isPending}>
              {syncInbox.isPending ? <CircularProgress size={18} color="inherit" /> : <SyncIcon fontSize="small" />}
            </IconButton>
            <IconButton size="small" sx={{ color: '#fff' }} onClick={() => navigate('/integrations/whatsapp')}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search or start new chat"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            sx: { borderRadius: 2, bgcolor: '#f0f2f5' },
          }}
        />
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {listLoading ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress size={28} />
          </Stack>
        ) : conversations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No chats yet. Sync to load contacts and message history from WhatsApp.
            </Typography>
            <Button variant="outlined" startIcon={<SyncIcon />} onClick={() => syncInbox.mutate()}>
              Sync chats
            </Button>
          </Box>
        ) : (
          conversations.map((conversation) => (
            <ChatListItem
              key={conversation.id}
              conversation={conversation}
              active={conversation.id === selectedId}
              onClick={() => handleSelect(conversation.id)}
            />
          ))
        )}
      </Box>
    </Box>
  );

  const chatPanel = (
    <Box
      sx={{
        flex: 1,
        display: isMobile && !showMobileChat ? 'none' : 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100%',
      }}
    >
      {activeConversation ? (
        <>
          <Box sx={{ px: 2, py: 1.25, bgcolor: WA_HEADER, color: '#fff' }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {isMobile && (
                <IconButton size="small" sx={{ color: '#fff' }} onClick={() => setShowMobileChat(false)}>
                  <ArrowBackIcon />
                </IconButton>
              )}
              <Avatar sx={{ width: 40, height: 40, bgcolor: '#dfe5e7', color: '#54656f' }}>
                {initials(displayName(activeConversation))}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} noWrap>
                  {displayName(activeConversation)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {activeConversation.phone_number}
                </Typography>
              </Box>
              {activeConversation.enquiry?.id && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  onClick={() => navigate(`/enquiry/view/${activeConversation.enquiry.id}`)}
                  sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}
                >
                  Enquiry
                </Button>
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              py: 2,
              bgcolor: WA_BG,
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23d1d7db\' fill-opacity=\'0.18\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\'/%3E%3C/g%3E%3C/svg%3E")',
            }}
          >
            {messagesLoading ? (
              <Stack alignItems="center" py={4}>
                <CircularProgress size={28} />
              </Stack>
            ) : messages.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                No messages yet. Send a message below or sync chats from WhatsApp.
              </Typography>
            ) : (
              messages.map((message) => <MessageBubble key={message.id} message={message} />)
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Divider />
          <Box sx={{ p: 1.5, bgcolor: '#f0f2f5' }}>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type a message"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#fff',
                  },
                }}
              />
              <IconButton
                onClick={handleSend}
                disabled={!draft.trim() || sendMessage.isPending}
                sx={{
                  bgcolor: '#25D366',
                  color: '#fff',
                  '&:hover': { bgcolor: '#1ebe57' },
                  '&.Mui-disabled': { bgcolor: '#c8e6c9', color: '#fff' },
                }}
              >
                {sendMessage.isPending ? <CircularProgress size={22} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Stack>
          </Box>
        </>
      ) : (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ flex: 1, bgcolor: '#f8f9fa', textAlign: 'center', px: 3 }}
        >
          <WhatsAppIcon sx={{ fontSize: 80, color: '#dfe5e7', mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="#41525d">
            Tours & Travels WhatsApp
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 420, mt: 1 }}>
            Select a chat to view messages and reply to customers without leaving the CRM.
          </Typography>
          <Button sx={{ mt: 2 }} startIcon={<SyncIcon />} onClick={() => syncInbox.mutate()}>
            Sync chats from WhatsApp
          </Button>
        </Stack>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        height: { xs: 'calc(100vh - 120px)', md: 'calc(100vh - 140px)' },
        minHeight: 520,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        display: 'flex',
        bgcolor: WA_PANEL,
      }}
    >
      {listPanel}
      {chatPanel}
    </Box>
  );
}
