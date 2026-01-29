import { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, TextField, IconButton, Chip, Button, Paper,
  Select, MenuItem, Card, CardContent, CardActions, Divider, Stack,
} from '@mui/material';
import {
  Send as SendIcon, Mic as MicIcon, Stop as StopIcon,
  Lightbulb as SuggestIcon, Close as CloseIcon,
} from '@mui/icons-material';
import { useStore } from '../../app/store';
import { useLocation } from 'react-router-dom';

const CANNED_RESPONSES: Record<string, string> = {
  'daily briefing': `**Daily Briefing — Crushton Oilseed Plant**\n\n• **Critical**: Throughput dropped 12% on Main Press (ano-1). 1/2 confirmations. Actions in progress.\n• **High**: Steam consumption spiked to 348 kg/T (ano-2). Needs triage.\n• **High**: Meal residual oil at 1.4% (ano-5). Mitigation underway — DT temp increased.\n• KPIs: Throughput 46 T/h (↓8%), Extraction Efficiency 93% (↓2%), Steam 312 kg/T (↑5%).\n\nRecommendation: Prioritize throughput anomaly confirmation and steam investigation.`,
  'explain drivers': `The throughput drop is driven by:\n1. **Main Press feed rate** decreased ~12% (met-1)\n2. **Hexane loss** increasing, suggesting solvent system back-pressure\n3. Possible root cause: bearing wear causing press slowdown\n\nCorrelation confidence: 0.87`,
  'draft comment': `Suggested comment:\n\n"Throughput decline correlates with elevated press vibration detected at 06:15. Hexane loss trend suggests possible solvent system back-pressure. Recommend bearing inspection and feed rate controller check."`,
  'assign actions': `I recommend the following actions:\n1. **Inspect** Main Press bearings → Maintenance (High priority)\n2. **Calibrate** feed rate controller → Instrumentation (High priority)\n3. **Inspect** solvent return line pressure → Operations (Medium priority)`,
  'generate resolution': `**Resolution Summary Draft:**\n\nRoot Cause: Equipment — Main Press bearing wear caused throughput reduction.\nCorrective Actions: Replaced bearings on press shaft, recalibrated feed rate controller.\nPreventive Actions: Added press bearings to monthly inspection schedule.\nVerification: Throughput metric stable above 48 T/h for 8 hours post-repair.`,
  default: `I've analyzed the current plant data. Here are my observations:\n\n• 3 active anomalies requiring attention\n• Throughput and extraction efficiency are below target\n• Steam consumption trending upward\n\nWould you like me to drill into any specific area?`,
};

const SAMPLE_UTTERANCES = [
  'Assign inspection to maintenance for throughput anomaly',
  'Add comment: bearing vibration looks elevated',
  'Change status of anomaly 1 to Under Review',
  'Give me a daily briefing',
  'Explain the throughput drivers',
];

const INTENT_PATTERNS: { pattern: RegExp; intent: string; description: string }[] = [
  { pattern: /assign|action|task/i, intent: 'assign_action', description: 'Assign action to a team' },
  { pattern: /comment|note/i, intent: 'add_comment', description: 'Add comment to anomaly' },
  { pattern: /status|change.*to|move.*to/i, intent: 'change_status', description: 'Change anomaly status' },
];

