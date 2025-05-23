import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Typography,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Switch,
  FormControlLabel,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Divider,
  RadioGroup,
  Radio,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip // Added Tooltip for better UX on icons
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Add as PlusIcon,
  Close as XIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  Folder as FolderIcon,
  Edit as EditIcon,
  Delete as TrashIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  ContentCopy as CopyIcon,
  ChevronRight as ExpandIcon, // Changed from ExpandMoreIcon for a simpler look
} from '@mui/icons-material';

// Import SyntaxHighlighter and styles
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs'; // Dark theme
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';     // Light theme

const App = () => {
  // --- State for Settings ---
  const [settings, setSettings] = useState(() => {
    try {
      const storedSettings = localStorage.getItem('apiClientSettings');
      return storedSettings ? {
        defaultUrl: 'https://official-joke-api.appspot.com/random_joke',
        defaultMethod: 'GET',
        autoFormatRequestJson: true,
        autoFormatResponseJson: true,
        maxHistoryItems: 50,
        enableCorsProxy: false,
        requestTimeout: 10000,
        showRequestTime: true,
        showResponseStatus: true,
        enableRequestBodyValidation: true,
        clearHistoryOnAppLoad: false,
        defaultHeaders: [],
        defaultAuthToken: '',
        defaultBodyType: 'none',
        responseTextWrap: true,
        responseBodyFontSize: 14,
        theme: 'light',
        defaultAuthType: 'none',
        defaultBasicAuthUsername: '',
        defaultBasicAuthPassword: '',
        highlightSyntaxInResponse: true,
        ...JSON.parse(storedSettings)
      } : {
        defaultUrl: 'https://official-joke-api.appspot.com/random_joke',
        defaultMethod: 'GET',
        autoFormatRequestJson: true,
        autoFormatResponseJson: true,
        maxHistoryItems: 50,
        enableCorsProxy: false,
        requestTimeout: 10000,
        showRequestTime: true,
        showResponseStatus: true,
        enableRequestBodyValidation: true,
        clearHistoryOnAppLoad: false,
        defaultHeaders: [],
        defaultAuthToken: '',
        defaultBodyType: 'none',
        responseTextWrap: true,
        responseBodyFontSize: 14,
        theme: 'light',
        defaultAuthType: 'none',
        defaultBasicAuthUsername: '',
        defaultBasicAuthPassword: '',
        highlightSyntaxInResponse: true,
      };
    } catch (e) {
      console.error("Failed to load settings from localStorage, using defaults:", e);
      return {
        defaultUrl: 'https://official-joke-api.appspot.com/random_joke',
        defaultMethod: 'GET',
        autoFormatRequestJson: true,
        autoFormatResponseJson: true,
        maxHistoryItems: 50,
        enableCorsProxy: false,
        requestTimeout: 10000,
        showRequestTime: true,
        showResponseStatus: true,
        enableRequestBodyValidation: true,
        clearHistoryOnAppLoad: false,
        defaultHeaders: [],
        defaultAuthToken: '',
        defaultBodyType: 'none',
        responseTextWrap: true,
        responseBodyFontSize: 14,
        theme: 'light',
        defaultAuthType: 'none',
        defaultBasicAuthUsername: '',
        defaultBasicAuthPassword: '',
        highlightSyntaxInResponse: true,
      };
    }
  });


  // --- State for Request Parameters ---
  const [url, setUrl] = useState(settings.defaultUrl);
  const [method, setMethod] = useState(settings.defaultMethod);
  const [queryParams, setQueryParams] = useState([{ id: crypto.randomUUID(), key: '', value: '' }]);
  const [authType, setAuthType] = useState(settings.defaultAuthType);
  const [authToken, setAuthToken] = useState(settings.defaultAuthToken);
  const [basicAuthUsername, setBasicAuthUsername] = useState(settings.defaultBasicAuthUsername);
  const [basicAuthPassword, setBasicAuthPassword] = useState(settings.defaultBasicAuthPassword);
  const [headers, setHeaders] = useState(settings.defaultHeaders.length > 0 ? settings.defaultHeaders.map(h => ({ ...h, id: crypto.randomUUID() })) : [{ id: crypto.randomUUID(), key: '', value: '' }]);
  const [requestBody, setRequestBody] = useState('');
  const [bodyType, setBodyType] = useState(settings.defaultBodyType);
  const [formEncodedBody, setFormEncodedBody] = useState([{ id: crypto.randomUUID(), key: '', value: '' }]);
  const [activeRequestTab, setActiveRequestTab] = useState(0);

  // --- State for Response ---
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseHeaders, setResponseHeaders] = useState({});
  const [responseBody, setResponseBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestTime, setRequestTime] = useState(null);
  const [activeResponseTab, setActiveResponseTab] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState('');

  // --- State for Collections & History ---
  const [collections, setCollections] = useState(() => {
    try {
      const storedCollections = localStorage.getItem('apiClientCollections');
      return storedCollections ? JSON.parse(storedCollections) : [];
    } catch (e) {
      console.error("Failed to load collections from localStorage, starting with empty array:", e);
      return [];
    }
  });
  const [expandedCollection, setExpandedCollection] = useState(null); // State for expanded collection

  const [history, setHistory] = useState(() => {
    try {
      const storedHistory = localStorage.getItem('apiClientHistory');
      const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
      return settings.clearHistoryOnAppLoad ? [] : parsedHistory;
    } catch (e) {
      console.error("Failed to load history from localStorage, starting with empty array:", e);
      return [];
    }
  });
  const [activeSidebarTab, setActiveSidebarTab] = useState(0);

  // --- State for Dialogs ---
  const [isSaveRequestDialogOpen, setIsSaveRequestDialogOpen] = useState(false);
  const [newRequestName, setNewRequestName] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [isNewCollectionDialogOpen, setIsNewCollectionDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isEditCollectionDialogOpen, setIsEditCollectionDialogOpen] = useState(false);
  const [editCollectionId, setEditCollectionId] = useState(null);
  const [editCollectionName, setEditCollectionName] = useState('');
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState(0);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogDetails, setConfirmDialogDetails] = useState({
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const fileInputRef = useRef(null);

  // --- MUI Theme Configuration ---
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: settings.theme,
        primary: {
          main: '#1976d2',
        },
        secondary: {
          main: '#dc004e',
        },
        success: {
          main: '#4CAF50',
        },
        warning: {
          main: '#FFC107',
        },
        error: {
          main: '#F44336',
        },
        info: {
          main: '#2196F3',
        },
        background: {
          default: settings.theme === 'dark' ? '#121212' : '#f5f5f5',
          paper: settings.theme === 'dark' ? '#1e1e1e' : '#ffffff',
        },
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 4, // Slightly less rounded for a simpler look
              textTransform: 'none',
              fontWeight: 500,
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
              },
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            root: {
              borderRadius: 4,
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
              '&.Mui-selected': {
                fontWeight: 700,
              },
            },
          },
        },
        // Removed MuiAccordion styles as Accordion is no longer used for collections
        MuiListItem: {
          styleOverrides: {
            root: {
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              },
            },
          },
        },
      },
    }), [settings.theme]);

  // --- Local Storage Effects ---
  useEffect(() => {
    try {
      localStorage.setItem('apiClientSettings', JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings to localStorage:", e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('apiClientCollections', JSON.stringify(collections));
    } catch (e) {
      console.error("Failed to save collections to localStorage:", e);
    }
  }, [collections]);

  useEffect(() => {
    try {
      const limitedHistory = history.slice(0, settings.maxHistoryItems === 0 ? history.length : settings.maxHistoryItems);
      localStorage.setItem('apiClientHistory', JSON.stringify(limitedHistory));
    } catch (e) {
      console.error("Failed to save history to localStorage:", e);
    }
  }, [history, settings.maxHistoryItems]);


  // --- Helper Functions for Key-Value Pairs (Headers, Query Params, Form Encoded) ---
  const addKeyValuePair = useCallback((setter, currentItems) => {
    setter([...currentItems, { id: crypto.randomUUID(), key: '', value: '' }]);
  }, []);

  const updateKeyValuePair = useCallback((setter, currentItems, id, field, value) => {
    setter(currentItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }, []);

  const removeKeyValuePair = useCallback((setter, currentItems, id) => {
    setter(currentItems.filter(item => item.id !== id));
  }, []);

  // --- Request Logic ---
  const sendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponseStatus(null);
    setResponseHeaders({});
    setResponseBody('');
    setRequestTime(null);
    setCopyFeedback('');

    const startTime = performance.now();

    try {
      let requestUrl = url;
      const validQueryParams = queryParams.filter(p => p.key && p.value);
      if (validQueryParams.length > 0) {
        const queryString = new URLSearchParams(
          validQueryParams.map(p => [p.key, p.value])
        ).toString();
        requestUrl = `${url.split('?')[0]}?${queryString}`;
      }

      const options = {
        method: method,
        headers: {},
      };

      if (authType === 'bearer' && authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
      } else if (authType === 'basic' && basicAuthUsername && basicAuthPassword) {
        const credentials = btoa(`${basicAuthUsername}:${basicAuthPassword}`);
        options.headers['Authorization'] = `Basic ${credentials}`;
      }

      headers.forEach(header => {
        if (header.key && header.value) {
          options.headers[header.key] = header.value;
        }
      });

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (bodyType === 'raw-json') {
          try {
            const parsedBody = JSON.parse(requestBody);
            options.body = JSON.stringify(parsedBody, null, settings.autoFormatRequestJson ? 2 : 0);
            options.headers['Content-Type'] = 'application/json';
          } catch (e) {
            if (settings.enableRequestBodyValidation) {
              setError('Invalid JSON in request body. Please format correctly.');
              setLoading(false);
              return;
            } else {
              options.body = requestBody;
              options.headers['Content-Type'] = 'text/plain';
            }
          }
        } else if (bodyType === 'form-urlencoded') {
          const formData = new URLSearchParams();
          formEncodedBody.forEach(item => {
            if (item.key && item.value) {
              formData.append(item.key, item.value);
            }
          });
          options.body = formData.toString();
          options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      }

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), settings.requestTimeout);
      options.signal = controller.signal;

      const response = await fetch(requestUrl, options);
      clearTimeout(id);

      const endTime = performance.now();
      setRequestTime((endTime - startTime).toFixed(2));

      setResponseStatus(response.status);

      const resHeaders = {};
      response.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });
      setResponseHeaders(resHeaders);

      const contentType = response.headers.get('content-type');
      let responseBodyText = '';
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        responseBodyText = JSON.stringify(json, null, settings.autoFormatResponseJson ? 2 : 0);
      } else {
        responseBodyText = await response.text();
      }
      setResponseBody(responseBodyText);

      const newHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        requestDetails: { url, method, queryParams, authType, authToken, basicAuthUsername, basicAuthPassword, headers, requestBody, bodyType, formEncodedBody },
        responseDetails: { status: response.status, headers: resHeaders, body: responseBodyText },
      };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory]);

    } catch (err) {
      if (err.name === 'AbortError') {
        setError(`Error: Request timed out after ${settings.requestTimeout}ms.`);
      } else {
        setError(`Error: ${err.message}. Please check the URL, network connection, or CORS issues.`);
      }
      setResponseStatus('Error');
      setResponseBody('');
    } finally {
      setLoading(false);
    }
  };

  // --- Request/Response Utilities ---
  const formatJsonBody = useCallback(() => {
    try {
      setRequestBody(JSON.stringify(JSON.parse(requestBody), null, 2));
      setError(null);
    } catch (e) {
      setError(`${e}`);
    }
  }, [requestBody]);

  const clearAllFields = useCallback(() => {
    setUrl(settings.defaultUrl);
    setMethod(settings.defaultMethod);
    setQueryParams([{ id: crypto.randomUUID(), key: '', value: '' }]);
    setAuthType(settings.defaultAuthType);
    setAuthToken(settings.defaultAuthToken);
    setBasicAuthUsername(settings.defaultBasicAuthUsername);
    setBasicAuthPassword(settings.defaultBasicAuthPassword);
    setHeaders(settings.defaultHeaders.length > 0 ? settings.defaultHeaders.map(h => ({ ...h, id: crypto.randomUUID() })) : [{ id: crypto.randomUUID(), key: '', value: '' }]);
    setRequestBody('');
    setBodyType(settings.defaultBodyType);
    setFormEncodedBody([{ id: crypto.randomUUID(), key: '', value: '' }]);
    setResponseStatus(null);
    setResponseHeaders({});
    setResponseBody('');
    setError(null);
    setRequestTime(null);
    setCopyFeedback('');
  }, [settings]);

  const saveResponseBodyAsJson = useCallback(() => {
    if (!responseBody) {
      setError('No response body to save.');
      return;
    }
    try {
      const blob = new Blob([responseBody], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `response_${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError('Failed to save response body.');
      console.error(e);
    }
  }, [responseBody]);

  const copyResponseBody = useCallback(() => {
    if (!responseBody) {
      setCopyFeedback('Nothing to copy!');
      return;
    }
    try {
      navigator.clipboard.writeText(responseBody)
        .then(() => setCopyFeedback('Copied!'))
        .catch((err) => {
          setCopyFeedback('Failed to copy.');
          console.error('Failed to copy response body:', err);
        });
    } catch (err) {
      setCopyFeedback('Failed to copy.');
      console.error('Failed to copy response body:', err);
    }
    setTimeout(() => setCopyFeedback(''), 2000);
  }, [responseBody]);

  // --- Collection Management ---
  const openSaveRequestDialog = useCallback(() => {
    setNewRequestName('');
    setSelectedCollectionId(collections.length > 0 ? collections[0].id : '');
    setIsSaveRequestDialogOpen(true);
  }, [collections]);

  const handleSaveRequest = useCallback(() => {
    if (!newRequestName.trim() || !selectedCollectionId) {
      setError('Please enter a request name and select a collection.');
      return;
    }

    const newRequest = {
      id: crypto.randomUUID(),
      name: newRequestName.trim(),
      url,
      method,
      queryParams: queryParams.map(p => ({ ...p })),
      authType,
      authToken,
      basicAuthUsername,
      basicAuthPassword,
      headers: headers.map(h => ({ ...h })),
      requestBody,
      bodyType,
      formEncodedBody: formEncodedBody.map(f => ({ ...f })),
    };

    setCollections(prevCollections =>
      prevCollections.map(col =>
        col.id === selectedCollectionId
          ? { ...col, requests: [...col.requests, newRequest] }
          : col
      )
    );
    setIsSaveRequestDialogOpen(false);
    setError(null);
  }, [newRequestName, selectedCollectionId, url, method, queryParams, authType, authToken, basicAuthUsername, basicAuthPassword, headers, requestBody, bodyType, formEncodedBody]);

  const handleNewCollection = useCallback(() => {
    if (!newCollectionName.trim()) {
      setError('Collection name cannot be empty.');
      return;
    }
    setCollections(prevCollections => [
      ...prevCollections,
      { id: crypto.randomUUID(), name: newCollectionName.trim(), requests: [] }
    ]);
    setNewCollectionName('');
    setIsNewCollectionDialogOpen(false);
    setError(null);
  }, [newCollectionName]);

  const loadRequestFromCollection = useCallback((request) => {
    setUrl(request.url);
    setMethod(request.method);
    setQueryParams(request.queryParams ? request.queryParams.map(p => ({ ...p, id: crypto.randomUUID() })) : [{ id: crypto.randomUUID(), key: '', value: '' }]);
    setAuthType(request.authType || 'none');
    setAuthToken(request.authToken || '');
    setBasicAuthUsername(request.basicAuthUsername || '');
    setBasicAuthPassword(request.basicAuthPassword || '');
    setHeaders(request.headers ? request.headers.map(h => ({ ...h, id: crypto.randomUUID() })) : [{ id: crypto.randomUUID(), key: '', value: '' }]);
    setRequestBody(request.requestBody || '');
    setBodyType(request.bodyType || 'none');
    setFormEncodedBody(request.formEncodedBody ? request.formEncodedBody.map(f => ({ ...f, id: crypto.randomUUID() })) : [{ id: crypto.randomUUID(), key: '', value: '' }]);
    setResponseStatus(null);
    setResponseHeaders({});
    setResponseBody('');
    setError(null);
    setRequestTime(null);
    setCopyFeedback('');
  }, []);

  const loadRequestFromHistory = useCallback((historyItem) => {
    const request = historyItem.requestDetails;
    setUrl(request.url);
    setMethod(request.method);
    setQueryParams(request.queryParams ? request.queryParams.map(p => ({ ...p, id: crypto.randomUUID() })) : [{ id: crypto.randomUUID(), key: '', value: '' }]);
    setAuthType(request.authType || 'none');
    setAuthToken(request.authToken || '');
    setBasicAuthUsername(request.basicAuthUsername || '');
    setBasicAuthPassword(request.basicAuthPassword || '');
    setHeaders(request.headers ? request.headers.map(h => ({ ...h, id: crypto.randomUUID() })) : [{ id: crypto.randomUUID(), key: '', value: '' }]);
    setRequestBody(request.requestBody || '');
    setBodyType(request.bodyType || 'none');
    setFormEncodedBody(request.formEncodedBody ? request.formEncodedBody.map(f => ({ ...f, id: crypto.randomUUID() })) : [{ id: crypto.randomUUID(), key: '', value: '' }]);

    setResponseStatus(historyItem.responseDetails.status);
    setResponseHeaders(historyItem.responseDetails.headers);
    setResponseBody(historyItem.responseDetails.body);
    setError(null);
    setRequestTime(null);
    setCopyFeedback('');
    setActiveResponseTab(0);
  }, []);

  const handleDeleteRequestFromCollection = useCallback((collectionId, requestId, requestName) => {
    setConfirmDialogDetails({
      title: `Delete Request "${requestName}"?`,
      message: 'Are you sure you want to delete this request from the collection? This action cannot be undone.',
      onConfirm: () => {
        setCollections(prevCollections =>
          prevCollections.map(col =>
            col.id === collectionId
              ? { ...col, requests: col.requests.filter(req => req.id !== requestId) }
              : col
          )
        );
        setIsConfirmDialogOpen(false);
      },
    });
    setIsConfirmDialogOpen(true);
  }, []);

  const handleDeleteCollection = useCallback((collectionId, collectionName) => {
    setConfirmDialogDetails({
      title: `Delete Collection "${collectionName}"?`,
      message: 'Are you sure you want to delete this collection and all its requests? This action cannot be undone.',
      onConfirm: () => {
        setCollections(prevCollections => prevCollections.filter(col => col.id !== collectionId));
        setIsConfirmDialogOpen(false);
        setExpandedCollection(null); // Close any expanded collection
      },
    });
    setIsConfirmDialogOpen(true);
  }, []);

  const openEditCollectionDialog = useCallback((collection) => {
    setEditCollectionId(collection.id);
    setEditCollectionName(collection.name);
    setIsEditCollectionDialogOpen(true);
  }, []);

  const handleEditCollectionName = useCallback(() => {
    if (!editCollectionName.trim()) {
      setError('Collection name cannot be empty.');
      return;
    }
    setCollections(prevCollections =>
      prevCollections.map(col =>
        col.id === editCollectionId ? { ...col, name: editCollectionName.trim() } : col
      )
    );
    setIsEditCollectionDialogOpen(false);
    setError(null);
  }, [editCollectionName, editCollectionId]);

  const handleClearHistory = useCallback(() => {
    setConfirmDialogDetails({
      title: 'Clear All History?',
      message: `Are you sure you want to clear your entire request history? This action cannot be undone.${history.length > 0 ? ' You have ' + history.length + ' items in your history.' : ''}`,
      onConfirm: () => {
        setHistory([]);
        setIsConfirmDialogOpen(false);
      },
    });
    setIsConfirmDialogOpen(true);
  }, []);


  // --- Export/Import Functionality (Collections Only) ---
  const exportData = useCallback(() => {
    const dataToExport = {
      collections,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api_collections_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [collections]);

  const importData = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.collections && Array.isArray(importedData.collections)) {
          const validatedCollections = importedData.collections.map(col => ({
            id: col.id || crypto.randomUUID(),
            name: col.name || 'Unnamed Collection',
            requests: Array.isArray(col.requests) ? col.requests.map(req => ({
              id: req.id || crypto.randomUUID(),
              name: req.name || 'Unnamed Request',
              url: req.url || '',
              method: req.method || 'GET',
              queryParams: Array.isArray(req.queryParams) ? req.queryParams.map(p => ({ ...p, id: p.id || crypto.randomUUID() })) : [],
              authType: req.authType || 'none',
              authToken: req.authToken || '',
              basicAuthUsername: req.basicAuthUsername || '',
              basicAuthPassword: req.basicAuthPassword || '',
              headers: Array.isArray(req.headers) ? req.headers.map(h => ({ ...h, id: h.id || crypto.randomUUID() })) : [],
              requestBody: req.requestBody || '',
              bodyType: req.bodyType || 'none',
              formEncodedBody: Array.isArray(req.formEncodedBody) ? req.formEncodedBody.map(f => ({ ...f, id: f.id || crypto.randomUUID() })) : [],
            })) : [],
          }));
          setCollections(validatedCollections);
          setError(null);
          alert('Collections imported successfully!');
        } else {
          setError('Imported file does not contain collections data in the expected format. Please ensure it\'s a valid export file.');
          return;
        }
      } catch (err) {
        setError('Invalid JSON file or unexpected format. Please ensure it\'s a valid collections export file.',err);
        console.error("Import error:", err);
      } finally {
        event.target.value = null;
      }
    };
    reader.readAsText(file);
  }, []);

  // --- Settings Handlers ---
  const handleSettingChange = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleDefaultHeadersChange = useCallback((id, field, value) => {
    setSettings(prev => ({
      ...prev,
      defaultHeaders: prev.defaultHeaders.map(header =>
        header.id === id ? { ...header, [field]: value } : header
      )
    }));
  }, []);

  const addDefaultHeader = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      defaultHeaders: [...prev.defaultHeaders, { id: crypto.randomUUID(), key: '', value: '' }]
    }));
  }, []);

  const removeDefaultHeader = useCallback((id) => {
    setSettings(prev => ({
      ...prev,
      defaultHeaders: prev.defaultHeaders.filter(header => header.id !== id)
    }));
  }, []);

  // --- Syntax Highlighting Logic for Response Panel ---
  const getLanguage = (body) => {
    try {
      JSON.parse(body);
      return 'json';
    } catch (e) {
      if (body.trim().startsWith('<') && body.trim().endsWith('>')) {
        if (body.includes('<html') || body.includes('<body') || body.includes('<div')) {
          return 'html';
        }
        return 'xml';
      }
      return 'plaintext';
    }
  };

  const syntaxStyle = settings.theme === 'dark' ? darcula : vs;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          fontFamily: 'Inter, sans-serif',
          '& textarea::-webkit-scrollbar, & div[sx*="overflowY:auto"]::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '& textarea::-webkit-scrollbar-track, & div[sx*="overflowY:auto"]::-webkit-scrollbar-track': {
            background: theme.palette.mode === 'dark' ? '#333' : '#f1f1f1',
            borderRadius: '10px',
          },
          '& textarea::-webkit-scrollbar-thumb, & div[sx*="overflowY:auto"]::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark' ? '#666' : '#888',
            borderRadius: '10px',
          },
          '& textarea::-webkit-scrollbar-thumb:hover, & div[sx*="overflowY:auto"]::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.mode === 'dark' ? '#888' : '#555',
          },
        }}
      >
        {/* Main Content Area */}
        <Box
          sx={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1, // Reduced gap
            bgcolor: 'background.default', // Use default background for cleaner look
          }}
        >
          {/* 1. Workspace Panel (Sidebar) */}
          <Box
            sx={{
              width: { xs: '100%', md: '18%' }, // Fixed width on md+, full width on xs
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 1, // Reduced gap
              bgcolor: 'background.paper', // Slightly different background for distinction
              borderRight: { xs: 0, md: '1px solid' },
              borderBottom: { xs: '1px solid', md: 0 },
              borderColor: 'divider',
              p: 1.5, // Reduced padding
              height: { xs: 'auto', md: '100%' },
              minHeight: { xs: '30vh', md: 'auto' }, // Min height for mobile
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" component="h2" sx={{ color: 'orangered', fontWeight: 'bold' }}>
                VectorLink
              </Typography>
              <Tooltip title="Settings & Import/Export">
                <IconButton onClick={() => setIsSettingsDialogOpen(true)} color="inherit" size="small">
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Sidebar Tabs */}
            <Tabs
              value={activeSidebarTab}
              onChange={(event, newValue) => setActiveSidebarTab(newValue)}
              aria-label="sidebar tabs"
              variant="fullWidth"
              sx={{ borderBottom: '1px solid', borderColor: 'divider', minHeight: '50px' }}
            >
              <Tab icon={<FolderIcon fontSize="small" />} label="" sx={{ textTransform: 'none', minHeight: '40px' }} />
              <Tab icon={<HistoryIcon fontSize="small" />} label="" sx={{ textTransform: 'none', minHeight: '40px' }} />
            </Tabs>

            {/* Collections Content */}
            {activeSidebarTab === 0 && (
              <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Button
                  variant="contained"
                  startIcon={<PlusIcon />}
                  onClick={() => setIsNewCollectionDialogOpen(true)}
                  size="small"
                  sx={{ mb: 1 }}
                >
                  New Collection
                </Button>
                {collections.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1, textAlign: 'center' }}>
                    No collections yet.
                  </Typography>
                )}
                <List dense disablePadding>
                  {collections.map(collection => (
                    <Box key={collection.id} sx={{ mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: '4px' }}>
                      <ListItem
                        secondaryAction={
                          <Box>
                            <Tooltip title="Edit Collection">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditCollectionDialog(collection); }}>
                                <EditIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Collection">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteCollection(collection.id, collection.name); }}>
                                <TrashIcon fontSize="inherit" color="error" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={expandedCollection === collection.id ? "Collapse" : "Expand"}>
                              <IconButton size="small" onClick={() => setExpandedCollection(expandedCollection === collection.id ? null : collection.id)}>
                                <ExpandIcon sx={{ transform: expandedCollection === collection.id ? 'rotate(90deg)' : 'none' }} fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                        sx={{
                          py: 0.5, pr: 0.5, pl: 1,
                          bgcolor: 'action.hover',
                          borderBottom: expandedCollection === collection.id ? '1px solid' : 'none',
                          borderColor: 'divider',
                        }}
                      >
                        <ListItemText
                          primary={<Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>{collection.name}</Typography>}
                        />
                      </ListItem>
                      {expandedCollection === collection.id && (
                        <List dense disablePadding sx={{ bgcolor: 'background.paper' }}>
                          {collection.requests.length === 0 ? (
                            <ListItem>
                              <ListItemText
                                primary={<Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  No requests.
                                </Typography>}
                              />
                            </ListItem>
                          ) : (
                            collection.requests.map(request => (
                              <ListItem
                                key={request.id}
                                onClick={() => loadRequestFromCollection(request)}
                                secondaryAction={
                                  <Tooltip title="Delete Request">
                                    <IconButton
                                      edge="end"
                                      aria-label="delete"
                                      onClick={(e) => { e.stopPropagation(); handleDeleteRequestFromCollection(collection.id, request.id, request.name); }}
                                      size="small"
                                    >
                                      <XIcon fontSize="inherit" color="error" />
                                    </IconButton>
                                  </Tooltip>
                                }
                                sx={{
                                  pr: 1, pl: 1, py: 0.5,
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: 'action.selected' },
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: '60px' }}>
                                  <Typography variant="caption" sx={{ fontWeight: 'bold', color:
                                    request.method === 'GET' ? theme.palette.success.main :
                                    request.method === 'POST' ? theme.palette.primary.main :
                                    request.method === 'PUT' ? theme.palette.warning.main :
                                    request.method === 'DELETE' ? theme.palette.error.main :
                                    theme.palette.secondary.main
                                  }}>
                                    {request.method}
                                  </Typography>
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {request.name}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))
                          )}
                        </List>
                      )}
                    </Box>
                  ))}
                </List>
              </Box>
            )}

            {/* History Content */}
            {activeSidebarTab === 1 && (
              <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<TrashIcon />}
                  onClick={handleClearHistory}
                  color="error"
                  size="small"
                  sx={{ mb: 1 }}
                >
                  Clear History
                </Button>
                {history.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1, textAlign: 'center' }}>
                    No history yet.
                  </Typography>
                )}
                <List dense disablePadding>
                  {history.map(item => (
                    <ListItem
                      key={item.id}
                      onClick={() => loadRequestFromHistory(item)}
                      sx={{
                        pr: 1, pl: 1, py: 0.5, mb: 0.5,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.selected' },
                        border: '1px solid', borderColor: 'divider', borderRadius: '4px'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color:
                              item.requestDetails.method === 'GET' ? theme.palette.success.main :
                              item.requestDetails.method === 'POST' ? theme.palette.primary.main :
                              item.requestDetails.method === 'PUT' ? theme.palette.warning.main :
                              item.requestDetails.method === 'DELETE' ? theme.palette.error.main :
                              theme.palette.secondary.main, flexShrink: 0
                            }}>
                              {item.requestDetails.method}
                            </Typography>
                            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                              {item.requestDetails.url}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Status: <Box component="span" sx={{ fontWeight: 'bold', color:
                              item.responseDetails.status >= 200 && item.responseDetails.status < 300 ? theme.palette.success.main :
                              item.responseDetails.status >= 400 && item.responseDetails.status < 500 ? theme.palette.warning.main :
                              item.responseDetails.status >= 500 ? theme.palette.error.main :
                              theme.palette.text.secondary
                            }}>
                              {item.responseDetails.status || 'N/A'}
                            </Box> • {new Date(item.timestamp).toLocaleString()}
                          </Typography>
                        }
                        slotProps={{ primary: { sx: { mb: 0 } }}}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          {/* 2. Request Panel */}
          <Box
            sx={{
              flexGrow: 2, // Allow it to take more space
              display: 'flex',
              flexDirection: 'column',
              minHeight: { xs: '50vh', md: 'auto' },
              borderRight: { xs: 0, md: '1px solid' },
              borderBottom: { xs: '1px solid', md: 0 },
              borderColor: 'divider',
              p: 1.5, // Reduced padding
            }}
          >
            {/* URL & Method Input */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, alignItems: { xs: 'stretch', sm: 'center' }, mb: 1 }}>
              <FormControl sx={{ minWidth: 110 }}>
                <Select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  size="small"
                  displayEmpty
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="PATCH">PATCH</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                </Select>
              </FormControl>
              <TextField
                placeholder="Enter URL"
                variant="outlined"
                fullWidth
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                sx={{ flexGrow: 1 }}
                size="small"
              />
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={sendRequest}
                disabled={loading}
                sx={{
                  minWidth: { xs: '100%', sm: 'auto' },
                  height: '38px', // Match TextField height for size="small"
                  width: { xs: 'auto', sm: '120px' }
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Send'}
              </Button>
              <Tooltip title="Clear All Fields">
                <IconButton onClick={clearAllFields} color="inherit" size="small">
                  <XIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Save Request">
                <IconButton onClick={openSaveRequestDialog} color="inherit" size="small">
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            {error && (
              <Box sx={{ bgcolor: 'error.light', color: 'error.contrastText', p: 1, borderRadius: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{error}</Typography>
                <IconButton size="small" onClick={() => setError(null)} color="inherit"><XIcon fontSize="small" /></IconButton>
              </Box>
            )}

            {/* Request Tabs */}
            <Tabs
              value={activeRequestTab}
              onChange={(event, newValue) => setActiveRequestTab(newValue)}
              aria-label="request tabs"
              sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 1, minHeight: '40px' }}
            >
              <Tab label="Query" sx={{ textTransform: 'none', minHeight: '40px' }} />
              <Tab label="Auth" sx={{ textTransform: 'none', minHeight: '40px' }} />
              <Tab label="Headers" sx={{ textTransform: 'none', minHeight: '40px' }} />
              <Tab label="Body" sx={{ textTransform: 'none', minHeight: '40px' }} />
            </Tabs>

            {/* Query Params Content */}
            {activeRequestTab === 0 && (
              <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Query Parameters</Typography>
                {queryParams.map((param) => (
                  <Grid container spacing={1} key={param.id} alignItems="center" sx={{ mb: 0.5 }}>
                    <Grid item xs={5}>
                      <TextField fullWidth placeholder="Key" value={param.key} onChange={(e) => updateKeyValuePair(setQueryParams, queryParams, param.id, 'key', e.target.value)} size="small" />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField fullWidth placeholder="Value" value={param.value} onChange={(e) => updateKeyValuePair(setQueryParams, queryParams, param.id, 'value', e.target.value)} size="small" />
                    </Grid>
                    <Grid item xs={1}>
                      <Tooltip title="Remove Parameter">
                        <IconButton onClick={() => removeKeyValuePair(setQueryParams, queryParams, param.id)} size="small" color="error" >
                          <XIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                ))}
                <Button startIcon={<PlusIcon />} onClick={() => addKeyValuePair(setQueryParams, queryParams)} variant="outlined" size="small" sx={{ mt: 1 }}>
                  Add Parameter
                </Button>
              </Box>
            )}

            {/* Auth Content */}
            {activeRequestTab === 1 && (
              <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Authentication Type</Typography>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <RadioGroup
                    row
                    aria-label="auth-type"
                    name="auth-type-group"
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                  >
                    <FormControlLabel value="none" control={<Radio size="small" />} label="None" />
                    <FormControlLabel value="bearer" control={<Radio size="small" />} label="Bearer Token" />
                    <FormControlLabel value="basic" control={<Radio size="small" />} label="Basic Auth" />
                  </RadioGroup>
                </FormControl>

                {authType === 'bearer' && (
                  <TextField
                    fullWidth
                    label="Bearer Token"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Enter Bearer Token"
                    size="small"
                  />
                )}

                {authType === 'basic' && (
                  <Box>
                    <TextField fullWidth label="Username" value={basicAuthUsername} onChange={(e) => setBasicAuthUsername(e.target.value)} variant="outlined" size="small" sx={{ mb: 1 }} />
                    <TextField fullWidth label="Password" type="password" value={basicAuthPassword} onChange={(e) => setBasicAuthPassword(e.target.value)} variant="outlined" size="small" />
                  </Box>
                )}
              </Box>
            )}

            {/* Headers Content */}
            {activeRequestTab === 2 && (
              <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Headers</Typography>
                {headers.map((header) => (
                  <Grid container spacing={1} key={header.id} alignItems="center" sx={{ mb: 0.5 }}>
                    <Grid item xs={5}>
                      <TextField fullWidth placeholder="Key" value={header.key} onChange={(e) => updateKeyValuePair(setHeaders, headers, header.id, 'key', e.target.value)} size="small" />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField fullWidth placeholder="Value" value={header.value} onChange={(e) => updateKeyValuePair(setHeaders, headers, header.id, 'value', e.target.value)} size="small" />
                    </Grid>
                    <Grid item xs={1}>
                      <Tooltip title="Remove Header">
                        <IconButton onClick={() => removeKeyValuePair(setHeaders, headers, header.id)} size="small" color="error" >
                          <XIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                ))}
                <Button startIcon={<PlusIcon />} onClick={() => addKeyValuePair(setHeaders, headers)} variant="outlined" size="small" sx={{ mt: 1 }}>
                  Add Header
                </Button>
              </Box>
            )}

            {/* Body Content */}
            {activeRequestTab === 3 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel id="body-type-select-label">Body Type</InputLabel>
                  <Select
                    labelId="body-type-select-label"
                    value={bodyType}
                    label="Body Type"
                    onChange={(e) => { setBodyType(e.target.value); }}
                  >
                    <MenuItem value="none">No Body</MenuItem>
                    <MenuItem value="raw-json">Raw (JSON)</MenuItem>
                    <MenuItem value="form-urlencoded">Form-urlencoded</MenuItem>
                  </Select>
                </FormControl>

                {bodyType === 'raw-json' && (
                  <>
                    <TextField
                      fullWidth
                      label="Request Body (JSON)"
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      variant="outlined"
                      multiline
                      rows={20}
                      placeholder="Enter JSON request body here"
                      sx={{ flexGrow: 1, mb: 1, '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
                      size="small"
                    />
                    <Button onClick={formatJsonBody} variant="outlined" size="small" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      Format JSON
                    </Button>
                  </>
                )}

                {bodyType === 'form-urlencoded' && (
                  <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Form Encoded Data</Typography>
                    {formEncodedBody.map((item) => (
                      <Grid container spacing={1} key={item.id} alignItems="center" sx={{ mb: 0.5 }}>
                        <Grid item xs={5}>
                          <TextField fullWidth placeholder="Key" value={item.key} onChange={(e) => updateKeyValuePair(setFormEncodedBody, formEncodedBody, item.id, 'key', e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField fullWidth placeholder="Value" value={item.value} onChange={(e) => updateKeyValuePair(setFormEncodedBody, formEncodedBody, item.id, 'value', e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={1}>
                          <Tooltip title="Remove Field">
                            <IconButton onClick={() => removeKeyValuePair(setFormEncodedBody, formEncodedBody, item.id)} size="small" color="error" >
                              <XIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    ))}
                    <Button startIcon={<PlusIcon />} onClick={() => addKeyValuePair(setFormEncodedBody, formEncodedBody)} variant="outlined" size="small" sx={{ mt: 1 }}>
                      Add Field
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* 3. Response Panel */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: { xs: '50vh', md: 'auto' },
              width: { md: '500px' },
              p: 1.5, // Reduced padding
            }}
          >
            {/* Response Tabs & Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', mb: 1, minHeight: '40px' }}>
              <Tabs
                value={activeResponseTab}
                onChange={(event, newValue) => setActiveResponseTab(newValue)}
                aria-label="response tabs"
                sx={{ minHeight: '40px' }}
              >
                <Tab label="Body" sx={{ textTransform: 'none', minHeight: '40px' }} />
                <Tab label="Headers" sx={{ textTransform: 'none', minHeight: '40px' }} />
                <Tab label="Status" sx={{ textTransform: 'none', minHeight: '40px' }} />
              </Tabs>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {settings.showRequestTime && requestTime && (
                  <>
                  <Typography variant="caption" color="text.primary" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                    Status: {responseStatus}
                  </Typography>
                  <Typography variant="caption" color="text.primary" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                    Time: {requestTime} ms
                  </Typography>
                  </>
                )}
                <Tooltip title="Copy Response Body">
                  <IconButton onClick={copyResponseBody} size="small">
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {copyFeedback && <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, display: { xs: 'none', sm: 'block' } }}>{copyFeedback}</Typography>}
                <Tooltip title="Download Response Body as JSON">
                  <IconButton onClick={saveResponseBodyAsJson} size="small">
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Response Body Content */}
            {activeResponseTab === 0 && (
              <Box sx={{
                flexGrow: 1,
                p: 1,
                bgcolor: 'background.paper',
                borderRadius: '4px',
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: settings.responseBodyFontSize,
                whiteSpace: settings.responseTextWrap ? 'pre-wrap' : 'pre',
                wordBreak: settings.responseTextWrap ? 'break-word' : 'normal',
                border: '1px solid', // Add a subtle border
                borderColor: 'divider',
              }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : responseBody ? (
                  settings.highlightSyntaxInResponse ? (
<SyntaxHighlighter
  language={getLanguage(responseBody)}
  style={syntaxStyle}
  wrapLongLines={settings.responseTextWrap}
  customStyle={{
    margin: 0,
    padding: '1em',
    backgroundColor: 'transparent',
    fontSize: settings.responseBodyFontSize,
    whiteSpace: settings.responseTextWrap ? 'pre-wrap' : 'pre',
    wordBreak: settings.responseTextWrap ? 'break-word' : 'normal',
    width: '100%',
    boxSizing: 'border-box',
    height: '100%',
    overflowX: 'auto',
    textOverflow: 'ellipsis'
  }}
  showLineNumbers={true}
>
  {typeof responseBody === 'string'
    ? responseBody
    : JSON.stringify(responseBody, null, 2)}
</SyntaxHighlighter>

                  ) : (
                    <pre style={{
                      margin: 0,
                      padding: '1em',
                      whiteSpace: settings.responseTextWrap ? 'pre-wrap' : 'pre',
                      wordBreak: settings.responseTextWrap ? 'break-word' : 'normal',
                      fontSize: settings.responseBodyFontSize,
                      boxSizing: 'border-box',
                      width: '500px',
                    }}>{responseBody}</pre>
                  )
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>
                    Send a request to see the response here.
                  </Typography>
                )}
              </Box>
            )}

            {/* Response Headers Content */}
            {activeResponseTab === 1 && (
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1, bgcolor: 'background.paper', borderRadius: '4px', border: '1px solid', borderColor: 'divider' }}>
                {Object.keys(responseHeaders).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 5 }}>
                    No response headers received yet.
                  </Typography>
                ) : (
                  <List dense>
                    {Object.entries(responseHeaders).map(([key, value]) => (
                      <ListItem key={key} sx={{ py: 0.5, borderBottom: '1px dotted', borderColor: 'divider' }}>
                        <ListItemText
                          primary={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{key}:</Typography>}
                          secondary={<Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{value}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {/* Response Status & Time Content */}
            {activeResponseTab === 2 && (
              <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', borderRadius: '4px', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                {settings.showResponseStatus && responseStatus && (
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color:
                    responseStatus >= 200 && responseStatus < 300 ? 'success.main' :
                    responseStatus >= 400 && responseStatus < 500 ? 'warning.main' :
                    responseStatus >= 500 ? 'error.main' : 'text.secondary'
                  }}>
                    Status: {responseStatus || 'N/A'}
                  </Typography>
                )}
                {settings.showRequestTime && requestTime && (
                  <>
                    <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                      Request Time: <Box component="span" sx={{ color: 'info.main' }}>{requestTime} ms</Box>
                    </Typography>
                  </>
                )}
                {!responseStatus && !requestTime && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No request sent yet.
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Dialogs (remain outside the main layout for consistent overlay behavior) */}

        {/* Save Request Dialog */}
        <Dialog open={isSaveRequestDialogOpen} onClose={() => setIsSaveRequestDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Save Request</DialogTitle>
          <DialogContent>
            {error && (
              <Box sx={{ bgcolor: 'error.light', color: 'error.contrastText', p: 1, borderRadius: 1, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{error}</Typography>
                <IconButton size="small" onClick={() => setError(null)} color="inherit"><XIcon fontSize="small" /></IconButton>
              </Box>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Request Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newRequestName}
              onChange={(e) => setNewRequestName(e.target.value)}
              sx={{ mb: 2 }}
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel id="select-collection-label">Select Collection</InputLabel>
              <Select
                labelId="select-collection-label"
                value={selectedCollectionId}
                label="Select Collection"
                onChange={(e) => setSelectedCollectionId(e.target.value)}
              >
                {collections.length === 0 ? (
                  <MenuItem disabled>
                    <em>No collections available. Create one first.</em>
                  </MenuItem>
                ) : (
                  collections.map(collection => (
                    <MenuItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsSaveRequestDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRequest} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        {/* New Collection Dialog */}
        <Dialog open={isNewCollectionDialogOpen} onClose={() => setIsNewCollectionDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogContent>
            {error && (
              <Box sx={{ bgcolor: 'error.light', color: 'error.contrastText', p: 1, borderRadius: 1, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{error}</Typography>
                <IconButton size="small" onClick={() => setError(null)} color="inherit"><XIcon fontSize="small" /></IconButton>
              </Box>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Collection Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              size="small"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsNewCollectionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleNewCollection} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Collection Dialog */}
        <Dialog open={isEditCollectionDialogOpen} onClose={() => setIsEditCollectionDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Edit Collection Name</DialogTitle>
          <DialogContent>
            {error && (
              <Box sx={{ bgcolor: 'error.light', color: 'error.contrastText', p: 1, borderRadius: 1, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{error}</Typography>
                <IconButton size="small" onClick={() => setError(null)} color="inherit"><XIcon fontSize="small" /></IconButton>
              </Box>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Collection Name"
              type="text"
              fullWidth
              variant="outlined"
              value={editCollectionName}
              onChange={(e) => setEditCollectionName(e.target.value)}
              size="small"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditCollectionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditCollectionName} variant="contained">Save Changes</Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Dialog */}
        <Dialog
          open={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{confirmDialogDetails.title}</DialogTitle>
          <DialogContent>
            <Typography>{confirmDialogDetails.message}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                confirmDialogDetails.onConfirm();
                setIsConfirmDialogOpen(false);
              }}
              color="error"
              variant="contained"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={isSettingsDialogOpen} onClose={() => setIsSettingsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Application Settings</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', p: 0 }}>
            <Box sx={{ borderRight: 1, borderColor: 'divider', width: 180, flexShrink: 0 }}>
              <Tabs
                orientation="vertical"
                value={activeSettingsTab}
                onChange={(e, newValue) => setActiveSettingsTab(newValue)}
                aria-label="Vertical settings tabs"
                sx={{ borderRight: 1, borderColor: 'divider' }}
              >
                <Tab label="General" sx={{ textTransform: 'none', alignItems: 'flex-start' }} />
                <Tab label="Defaults" sx={{ textTransform: 'none', alignItems: 'flex-start' }} />
                <Tab label="Display" sx={{ textTransform: 'none', alignItems: 'flex-start' }} />
                <Tab label="Data" sx={{ textTransform: 'none', alignItems: 'flex-start' }} />
              </Tabs>
            </Box>
            <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
              {activeSettingsTab === 0 && (
                <Grid container spacing={2}> {/* Reduced spacing */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>General Settings</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoFormatRequestJson}
                          onChange={(e) => handleSettingChange('autoFormatRequestJson', e.target.checked)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Auto-format Request JSON</Typography>}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
                      Automatically formats raw JSON request body as you type.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoFormatResponseJson}
                          onChange={(e) => handleSettingChange('autoFormatResponseJson', e.target.checked)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Auto-format Response JSON</Typography>}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
                      Automatically formats JSON response bodies for improved readability.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableRequestBodyValidation}
                          onChange={(e) => handleSettingChange('enableRequestBodyValidation', e.target.checked)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Validate Request Body JSON</Typography>}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
                      Prevents sending requests with invalid JSON bodies.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableCorsProxy}
                          onChange={(e) => handleSettingChange('enableCorsProxy', e.target.checked)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Enable CORS Proxy (Advanced)</Typography>}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
                      Use a CORS proxy for cross-origin requests. Only enable if you understand the implications.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Request Timeout (ms)"
                      type="number"
                      value={settings.requestTimeout}
                      onChange={(e) => handleSettingChange('requestTimeout', parseInt(e.target.value, 10))}
                      fullWidth
                      margin="normal"
                      size="small"
                      helperText="Maximum time (in milliseconds) to wait for a response."
                      inputProps={{ min: 1000 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.clearHistoryOnAppLoad}
                          onChange={(e) => handleSettingChange('clearHistoryOnAppLoad', e.target.checked)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Clear History on App Load</Typography>}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
                      Automatically clear the request history every time the application loads.
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {activeSettingsTab === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Default Request Values</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Max History Items"
                      type="number"
                      value={settings.maxHistoryItems}
                      onChange={(e) => handleSettingChange('maxHistoryItems', parseInt(e.target.value, 10))}
                      fullWidth
                      margin="normal"
                      size="small"
                      helperText="Maximum number of requests to keep in history (0 for unlimited)."
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Default URL"
                      value={settings.defaultUrl}
                      onChange={(e) => handleSettingChange('defaultUrl', e.target.value)}
                      fullWidth
                      margin="normal"
                      size="small"
                      helperText="The URL that pre-fills when clearing fields or starting fresh."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel id="default-method-label">Default Method</InputLabel>
                      <Select
                        labelId="default-method-label"
                        value={settings.defaultMethod}
                        label="Default Method"
                        onChange={(e) => handleSettingChange('defaultMethod', e.target.value)}
                      >
                        <MenuItem value="GET">GET</MenuItem>
                        <MenuItem value="POST">POST</MenuItem>
                        <MenuItem value="PUT">PUT</MenuItem>
                        <MenuItem value="PATCH">PATCH</MenuItem>
                        <MenuItem value="DELETE">DELETE</MenuItem>
                      </Select>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 1, mt: 0.5 }}>
                        The HTTP method that pre-fills for new requests.
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel id="default-auth-type-label">Default Authentication Type</InputLabel>
                      <Select
                        labelId="default-auth-type-label"
                        value={settings.defaultAuthType}
                        label="Default Authentication Type"
                        onChange={(e) => handleSettingChange('defaultAuthType', e.target.value)}
                      >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="bearer">Bearer Token</MenuItem>
                        <MenuItem value="basic">Basic Auth</MenuItem>
                      </Select>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 1, mt: 0.5 }}>
                        The default authentication method for new requests.
                      </Typography>
                    </FormControl>
                  </Grid>
                  {settings.defaultAuthType === 'bearer' && (
                    <Grid item xs={12}>
                      <TextField
                        label="Default Bearer Token"
                        value={settings.defaultAuthToken}
                        onChange={(e) => handleSettingChange('defaultAuthToken', e.target.value)}
                        fullWidth
                        margin="normal"
                        size="small"
                        multiline
                        rows={2}
                        helperText="Default Bearer token for new requests."
                      />
                    </Grid>
                  )}
                  {settings.defaultAuthType === 'basic' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Default Basic Auth Username"
                          value={settings.defaultBasicAuthUsername}
                          onChange={(e) => handleSettingChange('defaultBasicAuthUsername', e.target.value)}
                          fullWidth
                          margin="normal"
                          size="small"
                          helperText="Default username for Basic Authentication."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Default Basic Auth Password"
                          type="password"
                          value={settings.defaultBasicAuthPassword}
                          onChange={(e) => handleSettingChange('defaultBasicAuthPassword', e.target.value)}
                          fullWidth
                          margin="normal"
                          size="small"
                          helperText="Default password for Basic Authentication."
                        />
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel id="default-body-type-label">Default Body Type</InputLabel>
                      <Select
                        labelId="default-body-type-label"
                        value={settings.defaultBodyType}
                        label="Default Body Type"
                        onChange={(e) => handleSettingChange('defaultBodyType', e.target.value)}
                      >
                        <MenuItem value="none">No Body</MenuItem>
                        <MenuItem value="raw-json">Raw (JSON)</MenuItem>
                        <MenuItem value="form-urlencoded">Form-urlencoded</MenuItem>
                      </Select>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 1, mt: 0.5 }}>
                        The default body type for new requests.
                      </Typography>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, fontWeight: 'medium' }}>Default Headers</Typography>
                    {settings.defaultHeaders.map((header) => (
                      <Grid container spacing={1} key={header.id} alignItems="center" sx={{ mb: 0.5 }}>
                        <Grid item xs={5}>
                          <TextField fullWidth placeholder="Key" value={header.key} onChange={(e) => handleDefaultHeadersChange(header.id, 'key', e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField fullWidth placeholder="Value" value={header.value} onChange={(e) => handleDefaultHeadersChange(header.id, 'value', e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={1}>
                          <Tooltip title="Remove Default Header">
                            <IconButton onClick={() => removeDefaultHeader(header.id)} size="small" color="error" >
                              <XIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    ))}
                    <Button startIcon={<PlusIcon />} onClick={addDefaultHeader} variant="outlined" size="small" sx={{ mt: 1 }}>
                      Add Default Header
                    </Button>
                  </Grid>
                </Grid>
              )}

              {activeSettingsTab === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Display Settings</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.showRequestTime}
                          onChange={(e) => handleSettingChange('showRequestTime', e.target.checked)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Show Request Time</Typography>}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
                      Display the time taken for a request to complete.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.showResponseStatus}
                          onChange={(e) => handleSettingChange('showResponseStatus', e.target.checked)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Show Response Status</Typography>}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
                      Display the HTTP status code of the response.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.responseTextWrap}
                          onChange={(e) => handleSettingChange('responseTextWrap', e.target.checked)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Wrap Response Body Text</Typography>}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
                      Toggle text wrapping for the response body display area.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.highlightSyntaxInResponse}
                          onChange={(e) => handleSettingChange('highlightSyntaxInResponse', e.target.checked)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Highlight Response Syntax</Typography>}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
                      Enable syntax highlighting for JSON, XML, HTML in the response body.
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Response Body Font Size"
                      type="number"
                      value={settings.responseBodyFontSize}
                      onChange={(e) => handleSettingChange('responseBodyFontSize', parseInt(e.target.value, 10))}
                      fullWidth
                      margin="normal"
                      size="small"
                      helperText="Adjust the font size of the response body text."
                      inputProps={{ min: 8, max: 24 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel id="theme-select-label">Application Theme</InputLabel>
                      <Select
                        labelId="theme-select-label"
                        value={settings.theme}
                        label="Application Theme"
                        onChange={(e) => handleSettingChange('theme', e.target.value)}
                      >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                      </Select>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 1, mt: 0.5 }}>
                        Choose between a light or dark theme for the application.
                      </Typography>
                    </FormControl>
                  </Grid>
                </Grid>
              )}

              {activeSettingsTab === 3 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Data Management</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Collections & History</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        startIcon={<UploadIcon />}
                        onClick={exportData}
                        size="small"
                      >
                        Export Collections
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={importData}
                        style={{ display: 'none' }}
                        accept=".json"
                      />
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => fileInputRef.current.click()}
                        size="small"
                      >
                        Import Collections
                      </Button>
                    </Box>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                      Export saves your current collections to a JSON file. Importing will **replace** your existing collections with data from the selected JSON file.
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsSettingsDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default App;