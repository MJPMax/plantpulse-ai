import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import { useStore } from '../app/store';
import { computeScoreboard } from '../app/scoreboardData';
import type { ScoreboardCategory } from '../app/scoreboardData';

/* ── Pixel-art SVG icons (16×16 grid, monochrome) ── */

const PixelClipboard = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: 'crispEdges' }}>
    <rect x="3" y="1" width="10" height="2" fill="#2D2D2D" />
    <rect x="2" y="3" width="12" height="12" fill="#2D2D2D" />
    <rect x="3" y="4" width="10" height="10" fill="#F5F3F0" />
    <rect x="5" y="6" width="6" height="1" fill="#2D2D2D" />
    <rect x="5" y="8" width="6" height="1" fill="#2D2D2D" />
    <rect x="5" y="10" width="4" height="1" fill="#2D2D2D" />
    <rect x="6" y="0" width="4" height="2" fill="#2D2D2D" />
  </svg>
);

const PixelWrench = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: 'crispEdges' }}>
    <rect x="10" y="1" width="2" height="2" fill="#2D2D2D" />
    <rect x="12" y="1" width="2" height="2" fill="#2D2D2D" />
    <rect x="12" y="3" width="2" height="2" fill="#2D2D2D" />
    <rect x="10" y="5" width="2" height="2" fill="#2D2D2D" />
    <rect x="8" y="7" width="2" height="2" fill="#2D2D2D" />
    <rect x="6" y="9" width="2" height="2" fill="#2D2D2D" />
    <rect x="4" y="11" width="2" height="2" fill="#2D2D2D" />
    <rect x="2" y="13" width="2" height="2" fill="#2D2D2D" />
    <rect x="1" y="12" width="2" height="2" fill="#2D2D2D" />
    <rect x="3" y="10" width="2" height="2" fill="#2D2D2D" />
    <rect x="14" y="2" width="1" height="2" fill="#2D2D2D" />
  </svg>
);

const PixelBolt = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: 'crispEdges' }}>
    <rect x="8" y="0" width="2" height="2" fill="#2D2D2D" />
    <rect x="7" y="2" width="2" height="2" fill="#2D2D2D" />
    <rect x="6" y="4" width="2" height="2" fill="#2D2D2D" />
    <rect x="4" y="6" width="6" height="2" fill="#2D2D2D" />
    <rect x="8" y="8" width="2" height="2" fill="#2D2D2D" />
    <rect x="7" y="10" width="2" height="2" fill="#2D2D2D" />
    <rect x="6" y="12" width="2" height="2" fill="#2D2D2D" />
    <rect x="5" y="14" width="2" height="2" fill="#2D2D2D" />
  </svg>
);

const PixelTerminal = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: 'crispEdges' }}>
    <rect x="1" y="2" width="14" height="12" fill="#2D2D2D" />
    <rect x="2" y="3" width="12" height="10" fill="#F5F3F0" />
    <rect x="3" y="5" width="2" height="2" fill="#2D2D2D" />
    <rect x="5" y="7" width="2" height="2" fill="#2D2D2D" />
    <rect x="8" y="9" width="4" height="1" fill="#2D2D2D" />
    <rect x="3" y="9" width="2" height="1" fill="#2D2D2D" />
  </svg>
);

const ICONS: Record<string, React.ReactNode> = {
  'top-contributor': <PixelClipboard />,
  'action-champion': <PixelWrench />,
  'fastest-responder': <PixelBolt />,
  'bot-whisperer': <PixelTerminal />,
};

function CategoryCard({ cat }: { cat: ScoreboardCategory }) {
  return (
    <Card
      sx={{
        p: 2,
        border: '1px solid #D4D1CC',
        boxShadow: 'none',
        bgcolor: '#F5F3F0',
        minHeight: 200,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        {ICONS[cat.id]}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {cat.title}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        {cat.description}
      </Typography>

      {cat.entries.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No data available.
        </Typography>
      ) : (
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
          <Box component="tbody">
            {cat.entries.map((e, i) => (
              <Box
                key={e.userId}
                component="tr"
                sx={{
                  borderBottom: i < cat.entries.length - 1 ? '1px solid #E8E6E3' : 'none',
                }}
              >
                <Box
                  component="td"
                  sx={{
                    py: 0.75,
                    pr: 1,
                    width: 24,
                    fontWeight: 600,
                    color: i === 0 ? '#2D2D2D' : '#6B6B6B',
                    fontSize: '0.8rem',
                  }}
                >
                  {i + 1}
                </Box>
                <Box
                  component="td"
                  sx={{
                    py: 0.75,
                    fontSize: '0.8rem',
                    color: '#2D2D2D',
                    fontWeight: i === 0 ? 600 : 400,
                  }}
                >
                  {e.userName}
                </Box>
                <Box
                  component="td"
                  sx={{
                    py: 0.75,
                    textAlign: 'right',
                    fontSize: '0.75rem',
                    color: '#6B6B6B',
                    fontFamily: '"IBM Plex Mono", monospace',
                  }}
                >
                  {e.scoreLabel}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Card>
  );
}

export default function Scoreboard() {
  const anomalies = useStore((s) => s.anomalies);
  const actions = useStore((s) => s.actions);
  const users = useStore((s) => s.users);

  const categories = useMemo(
    () => computeScoreboard(anomalies, actions, users),
    [anomalies, actions, users],
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Scoreboard</Typography>
        <Chip label="This Month" size="small" variant="outlined" sx={{ color: '#6B6B6B', borderColor: '#D4D1CC' }} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        {categories.map((cat) => (
          <CategoryCard key={cat.id} cat={cat} />
        ))}
      </Box>
    </Box>
  );
}
