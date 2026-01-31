import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { useStore } from '../app/store';
import { computeUserScoreboard, computeFacilityScoreboard } from '../app/scoreboardData';
import type { ScoreboardCategory } from '../app/scoreboardData';

/* ═══════════════════════════════════════════════════════
   PIXEL-ART SVG ICONS  (24×24 viewBox, monochrome + accent)
   ═══════════════════════════════════════════════════════ */

const px = { shapeRendering: 'crispEdges' as const };

const PixelClipboard = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={px}>
    <rect x="6" y="2" width="12" height="3" fill="#6B4F3A" />
    <rect x="9" y="0" width="6" height="3" fill="#6B4F3A" />
    <rect x="4" y="5" width="16" height="17" fill="#6B4F3A" />
    <rect x="5" y="6" width="14" height="15" fill="#F5F3F0" />
    <rect x="7" y="9" width="10" height="2" fill="#8B6E55" />
    <rect x="7" y="13" width="10" height="2" fill="#8B6E55" />
    <rect x="7" y="17" width="6" height="2" fill="#8B6E55" />
  </svg>
);

const PixelWrench = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={px}>
    <rect x="15" y="1" width="4" height="3" fill="#6B4F3A" />
    <rect x="19" y="1" width="3" height="3" fill="#6B4F3A" />
    <rect x="19" y="4" width="3" height="3" fill="#6B4F3A" />
    <rect x="17" y="7" width="3" height="3" fill="#6B4F3A" />
    <rect x="14" y="10" width="3" height="3" fill="#6B4F3A" />
    <rect x="11" y="13" width="3" height="3" fill="#6B4F3A" />
    <rect x="8" y="16" width="3" height="3" fill="#6B4F3A" />
    <rect x="5" y="19" width="3" height="3" fill="#6B4F3A" />
    <rect x="2" y="19" width="3" height="3" fill="#6B4F3A" />
    <rect x="2" y="16" width="3" height="3" fill="#8B6E55" />
    <rect x="5" y="16" width="3" height="3" fill="#8B6E55" />
  </svg>
);

const PixelBolt = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={px}>
    <rect x="12" y="0" width="4" height="3" fill="#C47A20" />
    <rect x="10" y="3" width="4" height="3" fill="#C47A20" />
    <rect x="8" y="6" width="4" height="3" fill="#C47A20" />
    <rect x="6" y="9" width="10" height="3" fill="#6B4F3A" />
    <rect x="12" y="12" width="4" height="3" fill="#C47A20" />
    <rect x="10" y="15" width="4" height="3" fill="#C47A20" />
    <rect x="8" y="18" width="4" height="3" fill="#C47A20" />
    <rect x="6" y="21" width="4" height="3" fill="#C47A20" />
  </svg>
);

const PixelTerminal = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={px}>
    <rect x="1" y="3" width="22" height="18" fill="#6B4F3A" />
    <rect x="2" y="4" width="20" height="16" fill="#F5F3F0" />
    <rect x="4" y="7" width="3" height="3" fill="#3A7D44" />
    <rect x="7" y="10" width="3" height="3" fill="#3A7D44" />
    <rect x="4" y="13" width="3" height="3" fill="#3A7D44" />
    <rect x="12" y="14" width="6" height="2" fill="#8B6E55" />
  </svg>
);

const PixelFactory = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={px}>
    <rect x="1" y="18" width="22" height="4" fill="#6B4F3A" />
    <rect x="2" y="10" width="6" height="8" fill="#8B6E55" />
    <rect x="10" y="12" width="6" height="6" fill="#8B6E55" />
    <rect x="18" y="8" width="4" height="10" fill="#8B6E55" />
    <rect x="3" y="4" width="4" height="6" fill="#6B4F3A" />
    <rect x="4" y="1" width="2" height="3" fill="#6B6B6B" />
    <rect x="19" y="3" width="2" height="5" fill="#6B6B6B" />
  </svg>
);

/* ── Medal pixel-art icons ── */

const MedalGold = () => (
  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" style={px}>
    <rect x="6" y="0" width="4" height="2" fill="#C47A20" />
    <rect x="5" y="2" width="6" height="2" fill="#C47A20" />
    <rect x="4" y="4" width="8" height="2" fill="#D4A030" />
    <rect x="3" y="6" width="10" height="4" fill="#D4A030" />
    <rect x="4" y="10" width="8" height="2" fill="#D4A030" />
    <rect x="5" y="12" width="6" height="2" fill="#C47A20" />
    <rect x="6" y="8" width="4" height="2" fill="#E8C860" />
  </svg>
);

const MedalSilver = () => (
  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" style={px}>
    <rect x="6" y="0" width="4" height="2" fill="#8B8B8B" />
    <rect x="5" y="2" width="6" height="2" fill="#8B8B8B" />
    <rect x="4" y="4" width="8" height="2" fill="#A8A8A8" />
    <rect x="3" y="6" width="10" height="4" fill="#A8A8A8" />
    <rect x="4" y="10" width="8" height="2" fill="#A8A8A8" />
    <rect x="5" y="12" width="6" height="2" fill="#8B8B8B" />
    <rect x="6" y="8" width="4" height="2" fill="#C8C8C8" />
  </svg>
);

