import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Container, Typography, Button, Paper, Grid, Modal, Snackbar, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip, IconButton, Divider, TextField, Link, Switch, FormControlLabel, Stack, FormGroup, Checkbox, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TableFooter, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// --- 导入所有需要的图标 ---
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import PercentIcon from '@mui/icons-material/Percent';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SecurityIcon from '@mui/icons-material/Security';
import CallMissedOutgoingIcon from '@mui/icons-material/CallMissedOutgoing';
import CallMissedIcon from '@mui/icons-material/CallMissed';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { v4 as uuidv4 } from 'uuid';

const TEXTS = {
  title: 'Re-ID Accuracy Analysis Tool',
  selectFolder: 'Select Folder',
  selectFolderTitle: 'Start Your Analysis',
  dragAndDropPrompt: 'or drag and drop a folder here',
  privacyNotice: 'This is a serverless application that runs entirely in your browser. All folder and image processing is done locally on your computer. No data is ever uploaded to any server.',
  dropFolderError: 'Please drop a folder, not a file.',
  preparingToLoad: 'Filtering folders...',
  progressText: (processed, total) => `Processed ${processed} of ${total} folders`,
  processing: 'Processing, please wait...',
  scanningStructure: 'Scanning folder structure...',
  loadingImages: 'Loading image data...',
  totalIdentities: 'Total UUID Folders',
  copyUUID: 'Copy UUID',
  copyTrackID: 'Copy Track ID',
  relatedImages: 'Related Images',
  copied: 'Copied:',
  addNewPerson: 'Add New Person',
  hideStaff: 'Hide Staff',
  showStaff: 'Show Staff',
  done: 'Done',
  cancel: 'Cancel',
  confirm: 'Confirm', // 新增
  hideStaffConfirmTitle: 'Confirm Hide Staff', // 新增
  hideStaffConfirmContent: 'Hiding this folder will exclude it from all accuracy calculations. Recommendation: If this UUID folder corresponds to a staff member with a long duration and many tracklets (due to similar clothing), it is advisable to hide it, provided that your final report has conditions to filter out such long-duration staff entries.', // 新增
  newPerson: 'New Person',
  assigningTo: 'Assigning to',
  edit: 'Edit Assignments',
  editing: 'Editing',
  assignedPeople: 'Assigned People',
  unassignedTracks: 'Unassigned Tracks',
  unassignedTracksNone: 'Unassigned Tracks: None',
  rename: 'Rename Person',
  exportProgress: 'Export Progress',
  importProgress: 'Import Progress',
  importSuccess: 'Progress imported successfully!',
  importError: 'Failed to import file. Please check file format.',
  loadFolderFirst: 'Please select a folder first before importing progress.',
  noProgressToSave: 'There is no progress to save.',
  linkToUUID: 'Link to another Folder/Person UUID',
  enterUUID: 'Enter Folder or Person UUID to link',
  save: 'Save',
  invalidUUIDFormat: 'Invalid UUID format.',
  uuidNotFound: 'This Folder or Person UUID does not exist.',
  cannotLinkToSelf: 'Cannot link to itself or its own parent Folder.',
  linkSuccess: 'Link successful!',
  linkedTo: 'Linked to',
  unlink: 'Unlink',
  incompleteFolders: 'Incomplete Folders',
  allFoldersComplete: 'All folders are complete!',
  generateTemporaryUUID: 'Generate Temporary UUID',
  temporaryUUID: 'Temporary UUID',
  deleteTemporaryUUID: 'Delete Temporary UUID',
  correctUUIDs: 'Correct UUIDs',
  falseNegative: 'False Negative (Merging)',
  falsePositive: 'False Positive (Splitting)',
  closeNavigation: 'Close Navigation',
  reIdAccuracy: 'Re-ID Accuracy',
  toggleTheme: 'Toggle light/dark theme',
  appear: 'Appear',
  disappear: 'Disappear',
  duration: 'Duration',
  hours: 'Hours',
  minutes: 'Minutes',
  filters: 'Filters',
  durationLessThan: 'Duration less than (min)',
  durationMoreThan: 'Duration more than (min)',
  showOnlyFalseNegative: 'False Negative only',
  showOnlyFalsePositive: 'False Positive only',
  reset: 'Reset',
  totalIdentitiesTooltip: 'The total number of unique top-level UUID folders found in the selected directory, excluding hidden staff.',
  incompleteFoldersTooltip: 'The number of folders where not all Track IDs have been assigned to a person, excluding hidden staff.',
  reIdAccuracyTooltip: 'Calculated as (Correct UUIDs / Adjusted Total Folders). Excludes hidden staff. Green: >= 85%, Yellow: 75%-85%, Red: < 75%.',
  correctUUIDsTooltip: 'The number of folders that contain exactly one "Assigned Person" group, and that group is not linked to any other UUID. Excludes hidden staff.',
  falseNegativeTooltip: 'The number of folders that contain more than one "Assigned Person" group, indicating a potential merge is needed. Excludes hidden staff.',
  falsePositiveTooltip: 'The number of folders where at least one person is linked to an external UUID, indicating a potential split is needed. Excludes hidden staff.',
  userManual: 'User Manual',
  userManualTitle: 'User Manual Guide',
  userManualContent: 'For detailed instructions, please log in to the official documentation site and navigate to "Tools -> Re-ID Accuracy Analysis Tool".',
  userManualLinkText: 'Go to www.tdintelligence.wiki',
  close: 'Close',
  adjustTotal: 'Adjust Total Identities',
  missedPeopleLabel: 'Number of people not captured',
  missedPeopleHelper: 'Enter a number to compensate for missed identities in accuracy calculation.',
  selectAll: 'Select All',
  deselectAll: 'Deselect All',
  selectImportMode: 'Select Data Modes to Load',
  proceed: 'Proceed',
  fullStoreTracking: 'Full Store Tracking',
  fullStoreTrackingDesc: 'Loads data from "Appearance_..." folders for time-based analysis.',
  countingOnly: 'Counting Only',
  countingOnlyDesc: 'Loads data from "Counting_..." folders.',
  dwellingOnly: 'Dwelling Only',
  dwellingOnlyDesc: 'Loads data from "Dwelling_..." folders.',
  incompletePhotos: 'Incomplete Photos',
  incompletePhotosDesc: 'Loads data from "Others" folder.',
  currentDataSet: 'Current Data Set',
  datasetFolder: 'Dataset Folder',
  noValidFoldersFound: 'No valid UUID folders containing images were found.',
  noFoldersMatchCriteria: 'No folders found matching the selected criteria.',
  noDatasetFolderFound: 'No dataset folder (e.g., 204224020120_20250703_080000_220000) found.',
  noModesFound: 'No recognizable data folders (Appearance_..., Counting_..., etc.) found within the UUID folders.',
  missingEnterEvents: 'Missing Enter Events',
  missingExitEvents: 'Missing Exit Events',
  missingEnterEventsTooltip: 'Count of folders with at least one Counting event that has an Exit time but no matching Enter time. Excludes hidden staff.',
  missingExitEventsTooltip: 'Count of folders with at least one Counting event that has an Enter time but no matching Exit time. Excludes hidden staff.',
};

const MODE_DEFINITIONS = {
    full_store_tracking: { prefix: 'Appearance_Disappearance', title: 'Appearance Events', startWord: 'Appear', endWord: 'Disappear', shortName: 'Appearance', text: TEXTS.fullStoreTracking, description: TEXTS.fullStoreTrackingDesc },
    counting_only: { prefix: 'Counting_', title: 'Counting Events', startWord: 'Enter', endWord: 'Exit', shortName: 'Counting', text: TEXTS.countingOnly, description: TEXTS.countingOnlyDesc },
    dwelling_only: { prefix: 'Dwelling_', title: 'Dwelling Events', startWord: 'Enter', endWord: 'Exit', shortName: 'Dwelling', text: TEXTS.dwellingOnly, description: TEXTS.dwellingOnlyDesc },
    incomplete_photos: { prefix: 'Others', text: TEXTS.incompletePhotos, description: TEXTS.incompletePhotosDesc },
};

