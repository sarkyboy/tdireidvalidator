import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Container, Typography, Button, Paper, Grid, Modal, Snackbar, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip, IconButton, Divider, TextField, Link, Switch, FormControlLabel, Stack } from '@mui/material';
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
import { v4 as uuidv4 } from 'uuid';

const TEXTS = {
  title: 'Re-ID Accuracy Analysis Tool',
  selectFolder: 'Select Folder',
  processing: 'Processing, please wait...',
  totalIdentities: 'Total UUID Folders',
  copyUUID: 'Copy UUID',
  copyTrackID: 'Copy Track ID',
  relatedImages: 'Related Images',
  copied: 'Copied:',
  addNewPerson: 'Add New Person',
  done: 'Done',
  cancel: 'Cancel',
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
  totalIdentitiesTooltip: 'The total number of unique top-level UUID folders found in the selected directory.',
  incompleteFoldersTooltip: 'The number of folders where not all Track IDs have been assigned to a person.',
  reIdAccuracyTooltip: 'Calculated as (Correct UUIDs / Adjusted Total Folders). Green: >= 85%, Yellow: 75%-85%, Red: < 75%.',
  correctUUIDsTooltip: 'The number of folders that contain exactly one "Assigned Person" group, and that group is not linked to any other UUID.', // 修改
  falseNegativeTooltip: 'The number of folders that contain more than one "Assigned Person" group, indicating a potential merge is needed.',
  falsePositiveTooltip: 'The number of folders where at least one person is linked to an external UUID, indicating a potential split is needed.',
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
  selectImportMode: 'Select Import Mode',
  countingOnly: 'Counting Only',
  countingOnlyDesc: 'Skips "Appearance_Disappearance" folders for faster loading.',
  fullStoreTracking: 'Full Store Tracking',
  fullStoreTrackingDesc: 'Imports all data including appearance and disappearance times (Default).',
  currentDataSet: 'Current Data Set',
  noValidFoldersFound: 'No valid UUID folders found in the selected directory.',
};

// --- Reusable TrackID Card Component ---
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

// --- Reusable Stat Item Component ---
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