export default function AIPanel() {
  const { chatMessages, addChatMessage, clearChat, currentFacilityId, facilities, timeRange } = useStore();
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [proposal, setProposal] = useState<{ intent: string; description: string; text: string } | null>(null);
  const [selectedUtterance, setSelectedUtterance] = useState(SAMPLE_UTTERANCES[0]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const facility = facilities.find((f) => f.id === currentFacilityId);

  const getContextLabel = () => {
    if (location.pathname.startsWith('/anomalies/')) return 'Anomaly Detail';
    if (location.pathname.startsWith('/metrics/')) return 'Metric Detail';
    if (location.pathname === '/anomalies') return 'Anomalies List';
    if (location.pathname === '/actions') return 'Actions';
    return 'Overview';
  };

  const respond = (userText: string) => {
    addChatMessage({ role: 'user', text: userText });
    const key = Object.keys(CANNED_RESPONSES).find((k) => userText.toLowerCase().includes(k));
    setTimeout(() => {
      addChatMessage({ role: 'ai', text: CANNED_RESPONSES[key ?? 'default'] });
    }, 500);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    respond(input.trim());
    setInput('');
  };

  const handleVoice = () => {
    if (listening) {
      setListening(false);
      const text = selectedUtterance;
      setVoiceText(text);
      // Detect intent
      const match = INTENT_PATTERNS.find((p) => p.pattern.test(text));
      if (match) {
        setProposal({ intent: match.intent, description: match.description, text });
      } else {
        respond(text);
        setVoiceText('');
      }
    } else {
      setListening(true);
      setVoiceText('');
      setProposal(null);
    }
  };

  const confirmProposal = () => {
    if (!proposal) return;
    addChatMessage({ role: 'user', text: `🎤 "${proposal.text}"` });
    addChatMessage({ role: 'ai', text: `✅ Confirmed: ${proposal.description}.\n\n(In production, this would execute the ${proposal.intent} action.)` });
    setProposal(null);
    setVoiceText('');
  };

  const rejectProposal = () => { setProposal(null); setVoiceText(''); };

  const suggestedPrompts = [
    { label: 'Daily briefing', key: 'daily briefing' },
    { label: 'Explain drivers', key: 'explain drivers' },
    { label: 'Draft comment', key: 'draft comment' },
    { label: 'Assign actions', key: 'assign actions' },
    { label: 'Resolution summary', key: 'generate resolution' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>PlantPulse AI Copilot</Typography>

      {/* Context chips */}
      <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
        <Chip label={facility?.name ?? 'Facility'} size="small" variant="outlined" />
        <Chip label={`Last ${timeRange}`} size="small" variant="outlined" />
        <Chip label={getContextLabel()} size="small" color="primary" />
      </Stack>

      {/* Suggested buttons */}
      <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
        {suggestedPrompts.map((p) => (
          <Button key={p.key} size="small" variant="outlined" startIcon={<SuggestIcon />}
            onClick={() => respond(p.label)} sx={{ fontSize: '0.7rem', py: 0.25 }}>
            {p.label}
          </Button>
        ))}
      </Stack>

      <Divider sx={{ mb: 1 }} />

      {/* Chat messages */}
      <Box sx={{ flex: 1, overflow: 'auto', mb: 1, minHeight: 100 }}>
        {chatMessages.length === 0 && (
          <Typography variant="body2" sx={{ opacity: 0.5, textAlign: 'center', mt: 4 }}>
            Ask the AI copilot anything about your plant data.
          </Typography>
        )}
        {chatMessages.map((msg) => (
          <Box key={msg.id} sx={{ mb: 1, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <Paper sx={{
              px: 1.5, py: 1, maxWidth: '90%',
              bgcolor: msg.role === 'user' ? '#EDE8E0' : '#F5F3EF',
              borderRadius: 2,
            }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: 'text.primary' }}>
                {msg.text}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={bottomRef} />
      </Box>

      {/* Proposal card */}
      {proposal && (
        <Card sx={{ mb: 1, border: '1px solid', borderColor: 'warning.main' }}>
          <CardContent sx={{ pb: 0.5 }}>
            <Typography variant="subtitle2" color="warning.main">Proposed Change</Typography>
            <Typography variant="body2">{proposal.description}</Typography>
            <Typography variant="caption" color="text.secondary">"{proposal.text}"</Typography>
          </CardContent>
          <CardActions>
            <Button size="small" variant="contained" color="warning" onClick={confirmProposal}>Confirm</Button>
            <Button size="small" onClick={rejectProposal}>Reject</Button>
          </CardActions>
        </Card>
      )}

      {/* Voice section */}
      <Box sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton color={listening ? 'error' : 'primary'} onClick={handleVoice}
            sx={{ border: '1px solid', borderColor: listening ? 'error.main' : 'primary.main' }}>
            {listening ? <StopIcon /> : <MicIcon />}
          </IconButton>
          {listening && <Typography variant="body2" color="error">Listening…</Typography>}
          {voiceText && !listening && <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>"{voiceText}"</Typography>}
          <Select size="small" value={selectedUtterance} onChange={(e) => setSelectedUtterance(e.target.value as string)}
            sx={{ fontSize: '0.7rem', flex: 1, minWidth: 0 }}>
            {SAMPLE_UTTERANCES.map((u) => <MenuItem key={u} value={u} sx={{ fontSize: '0.75rem' }}>{u}</MenuItem>)}
          </Select>
        </Stack>
      </Box>

      {/* Text input */}
      <Stack direction="row" spacing={1}>
        <TextField size="small" fullWidth placeholder="Ask AI…" value={input}
          onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
        <IconButton color="primary" onClick={handleSend}><SendIcon /></IconButton>
        {chatMessages.length > 0 && <IconButton size="small" onClick={clearChat}><CloseIcon fontSize="small" /></IconButton>}
      </Stack>
    </Box>
  );
}