const TrackIDCard = ({ image, sx, onClick, onCopy }) => {
  const handleCopyClick = (e, trackId) => { e.stopPropagation(); onCopy(trackId); };
  return (
    <Box onClick={onClick} sx={{ border: '1px solid #eee', borderRadius: 1, p: 1, height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
      <img src={image.filePath} alt={image.uuid} style={{ width: '100%', height: 'auto', display: 'block', cursor: onClick ? 'pointer' : 'default' }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{image.startTime}</Typography>
        <Tooltip title={TEXTS.copyTrackID}><IconButton onClick={(e) => handleCopyClick(e, image.uuid)} size="small" sx={{ p: 0.1 }}><ContentCopyIcon sx={{ fontSize: '1rem' }} /></IconButton></Tooltip>
      </Box>
    </Box>
  );
};

const StatItem = ({ icon, label, tooltipText, value, valueSx, onClick, onEdit }) => {
  const ValueComponent = onClick ? Link : Box;
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{ mr: 2, color: 'text.secondary' }}>{icon}</Box>
        <Box sx={{ flexGrow: 1 }}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                <Typography variant="body1" color="text.secondary">{label}</Typography>
                <Tooltip title={tooltipText}><InfoOutlinedIcon sx={{fontSize: '1rem', color: 'action.active', cursor: 'help'}}/></Tooltip>
            </Box>
          <ValueComponent component={onClick ? 'button' : 'div'} onClick={onClick} sx={{ fontSize: '1.75rem', fontWeight: 'bold', lineHeight: 1.2, color: 'text.primary', cursor: onClick ? 'pointer' : 'default', textDecoration: 'none', '&:hover': { textDecoration: onClick ? 'underline': 'none' }, ...valueSx }}>{value}</ValueComponent>
        </Box>
        {onEdit && <Tooltip title={TEXTS.adjustTotal}><IconButton onClick={onEdit} size="small"><EditIcon fontSize="small" /></IconButton></Tooltip>}
      </Paper>
    </Grid>
  );
};

const InitialScreen = ({ onFolderSelect, onDrop, onDragOver, onDragLeave, isDragging, disabled }) => {
    return (
        <Box
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: { xs: '60vh', sm: '70vh' },
                border: '3px dashed',
                borderColor: isDragging ? 'primary.main' : 'grey.500',
                borderRadius: 2,
                transition: 'border-color 0.3s, background-color 0.3s',
                backgroundColor: isDragging ? 'action.hover' : 'transparent',
                p: { xs: 2, sm: 4 },
                textAlign: 'center'
            }}
        >
            <CloudUploadIcon sx={{ fontSize: { xs: 60, sm: 80 }, mb: 2, color: 'text.secondary' }} />
            <Typography variant="h5" component="h2" gutterBottom>{TEXTS.selectFolderTitle}</Typography>
            <Button
                variant="contained"
                size="large"
                onClick={onFolderSelect}
                startIcon={<FolderOpenIcon />}
                disabled={disabled}
            >
                {TEXTS.selectFolder}
            </Button>
            <Typography variant="h6" sx={{ color: 'text.secondary', my: 2 }}>{TEXTS.dragAndDropPrompt}</Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 4, maxWidth: '600px', bgcolor: 'action.selected' }}>
                 <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    <SecurityIcon sx={{ fontSize: '1rem', verticalAlign: 'middle', mr: 0.5 }} />
                    {TEXTS.privacyNotice}
                </Typography>
            </Paper>
        </Box>
    );
};

function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} size={60} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}