function AppContent({ onToggleTheme, themeMode }) {
  const objectUrlsRef = useRef([]);
  const fileInputRef = useRef(null);
  const folderRefs = useRef(new Map());

  const [folders, setFolders] = useState([]);
  const [totalUUIDFolders, setTotalUUIDFolders] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [assignmentState, setAssignmentState] = useState({ isActive: false, folderIndex: null, personId: null, isEditing: false });
  const [currentSelection, setCurrentSelection] = useState(new Set());
  const [renamingState, setRenamingState] = useState({ personId: null, currentName: '' });
  const [linkState, setLinkState] = useState({ isOpen: false, personId: null, folderIndex: null, inputValue: '', error: '' });
  const [navigation, setNavigation] = useState({ isActive: false, targets: [], currentIndex: -1 });
  const [filters, setFilters] = useState({ durationLessThan: '', durationMoreThan: '', showFalseNegative: false, showFalsePositive: false });
  const [missedPeopleCount, setMissedPeopleCount] = useState(0);
  const [isMissedPeopleDialogOpen, setIsMissedPeopleDialogOpen] = useState(false);
  const [missedPeopleInput, setMissedPeopleInput] = useState('0');
  const [rootFolderName, setRootFolderName] = useState('');
  const [isModeSelectOpen, setIsModeSelectOpen] = useState(false);

  // --- Logic Functions ---
  const handleCopy = (uuid) => { navigator.clipboard.writeText(uuid).then(() => { setNotification({ open: true, message: `${TEXTS.copied} ${uuid}` }); }); };
  const extractImageUUID = (name) => { const re = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/; const match = name.match(re); return match ? match[0] : null; };
  const isUUIDFolder = (name) => { const reOriginal = /^\d{6}_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/; const reUUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/; return reOriginal.test(name) || reUUID.test(name); };

  const handleFolderSelect = () => { setIsModeSelectOpen(true); };
  
  const proceedToSelectFolder = async (mode) => {
    try {
      setIsLoading(true);
      objectUrlsRef.current.forEach(URL.revokeObjectURL);
      objectUrlsRef.current = [];
      folderRefs.current.clear();
      setMissedPeopleCount(0);
      setMissedPeopleInput('0');
      const dirHandle = await window.showDirectoryPicker();
      setRootFolderName(dirHandle.name);
      const processedFolders = await processDirectory(dirHandle, dirHandle.name, mode);
      if (processedFolders.length === 0) { setNotification({ open: true, message: TEXTS.noValidFoldersFound }); }
      setFolders(processedFolders);
      setTotalUUIDFolders(processedFolders.length);
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Error selecting folder:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleModeSelected = (mode) => { setIsModeSelectOpen(false); proceedToSelectFolder(mode); };
  const processDirectory = async (dirHandle, path = '', mode) => { const entries = []; for await (const entry of dirHandle.values()) { if (entry.kind === 'directory') { if (isUUIDFolder(entry.name)) { entries.push(await processUUIDFolder(entry, `${path}/${entry.name}`, mode)); } else { entries.push(...await processDirectory(entry, `${path}/${entry.name}`, mode)); } } } return entries; };
  const processUUIDFolder = async (dirHandle, path, mode) => {
    const imageMap = new Map();
    let appearData = null; 
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
          if (entry.name === 'Appearance_Disappearance' && mode === 'full_store') {
            try {
              const infoFileHandle = await entry.getFileHandle('info.txt');
              const file = await infoFileHandle.getFile();
              const text = await file.text();
              const lines = text.split('\n');
              const appears = [];
              const disappears = [];
              const todayForParsing = new Date();
              const [year, month, day] = [todayForParsing.getFullYear(), todayForParsing.getMonth(), todayForParsing.getDate()];
              lines.forEach(line => { const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2})/); if (timeMatch) { const [, h, m, s] = timeMatch.map(Number); const date = new Date(year, month, day, h, m, s); if (line.includes('Appear')) appears.push(date); else if (line.includes('Disappear')) disappears.push(date); } });
              if (appears.length > 0 || disappears.length > 0) {
                const formatTime = (date) => date ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}` : 'N/A';
                const minAppear = appears.length > 0 ? new Date(Math.min(...appears)) : null;
                const maxDisappear = disappears.length > 0 ? new Date(Math.max(...disappears)) : null;
                let durationString = 'N/A';
                let durationInMinutes = -1;
                if (minAppear && maxDisappear && maxDisappear > minAppear) { const diffMs = maxDisappear - minAppear; const diffHrs = Math.floor(diffMs / 3600000); const diffMins = Math.floor((diffMs % 3600000) / 60000); durationString = `${diffHrs} ${TEXTS.hours} ${diffMins} ${TEXTS.minutes}`; durationInMinutes = Math.floor(diffMs / 60000); }
                appearData = { startTime: formatTime(minAppear), endTime: formatTime(maxDisappear), duration: durationString, durationInMinutes };
              }
            } catch (e) { console.log(`info.txt not found in ${path}/${entry.name}`); }
          }
          await collectFilesRecursively(entry);
        }
      }
    };
    await collectFilesRecursively(dirHandle);
    imageMap.forEach(imgData => { let minDate = null; for (const fileName of imgData.fileNames) { const match = fileName.match(/^(\d{8})(\d{6})(\d{3})/); if (match) { const [, dateStr, timeStr, msStr] = match; const [year, month, day, hour, minute, second, millisecond] = [ parseInt(dateStr.substring(0, 4), 10), parseInt(dateStr.substring(4, 6), 10) - 1, parseInt(dateStr.substring(6, 8), 10), parseInt(timeStr.substring(0, 2), 10), parseInt(timeStr.substring(2, 4), 10), parseInt(timeStr.substring(4, 6), 10), parseInt(msStr, 10) ]; const currentDate = new Date(year, month, day, hour, minute, second, millisecond); if (!minDate || currentDate < minDate) minDate = currentDate; } } imgData.startTime = minDate ? `${String(minDate.getHours()).padStart(2, '0')}:${String(minDate.getMinutes()).padStart(2, '0')}:${String(minDate.getSeconds()).padStart(2, '0')}` : 'N/A'; });
    return { folderUUID: dirHandle.name.split('_').pop(), folderPath: path, images: Array.from(imageMap.values()).sort((a, b) => a.uuid.localeCompare(b.uuid)), newPeople: [], appearData: appearData };
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
  const handleExportProgress = () => { if (folders.length === 0) { setNotification({ open: true, message: TEXTS.noProgressToSave }); return; } const dataToSave = { version: 1, missedPeopleCount: missedPeopleCount, foldersData: folders.map(folder => ({ folderUUID: folder.folderUUID, newPeople: folder.newPeople })) }; const jsonString = JSON.stringify(dataToSave, null, 2); const blob = new Blob([jsonString], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${rootFolderName || 'progress'}.dat`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); };
  const handleImportClick = () => { if (folders.length === 0) { setNotification({ open: true, message: TEXTS.loadFolderFirst }); return; } fileInputRef.current.click(); };
  const handleFileSelected = (event) => { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (e) => { try { const importedData = JSON.parse(e.target.result); let foldersFromImport = []; let missedCountFromImport = 0; if (Array.isArray(importedData)) { foldersFromImport = importedData; } else if (typeof importedData === 'object' && importedData !== null && 'foldersData' in importedData) { foldersFromImport = importedData.foldersData; missedCountFromImport = importedData.missedPeopleCount || 0; } else { throw new Error("Invalid format"); } if (!Array.isArray(foldersFromImport)) throw new Error("Invalid format"); setMissedPeopleCount(missedCountFromImport); setMissedPeopleInput(String(missedCountFromImport)); const importMap = new Map(foldersFromImport.map(item => [item.folderUUID, item.newPeople])); setFolders(currentFolders => currentFolders.map(folder => importMap.has(folder.folderUUID) ? { ...folder, newPeople: importMap.get(folder.folderUUID) } : folder)); setNotification({ open: true, message: TEXTS.importSuccess }); } catch (error) { setNotification({ open: true, message: TEXTS.importError }); console.error("Error parsing imported file:", error); } }; reader.readAsText(file); event.target.value = null; };
  const handleGenerateTemporaryUUID = (folderIndex, personId) => { setFolders(prevFolders => { const newFolders = JSON.parse(JSON.stringify(prevFolders)); const person = newFolders[folderIndex].newPeople.find(p => p.id === personId); if (person && !person.temporaryUUID) person.temporaryUUID = uuidv4(); return newFolders; }); };
  const handleDeleteTemporaryUUID = (folderIndex, personId) => { const uuidToDelete = folders[folderIndex]?.newPeople.find(p => p.id === personId)?.temporaryUUID; if (!uuidToDelete) return; setFolders(prevFolders => { const newFolders = JSON.parse(JSON.stringify(prevFolders)); for (const folder of newFolders) { for (const person of folder.newPeople) { if (person.id === personId) person.temporaryUUID = null; if (person.linkedFolderUUID === uuidToDelete) person.linkedFolderUUID = null; } } return newFolders; }); };
  const handleOpenLinkDialog = (person, folderIndex) => { setLinkState({ isOpen: true, personId: person.id, folderIndex, inputValue: person.linkedFolderUUID || '', error: '' }); };
  const handleCloseLinkDialog = () => { setLinkState({ isOpen: false, personId: null, folderIndex: null, inputValue: '', error: '' }); };
  const handleSaveLink = () => { const { inputValue, personId, folderIndex } = linkState; const trimmedInput = inputValue.trim(); if (trimmedInput === '') { handleUnlink(personId, folderIndex); handleCloseLinkDialog(); return; } const uuidRegex = /^[a-f\d]{8}-([a-f\d]{4}-){3}[a-f\d]{12}$/i; if (!uuidRegex.test(trimmedInput)) { setLinkState(s => ({ ...s, error: TEXTS.invalidUUIDFormat })); return; } const currentFolder = folders[folderIndex]; const personBeingLinked = currentFolder.newPeople.find(p => p.id === personId); if (trimmedInput === currentFolder.folderUUID || trimmedInput === personBeingLinked?.temporaryUUID) { setLinkState(s => ({ ...s, error: TEXTS.cannotLinkToSelf })); return; } const allFolderUUIDs = new Set(folders.map(f => f.folderUUID)); const allTemporaryUUIDs = new Set(folders.flatMap(f => f.newPeople).map(p => p.temporaryUUID).filter(Boolean)); if (!allFolderUUIDs.has(trimmedInput) && !allTemporaryUUIDs.has(trimmedInput)) { setLinkState(s => ({ ...s, error: TEXTS.uuidNotFound })); return; } setFolders(prevFolders => prevFolders.map((folder, fIndex) => fIndex !== folderIndex ? folder : { ...folder, newPeople: folder.newPeople.map(p => p.id === personId ? { ...p, linkedFolderUUID: trimmedInput } : p) })); setNotification({ open: true, message: TEXTS.linkSuccess }); handleCloseLinkDialog(); };
  const handleUnlink = (personId, folderIndex) => { setFolders(prevFolders => prevFolders.map((folder, fIndex) => fIndex !== folderIndex ? folder : { ...folder, newPeople: folder.newPeople.map(p => p.id === personId ? { ...p, linkedFolderUUID: null } : p) })); };
  const handleScrollToUUID = (uuid) => { const node = folderRefs.current.get(uuid); if (node) { node.scrollIntoView({ behavior: 'smooth', block: 'start' }); } else { let targetFolderUUID = null; for (const folder of folders) { for (const person of folder.newPeople) { if (person.temporaryUUID === uuid) { targetFolderUUID = folder.folderUUID; break; } } if (targetFolderUUID) break; } if (targetFolderUUID) handleScrollToUUID(targetFolderUUID); else setNotification({ open: true, message: `Could not find folder for UUID: ${uuid}` }); } };
  const handleFilterChange = (e) => { const { name, value, type, checked } = e.target; setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); };
  const handleResetFilters = () => { setFilters({ durationLessThan: '', durationMoreThan: '', showFalseNegative: false, showFalsePositive: false }); };
  const handleSaveMissedPeople = () => { setMissedPeopleCount(parseInt(missedPeopleInput, 10) || 0); setIsMissedPeopleDialogOpen(false); };
  
  // --- Derived State & Handlers for Statistics & Navigation ---
  const incompleteFolders = folders.filter(folder => { if (folder.images.length === 0) return false; const assignedTracksCount = new Set(folder.newPeople.flatMap(p => p.assignedTracks)).size; return assignedTracksCount < folder.images.length; });
  const correctFolders = folders.filter(f => f.newPeople.length === 1 && !f.newPeople[0].linkedFolderUUID); // MODIFIED
  const falseNegativeFolders = folders.filter(f => f.newPeople.length > 1);
  const falsePositiveFolders = folders.filter(f => f.newPeople.some(p => p.linkedFolderUUID));
  const adjustedTotal = totalUUIDFolders + missedPeopleCount;
  const reIdAccuracy = adjustedTotal > 0 ? (correctFolders.length / adjustedTotal) * 100 : 0;
  let accuracyColor = 'success.main';
  if (reIdAccuracy < 75) accuracyColor = 'error.main';
  else if (reIdAccuracy < 85) accuracyColor = 'warning.main';
  const startNavigation = (targetFolders) => { if (targetFolders.length === 0) return; const targetUUIDs = targetFolders.map(f => f.folderUUID); setNavigation({ isActive: true, targets: targetUUIDs, currentIndex: 0 }); handleScrollToUUID(targetUUIDs[0]); };
  const handleNavNext = () => { const { targets, currentIndex } = navigation; if (currentIndex < targets.length - 1) { const nextIndex = currentIndex + 1; handleScrollToUUID(targets[nextIndex]); setNavigation(nav => ({...nav, currentIndex: nextIndex})); } };
  const handleNavPrev = () => { const { currentIndex } = navigation; if (currentIndex > 0) { const prevIndex = currentIndex - 1; handleScrollToUUID(navigation.targets[prevIndex]); setNavigation(nav => ({...nav, currentIndex: prevIndex})); } };
  const handleCloseNavigation = () => setNavigation({ isActive: false, targets: [], currentIndex: -1 });
  const filteredFolders = useMemo(() => { return folders.filter(folder => { const duration = folder.appearData?.durationInMinutes; if (filters.durationLessThan && (duration === undefined || duration >= parseInt(filters.durationLessThan, 10))) return false; if (filters.durationMoreThan && (duration === undefined || duration <= parseInt(filters.durationMoreThan, 10))) return false; if (filters.showFalseNegative && folder.newPeople.length <= 1) return false; if (filters.showFalsePositive && !folder.newPeople.some(p => p.linkedFolderUUID)) return false; return true; }); }, [folders, filters]);
  const handleSelectAll = (imagesToSelect) => { setCurrentSelection(new Set(imagesToSelect.map(img => img.uuid))); };
  const handleDeselectAll = () => { setCurrentSelection(new Set()); };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>{TEXTS.title}</Typography>
          <Box><Tooltip title={TEXTS.userManual}><IconButton onClick={() => setManualOpen(true)} color="inherit"><HelpOutlineIcon /></IconButton></Tooltip><Tooltip title={TEXTS.toggleTheme}><IconButton sx={{ ml: 1 }} onClick={onToggleTheme} color="inherit">{themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}</IconButton></Tooltip></Box>
        </Box>
        <Box sx={{display: 'flex', gap: 2, mb: 1}}><Button variant="contained" color="primary" onClick={handleFolderSelect} disabled={isLoading}>{TEXTS.selectFolder}</Button><Button variant="outlined" color="secondary" onClick={handleImportClick} disabled={isLoading}>{TEXTS.importProgress}</Button><Button variant="outlined" color="secondary" onClick={handleExportProgress} disabled={isLoading}>{TEXTS.exportProgress}</Button></Box>
        {rootFolderName && <Typography variant="caption" color="text.secondary" sx={{mb: 3, display: 'block'}}>{TEXTS.currentDataSet}: {rootFolderName}</Typography>}
        <input type="file" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileSelected} accept=".dat, .json, .txt"/>
        <Dialog open={isLoading} disableEscapeKeyDown><DialogContent sx={{ textAlign: 'center', p: 4 }}><CircularProgress sx={{ mb: 2 }} /><DialogContentText>{TEXTS.processing}</DialogContentText></DialogContent></Dialog>
        <Paper sx={{ p: 2, mb: 3 }}><Grid container spacing={2}><StatItem icon={<FolderCopyIcon fontSize="large"/>} label={TEXTS.totalIdentities} tooltipText={TEXTS.totalIdentitiesTooltip} value={<>{adjustedTotal} {missedPeopleCount > 0 && <Box component="span" sx={{fontSize: '1rem', fontWeight: 'normal'}}>({totalUUIDFolders} + {missedPeopleCount})</Box>}</>} onEdit={() => { setMissedPeopleInput(String(missedPeopleCount)); setIsMissedPeopleDialogOpen(true); }}/><StatItem icon={<ReportProblemIcon fontSize="large"/>} label={TEXTS.incompleteFolders} tooltipText={TEXTS.incompleteFoldersTooltip} value={incompleteFolders.length} onClick={() => startNavigation(incompleteFolders)} valueSx={{color: incompleteFolders.length > 0 ? 'error.main' : 'text.primary'}}/><StatItem icon={<PercentIcon fontSize="large"/>} label={TEXTS.reIdAccuracy} tooltipText={TEXTS.reIdAccuracyTooltip} value={`${reIdAccuracy.toFixed(2)}%`} valueSx={{color: accuracyColor}}/><StatItem icon={<CheckCircleOutlineIcon fontSize="large"/>} label={TEXTS.correctUUIDs} tooltipText={TEXTS.correctUUIDsTooltip} value={correctFolders.length} onClick={() => startNavigation(correctFolders)}/><StatItem icon={<CallMergeIcon fontSize="large"/>} label={TEXTS.falseNegative} tooltipText={TEXTS.falseNegativeTooltip} value={falseNegativeFolders.length} onClick={() => startNavigation(falseNegativeFolders)}/><StatItem icon={<CallSplitIcon fontSize="large"/>} label={TEXTS.falsePositive} tooltipText={TEXTS.falsePositiveTooltip} value={falsePositiveFolders.length} onClick={() => startNavigation(falsePositiveFolders)}/></Grid></Paper>
        <Paper sx={{ p: 2, mb: 3 }}><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}><Typography variant="h6">{TEXTS.filters}</Typography><Button onClick={handleResetFilters} size="small">{TEXTS.reset}</Button></Box><Grid container spacing={2} alignItems="center"><Grid item xs={12} sm={3}><TextField label={TEXTS.durationLessThan} name="durationLessThan" type="number" value={filters.durationLessThan} onChange={handleFilterChange} variant="outlined" size="small" fullWidth/></Grid><Grid item xs={12} sm={3}><TextField label={TEXTS.durationMoreThan} name="durationMoreThan" type="number" value={filters.durationMoreThan} onChange={handleFilterChange} variant="outlined" size="small" fullWidth/></Grid><Grid item xs={12} sm={3}><FormControlLabel control={<Switch checked={filters.showFalseNegative} onChange={handleFilterChange} name="showFalseNegative" />} label={TEXTS.showOnlyFalseNegative} /></Grid><Grid item xs={12} sm={3}><FormControlLabel control={<Switch checked={filters.showFalsePositive} onChange={handleFilterChange} name="showFalsePositive" />} label={TEXTS.showOnlyFalsePositive} /></Grid></Grid></Paper>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} aria-labelledby="modal-title" ><Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 1000, bgcolor: 'background.paper', boxShadow: 24, p: 4, maxHeight: '90vh', overflow: 'auto' }} ><Typography id="modal-title" variant="h6" component="h2" gutterBottom>{TEXTS.relatedImages}</Typography><Grid container spacing={1}>{currentImages.map((imgUrl, idx) => (<Grid item xs={2} sm={1} key={idx}><img src={imgUrl} alt={`Related ${idx}`} style={{ width: '100%', height: 'auto' }} /></Grid>))}</Grid></Box></Modal>
        <Snackbar open={notification.open} autoHideDuration={5000} onClose={closeNotification} message={notification.message} />
        <Grid container spacing={2}>
          {filteredFolders.map((folder, folderIndex) => { const imageMap = new Map(folder.images.map(img => [img.uuid, img])); let tracksToHide = new Set(); if (assignmentState.isActive && assignmentState.folderIndex === folderIndex) { folder.newPeople.forEach(p => { if (p.id !== assignmentState.personId) p.assignedTracks.forEach(trackId => tracksToHide.add(trackId)); }); } else { tracksToHide = new Set(folder.newPeople.flatMap(p => p.assignedTracks)); } const availableImages = folder.images.filter(img => !tracksToHide.has(img.uuid)); const currentPersonIndex = folder.newPeople.findIndex(p => p.id === assignmentState.personId); return ( <Grid item xs={12} key={folder.folderUUID} ref={node => { const map = folderRefs.current; if (node) map.set(folder.folderUUID, node); else map.delete(folder.folderUUID); }}> <Paper sx={{ p: 2 }}><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><Box sx={{ display: 'flex', alignItems: 'center' }}><Typography variant="h6">UUID: {folder.folderUUID}</Typography><Button size="small" variant="outlined" onClick={() => handleCopy(folder.folderUUID)} sx={{ ml: 1 }}>{TEXTS.copyUUID}</Button></Box>{assignmentState.isActive && assignmentState.folderIndex === folderIndex ? (<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}><Typography variant="subtitle2" color="primary">{assignmentState.isEditing ? `${TEXTS.editing} "${folder.newPeople[currentPersonIndex]?.name}"` : `${TEXTS.assigningTo} ${TEXTS.newPerson} ${folder.newPeople.length + 1}`}</Typography><Button variant="contained" size="small" onClick={handleDoneAssignment}>{TEXTS.done}</Button><Button variant="outlined" size="small" onClick={handleCancelAssignment}>{TEXTS.cancel}</Button></Box>) : ( <Button variant="contained" onClick={() => handleAddNewPerson(folderIndex)} disabled={assignmentState.isActive || renamingState.personId}>{TEXTS.addNewPerson}</Button> )} </Box>{folder.appearData && (<Box sx={{ my: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1}}><Typography variant="caption" sx={{color: 'text.secondary', wordBreak: 'break-word'}}>{`${TEXTS.appear}: ${folder.appearData.startTime} | ${TEXTS.disappear}: ${folder.appearData.endTime} | ${TEXTS.duration}: ${folder.appearData.duration}`}</Typography></Box>)}<Divider sx={{ my: 2 }} /> <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}><Typography variant="subtitle1">{TEXTS.unassignedTracks}</Typography>{assignmentState.isActive && assignmentState.folderIndex === folderIndex && availableImages.length > 0 && (<Button size="small" onClick={() => currentSelection.size === availableImages.length ? handleDeselectAll() : handleSelectAll(availableImages)}>{currentSelection.size === availableImages.length ? TEXTS.deselectAll : TEXTS.selectAll}</Button>)}</Box>{availableImages.length > 0 ? (<Grid container spacing={1}>{availableImages.map((image) => { const isSelected = currentSelection.has(image.uuid); const cardSx = { borderWidth: '2px', borderColor: isSelected ? 'primary.main' : 'error.main', transform: isSelected ? 'scale(0.95)' : 'none', transition: 'all 0.2s ease-in-out' }; return ( <Grid item xs={6} sm={4} md={2} lg={1} key={image.uuid}> <TrackIDCard image={image} sx={cardSx} onCopy={handleCopy} onClick={assignmentState.isActive && assignmentState.folderIndex === folderIndex ? () => handleTrackClickForAssignment(image.uuid) : () => handleImageClick(image.relatedImages)} /> </Grid> )})}</Grid>) : (<Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>{TEXTS.unassignedTracksNone}</Typography>)}{!(assignmentState.isActive && assignmentState.isEditing && assignmentState.folderIndex === folderIndex) && folder.newPeople.length > 0 && (<Box><Divider sx={{ my: 2 }}/><Typography variant="subtitle1" sx={{ mb: 1 }}>{TEXTS.assignedPeople}</Typography>{folder.newPeople.map((person, personIndex) => (<Paper key={person.id} variant="outlined" sx={{ p: 2, mb: 2 }}><Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>{renamingState.personId === person.id ? (<TextField value={renamingState.currentName} onChange={handleRenameChange} onKeyDown={handleRenameKeyDown} onBlur={handleSaveRename} size="small" variant="standard" autoFocus sx={{ flexGrow: 1, mr: 1, '& .MuiInputBase-input': { fontSize: '1.25rem', fontWeight: '500' } }} />) : (<Typography variant="h6" gutterBottom sx={{flexGrow: 1, mb: 0}}>{person.name || `${TEXTS.newPerson} ${personIndex + 1}`}</Typography>)}{renamingState.personId !== person.id && (<><Tooltip title={TEXTS.linkToUUID}><span><IconButton size="small" onClick={() => handleOpenLinkDialog(person, folderIndex)} disabled={assignmentState.isActive || renamingState.personId}><LinkIcon /></IconButton></span></Tooltip><Tooltip title={TEXTS.rename}><span><IconButton size="small" onClick={() => handleStartRename(person)} disabled={assignmentState.isActive || renamingState.personId}><DriveFileRenameOutlineIcon /></IconButton></span></Tooltip><Tooltip title={TEXTS.edit}><span><IconButton size="small" onClick={() => handleEditPerson(folderIndex, person)} disabled={assignmentState.isActive || renamingState.personId}><EditIcon /></IconButton></span></Tooltip></>)}</Box><Grid container spacing={1}>{person.assignedTracks.map(trackId => ( imageMap.has(trackId) ? (<Grid item xs={6} sm={4} md={2} lg={1} key={trackId}><TrackIDCard image={imageMap.get(trackId)} sx={{ borderColor: 'primary.main', borderWidth: '2px' }} onCopy={handleCopy} onClick={() => handleImageClick(imageMap.get(trackId).relatedImages)}/></Grid>) : null ))}</Grid>{person.linkedFolderUUID && ( <Box sx={{mt: 1, display: 'flex', alignItems: 'center', gap: 0.5}}><Typography variant="body2" sx={{ color: 'text.secondary' }}>{TEXTS.linkedTo}:</Typography><Link component="button" variant="body2" onClick={() => handleScrollToUUID(person.linkedFolderUUID)} sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': {textDecoration: 'underline'} }}>{person.linkedFolderUUID}</Link><Tooltip title={TEXTS.unlink}><IconButton size="small" sx={{p: 0.2}} onClick={() => handleUnlink(person.id, folderIndex)}><CloseIcon sx={{ fontSize: '1rem' }} /></IconButton></Tooltip></Box>)}{person.temporaryUUID ? (<Box sx={{mt: 1, display: 'flex', alignItems: 'center', gap: 0.5}}><Typography variant="body2" sx={{ color: 'text.secondary' }}>{TEXTS.temporaryUUID}:</Typography><Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace', wordBreak: 'break-all' }}>{person.temporaryUUID}</Typography><Tooltip title={TEXTS.copyTrackID}><IconButton size="small" sx={{p: 0.2}} onClick={() => handleCopy(person.temporaryUUID)}><ContentCopyIcon sx={{ fontSize: '1rem' }} /></IconButton></Tooltip><Tooltip title={TEXTS.deleteTemporaryUUID}><IconButton size="small" sx={{p: 0.2}} onClick={() => handleDeleteTemporaryUUID(folderIndex, person.id)}><CloseIcon sx={{ fontSize: '1rem' }} /></IconButton></Tooltip></Box>) : ( <Button startIcon={<AddCircleOutlineIcon/>} onClick={() => handleGenerateTemporaryUUID(folderIndex, person.id)} size="small" sx={{mt: 1, p: 0.2}}> {TEXTS.generateTemporaryUUID} </Button> )}</Paper>))}</Box>)} </Paper> </Grid> )})}
        </Grid>
      </Box>

      {navigation.isActive && ( <Paper elevation={4} sx={{ position: 'fixed', bottom: 24, right: 24, p: 1, display: 'flex', flexDirection: 'column', gap: 1, zIndex: 'tooltip' }}> <IconButton onClick={handleNavPrev} disabled={navigation.currentIndex <= 0}><KeyboardArrowUpIcon /></IconButton> <Typography align="center" variant="body2">{`${navigation.currentIndex + 1} / ${navigation.targets.length}`}</Typography> <IconButton onClick={handleNavNext} disabled={navigation.currentIndex >= navigation.targets.length - 1}><KeyboardArrowDownIcon /></IconButton> <Divider /> <Tooltip title={TEXTS.closeNavigation}><IconButton onClick={handleCloseNavigation} size="small"><CloseIcon fontSize="small" /></IconButton></Tooltip> </Paper> )}
      <Dialog open={linkState.isOpen} onClose={handleCloseLinkDialog} fullWidth maxWidth="sm"><DialogTitle>{TEXTS.linkToUUID}</DialogTitle><DialogContent><DialogContentText sx={{mb: 2}}>{TEXTS.enterUUID}</DialogContentText><TextField autoFocus margin="dense" id="uuid-link-input" label="Folder or Person UUID" type="text" fullWidth variant="outlined" value={linkState.inputValue} onChange={(e) => setLinkState(s => ({...s, inputValue: e.target.value, error: ''}))} error={!!linkState.error} helperText={linkState.error}/></DialogContent><DialogActions><Button onClick={handleCloseLinkDialog}>{TEXTS.cancel}</Button><Button onClick={handleSaveLink} variant="contained">{TEXTS.save}</Button></DialogActions></Dialog>
      <Dialog open={manualOpen} onClose={() => setManualOpen(false)}><DialogTitle>{TEXTS.userManualTitle}</DialogTitle><DialogContent><DialogContentText>{TEXTS.userManualContent}</DialogContentText><Link href="http://www.tdintelligence.wiki" target="_blank" rel="noopener noreferrer" sx={{mt: 2, display: 'block'}}>{TEXTS.userManualLinkText}</Link></DialogContent><DialogActions><Button onClick={() => setManualOpen(false)}>{TEXTS.close}</Button></DialogActions></Dialog>
      <Dialog open={isMissedPeopleDialogOpen} onClose={() => setIsMissedPeopleDialogOpen(false)}><DialogTitle>{TEXTS.adjustTotal}</DialogTitle><DialogContent><DialogContentText>{TEXTS.missedPeopleHelper}</DialogContentText><TextField autoFocus margin="dense" label={TEXTS.missedPeopleLabel} type="number" fullWidth variant="standard" value={missedPeopleInput} onChange={(e) => setMissedPeopleInput(e.target.value)}/></DialogContent><DialogActions><Button onClick={() => setIsMissedPeopleDialogOpen(false)}>{TEXTS.cancel}</Button><Button onClick={handleSaveMissedPeople}>{TEXTS.save}</Button></DialogActions></Dialog>
      <Dialog open={isModeSelectOpen} onClose={() => setIsModeSelectOpen(false)}><DialogTitle>{TEXTS.selectImportMode}</DialogTitle><DialogContent><Stack spacing={2} sx={{pt: 1}}><Button variant="contained" onClick={() => handleModeSelected('full_store')}>{TEXTS.fullStoreTracking}</Button><Typography variant="caption">{TEXTS.fullStoreTrackingDesc}</Typography><Button variant="outlined" onClick={() => handleModeSelected('counting_only')}>{TEXTS.countingOnly}</Button><Typography variant="caption">{TEXTS.countingOnlyDesc}</Typography></Stack></DialogContent></Dialog>
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