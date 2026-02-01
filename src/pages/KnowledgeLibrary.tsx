import { useState, useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Stack, Chip, Button,
  Select, MenuItem, FormControl, InputLabel, IconButton, Collapse,
  Table, TableBody, TableRow, TableCell, TableHead, TableContainer, Divider,
} from '@mui/material';
import {
  Upload as UploadIcon, ExpandMore as ExpandIcon,
  Archive as ArchiveIcon, Delete as DeleteIcon,
  MenuBook as ScenarioIcon,
} from '@mui/icons-material';
import { useStore } from '../app/store';
import { fmtTs } from '../app/utils';
import UploadKnowledgeDialog from '../components/dialogs/UploadKnowledgeDialog';
import type { KnowledgeFileStatus } from '../app/types';

export default function KnowledgeLibrary() {
  const { knowledgeFiles, knowledgeScenarios, currentFacilityId, archiveKnowledgeFile, deleteKnowledgeFile } = useStore();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [areaFilter, setAreaFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<KnowledgeFileStatus | 'All'>('All');
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  // Statistics computation
  const stats = useMemo(() => {
    const activeFiles = knowledgeFiles.filter((f) => f.facilityId === currentFacilityId && f.status === 'Active');
    const totalScenarios = activeFiles.reduce((sum, f) => sum + f.scenarioCount, 0);
    const areas = new Set(activeFiles.map((f) => f.area));
    const recentUploads = knowledgeFiles.filter((f) => f.uploadedAt > Date.now() - 30 * 24 * 3600_000).length;

    return {
      totalFiles: activeFiles.length,
      totalScenarios,
      areasCount: areas.size,
      recentUploads,
    };
  }, [knowledgeFiles, currentFacilityId]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    let files = knowledgeFiles.filter((f) => f.facilityId === currentFacilityId);
    if (areaFilter !== 'All') files = files.filter((f) => f.area === areaFilter);
    if (statusFilter !== 'All') files = files.filter((f) => f.status === statusFilter);
    return files.sort((a, b) => b.uploadedAt - a.uploadedAt);
  }, [knowledgeFiles, currentFacilityId, areaFilter, statusFilter]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Knowledge Library</Typography>
        <Button variant="contained" startIcon={<UploadIcon />} onClick={() => setUploadOpen(true)}>
          Upload Knowledge
        </Button>
      </Stack>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>{stats.totalFiles}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Active Files</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>{stats.totalScenarios}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Scenarios</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>{stats.areasCount}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Areas Covered</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>{stats.recentUploads}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Recent (30d)</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Area</InputLabel>
          <Select value={areaFilter} label="Area" onChange={(e) => setAreaFilter(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Extraction">Extraction</MenuItem>
            <MenuItem value="Preparation">Preparation</MenuItem>
            <MenuItem value="Utilities">Utilities</MenuItem>
            <MenuItem value="Refining">Refining</MenuItem>
            <MenuItem value="Quality">Quality</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as any)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Archived">Archived</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* File List */}
      <Stack spacing={1.5}>
        {filteredFiles.map((file) => {
          const isExpanded = expandedFile === file.id;
          const fileScenarios = knowledgeScenarios.filter((sc) => sc.fileId === file.id);

          return (
            <Card key={file.id} variant="outlined">
              <CardContent sx={{ pb: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <ScenarioIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600, fontSize: '0.9rem' }}>
                    {file.fileName}
                  </Typography>
                  <Chip
                    label={file.status}
                    size="small"
                    color={file.status === 'Active' ? 'success' : 'default'}
                    sx={{ fontSize: '0.65rem', height: 20 }}
                  />
                  <Chip
                    label={`${file.scenarioCount} scenarios`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.65rem', height: 20 }}
                  />
                  <IconButton size="small" onClick={() => setExpandedFile(isExpanded ? null : file.id)}>
                    <ExpandIcon
                      sx={{
                        transform: isExpanded ? 'rotate(180deg)' : 'none',
                        transition: '0.2s',
                        fontSize: '1.2rem',
                      }}
                    />
                  </IconButton>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.75rem' }}>
                  {file.area} · Uploaded by {file.uploadedBy} · {fmtTs(file.uploadedAt)}
                </Typography>

                {file.notes && (
                  <Typography variant="body2" sx={{ fontSize: '0.78rem', mb: 1, color: '#6B6B6B' }}>
                    {file.notes}
                  </Typography>
                )}

                <Stack direction="row" spacing={0.5}>
                  {file.status === 'Active' && (
                    <Button size="small" onClick={() => archiveKnowledgeFile(file.id)} startIcon={<ArchiveIcon />}
                      sx={{ fontSize: '0.7rem', py: 0.25 }}>
                      Archive
                    </Button>
                  )}
                  <Button size="small" color="error" onClick={() => deleteKnowledgeFile(file.id)} startIcon={<DeleteIcon />}
                    sx={{ fontSize: '0.7rem', py: 0.25 }}>
                    Delete
                  </Button>
                </Stack>

                {/* Scenarios Table */}
                <Collapse in={isExpanded} unmountOnExit>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.85rem' }}>
                    Scenarios ({fileScenarios.length})
                  </Typography>
                  <TableContainer sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Productivity Metric</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Contributor Deviation</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Cause Type</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Impact</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Recommendation</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fileScenarios.map((sc) => (
                          <TableRow key={sc.id} hover>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{sc.productivityMetric}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>
                              {sc.contributorDeviation}
                              <Typography component="span" variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                                ({sc.deviationDirection})
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{sc.causeType}</TableCell>
                            <TableCell>
                              <Chip
                                label={sc.impactImportance.split(' - ')[0]}
                                size="small"
                                color={
                                  sc.impactImportance.startsWith('Critical') ? 'error' :
                                  sc.impactImportance.startsWith('High') ? 'warning' : 'default'
                                }
                                sx={{ fontSize: '0.65rem', height: 18 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.72rem', maxWidth: 300 }}>
                              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                <strong>Cause:</strong> {sc.potentialCause}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                <strong>Action:</strong> {sc.followUpRecommendation}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </CardContent>
            </Card>
          );
        })}

        {filteredFiles.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No knowledge files found. Click "Upload Knowledge" to add diagnostic scenarios.
          </Typography>
        )}
      </Stack>

      <UploadKnowledgeDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </Box>
  );
}