function AppContent({ onToggleTheme, themeMode }) {
  const objectUrlsRef = useRef([]);
  const fileInputRef = useRef(null);
  const folderRefs = useRef(new Map());
  const datasetFolderHandleRef = useRef(null);

  const [folders, setFolders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(TEXTS.processing);
  const [manualOpen, setManualOpen] = useState(false);
  const [assignmentState, setAssignmentState] = useState({ isActive: false, folderIndex: null, personId: null, isEditing: false });
  const [currentSelection, setCurrentSelection] = useState(new Set());
  const [renamingState, setRenamingState] = useState({ personId: null, currentName: '' });
  const [linkState, setLinkState] = useState({ isOpen: false, personId: null, folderIndex: null, inputValue: '', error: '' });
  const [navigation, setNavigation] = useState({ isActive: false, targets: [], currentIndex: -1 });
  const [missedPeopleCount, setMissedPeopleCount] = useState(0);
  const [isMissedPeopleDialogOpen, setIsMissedPeopleDialogOpen] = useState(false);
  const [missedPeopleInput, setMissedPeopleInput] = useState('0');
  const [rootFolderName, setRootFolderName] = useState('');
  
  const [datasetFolderName, setDatasetFolderName] = useState('');
  const [isModeSelectOpen, setIsModeSelectOpen] = useState(false);
  const [availableModes, setAvailableModes] = useState([]);
  const [userSelectedModes, setUserSelectedModes] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState({ value: 0, text: '' });
  const [isCountingMode, setIsCountingMode] = useState(false);
  
  const [filters, setFilters] = useState({
      durationLessThan: '',
      durationMoreThan: '',
      showFalseNegative: false,
      showFalsePositive: false,
      durationFilterType: '',
  });
  const [availableDurationFilters, setAvailableDurationFilters] = useState([]);
  const [staffConfirmState, setStaffConfirmState] = useState({ isOpen: false, targetUUID: null }); // 新增
  
  const handleCopy = (uuid) => { navigator.clipboard.writeText(uuid).then(() => { setNotification({ open: true, message: `${TEXTS.copied} ${uuid}` }); }); };
  const extractImageUUID = (name) => { const re = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/; const match = name.match(re); return match ? match[0] : null; };
  const isUUIDFolder = (name) => { const reOriginal = /^\d{6}_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/; const reUUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/; return reOriginal.test(name) || reUUID.test(name); };
  const datasetFolderRegex = /^\d{12}_\d{8}_\d{6}_\d{6}$/;


  const startProcessingFromHandle = async (topLevelHandle) => {
    try {
      setIsLoading(true);
      setLoadingMessage(TEXTS.scanningStructure);
      setProgress({ value: 0, text: '' });
      setIsCountingMode(false);
      setAvailableDurationFilters([]);

      objectUrlsRef.current.forEach(URL.revokeObjectURL);
      objectUrlsRef.current = [];
      folderRefs.current.clear();
      setFolders([]);
      setMissedPeopleCount(0);
      setMissedPeopleInput('0');
      setDatasetFolderName('');
      setRootFolderName('');

      const datasetHandle = await findDatasetFolderRecursive(topLevelHandle);

      if (!datasetHandle) {
        setNotification({ open: true, message: TEXTS.noDatasetFolderFound });
        setIsLoading(false);
        return;
      }
      
      datasetFolderHandleRef.current = datasetHandle;
      setDatasetFolderName(datasetHandle.name);
      setRootFolderName(topLevelHandle.name);

      const { modes } = await scanFolderStructure(datasetHandle);
      
      if (modes.length === 0) {
        setNotification({ open: true, message: TEXTS.noModesFound });
        setIsLoading(false);
        return;
      }

      setAvailableModes(modes);
      setUserSelectedModes(new Set()); 
      setIsLoading(false);
      setIsModeSelectOpen(true);

    } catch (error) {
      if (error.name !== 'AbortError') console.error('Error during folder processing:', error);
      setIsLoading(false);
    }
  };

  const handleSelectFolderClick = async () => {
    try {
        const topLevelHandle = await window.showDirectoryPicker();
        await startProcessingFromHandle(topLevelHandle);
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error selecting folder:', error);
        }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      try {
        const handle = await e.dataTransfer.items[0].getAsFileSystemHandle();
        if (handle.kind === 'directory') {
          await startProcessingFromHandle(handle);
        } else {
          setNotification({ open: true, message: TEXTS.dropFolderError });
        }
      } catch(err) {
        console.error("Error getting handle from drop event:", err);
        setNotification({ open: true, message: "Could not process the dropped item." });
      }
    }
  };

  const findDatasetFolderRecursive = async (dirHandle) => {
    if (datasetFolderRegex.test(dirHandle.name)) {
      return dirHandle;
    }
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'directory') {
        const found = await findDatasetFolderRecursive(entry);
        if (found) return found;
      }
    }
    return null;
  };

  const scanFolderStructure = async (datasetDirHandle) => {
    const modes = new Set();
    for await (const uuidEntry of datasetDirHandle.values()) {
        if (uuidEntry.kind === 'directory' && isUUIDFolder(uuidEntry.name)) {
            for await (const modeEntry of uuidEntry.values()) {
                if (modeEntry.kind === 'directory') {
                    for (const modeKey in MODE_DEFINITIONS) {
                        const { prefix } = MODE_DEFINITIONS[modeKey];
                        if ((prefix === 'Others' && modeEntry.name === 'Others') || (prefix !== 'Others' && modeEntry.name.startsWith(prefix))) {
                            modes.add(modeKey);
                        }
                    }
                }
            }
        }
    }
    return { modes: Array.from(modes) };
  };

  const handleModeSelectionChange = (event) => {
    const { name, checked } = event.target;
    setUserSelectedModes(prev => {
        const newSet = new Set(prev);
        if (checked) {
            newSet.add(name);
        } else {
            newSet.delete(name);
        }
        return newSet;
    });
  };

  const handleProceedWithLoading = async () => {
    setIsModeSelectOpen(false);
    if (userSelectedModes.size === 0) {
        setNotification({ open: true, message: 'Please select at least one mode to load.' });
        return;
    }

    setIsLoading(true);
    setLoadingMessage(TEXTS.preparingToLoad);
    setProgress({ value: 0, text: '' });

    const datasetHandle = datasetFolderHandleRef.current;
    
    const uuidFolderHandlesToProcess = [];
    const allPossibleUuidHandles = [];
    for await (const entry of datasetHandle.values()) {
        if (entry.kind === 'directory' && isUUIDFolder(entry.name)) {
            allPossibleUuidHandles.push(entry);
        }
    }

    for (const uuidHandle of allPossibleUuidHandles) {
        let shouldProcess = false;
        for await (const modeHandle of uuidHandle.values()) {
            if (modeHandle.kind !== 'directory') continue;

            for (const selectedModeKey of userSelectedModes) {
                const modeInfo = MODE_DEFINITIONS[selectedModeKey];
                if ( (modeInfo.prefix === 'Others' && modeHandle.name === 'Others') || (modeInfo.prefix !== 'Others' && modeHandle.name.startsWith(modeInfo.prefix)) ) {
                    shouldProcess = true;
                    break; 
                }
            }
            if (shouldProcess) break;
        }

        if (shouldProcess) {
            uuidFolderHandlesToProcess.push(uuidHandle);
        }
    }

    const totalFolders = uuidFolderHandlesToProcess.length;

    if (totalFolders === 0) {
        setNotification({ open: true, message: TEXTS.noFoldersMatchCriteria });
        setIsLoading(false);
        return;
    }
    
    setLoadingMessage(TEXTS.loadingImages);
    const allFoldersData = [];
    let processedFoldersCount = 0;

    for (const uuidEntry of uuidFolderHandlesToProcess) {
        const processedFolder = await processUUIDFolder(uuidEntry, `${datasetHandle.name}/${uuidEntry.name}`, userSelectedModes);
        if (processedFolder.images.length > 0 || Object.keys(processedFolder.eventData).length > 0) {
            allFoldersData.push(processedFolder);
        }
        
        processedFoldersCount++;
        const percentage = Math.round((processedFoldersCount / totalFolders) * 100);
        setProgress({ 
            value: percentage, 
            text: TEXTS.progressText(processedFoldersCount, totalFolders)
        });
    }
    
    if (allFoldersData.length === 0) {
        setNotification({ open: true, message: TEXTS.noValidFoldersFound });
    }

    setFolders(allFoldersData);
    setIsCountingMode(userSelectedModes.has('counting_only'));
    
    const durationModes = ['full_store_tracking', 'counting_only', 'dwelling_only'];
    const available = durationModes.filter(mode => userSelectedModes.has(mode));
    setAvailableDurationFilters(available);
    handleResetFilters(available[0] || '');

    setIsLoading(false);
  };
  
  const calculateDurationInMinutes = (startStr, endStr) => {
    const timeToDate = (timeStr) => {
        if (!timeStr || timeStr === 'N/A') return null;
        const parts = timeStr.split(':').map(Number);
        if (parts.length !== 3 || parts.some(isNaN)) return null;
        const [h, m, s] = parts;
        return new Date(2025, 0, 1, h, m, s); 
    };
    const date1 = timeToDate(startStr);
    const date2 = timeToDate(endStr);
    if (!date1 || !date2 || date2 < date1) return 'N/A';
    const diffMs = date2 - date1;
    return (diffMs / 60000).toFixed(2);
  };

  const parseAndPairEvents = (text, modeKey) => {
      const modeInfo = MODE_DEFINITIONS[modeKey];
      if (!modeInfo || !modeInfo.startWord) return [];

      const timeRegex = /(\d{2}:\d{2}:\d{2})/;
      const rawEvents = [];

      text.trim().split('\n').forEach(line => {
          const match = line.match(timeRegex);
          if (!match) return;
          const time = new Date(2025, 0, 1, ...match[0].split(':').map(Number));
          if (line.includes(modeInfo.startWord)) {
              rawEvents.push({ type: 'start', time });
          } else if (line.includes(modeInfo.endWord)) {
              rawEvents.push({ type: 'end', time });
          }
      });
      
      rawEvents.sort((a, b) => a.time - b.time);

      const pairedEvents = [];
      const openStarts = [];
      
      for (const event of rawEvents) {
          if (event.type === 'start') {
              openStarts.push(event);
          } else if (event.type === 'end') {
              if (openStarts.length > 0) {
                  const startEvent = openStarts.shift(); 
                  pairedEvents.push({ startTime: startEvent.time, endTime: event.time });
              } else {
                  pairedEvents.push({ startTime: null, endTime: event.time });
              }
          }
      }

      openStarts.forEach(startEvent => {
          pairedEvents.push({ startTime: startEvent.time, endTime: null });
      });
      
      const formatTime = (date) => date ? date.toTimeString().split(' ')[0] : 'N/A';

      return pairedEvents.map(event => ({
          startTime: formatTime(event.startTime),
          endTime: formatTime(event.endTime),
          duration: calculateDurationInMinutes(formatTime(event.startTime), formatTime(event.endTime)),
          isComplete: !!event.startTime && !!event.endTime,
      }));
  };

  const processUUIDFolder = async (dirHandle, path, selectedModes) => {
    const imageMap = new Map();
    const eventData = {};
    const totalDurations = {};

    const collectFilesRecursively = async (directoryHandle) => {
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.jpg')) {
          const uuid = extractImageUUID(entry.name);
          if (uuid) {
            const file = await entry.getFile();
            const imageUrl = URL.createObjectURL(file);
            objectUrlsRef.current.push(imageUrl);
            if (!imageMap.has(uuid)) {
              imageMap.set(uuid, { filePath: imageUrl, uuid: uuid, count: 1, relatedImages: [imageUrl], fileNames: [entry.name] });
            } else {
              const imgData = imageMap.get(uuid);
              imgData.count++;
              imgData.relatedImages.push(imageUrl);
              imgData.fileNames.push(entry.name);
            }
          }
        } else if (entry.kind === 'directory') {
          for (const modeKey of selectedModes) {
            const modeInfo = MODE_DEFINITIONS[modeKey];
            if ( (modeInfo.prefix === 'Others' && entry.name === 'Others') || (modeInfo.prefix !== 'Others' && entry.name.startsWith(modeInfo.prefix)) ) {
              try {
                const infoFileHandle = await entry.getFileHandle('info.txt');
                const file = await infoFileHandle.getFile();
                const text = await file.text();
                const parsedEvents = parseAndPairEvents(text, modeKey);
                if(parsedEvents.length > 0) {
                  if (!eventData[modeKey]) {
                    eventData[modeKey] = [];
                  }
                  eventData[modeKey].push(...parsedEvents);
                }
              } catch (e) { }
            }
          }
          await collectFilesRecursively(entry);
        }
      }
    };

    await collectFilesRecursively(dirHandle);

    for (const modeKey in eventData) {
        if (Object.hasOwnProperty.call(eventData, modeKey)) {
            const events = eventData[modeKey];
            const total = events.reduce((sum, event) => sum + (parseFloat(event.duration) || 0), 0);
            if (total > 0) {
              totalDurations[modeKey] = total;
            }
        }
    }

    imageMap.forEach(imgData => { let minDate = null; for (const fileName of imgData.fileNames) { const match = fileName.match(/^(\d{8})(\d{6})(\d{3})/); if (match) { const [, dateStr, timeStr, msStr] = match; const [year, month, day, hour, minute, second, millisecond] = [ parseInt(dateStr.substring(0, 4), 10), parseInt(dateStr.substring(4, 6), 10) - 1, parseInt(dateStr.substring(6, 8), 10), parseInt(timeStr.substring(0, 2), 10), parseInt(timeStr.substring(2, 4), 10), parseInt(timeStr.substring(4, 6), 10), parseInt(msStr, 10) ]; const currentDate = new Date(year, month, day, hour, minute, second, millisecond); if (!minDate || currentDate < minDate) minDate = currentDate; } } imgData.startTime = minDate ? `${String(minDate.getHours()).padStart(2, '0')}:${String(minDate.getMinutes()).padStart(2, '0')}:${String(minDate.getSeconds()).padStart(2, '0')}` : 'N/A'; });
    
    return { 
        folderUUID: dirHandle.name.split('_').pop(), 
        folderPath: path, 
        images: Array.from(imageMap.values()).sort((a, b) => a.uuid.localeCompare(b.uuid)), 
        newPeople: [], 
        eventData: eventData,
        totalDurations: totalDurations,
        isStaff: false,
    };
  };
  
  const handleImageClick = (images) => { setCurrentImages(images); setModalOpen(true); };
  const closeNotification = () => setNotification({ ...notification, open: false });
  const handleAddNewPerson = (folderIndex) => { setAssignmentState({ isActive: true, folderIndex, personId: uuidv4(), isEditing: false }); setCurrentSelection(new Set()); };
  const handleEditPerson = (folderIndex, person) => { setAssignmentState({ isActive: true, folderIndex, personId: person.id, isEditing: true }); setCurrentSelection(new Set(person.assignedTracks)); };
  const handleTrackClickForAssignment = (trackId) => { const newSelection = new Set(currentSelection); if (newSelection.has(trackId)) newSelection.delete(trackId); else newSelection.add(trackId); setCurrentSelection(newSelection); };
  const handleDoneAssignment = () => { const { folderIndex, personId, isEditing } = assignmentState; setFolders(prevFolders => { const newFolders = JSON.parse(JSON.stringify(prevFolders)); const folderToUpdate = newFolders[folderIndex]; if (isEditing) { const personIndex = folderToUpdate.newPeople.findIndex(p => p.id === personId); if (personIndex !== -1) { if (currentSelection.size > 0) folderToUpdate.newPeople[personIndex].assignedTracks = Array.from(currentSelection); else folderToUpdate.newPeople.splice(personIndex, 1); } } else { if (currentSelection.size > 0) { folderToUpdate.newPeople.push({ id: personId, name: `${TEXTS.newPerson} ${folderToUpdate.newPeople.length + 1}`, assignedTracks: Array.from(currentSelection), linkedFolderUUID: null, temporaryUUID: null }); } } return newFolders; }); handleCancelAssignment(); };
  const handleCancelAssignment = () => { setAssignmentState({ isActive: false, folderIndex: null, personId: null, isEditing: false }); setCurrentSelection(new Set()); };
  const handleStartRename = (person) => setRenamingState({ personId: person.id, currentName: person.name });
  const handleRenameChange = (e) => setRenamingState({ ...renamingState, currentName: e.target.value });
  const handleCancelRename = () => setRenamingState({ personId: null, currentName: '' });
  const handleSaveRename = () => { if (!renamingState.personId) return; setFolders(prevFolders => prevFolders.map(folder => ({ ...folder, newPeople: folder.newPeople.map(person => person.id === renamingState.personId ? { ...person, name: renamingState.currentName } : person) }))); handleCancelRename(); };
  const handleRenameKeyDown = (e) => { if (e.key === 'Enter') handleSaveRename(); if (e.key === 'Escape') handleCancelRename(); };
  const handleExportProgress = () => { if (folders.length === 0) { setNotification({ open: true, message: TEXTS.noProgressToSave }); return; } const dataToSave = { version: 1, missedPeopleCount: missedPeopleCount, foldersData: folders.map(folder => ({ folderUUID: folder.folderUUID, newPeople: folder.newPeople, isStaff: folder.isStaff })) }; const jsonString = JSON.stringify(dataToSave, null, 2); const blob = new Blob([jsonString], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${datasetFolderName || 'progress'}.dat`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); };
  const handleImportClick = () => { if (folders.length === 0) { setNotification({ open: true, message: TEXTS.loadFolderFirst }); return; } fileInputRef.current.click(); };
  const handleFileSelected = (event) => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (e) => { try { const importedData = JSON.parse(e.target.result); let foldersFromImport = []; let missedCountFromImport = 0; if (Array.isArray(importedData)) { foldersFromImport = importedData; } else if (typeof importedData === 'object' && importedData !== null && 'foldersData' in importedData) { foldersFromImport = importedData.foldersData; missedCountFromImport = importedData.missedPeopleCount || 0; } else { throw new Error("Invalid format"); } if (!Array.isArray(foldersFromImport)) throw new Error("Invalid format"); setMissedPeopleCount(missedCountFromImport); setMissedPeopleInput(String(missedCountFromImport)); const importMap = new Map(foldersFromImport.map(item => [item.folderUUID, {newPeople: item.newPeople, isStaff: item.isStaff || false}])); setFolders(currentFolders => currentFolders.map(folder => importMap.has(folder.folderUUID) ? { ...folder, newPeople: importMap.get(folder.folderUUID).newPeople, isStaff: importMap.get(folder.folderUUID).isStaff } : folder)); setNotification({ open: true, message: TEXTS.importSuccess }); } catch (error) { setNotification({ open: true, message: TEXTS.importError }); console.error("Error parsing imported file:", error); } }; reader.readAsText(file); event.target.value = null; };
  const handleGenerateTemporaryUUID = (folderIndex, personId) => { setFolders(prevFolders => { const newFolders = JSON.parse(JSON.stringify(prevFolders)); const person = newFolders[folderIndex].newPeople.find(p => p.id === personId); if (person && !person.temporaryUUID) person.temporaryUUID = uuidv4(); return newFolders; }); };
  const handleDeleteTemporaryUUID = (folderIndex, personId) => { const uuidToDelete = folders[folderIndex]?.newPeople.find(p => p.id === personId)?.temporaryUUID; if (!uuidToDelete) return; setFolders(prevFolders => { const newFolders = JSON.parse(JSON.stringify(prevFolders)); for (const folder of newFolders) { for (const person of folder.newPeople) { if (person.id === personId) person.temporaryUUID = null; if (person.linkedFolderUUID === uuidToDelete) person.linkedFolderUUID = null; } } return newFolders; }); };
  const handleOpenLinkDialog = (person, folderIndex) => { setLinkState({ isOpen: true, personId: person.id, folderIndex, inputValue: person.linkedFolderUUID || '', error: '' }); };
  const handleCloseLinkDialog = () => { setLinkState({ isOpen: false, personId: null, folderIndex: null, inputValue: '', error: '' }); };
  const handleSaveLink = () => { const { inputValue, personId, folderIndex } = linkState; const trimmedInput = inputValue.trim(); if (trimmedInput === '') { handleUnlink(personId, folderIndex); handleCloseLinkDialog(); return; } const uuidRegex = /^[a-f\d]{8}-([a-f\d]{4}-){3}[a-f\d]{12}$/i; if (!uuidRegex.test(trimmedInput)) { setLinkState(s => ({ ...s, error: TEXTS.invalidUUIDFormat })); return; } const currentFolder = folders[folderIndex]; const personBeingLinked = currentFolder.newPeople.find(p => p.id === personId); if (trimmedInput === currentFolder.folderUUID || trimmedInput === personBeingLinked?.temporaryUUID) { setLinkState(s => ({ ...s, error: TEXTS.cannotLinkToSelf })); return; } const allFolderUUIDs = new Set(folders.map(f => f.folderUUID)); const allTemporaryUUIDs = new Set(folders.flatMap(f => f.newPeople).map(p => p.temporaryUUID).filter(Boolean)); if (!allFolderUUIDs.has(trimmedInput) && !allTemporaryUUIDs.has(trimmedInput)) { setLinkState(s => ({ ...s, error: TEXTS.uuidNotFound })); return; } setFolders(prevFolders => prevFolders.map((folder, fIndex) => fIndex !== folderIndex ? folder : { ...folder, newPeople: folder.newPeople.map(p => p.id === personId ? { ...p, linkedFolderUUID: trimmedInput } : p) })); setNotification({ open: true, message: TEXTS.linkSuccess }); handleCloseLinkDialog(); };
  const handleUnlink = (personId, folderIndex) => { setFolders(prevFolders => prevFolders.map((folder, fIndex) => fIndex !== folderIndex ? folder : { ...folder, newPeople: folder.newPeople.map(p => p.id === personId ? { ...p, linkedFolderUUID: null } : p) })); };
  const handleScrollToUUID = (uuid) => { const node = folderRefs.current.get(uuid); if (node) { node.scrollIntoView({ behavior: 'smooth', block: 'start' }); } else { let targetFolderUUID = null; for (const folder of folders) { for (const person of folder.newPeople) { if (person.temporaryUUID === uuid) { targetFolderUUID = folder.folderUUID; break; } } if (targetFolderUUID) break; } if (targetFolderUUID) handleScrollToUUID(targetFolderUUID); else setNotification({ open: true, message: `Could not find folder for UUID: ${uuid}` }); } };
  
  const handleFilterChange = (e) => { 
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); 
  };
  
  const handleDurationFilterTypeChange = (event, newType) => {
    setFilters(prev => ({ ...prev, durationFilterType: newType || '' }));
  };
  
  const handleResetFilters = (defaultDurationType = '') => { 
    setFilters({ 
      durationLessThan: '', 
      durationMoreThan: '', 
      showFalseNegative: false, 
      showFalsePositive: false,
      durationFilterType: defaultDurationType || (availableDurationFilters[0] || ''),
    }); 
  };
  
  const handleSaveMissedPeople = () => { setMissedPeopleCount(parseInt(missedPeopleInput, 10) || 0); setIsMissedPeopleDialogOpen(false); };
  
  const triggerToggleStaff = (folderUUID) => {
    const folder = folders.find(f => f.folderUUID === folderUUID);
    if (!folder) return;

    if (folder.isStaff) {
      setFolders(prev => prev.map(f => f.folderUUID === folderUUID ? { ...f, isStaff: false } : f));
    } else {
      setStaffConfirmState({ isOpen: true, targetUUID: folderUUID });
    }
  };

  const handleCloseStaffConfirm = () => {
    setStaffConfirmState({ isOpen: false, targetUUID: null });
  };

  const handleConfirmHideStaff = () => {
    if(staffConfirmState.targetUUID) {
        setFolders(prev => prev.map(f => f.folderUUID === staffConfirmState.targetUUID ? { ...f, isStaff: true } : f));
    }
    handleCloseStaffConfirm();
  };

  const activeFolders = useMemo(() => folders.filter(f => !f.isStaff), [folders]);
  const incompleteFolders = useMemo(() => activeFolders.filter(folder => { if (folder.images.length === 0) return false; const assignedTracksCount = new Set(folder.newPeople.flatMap(p => p.assignedTracks)).size; return assignedTracksCount < folder.images.length; }), [activeFolders]);
  const correctFolders = useMemo(() => activeFolders.filter(f => f.newPeople.length === 1 && !f.newPeople[0].linkedFolderUUID), [activeFolders]);
  const falseNegativeFolders = useMemo(() => activeFolders.filter(f => f.newPeople.length > 1), [activeFolders]);
  const falsePositiveFolders = useMemo(() => activeFolders.filter(f => f.newPeople.some(p => p.linkedFolderUUID)), [activeFolders]);
  const missingEnterFolders = useMemo(() => { if (!isCountingMode) return []; return activeFolders.filter(folder => folder.eventData?.counting_only?.some(event => !event.isComplete && event.endTime !== 'N/A')); }, [activeFolders, isCountingMode]);
  const missingExitFolders = useMemo(() => { if (!isCountingMode) return []; return activeFolders.filter(folder => folder.eventData?.counting_only?.some(event => !event.isComplete && event.startTime !== 'N/A')); }, [activeFolders, isCountingMode]);

  const adjustedTotal = activeFolders.length + missedPeopleCount;
  const reIdAccuracy = adjustedTotal > 0 ? (correctFolders.length / adjustedTotal) * 100 : 0;
  let accuracyColor = 'success.main';
  if (reIdAccuracy < 75) accuracyColor = 'error.main';
  else if (reIdAccuracy < 85) accuracyColor = 'warning.main';
  
  const filteredFolders = useMemo(() => {
    return folders.filter(folder => {
        if (folder.isStaff) return true;

        const passesNormalFilters = (() => {
            if (filters.showFalseNegative && !falseNegativeFolders.some(fn => fn.folderUUID === folder.folderUUID)) return false;
            if (filters.showFalsePositive && !falsePositiveFolders.some(fp => fp.folderUUID === folder.folderUUID)) return false;
            return true;
        })();

        if (!passesNormalFilters) return false;
        
        if (filters.durationFilterType && (filters.durationLessThan || filters.durationMoreThan)) {
            const duration = folder.totalDurations?.[filters.durationFilterType];
            
            if (filters.durationLessThan && (duration === undefined || duration >= parseFloat(filters.durationLessThan))) {
                return false;
            }
            if (filters.durationMoreThan && (duration === undefined || duration <= parseFloat(filters.durationMoreThan))) {
                return false;
            }
        }
        return true;
    });
  }, [folders, filters, falseNegativeFolders, falsePositiveFolders]);
  
  const startNavigation = (targetFolders) => { if (targetFolders.length === 0) return; const targetUUIDs = targetFolders.map(f => f.folderUUID); setNavigation({ isActive: true, targets: targetUUIDs, currentIndex: 0 }); handleScrollToUUID(targetUUIDs[0]); };
  const handleNavNext = () => { const { targets, currentIndex } = navigation; if (currentIndex < targets.length - 1) { const nextIndex = currentIndex + 1; handleScrollToUUID(targets[nextIndex]); setNavigation(nav => ({...nav, currentIndex: nextIndex})); } };
  const handleNavPrev = () => { const { currentIndex } = navigation; if (currentIndex > 0) { const prevIndex = currentIndex - 1; handleScrollToUUID(navigation.targets[prevIndex]); setNavigation(nav => ({...nav, currentIndex: prevIndex})); } };
  const handleCloseNavigation = () => setNavigation({ isActive: false, targets: [], currentIndex: -1 });
  const handleSelectAll = (imagesToSelect) => { setCurrentSelection(new Set(imagesToSelect.map(img => img.uuid))); };
  const handleDeselectAll = () => { setCurrentSelection(new Set()); };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>{TEXTS.title}</Typography>
            <Box>
                <Tooltip title={TEXTS.userManual}><IconButton onClick={() => setManualOpen(true)} color="inherit"><HelpOutlineIcon /></IconButton></Tooltip>
                <Tooltip title={TEXTS.toggleTheme}><IconButton sx={{ ml: 1 }} onClick={onToggleTheme} color="inherit">{themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}</IconButton></Tooltip>
            </Box>
        </Box>

        {folders.length === 0 && !datasetFolderName ? (
            <InitialScreen 
                onFolderSelect={handleSelectFolderClick} 
                onDrop={handleDrop} 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                isDragging={isDragging}
                disabled={isLoading}
            />
        ) : (
            <>
                <Box sx={{display: 'flex', gap: 2, mb: 1}}>
                    <Button variant="contained" color="primary" onClick={handleSelectFolderClick} disabled={isLoading}>{TEXTS.selectFolder}</Button>
                    <Button variant="outlined" color="secondary" onClick={handleImportClick} disabled={isLoading || folders.length === 0}>{TEXTS.importProgress}</Button>
                    <Button variant="outlined" color="secondary" onClick={handleExportProgress} disabled={isLoading || folders.length === 0}>{TEXTS.exportProgress}</Button>
                </Box>
                {rootFolderName && <Typography variant="caption" color="text.secondary" sx={{display: 'block'}}>{TEXTS.currentDataSet}: {rootFolderName}</Typography>}
                {datasetFolderName && <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 3}}>{TEXTS.datasetFolder}: {datasetFolderName}</Typography>}

                {folders.length > 0 && (
                  <>
                    <Paper sx={{ p: 2, mb: 3 }}>
                      <Grid container spacing={2}>
                        <StatItem icon={<FolderCopyIcon fontSize="large"/>} label={TEXTS.totalIdentities} tooltipText={TEXTS.totalIdentitiesTooltip} value={<> {adjustedTotal} {missedPeopleCount > 0 && <Box component="span" sx={{fontSize: '1rem', fontWeight: 'normal'}}>({activeFolders.length} + {missedPeopleCount})</Box>} {(folders.length - activeFolders.length) > 0 && <Typography variant="caption" color="text.secondary" display="block">(Hidden Staff: {folders.length - activeFolders.length})</Typography>} </>} onEdit={() => { setMissedPeopleInput(String(missedPeopleCount)); setIsMissedPeopleDialogOpen(true); }}/>
                        <StatItem icon={<ReportProblemIcon fontSize="large"/>} label={TEXTS.incompleteFolders} tooltipText={TEXTS.incompleteFoldersTooltip} value={incompleteFolders.length} onClick={() => startNavigation(incompleteFolders)} valueSx={{color: incompleteFolders.length > 0 ? 'error.main' : 'text.primary'}}/>
                        <StatItem icon={<PercentIcon fontSize="large"/>} label={TEXTS.reIdAccuracy} tooltipText={TEXTS.reIdAccuracyTooltip} value={`${reIdAccuracy.toFixed(2)}%`} valueSx={{color: accuracyColor}}/>
                        <StatItem icon={<CheckCircleOutlineIcon fontSize="large"/>} label={TEXTS.correctUUIDs} tooltipText={TEXTS.correctUUIDsTooltip} value={correctFolders.length} onClick={() => startNavigation(correctFolders)}/>
                        <StatItem icon={<CallMergeIcon fontSize="large"/>} label={TEXTS.falseNegative} tooltipText={TEXTS.falseNegativeTooltip} value={falseNegativeFolders.length} onClick={() => startNavigation(falseNegativeFolders)}/>
                        <StatItem icon={<CallSplitIcon fontSize="large"/>} label={TEXTS.falsePositive} tooltipText={TEXTS.falsePositiveTooltip} value={falsePositiveFolders.length} onClick={() => startNavigation(falsePositiveFolders)}/>
                        
                        {isCountingMode && (
                          <>
                            <StatItem
                              icon={<CallMissedIcon fontSize="large" />}
                              label={TEXTS.missingEnterEvents}
                              tooltipText={TEXTS.missingEnterEventsTooltip}
                              value={missingEnterFolders.length}
                              onClick={() => startNavigation(missingEnterFolders)}
                              valueSx={{ color: missingEnterFolders.length > 0 ? 'error.main' : 'text.primary' }}
                            />
                            <StatItem
                              icon={<CallMissedOutgoingIcon fontSize="large" />}
                              label={TEXTS.missingExitEvents}
                              tooltipText={TEXTS.missingExitEventsTooltip}
                              value={missingExitFolders.length}
                              onClick={() => startNavigation(missingExitFolders)}
                              valueSx={{ color: missingExitFolders.length > 0 ? 'error.main' : 'text.primary' }}
                            />
                          </>
                        )}
                      </Grid>
                    </Paper>
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h6">{TEXTS.filters}</Typography>
                            <Button onClick={() => handleResetFilters()} size="small">{TEXTS.reset}</Button>
                        </Box>
                        <Grid container spacing={2} alignItems="center">
                            {availableDurationFilters.length > 0 &&
                                <>
                                    <Grid item xs={12} sm={6} md="auto">
                                        <ToggleButtonGroup
                                            value={filters.durationFilterType}
                                            exclusive
                                            onChange={handleDurationFilterTypeChange}
                                            aria-label="duration filter type"
                                            size="small"
                                        >
                                            {availableDurationFilters.map(modeKey => (
                                                <ToggleButton key={modeKey} value={modeKey} aria-label={modeKey}>
                                                    {MODE_DEFINITIONS[modeKey].shortName}
                                                </ToggleButton>
                                            ))}
                                        </ToggleButtonGroup>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <TextField disabled={!filters.durationFilterType} label={TEXTS.durationLessThan} name="durationLessThan" type="number" value={filters.durationLessThan} onChange={handleFilterChange} variant="outlined" size="small" fullWidth/>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <TextField disabled={!filters.durationFilterType} label={TEXTS.durationMoreThan} name="durationMoreThan" type="number" value={filters.durationMoreThan} onChange={handleFilterChange} variant="outlined" size="small" fullWidth/>
                                    </Grid>
                                </>
                            }
                            <Grid item xs={12} sm={6} md>
                                <FormControlLabel control={<Switch checked={filters.showFalseNegative} onChange={handleFilterChange} name="showFalseNegative" />} label={TEXTS.showOnlyFalseNegative} />
                            </Grid>
                            <Grid item xs={12} sm={6} md>
                                <FormControlLabel control={<Switch checked={filters.showFalsePositive} onChange={handleFilterChange} name="showFalsePositive" />} label={TEXTS.showOnlyFalsePositive} />
                            </Grid>
                        </Grid>
                    </Paper>
                  </>
                )}
                
                <Grid container spacing={2}>
                  {filteredFolders.map((folder, folderIndex) => { const imageMap = new Map(folder.images.map(img => [img.uuid, img])); let tracksToHide = new Set(); if (assignmentState.isActive && assignmentState.folderIndex === folderIndex) { folder.newPeople.forEach(p => { if (p.id !== assignmentState.personId) p.assignedTracks.forEach(trackId => tracksToHide.add(trackId)); }); } else { tracksToHide = new Set(folder.newPeople.flatMap(p => p.assignedTracks)); } const availableImages = folder.images.filter(img => !tracksToHide.has(img.uuid)); const currentPersonIndex = folder.newPeople.findIndex(p => p.id === assignmentState.personId); return ( <Grid item xs={12} key={folder.folderUUID} ref={node => { const map = folderRefs.current; if (node) map.set(folder.folderUUID, node); else map.delete(folder.folderUUID); }}> <Paper sx={{ p: 2, opacity: folder.isStaff ? 0.5 : 1, transition: 'opacity 300ms ease-in-out' }}><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}><Box sx={{ display: 'flex', alignItems: 'center' }}><Typography variant="h6">UUID: {folder.folderUUID}</Typography><Button size="small" variant="outlined" onClick={() => handleCopy(folder.folderUUID)} sx={{ ml: 1 }}>{TEXTS.copyUUID}</Button></Box>{assignmentState.isActive && assignmentState.folderIndex === folderIndex ? (<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}><Typography variant="subtitle2" color="primary">{assignmentState.isEditing ? `${TEXTS.editing} "${folder.newPeople[currentPersonIndex]?.name}"` : `${TEXTS.assigningTo} ${TEXTS.newPerson}`}</Typography><Button variant="contained" size="small" onClick={handleDoneAssignment}>{TEXTS.done}</Button><Button variant="outlined" size="small" onClick={handleCancelAssignment}>{TEXTS.cancel}</Button></Box>) : ( <Box sx={{display: 'flex', gap: 1}}><Button variant="outlined" color="secondary" size="small" startIcon={folder.isStaff ? <VisibilityIcon/> : <VisibilityOffIcon/>} onClick={() => triggerToggleStaff(folder.folderUUID)}>{folder.isStaff ? TEXTS.showStaff : TEXTS.hideStaff}</Button><Button variant="contained" onClick={() => handleAddNewPerson(folderIndex)} disabled={assignmentState.isActive || renamingState.personId}>{TEXTS.addNewPerson}</Button></Box> )} </Box>
                  
                  {folder.eventData && Object.keys(folder.eventData).length > 0 && (
                      <Box sx={{ mt: 1.5, width: '100%' }}>
                          {Object.entries(folder.eventData).map(([modeKey, events]) => {
                            const modeInfo = MODE_DEFINITIONS[modeKey];
                            if (!modeInfo || events.length === 0) return null;

                            const totalDuration = (modeKey === 'counting_only' || modeKey === 'dwelling_only')
                                ? events.reduce((sum, event) => sum + (parseFloat(event.duration) || 0), 0)
                                : 0;
                            
                            return (
                              <Box key={modeKey} sx={{ mb: 1.5 }}>
                                  <Typography variant="subtitle2" gutterBottom>{modeInfo.title}:</Typography>
                                  <TableContainer component={Paper} variant="outlined">
                                      <Table size="small" aria-label={`${modeKey} events table`}>
                                          <TableHead>
                                              <TableRow>
                                                  <TableCell>{modeInfo.startWord}</TableCell>
                                                  <TableCell>{modeInfo.endWord}</TableCell>
                                                  <TableCell align="right">Duration (min)</TableCell>
                                              </TableRow>
                                          </TableHead>
                                          <TableBody>
                                              {events.map((event, index) => (
                                                  <TableRow key={index} >
                                                      <TableCell sx={{ color: event.isComplete ? 'inherit' : 'error.main' }}>{event.startTime}</TableCell>
                                                      <TableCell sx={{ color: event.isComplete ? 'inherit' : 'error.main' }}>{event.endTime}</TableCell>
                                                      <TableCell align="right" sx={{ color: event.isComplete ? 'inherit' : 'error.main' }}>{event.duration}</TableCell>
                                                  </TableRow>
                                              ))}
                                          </TableBody>
                                          {(modeKey === 'counting_only' || modeKey === 'dwelling_only') && totalDuration > 0 && (
                                            <TableFooter>
                                                <TableRow sx={{ '& th, & td': { fontWeight: 'bold', borderTop: `2px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'}` } }}>
                                                    <TableCell colSpan={2} align="right">Total</TableCell>
                                                    <TableCell align="right">{totalDuration.toFixed(2)}</TableCell>
                                                </TableRow>
                                            </TableFooter>
                                          )}
                                      </Table>
                                  </TableContainer>
                              </Box>
                          )})}
                      </Box>
                  )}

                  <Divider sx={{ my: 2 }} /> 
                  <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}><Typography variant="subtitle1">{TEXTS.unassignedTracks}</Typography>{assignmentState.isActive && assignmentState.folderIndex === folderIndex && availableImages.length > 0 && (<Button size="small" onClick={() => currentSelection.size === availableImages.length ? handleDeselectAll() : handleSelectAll(availableImages)}>{currentSelection.size === availableImages.length ? TEXTS.deselectAll : TEXTS.selectAll}</Button>)}</Box>{availableImages.length > 0 ? (<Grid container spacing={1}>{availableImages.map((image) => { const isSelected = currentSelection.has(image.uuid); const cardSx = { borderWidth: '2px', borderColor: isSelected ? 'primary.main' : 'error.main', transform: isSelected ? 'scale(0.95)' : 'none', transition: 'all 0.2s ease-in-out' }; return ( <Grid item xs={6} sm={4} md={2} lg={1} key={image.uuid}> <TrackIDCard image={image} sx={cardSx} onCopy={handleCopy} onClick={assignmentState.isActive && assignmentState.folderIndex === folderIndex ? () => handleTrackClickForAssignment(image.uuid) : () => handleImageClick(image.relatedImages)} /> </Grid> )})}</Grid>) : (<Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>{TEXTS.unassignedTracksNone}</Typography>)}{!(assignmentState.isActive && assignmentState.isEditing && assignmentState.folderIndex === folderIndex) && folder.newPeople.length > 0 && (<Box><Divider sx={{ my: 2 }}/><Typography variant="subtitle1" sx={{ mb: 1 }}>{TEXTS.assignedPeople}</Typography>{folder.newPeople.map((person, personIndex) => (<Paper key={person.id} variant="outlined" sx={{ p: 2, mb: 2 }}><Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>{renamingState.personId === person.id ? (<TextField value={renamingState.currentName} onChange={handleRenameChange} onKeyDown={handleRenameKeyDown} onBlur={handleSaveRename} size="small" variant="standard" autoFocus sx={{ flexGrow: 1, mr: 1, '& .MuiInputBase-input': { fontSize: '1.25rem', fontWeight: '500' } }} />) : (<Typography variant="h6" gutterBottom sx={{flexGrow: 1, mb: 0}}>{person.name || `${TEXTS.newPerson} ${personIndex + 1}`}</Typography>)}{renamingState.personId !== person.id && (<><Tooltip title={TEXTS.linkToUUID}><span><IconButton size="small" onClick={() => handleOpenLinkDialog(person, folderIndex)} disabled={assignmentState.isActive || renamingState.personId}><LinkIcon /></IconButton></span></Tooltip><Tooltip title={TEXTS.rename}><span><IconButton size="small" onClick={() => handleStartRename(person)} disabled={assignmentState.isActive || renamingState.personId}><DriveFileRenameOutlineIcon /></IconButton></span></Tooltip><Tooltip title={TEXTS.edit}><span><IconButton size="small" onClick={() => handleEditPerson(folderIndex, person)} disabled={assignmentState.isActive || renamingState.personId}><EditIcon /></IconButton></span></Tooltip></>)}</Box><Grid container spacing={1}>{person.assignedTracks.map(trackId => ( imageMap.has(trackId) ? (<Grid item xs={6} sm={4} md={2} lg={1} key={trackId}><TrackIDCard image={imageMap.get(trackId)} sx={{ borderColor: 'primary.main', borderWidth: '2px' }} onCopy={handleCopy} onClick={() => handleImageClick(imageMap.get(trackId).relatedImages)}/></Grid>) : null ))}</Grid>{person.linkedFolderUUID && ( <Box sx={{mt: 1, display: 'flex', alignItems: 'center', gap: 0.5}}><Typography variant="body2" sx={{ color: 'text.secondary' }}>{TEXTS.linkedTo}:</Typography><Link component="button" variant="body2" onClick={() => handleScrollToUUID(person.linkedFolderUUID)} sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': {textDecoration: 'underline'} }}>{person.linkedFolderUUID}</Link><Tooltip title={TEXTS.unlink}><IconButton size="small" sx={{p: 0.2}} onClick={() => handleUnlink(person.id, folderIndex)}><CloseIcon sx={{ fontSize: '1rem' }} /></IconButton></Tooltip></Box>)}{person.temporaryUUID ? (<Box sx={{mt: 1, display: 'flex', alignItems: 'center', gap: 0.5}}><Typography variant="body2" sx={{ color: 'text.secondary' }}>{TEXTS.temporaryUUID}:</Typography><Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace', wordBreak: 'break-all' }}>{person.temporaryUUID}</Typography><Tooltip title={TEXTS.copyTrackID}><IconButton size="small" sx={{p: 0.2}} onClick={() => handleCopy(person.temporaryUUID)}><ContentCopyIcon sx={{ fontSize: '1rem' }} /></IconButton></Tooltip><Tooltip title={TEXTS.deleteTemporaryUUID}><IconButton size="small" sx={{p: 0.2}} onClick={() => handleDeleteTemporaryUUID(folderIndex, person.id)}><CloseIcon sx={{ fontSize: '1rem' }} /></IconButton></Tooltip></Box>) : ( <Button startIcon={<AddCircleOutlineIcon/>} onClick={() => handleGenerateTemporaryUUID(folderIndex, person.id)} size="small" sx={{mt: 1, p: 0.2}}> {TEXTS.generateTemporaryUUID} </Button> )}</Paper>))}</Box>)} </Paper> </Grid> )})}
                </Grid>
            </>
        )}

        <input type="file" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileSelected} accept=".dat, .json, .txt"/>
        
        <Dialog open={isLoading} disableEscapeKeyDown>
            <DialogContent sx={{ textAlign: 'center', p: 4 }}>
                <CircularProgressWithLabel value={progress.value} />
                <DialogContentText sx={{ mt: 2 }}>
                    {loadingMessage}
                </DialogContentText>
                 <DialogContentText variant="body2" sx={{ color: 'text.secondary', minHeight: '1.2em' }}>
                    {progress.text}
                </DialogContentText>
            </DialogContent>
        </Dialog>
        
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} aria-labelledby="modal-title" ><Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 1000, bgcolor: 'background.paper', boxShadow: 24, p: 4, maxHeight: '90vh', overflow: 'auto' }} ><Typography id="modal-title" variant="h6" component="h2" gutterBottom>{TEXTS.relatedImages}</Typography><Grid container spacing={1}>{currentImages.map((imgUrl, idx) => (<Grid item xs={2} sm={1} key={idx}><img src={imgUrl} alt={`Related ${idx}`} style={{ width: '100%', height: 'auto' }} /></Grid>))}</Grid></Box></Modal>
        <Snackbar open={notification.open} autoHideDuration={5000} onClose={closeNotification} message={notification.message} />
        {navigation.isActive && ( <Paper elevation={4} sx={{ position: 'fixed', bottom: 24, right: 24, p: 1, display: 'flex', flexDirection: 'column', gap: 1, zIndex: 'tooltip' }}> <IconButton onClick={handleNavPrev} disabled={navigation.currentIndex <= 0}><KeyboardArrowUpIcon /></IconButton> <Typography align="center" variant="body2">{`${navigation.currentIndex + 1} / ${navigation.targets.length}`}</Typography> <IconButton onClick={handleNavNext} disabled={navigation.currentIndex >= navigation.targets.length - 1}><KeyboardArrowDownIcon /></IconButton> <Divider /> <Tooltip title={TEXTS.closeNavigation}><IconButton onClick={handleCloseNavigation} size="small"><CloseIcon fontSize="small" /></IconButton></Tooltip> </Paper> )}
        <Dialog open={linkState.isOpen} onClose={handleCloseLinkDialog} fullWidth maxWidth="sm"><DialogTitle>{TEXTS.linkToUUID}</DialogTitle><DialogContent><DialogContentText sx={{mb: 2}}>{TEXTS.enterUUID}</DialogContentText><TextField autoFocus margin="dense" id="uuid-link-input" label="Folder or Person UUID" type="text" fullWidth variant="outlined" value={linkState.inputValue} onChange={(e) => setLinkState(s => ({...s, inputValue: e.target.value, error: ''}))} error={!!linkState.error} helperText={linkState.error}/></DialogContent><DialogActions><Button onClick={handleCloseLinkDialog}>{TEXTS.cancel}</Button><Button onClick={handleSaveLink} variant="contained">{TEXTS.save}</Button></DialogActions></Dialog>
        <Dialog open={manualOpen} onClose={() => setManualOpen(false)}><DialogTitle>{TEXTS.userManualTitle}</DialogTitle><DialogContent><DialogContentText>{TEXTS.userManualContent}</DialogContentText><Link href="http://www.tdintelligence.wiki" target="_blank" rel="noopener noreferrer" sx={{mt: 2, display: 'block'}}>{TEXTS.userManualLinkText}</Link></DialogContent><DialogActions><Button onClick={() => setManualOpen(false)}>{TEXTS.close}</Button></DialogActions></Dialog>
        <Dialog open={isMissedPeopleDialogOpen} onClose={() => setIsMissedPeopleDialogOpen(false)}><DialogTitle>{TEXTS.adjustTotal}</DialogTitle><DialogContent><DialogContentText>{TEXTS.missedPeopleHelper}</DialogContentText><TextField autoFocus margin="dense" label={TEXTS.missedPeopleLabel} type="number" fullWidth variant="standard" value={missedPeopleInput} onChange={(e) => setMissedPeopleInput(e.target.value)}/></DialogContent><DialogActions><Button onClick={() => setIsMissedPeopleDialogOpen(false)}>{TEXTS.cancel}</Button><Button onClick={handleSaveMissedPeople}>{TEXTS.save}</Button></DialogActions></Dialog>
        <Dialog open={isModeSelectOpen} onClose={() => setIsModeSelectOpen(false)}>
            <DialogTitle>{TEXTS.selectImportMode}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{mb: 2}}>
                    The following data types were found. Please select which ones to load.
                </DialogContentText>
                <FormGroup>
                    {availableModes.map(modeKey => {
                        const modeInfo = MODE_DEFINITIONS[modeKey];
                        return (
                            <Box key={modeKey} sx={{mb: 1}}>
                               <FormControlLabel 
                                 control={
                                    <Checkbox 
                                        checked={userSelectedModes.has(modeKey)} 
                                        onChange={handleModeSelectionChange} 
                                        name={modeKey} 
                                    />
                                 } 
                                 label={modeInfo.text} 
                               />
                               <Typography variant="caption" sx={{display: 'block', pl: 4}}>{modeInfo.description}</Typography>
                            </Box>
                        )
                    })}
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIsModeSelectOpen(false)}>{TEXTS.cancel}</Button>
                <Button onClick={handleProceedWithLoading} variant="contained">{TEXTS.proceed}</Button>
            </DialogActions>
        </Dialog>
        {/* --- 新增的确认对话框 --- */}
        <Dialog open={staffConfirmState.isOpen} onClose={handleCloseStaffConfirm}>
            <DialogTitle>{TEXTS.hideStaffConfirmTitle}</DialogTitle>
            <DialogContent>
                <DialogContentText>{TEXTS.hideStaffConfirmContent}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseStaffConfirm}>{TEXTS.cancel}</Button>
                <Button onClick={handleConfirmHideStaff} variant="contained" color="warning">{TEXTS.confirm}</Button>
            </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default function App() {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'dark');
  useEffect(() => { localStorage.setItem('themeMode', themeMode); }, [themeMode]);
  const theme = useMemo(() => createTheme({ palette: { mode: themeMode } }), [themeMode]);
  const toggleTheme = () => { setThemeMode(prevMode => (prevMode === 'light' ? 'dark' : 'light')); };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent onToggleTheme={toggleTheme} themeMode={themeMode} />
    </ThemeProvider>
  );
}