const MedalBronze = () => (
  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" style={px}>
    <rect x="6" y="0" width="4" height="2" fill="#8B5E3C" />
    <rect x="5" y="2" width="6" height="2" fill="#8B5E3C" />
    <rect x="4" y="4" width="8" height="2" fill="#A87045" />
    <rect x="3" y="6" width="10" height="4" fill="#A87045" />
    <rect x="4" y="10" width="8" height="2" fill="#A87045" />
    <rect x="5" y="12" width="6" height="2" fill="#8B5E3C" />
    <rect x="6" y="8" width="4" height="2" fill="#C48A60" />
  </svg>
);

function getMedal(rank: number) {
  if (rank === 0) return <MedalGold />;
  if (rank === 1) return <MedalSilver />;
  if (rank === 2) return <MedalBronze />;
  return null;
}

function getRankColor(rank: number) {
  if (rank === 0) return '#C47A20';
  if (rank === 1) return '#8B8B8B';
  if (rank === 2) return '#A87045';
  return '#6B6B6B';
}

const ICONS: Record<string, React.ReactNode> = {
  'top-contributor': <PixelClipboard />,
  'action-champion': <PixelWrench />,
  'fastest-responder': <PixelBolt />,
  'bot-whisperer': <PixelTerminal />,
  'fac-top-contributor': <PixelClipboard />,
  'fac-action-champion': <PixelWrench />,
  'fac-fastest-responder': <PixelBolt />,
  'fac-bot-whisperer': <PixelTerminal />,
};

/* ── Score bar (visual progress indicator) ── */
function ScoreBar({ pct, color }: { pct: number; color: string }) {
  return (
    <Box sx={{ width: 60, height: 6, bgcolor: '#E8E6E3', borderRadius: '2px', overflow: 'hidden', ml: 1 }}>
      <Box sx={{ width: `${Math.min(pct, 100)}%`, height: '100%', bgcolor: color, transition: 'width 0.4s' }} />
    </Box>
  );
}

function CategoryCard({ cat, showFactory }: { cat: ScoreboardCategory; showFactory?: boolean }) {
  const maxScore = cat.entries.length > 0
    ? (cat.lowerIsBetter ? cat.entries[cat.entries.length - 1].score : cat.entries[0].score)
    : 1;

  return (
    <Card
      sx={{
        p: 2.5,
        border: '1px solid #D4D1CC',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        bgcolor: '#F5F3F0',
        minHeight: 220,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        {showFactory ? <PixelFactory /> : ICONS[cat.id]}
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.02em' }}>
          {cat.title}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, lineHeight: 1.4 }}>
        {cat.description}
      </Typography>

      {cat.entries.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No data available.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {cat.entries.map((e, i) => {
            const pct = cat.lowerIsBetter
              ? (maxScore > 0 ? ((maxScore - e.score) / maxScore) * 100 + 20 : 50)
              : (maxScore > 0 ? (e.score / maxScore) * 100 : 0);
            const medal = getMedal(i);
            const rankColor = getRankColor(i);
            return (
              <Box
                key={e.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 1,
                  px: 1.5,
                  borderRadius: '4px',
                  bgcolor: i === 0 ? 'rgba(196, 122, 32, 0.06)' : 'transparent',
                  border: i === 0 ? '1px solid rgba(196, 122, 32, 0.15)' : '1px solid transparent',
                  transition: 'background 0.2s',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
                }}
              >
                {/* Medal or rank number */}
                <Box sx={{ width: 28, display: 'flex', justifyContent: 'center', mr: 1, flexShrink: 0 }}>
                  {medal ?? (
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B6B6B' }}>
                      {i + 1}
                    </Typography>
                  )}
                </Box>

                {/* Name */}
                <Typography
                  sx={{
                    flex: 1,
                    fontSize: '0.82rem',
                    fontWeight: i === 0 ? 700 : i < 3 ? 600 : 400,
                    color: i < 3 ? rankColor : '#6B6B6B',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {e.name}
                </Typography>

                {/* Score bar */}
                <ScoreBar pct={pct} color={rankColor} />

                {/* Score label */}
                <Typography
                  sx={{
                    ml: 1.5,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: rankColor,
                    fontFamily: '"IBM Plex Mono", monospace',
                    minWidth: 65,
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {e.scoreLabel}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */

export default function Scoreboard() {
  const anomalies = useStore((s) => s.anomalies);
  const actions = useStore((s) => s.actions);
  const users = useStore((s) => s.users);
  const facilities = useStore((s) => s.facilities);

  const userCategories = useMemo(
    () => computeUserScoreboard(anomalies, actions, users),
    [anomalies, actions, users],
  );
  const facilityCategories = useMemo(
    () => computeFacilityScoreboard(anomalies, actions, facilities),
    [anomalies, actions, facilities],
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Scoreboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <MedalGold /><MedalSilver /><MedalBronze />
          </Box>
        </Box>
        <Chip
          label="This Month"
          size="small"
          variant="outlined"
          sx={{ color: '#6B6B6B', borderColor: '#D4D1CC', fontWeight: 600 }}
        />
      </Box>

      {/* ── Operators section ── */}
      <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B4F3A', mb: 1.5 }}>
        Individual
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 4,
        }}
      >
        {userCategories.map((cat) => (
          <CategoryCard key={cat.id} cat={cat} />
        ))}
      </Box>

      <Divider sx={{ mb: 3, borderColor: '#D4D1CC' }} />

      {/* ── Plants section ── */}
      <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B4F3A', mb: 1.5 }}>
        Plants
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        {facilityCategories.map((cat) => (
          <CategoryCard key={cat.id} cat={cat} showFactory />
        ))}
      </Box>
    </Box>
  );
}
