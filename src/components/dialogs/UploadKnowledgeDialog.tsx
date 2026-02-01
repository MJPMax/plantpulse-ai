import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Typography, Box, Alert,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { useStore } from '../../app/store';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UploadKnowledgeDialog({ open, onClose }: Props) {
  const { uploadKnowledgeFile, facilities, currentFacilityId, currentUserId } = useStore();
  const [fileName, setFileName] = useState('');
  const [area, setArea] = useState('Extraction');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const facility = facilities.find((f) => f.id === currentFacilityId);

  const handleFileSelect = () => {
    // Simulate file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) setFileName(file.name);
    };
    input.click();
  };

  const handleSubmit = () => {
    if (!fileName.trim()) return;

    // Generate 20-50 scenarios randomly
    const scenarioCount = Math.floor(Math.random() * 31) + 20;

    uploadKnowledgeFile({
      facilityId: currentFacilityId,
      fileName: fileName.trim(),
      uploadedBy: currentUserId,
      plant: facility?.name ?? 'Unknown',
      area,
      notes: notes.trim(),
      status: 'Active',
    }, scenarioCount);

    setSuccess(`Successfully uploaded! Generated ${scenarioCount} scenarios from ${fileName}.`);
    setTimeout(() => {
      setSuccess(null);
      setFileName('');
      setNotes('');
      onClose();
    }, 2500);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Knowledge File</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
          Upload an Excel or CSV file containing diagnostic scenarios. The system will parse and index scenarios for AI-powered diagnostics.
        </Typography>

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<UploadIcon />}
            onClick={handleFileSelect}
            sx={{ py: 2, mb: 1 }}
          >
            {fileName || 'Select File (.xlsx, .xls, .csv)'}
          </Button>
          {fileName && (
            <Typography variant="caption" color="text.secondary">
              File selected: {fileName}
            </Typography>
          )}
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Area</InputLabel>
          <Select value={area} label="Area" onChange={(e) => setArea(e.target.value)}>
            <MenuItem value="Extraction">Extraction</MenuItem>
            <MenuItem value="Preparation">Preparation</MenuItem>
            <MenuItem value="Utilities">Utilities</MenuItem>
            <MenuItem value="Refining">Refining</MenuItem>
            <MenuItem value="Quality">Quality</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Notes (optional)"
          multiline
          rows={3}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this knowledge file (e.g., source, date range, special considerations)..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!fileName.trim() || !!success}>
          Upload & Process
        </Button>
      </DialogActions>
    </Dialog>
  );
}
