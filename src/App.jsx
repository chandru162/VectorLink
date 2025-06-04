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
  Tooltip
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
  ChevronRight as ExpandIcon,
  Refresh as ClearIcon, // Added for Clear Response
  AutoFixHigh as FormatIcon, // Added for Format JSON
} from '@mui/icons-material';

import { Light as SyntaxHighlighter } from 'react-syntax-highlighter/dist/esm';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';


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
        corsProxyUrl: '',
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
        fetchTimeout: 10000,
        defaultBasicAuthPassword: '',
        highlightSyntaxInResponse: false,
        jsonIndentSpaces: 2,
        defaultEnvironment: 'No Environment',
        environments: [{ id: crypto.randomUUID(), name: 'No Environment', variables: [] }],
        maxRequestSize: 10, // MB
        ...JSON.parse(storedSettings)
      } : {
        defaultUrl: 'https://official-joke-api.appspot.com/random_joke',
        defaultMethod: 'GET',
        autoFormatRequestJson: true,
        autoFormatResponseJson: true,
        maxHistoryItems: 50,
        enableCorsProxy: false,
        corsProxyUrl: '',
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
        fetchTimeout: 10000,
        defaultBasicAuthPassword: '',
        highlightSyntaxInResponse: false,
        jsonIndentSpaces: 2,
        defaultEnvironment: 'No Environment',
        environments: [{ id: crypto.randomUUID(), name: 'No Environment', variables: [] }],
        maxRequestSize: 10, // MB
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
        corsProxyUrl: '',
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
        fetchTimeout: 10000,
        defaultBasicAuthPassword: '',
        highlightSyntaxInResponse: false,
        jsonIndentSpaces: 2,
        defaultEnvironment: 'No Environment',
        environments: [{ id: crypto.randomUUID(), name: 'No Environment', variables: [] }],
        maxRequestSize: 10, // MB
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
  const [cookies, setCookies] = useState([{ id: crypto.randomUUID(), key: '', value: '' }]);
  const [requestBody, setRequestBody] = useState('');
  const [bodyType, setBodyType] = useState(settings.defaultBodyType);
  const [formEncodedBody, setFormEncodedBody] = useState([{ id: crypto.randomUUID(), key: '', value: '', isFile: false, file: null }]);
  // Removed: const [preRequestScript, setPreRequestScript] = useState('// Your pre-request script here');
  // Removed: const [responseTests, setResponseTests] = useState('// Your response tests here');
  const [activeRequestTab, setActiveRequestTab] = useState(0);

  // --- State for Response ---
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseStatusText, setResponseStatusText] = useState('');
  const [responseHeaders, setResponseHeaders] = useState({});
  const [responseBody, setResponseBody] = useState('');
  const [responseCookies, setResponseCookies] = useState([]);
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
  const [expandedCollection, setExpandedCollection] = useState(null);

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
  const [selectedEnvironment, setSelectedEnvironment] = useState(settings.defaultEnvironment);

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

  // State for Import Conflict Resolution Dialog
  const [isImportConflictDialogOpen, setIsImportConflictDialogOpen] = useState(false);
  const [importConflictResolution, setImportConflictResolution] = useState('merge'); // 'merge' or 'overwrite'
  const [importDataPending, setImportDataPending] = useState(null); // Stores data waiting for conflict resolution

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
              borderRadius: 4,
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


  // --- Helper Functions for Key-Value Pairs (Headers, Query Params, Form Encoded, Cookies) ---
  const addKeyValuePair = useCallback((setter, currentItems) => {
    setter([...currentItems, { id: crypto.randomUUID(), key: '', value: '', isFile: false, file: null }]);
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
    setResponseStatusText('');
    setResponseHeaders({});
    setResponseBody('');
    setResponseCookies([]);
    setRequestTime(null);
    setCopyFeedback('');

    const startTime = performance.now();

    try {
      let requestUrl = url;
      // Apply environment variables to URL
      const activeEnvironment = settings.environments.find(env => env.name === selectedEnvironment);
      if (activeEnvironment) {
        activeEnvironment.variables.forEach(variable => {
          if (variable.key && variable.value) {
            requestUrl = requestUrl.replace(new RegExp(`{{${variable.key}}}`, 'g'), variable.value);
          }
        });
      }

      const validQueryParams = queryParams.filter(p => p.key && p.value);
      if (validQueryParams.length > 0) {
        const queryString = new URLSearchParams(
          validQueryParams.map(p => [p.key, p.value])
        ).toString();
        requestUrl = `${requestUrl.split('?')[0]}?${queryString}`;
      }

      // CORS Proxy Logic
      let finalUrl = requestUrl;
      if (settings.enableCorsProxy && settings.corsProxyUrl) {
        const proxyBase = settings.corsProxyUrl.endsWith('/') || settings.corsProxyUrl.includes('?')
          ? settings.corsProxyUrl
          : `${settings.corsProxyUrl}/`;
        finalUrl = `${proxyBase}${encodeURIComponent(requestUrl)}`;
        console.log("Using CORS proxy. Final URL:", finalUrl);
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

      // Add Cookies to Headers
      const validCookies = cookies.filter(c => c.key && c.value);
      if (validCookies.length > 0) {
        const cookieString = validCookies.map(c => `${c.key}=${c.value}`).join('; ');
        options.headers['Cookie'] = cookieString;
      }

      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (bodyType === 'form-data') {
          const formData = new FormData();
          formEncodedBody.forEach(item => {
            if (item.key) {
              if (item.isFile && item.file) {
                formData.append(item.key, item.file);
              } else {
                formData.append(item.key, item.value || '');
              }
            }
          });
          options.body = formData;
          // Don't set Content-Type header for FormData, browser will set it with boundary
        } else if (bodyType.startsWith('raw-')) {
          if (bodyType === 'raw-json') {
            try {
              const parsedBody = JSON.parse(requestBody);
              options.body = JSON.stringify(parsedBody, null, settings.autoFormatRequestJson ? settings.jsonIndentSpaces : 0);
              options.headers['Content-Type'] = 'application/json';
            } catch (e) {
              if (settings.enableRequestBodyValidation) {
                setError('Invalid JSON in request body. Please format correctly.');
                setLoading(false);
                return;
              }
            }
          } else {
            options.body = requestBody;
            const contentTypeMap = {
              'raw-text': 'text/plain',
              'raw-javascript': 'application/javascript',
              'raw-html': 'text/html',
              'raw-xml': 'application/xml'
            };
            options.headers['Content-Type'] = contentTypeMap[bodyType] || 'text/plain';
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

      const response = await fetch(finalUrl, options);
      clearTimeout(id);

      const endTime = performance.now();
      setRequestTime((endTime - startTime).toFixed(2));

      setResponseStatus(response.status);
      setResponseStatusText(response.statusText);

      const resHeaders = {};
      response.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });
      setResponseHeaders(resHeaders);

      // Parse Set-Cookie header for response cookies
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        const parsedCookies = setCookieHeader.split(/,\s*(?=[^;]*=)/).map(cookiePart => {
          const [key, ...valueParts] = cookiePart.trim().split('=');
          const value = valueParts.join('=').split(';')[0];
          return { key: decodeURIComponent(key || ''), value: decodeURIComponent(value || '') };
        }).filter(c => c.key);
        setResponseCookies(parsedCookies);
      } else {
        setResponseCookies([]);
      }

      const contentType = response.headers.get('content-type');
      let responseBodyText = '';
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        responseBodyText = JSON.stringify(json, null, settings.autoFormatResponseJson ? settings.jsonIndentSpaces : 0);
      } else {
        responseBodyText = await response.text();
      }
      setResponseBody(responseBodyText);

      const newHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        requestDetails: { url, method, queryParams, authType, authToken, basicAuthUsername, basicAuthPassword, headers, cookies, requestBody, bodyType, formEncodedBody }, // Removed preRequestScript, responseTests
        responseDetails: { status: response.status, statusText: response.statusText, headers: resHeaders, body: responseBodyText, cookies: setCookies },
      };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory]);

    } catch (err) {
      if (err.name === 'AbortError') {
        setError(`Error: Request timed out after ${settings.requestTimeout}ms.`);
      } else {
        setError(`Error: ${err.message}`);
      }
      setResponseStatus('Error');
      setResponseStatusText('Request Failed');
      setResponseBody('');
      setResponseCookies([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Request/Response Utilities ---
  const formatJsonBody = useCallback(() => {
    try {
      setRequestBody(JSON.stringify(JSON.parse(requestBody), null, settings.jsonIndentSpaces));
      setError(null);
    } catch (e) {
      setError(`${e}`);
    }
  }, [requestBody, settings.jsonIndentSpaces]);

  const clearAllFields = useCallback(() => {
    setUrl(settings.defaultUrl);
    setMethod(settings.defaultMethod);
    setQueryParams([{ id: crypto.randomUUID(), key: '', value: '' }]);
    setAuthType(settings.defaultAuthType);
    setAuthToken(settings.defaultAuthToken);
    setBasicAuthUsername(settings.defaultBasicAuthUsername);
    setBasicAuthPassword(settings.defaultBasicAuthPassword);
    setHeaders(settings.defaultHeaders.length > 0 ? settings.defaultHeaders.map(h => ({ ...h, id: crypto.randomUUID() })) : [{ id: crypto.randomUUID(), key: '', value: '' }]);
    setCookies([{ id: crypto.randomUUID(), key: '', value: '' }]);
    setRequestBody('');
    setBodyType(settings.defaultBodyType);
    setFormEncodedBody([{ id: crypto.randomUUID(), key: '', value: '', isFile: false, file: null }]);
    // Removed: setPreRequestScript('// Your pre-request script here');
    // Removed: setResponseTests('// Your response tests here');
    setResponseStatus(null);
    setResponseStatusText('');
    setResponseHeaders({});
    setResponseBody('');
    setResponseCookies([]);
    setError(null);
    setRequestTime(null);
    setCopyFeedback('');
  }, [settings]);

  const clearResponseBody = useCallback(() => {
    setResponseStatus(null);
    setResponseStatusText('');
    setResponseHeaders({});
    setResponseBody('');
    setResponseCookies([]);
    setError(null);
    setRequestTime(null);
    setCopyFeedback('');
  }, []);

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

  const copyResponseHeaders = useCallback(() => {
    if (Object.keys(responseHeaders).length === 0) {
      setCopyFeedback('No headers to copy!');
      return;
    }
    const headersText = Object.entries(responseHeaders).map(([key, value]) => `${key}: ${value}`).join('\n');
    try {
      navigator.clipboard.writeText(headersText)
        .then(() => setCopyFeedback('Copied Headers!'))
        .catch((err) => {
          setCopyFeedback('Failed to copy headers.');
          console.error('Failed to copy response headers:', err);
        });
    } catch (err) {
      setCopyFeedback('Failed to copy headers.');
      console.error('Failed to copy response headers:', err);
    }
    setTimeout(() => setCopyFeedback(''), 2000);
  }, [responseHeaders]);

  const copyResponseCookies = useCallback(() => {
    if (responseCookies.length === 0) {
      setCopyFeedback('No cookies to copy!');
      return;
    }
    const cookiesText = responseCookies.map(c => `${c.key}=${c.value}`).join('; ');
    try {
      navigator.clipboard.writeText(cookiesText)
        .then(() => setCopyFeedback('Copied Cookies!'))
        .catch((err) => {
          setCopyFeedback('Failed to copy cookies.');
          console.error('Failed to copy response cookies:', err);
        });
    } catch (err) {
      setCopyFeedback('Failed to copy cookies.');
      console.error('Failed to copy response cookies:', err);
    }
    setTimeout(() => setCopyFeedback(''), 2000);
  }, [responseCookies]);


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
      cookies: cookies.map(c => ({ ...c })),
      requestBody,
      bodyType,
      formEncodedBody: formEncodedBody.map(f => ({ ...f })),
      // Removed: preRequestScript,
      // Removed: responseTests,
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
  }, [newRequestName, selectedCollectionId, url, method, queryParams, authType, authToken, basicAuthUsername, basicAuthPassword, headers, cookies, requestBody, bodyType, formEncodedBody]); // Removed preRequestScript, responseTests

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
    setCookies(request.cookies ? request.cookies.map(c => ({ ...c, id: crypto.randomUUID() })) : [{ id: crypto.randomUUID(), key: '', value: '' }]);
    setRequestBody(request.requestBody || '');
    setBodyType(request.bodyType || 'none');
    setFormEncodedBody(request.formEncodedBody ? request.formEncodedBody.map(f => ({ ...f, id: crypto.randomUUID() })) : [{ id: crypto.randomUUID(), key: '', value: '', isFile: false, file: null }]);
    // Removed: setPreRequestScript(request.preRequestScript || '// Your pre-request script here');
    // Removed: setResponseTests(request.responseTests || '// Your response tests here');
    setResponseStatus(null);
    setResponseStatusText('');
    setResponseHeaders({});
    setResponseBody('');
    setResponseCookies([]);
    setError(null);
    setRequestTime(null);
    setCopyFeedback('');
    setActiveRequestTab(0);
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
    setCookies(request.cookies ? request.cookies.map(c => ({ ...c, id: crypto.randomUUID() })) : [{ id: crypto.randomUUID(), key: '', value: '' }]);
    setRequestBody(request.requestBody || '');
    setBodyType(request.bodyType || 'none');
    setFormEncodedBody(request.formEncodedBody ? request.formEncodedBody.map(f => ({ ...f, id: crypto.randomUUID() })) : [{ id: crypto.randomUUID(), key: '', value: '', isFile: false, file: null }]);
    // Removed: setPreRequestScript(request.preRequestScript || '// Your pre-request script here');
    // Removed: setResponseTests(request.responseTests || '// Your response tests here');

    setResponseStatus(historyItem.responseDetails.status);
    setResponseStatusText(historyItem.responseDetails.statusText || '');
    setResponseHeaders(historyItem.responseDetails.headers);
    setResponseBody(historyItem.responseDetails.body);
    setResponseCookies(historyItem.responseDetails.cookies || []);
    setError(null);
    setRequestTime(null);
    setCopyFeedback('');
    setActiveResponseTab(0);
    setActiveRequestTab(0);
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
        setExpandedCollection(null);
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
  }, [history.length]);


  // --- Export/Import Functionality (Collections Only) ---
  const exportData = useCallback(() => {
    const dataToExport = {
      collections,
      // settings: { ...settings, defaultAuthToken: '', defaultBasicAuthPassword: '' } // Exclude sensitive info from export
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Collections_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [collections, settings]);

  const importData = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Validate collections before prompting for conflict resolution
        const validatedCollections = importedData.collections && Array.isArray(importedData.collections)
          ? importedData.collections.map(col => ({
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
                cookies: Array.isArray(req.cookies) ? req.cookies.map(c => ({ ...c, id: c.id || crypto.randomUUID() })) : [],
                requestBody: req.requestBody || '',
                bodyType: req.bodyType || 'none',
                formEncodedBody: Array.isArray(req.formEncodedBody) ? req.formEncodedBody.map(f => ({ ...f, id: f.id || crypto.randomUUID() })) : [],
              })) : [],
            }))
          : [];

        // Store pending data and open conflict resolution dialog if collections exist
        if (validatedCollections.length > 0) {
          setImportDataPending({
            collections: validatedCollections,
            settings: importedData.settings,
          });
          setIsImportConflictDialogOpen(true);
        } else {
          // If no collections to import, just handle settings
          if (importedData.settings && typeof importedData.settings === 'object') {
              setSettings(prevSettings => ({
                  ...prevSettings,
                  ...importedData.settings,
                  defaultAuthToken: importedData.settings.defaultAuthToken || prevSettings.defaultAuthToken,
                  defaultBasicAuthPassword: importedData.settings.defaultBasicAuthPassword || prevSettings.defaultBasicAuthPassword,
              }));
              alert('Settings imported successfully! ⚙️');
          } else {
              setError('Invalid JSON file or unexpected format. No collections or settings found.');
          }
        }
      } catch (err) {
        setError('Invalid JSON file or unexpected format. Please ensure it\'s a valid collections export file.', err);
        console.error("Import error:", err);
      } finally {
        event.target.value = null; // Clear file input
      }
    };
    reader.readAsText(file);
  }, []);

  const handleImportCollections = useCallback(() => {
    if (!importDataPending) return;

    const { collections: importedCollections, settings: importedSettings } = importDataPending;

    if (importConflictResolution === 'overwrite') {
      setCollections(importedCollections);
      alert('Collections overwritten successfully! ✨');
    } else { // 'merge'
      const mergedCollections = [...collections];
      importedCollections.forEach(importedCol => {
        const existingColIndex = mergedCollections.findIndex(col => col.name === importedCol.name);
        if (existingColIndex > -1) {
          // Merge requests within existing collection
          const existingRequests = new Set(mergedCollections[existingColIndex].requests.map(req => req.name));
          importedCol.requests.forEach(importedReq => {
            // Only add if request name doesn't already exist in the collection
            if (!existingRequests.has(importedReq.name)) {
              mergedCollections[existingColIndex].requests.push(importedReq);
            }
          });
        } else {
          // Add new collection
          mergedCollections.push(importedCol);
        }
      });
      setCollections(mergedCollections);
      alert('Collections merged successfully! 🤝');
    }

    if (importedSettings && typeof importedSettings === 'object') {
        setSettings(prevSettings => ({
            ...prevSettings,
            ...importedSettings,
            defaultAuthToken: importedSettings.defaultAuthToken || prevSettings.defaultAuthToken,
            defaultBasicAuthPassword: importedSettings.defaultBasicAuthPassword || prevSettings.defaultBasicAuthPassword,
        }));
        alert('Settings imported successfully! ⚙️');
    }

    setIsImportConflictDialogOpen(false);
    setImportDataPending(null);
    setError(null);
  }, [importDataPending, importConflictResolution, collections]);


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

    // Environment Handlers
    const handleAddEnvironment = useCallback(() => {
      setSettings(prev => ({
          ...prev,
          environments: [...prev.environments, { id: crypto.randomUUID(), name: `New Env ${prev.environments.length}`, variables: [{ id: crypto.randomUUID(), key: '', value: '' }] }]
      }));
  }, []);

  const handleUpdateEnvironmentName = useCallback((envId, newName) => {
      setSettings(prev => ({
          ...prev,
          environments: prev.environments.map(env =>
              env.id === envId ? { ...env, name: newName } : env
          )
      }));
  }, []);

  const handleDeleteEnvironment = useCallback((envId, envName) => {
      if (envName === 'No Environment') {
          alert("Cannot delete 'No Environment'.");
          return;
      }
      setConfirmDialogDetails({
          title: `Delete Environment "${envName}"?`,
          message: 'Are you sure you want to delete this environment and all its variables? This action cannot be undone.',
          onConfirm: () => {
              setSettings(prev => {
                  const updatedEnvs = prev.environments.filter(env => env.id !== envId);
                  if (selectedEnvironment === envName) {
                      setSelectedEnvironment('No Environment');
                  }
                  return { ...prev, environments: updatedEnvs };
              });
              setIsConfirmDialogOpen(false);
          },
      });
      setIsConfirmDialogOpen(true);
  }, [selectedEnvironment]);

  const handleAddEnvironmentVariable = useCallback((envId) => {
      setSettings(prev => ({
          ...prev,
          environments: prev.environments.map(env =>
              env.id === envId ? { ...env, variables: [...env.variables, { id: crypto.randomUUID(), key: '', value: '' }] } : env
          )
      }));
  }, []);

  const handleUpdateEnvironmentVariable = useCallback((envId, varId, field, value) => {
      setSettings(prev => ({
          ...prev,
          environments: prev.environments.map(env =>
              env.id === envId ? {
                  ...env,
                  variables: env.variables.map(variable =>
                      variable.id === varId ? { ...variable, [field]: value } : variable
                  )
              } : env
          )
      }));
  }, []);

  const handleRemoveEnvironmentVariable = useCallback((envId, varId) => {
      setSettings(prev => ({
          ...prev,
          environments: prev.environments.filter(env =>
              env.id === envId ? { ...env, variables: env.variables.filter(variable => variable.id !== varId) } : true
          ).map(env =>
            env.id === envId ? { ...env, variables: env.variables.filter(variable => variable.id !== varId) } : env
          )
      }));
  }, []);


  // --- Syntax Highlighting Logic for Response Panel ---
  const getLanguage = (body) => {
    try {
      JSON.parse(body);
      return 'json';
    } catch (e) {
      if (body.trim().startsWith('<')) {
        if (body.includes('<html') || body.includes('<body') || body.includes('<div')) {
          return 'html';
        }
        return 'xml';
      }
      if (body.includes('function') || body.includes('const') || body.includes('let') || body.includes('var')) {
        return 'javascript';
      }
      return 'plaintext';
    }
  };

  const syntaxStyle = settings.theme === 'dark' ? darcula : vs;

  // Add new state for file uploads
  const [formDataFiles, setFormDataFiles] = useState([]);
  const [rawBodyType, setRawBodyType] = useState('text');

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
            height: { xs: 'auto', md: '100vh' },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1,
            bgcolor: 'background.default',
          }}
        >
          {/* 1. Workspace Panel (Sidebar) */}
          <Box
            sx={{
              width: { xs: '100%', sm: '100%', md: '100%' },
              maxWidth: { md: '300px' },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              bgcolor: 'background.paper',
              borderRight: { xs: 0, md: '1px solid' },
              borderBottom: { xs: '1px solid', md: 0 },
              borderColor: 'divider',
              p: 1.5,
              height: { xs: 'auto', md: '100%' },
              minHeight: { xs: '25vh', sm: '30vh', md: 'auto' },
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

            {/* Environment Selector */}
            <FormControl fullWidth size="small" sx={{ my: 1 }}>
              <InputLabel id="environment-select-label">Environment</InputLabel>
              <Select
                labelId="environment-select-label"
                value={selectedEnvironment}
                label="Environment"
                onChange={(e) => setSelectedEnvironment(e.target.value)}
              >
                {settings.environments.map(env => (
                  <MenuItem key={env.id} value={env.name}>{env.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

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
                    No collections yet. 📂
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
                                  No requests. ✨
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
                  // startIcon={<TrashIcon />}
                  onClick={handleClearHistory}
                  color="error"
                  size="small"
                  sx={{ mb: 1 }}
                >
                  🗑️ Clear History
                </Button>
                {history.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1, textAlign: 'center' }}>
                    No history yet. ⏳
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
                              {item.responseDetails.status || 'N/A'} {item.responseDetails.statusText}
                            </Box>
                            <Box> • {new Date(item.timestamp).toLocaleString()}</Box>
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
          <Box sx={{ flexGrow: 2,
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: '50vh', md: 'auto' },
            borderRight: { xs: 0, md: '1px solid' },
            borderBottom: { xs: '1px solid', md: 0 },
            borderColor: 'divider',
            p: 1.5,
            width: { xs: '100%', md: '40%' }
          }}
          >
            {/* URL & Method Input */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, alignItems: { xs: 'stretch', sm: 'center' }, mb: 1 }}>
              <FormControl sx={{ minWidth: { xs: '100%', sm: 110 } }}>
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
                  <MenuItem value="HEAD">HEAD</MenuItem>
                  <MenuItem value="OPTIONS">OPTIONS</MenuItem>
                  <MenuItem value="TRACE">TRACE</MenuItem>
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
                  height: '38px',
                  width: { xs: 'auto', sm: '120px' }
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Send'}
              </Button>
            </Box>

            {error && (
              <Box sx={{ bgcolor: 'error.light', color: 'error.contrastText', p: 1, borderRadius: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{error} ❌</Typography>
                <IconButton size="small" onClick={() => setError(null)} color="inherit"><XIcon fontSize="small" /></IconButton>
              </Box>
            )}

            {/* Request Tabs */}
            <Tabs
              value={activeRequestTab}
              onChange={(event, newValue) => setActiveRequestTab(newValue)}
              aria-label="request tabs"
              sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 1, minHeight: '40px' }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Params" sx={{ textTransform: 'none', minHeight: '40px' }} />
              <Tab label="Auth" sx={{ textTransform: 'none', minHeight: '40px' }} />
              <Tab label="Headers" sx={{ textTransform: 'none', minHeight: '40px' }} />
              <Tab label="Cookies" sx={{ textTransform: 'none', minHeight: '40px' }} />
              <Tab label="Body" sx={{ textTransform: 'none', minHeight: '40px' }} />
              
              <Tooltip title="Save Request">
                <IconButton onClick={openSaveRequestDialog} color="inherit" size="small" sx={{p:"10px",margin:"5px"}}>
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear All Fields">
                <IconButton onClick={clearAllFields} color="inherit" size="small" sx={{p:"10px", margin:"5px"}}>
                  <XIcon fontSize="small"/>
                </IconButton>
              </Tooltip>
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
                <Button startIcon={<PlusIcon />} onClick={() => addKeyValuePair(setQueryParams, queryParams)} variant="outlined" size="small" sx={{ mt: 1 }}> Add Parameter </Button>
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
                    <TextField
                      fullWidth
                      label="Username"
                      value={basicAuthUsername}
                      onChange={(e) => setBasicAuthUsername(e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={basicAuthPassword}
                      onChange={(e) => setBasicAuthPassword(e.target.value)}
                      variant="outlined"
                      size="small"
                    />
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
                <Button startIcon={<PlusIcon />} onClick={() => addKeyValuePair(setHeaders, headers)} variant="outlined" size="small" sx={{ mt: 1 }}> Add Header </Button>
              </Box>
            )}

            {/* Cookies Content */}
            {activeRequestTab === 3 && (
              <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Cookies</Typography>
                {cookies.map((c) => (
                  <Grid container spacing={1} key={c.id} alignItems="center" sx={{ mb: 0.5 }}>
                    <Grid item xs={5}>
                      <TextField fullWidth placeholder="Name" value={c.key} onChange={(e) => updateKeyValuePair(setCookies, cookies, c.id, 'key', e.target.value)} size="small" />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField fullWidth placeholder="Value" value={c.value} onChange={(e) => updateKeyValuePair(setCookies, cookies, c.id, 'value', e.target.value)} size="small" />
                    </Grid>
                    <Grid item xs={1}>
                      <Tooltip title="Remove Cookie">
                        <IconButton onClick={() => removeKeyValuePair(setCookies, cookies, c.id)} size="small" color="error" >
                          <XIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                ))}
                <Button startIcon={<PlusIcon />} onClick={() => addKeyValuePair(setCookies, cookies)} variant="outlined" size="small" sx={{ mt: 1 }}> Add Cookie </Button>
              </Box>
            )}

            {/* Body Content */}
            {activeRequestTab === 4 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel id="body-type-select-label">Body Type</InputLabel>
                  <Select
                    labelId="body-type-select-label"
                    value={bodyType}
                    label="Body Type"
                    onChange={(e) => {
                      setBodyType(e.target.value);
                      if (e.target.value !== 'form-data') {
                        setFormDataFiles([]);
                      }
                    }}
                  >
                    <MenuItem value="none">No Body</MenuItem>
                    <MenuItem value="raw-json">Raw JSON</MenuItem>
                    <MenuItem value="raw-text">Raw Text</MenuItem>
                    <MenuItem value="raw-javascript">Raw JavaScript</MenuItem>
                    <MenuItem value="raw-html">Raw HTML</MenuItem>
                    <MenuItem value="raw-xml">Raw XML</MenuItem>
                    <MenuItem value="form-urlencoded">x-www-form-urlencoded</MenuItem>
                    <MenuItem value="form-data">Form Data</MenuItem>
                  </Select>
                </FormControl>

                {bodyType.startsWith('raw-') && (
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                      <InputLabel id="raw-body-type-label">Raw Body Type</InputLabel>
                      <Select
                        labelId="raw-body-type-label"
                        value={rawBodyType}
                        label="Raw Body Type"
                        onChange={(e) => setRawBodyType(e.target.value)}
                      >
                        <MenuItem value="text">Text</MenuItem>
                        <MenuItem value="javascript">JavaScript</MenuItem>
                        <MenuItem value="html">HTML</MenuItem>
                        <MenuItem value="xml">XML</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      multiline
                      rows={15}
                      placeholder={`Enter ${rawBodyType} content`}
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      variant="outlined"
                      sx={{ flexGrow: 1, '& .MuiInputBase-input': { fontFamily: 'monospace' }}}
                    />
                    {bodyType === 'raw-json' && (
                      <Button
                        variant="outlined"
                        onClick={formatJsonBody}
                        size="small"
                        startIcon={<FormatIcon />}
                        sx={{ mt: 1, alignSelf: 'flex-end' }}
                      >
                        Format JSON
                      </Button>
                    )}
                  </Box>
                )}

                {bodyType === 'form-data' && (
                  <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                    {formEncodedBody.map((param) => (
                      <Grid container spacing={1} key={param.id} alignItems="center" sx={{ mb: 0.5 }}>
                        <Grid item xs={5}>
                          <TextField 
                            fullWidth 
                            placeholder="Key" 
                            value={param.key} 
                            onChange={(e) => updateKeyValuePair(setFormEncodedBody, formEncodedBody, param.id, 'key', e.target.value)} 
                            size="small" 
                          />
                        </Grid>
                        <Grid item xs={6}>
                          {param.isFile ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    if (file.size > settings.maxRequestSize * 1024 * 1024) {
                                      setError(`File size exceeds ${settings.maxRequestSize}MB limit`);
                                      return;
                                    }
                                    updateKeyValuePair(setFormEncodedBody, formEncodedBody, param.id, 'value', file.name);
                                    updateKeyValuePair(setFormEncodedBody, formEncodedBody, param.id, 'file', file);
                                  }
                                }}
                                style={{ display: 'none' }}
                                id={`file-upload-${param.id}`}
                              />
                              <Button
                                variant="outlined"
                                size="small"
                                component="label"
                                htmlFor={`file-upload-${param.id}`}
                                sx={{ flexGrow: 1 }}
                              >
                                {param.value || 'Choose File'}
                              </Button>
                            </Box>
                          ) : (
                            <TextField 
                              fullWidth 
                              placeholder="Value" 
                              value={param.value} 
                              onChange={(e) => updateKeyValuePair(setFormEncodedBody, formEncodedBody, param.id, 'value', e.target.value)} 
                              size="small" 
                            />
                          )}
                        </Grid>
                        <Grid item xs={1}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title={param.isFile ? "Switch to Text" : "Switch to File"}>
                              <IconButton 
                                onClick={() => updateKeyValuePair(setFormEncodedBody, formEncodedBody, param.id, 'isFile', !param.isFile)} 
                                size="small"
                              >
                                {param.isFile ? <EditIcon fontSize="small" /> : <UploadIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove Field">
                              <IconButton 
                                onClick={() => removeKeyValuePair(setFormEncodedBody, formEncodedBody, param.id)} 
                                size="small" 
                                color="error"
                              >
                                <XIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                      </Grid>
                    ))}
                    <Button 
                      startIcon={<PlusIcon />} 
                      onClick={() => addKeyValuePair(setFormEncodedBody, formEncodedBody)} 
                      variant="outlined" 
                      size="small" 
                      sx={{ mt: 1 }}
                    > 
                      Add Field 
                    </Button>
                  </Box>
                )}

                {bodyType === 'form-urlencoded' && (
                  <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                    {formEncodedBody.map((param) => (
                      <Grid container spacing={1} key={param.id} alignItems="center" sx={{ mb: 0.5 }}>
                        <Grid item xs={5}>
                          <TextField fullWidth placeholder="Key" value={param.key} onChange={(e) => updateKeyValuePair(setFormEncodedBody, formEncodedBody, param.id, 'key', e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField fullWidth placeholder="Value" value={param.value} onChange={(e) => updateKeyValuePair(setFormEncodedBody, formEncodedBody, param.id, 'value', e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={1}>
                          <Tooltip title="Remove Field">
                            <IconButton onClick={() => removeKeyValuePair(setFormEncodedBody, formEncodedBody, param.id)} size="small" color="error" >
                              <XIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    ))}
                    <Button startIcon={<PlusIcon />} onClick={() => addKeyValuePair(setFormEncodedBody, formEncodedBody)} variant="outlined" size="small" sx={{ mt: 1 }}> Add Field </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Removed Pre-request Script Content */}
            {/* Removed Response Tests Content */}
          </Box>

          {/* 3. Response Panel */}
          <Box sx={{ flexGrow: 3,
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: '50vh', md: 'auto' },
            p: 1.5,
            width: { xs: '100%', md: '28%' }
          }}
          >
            {/* Response Status & Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, justifyContent: 'space-between' }}>
              {settings.showResponseStatus && (
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Status: {responseStatus ? (
                    <Box component="span" sx={{
                      color:
                        responseStatus >= 200 && responseStatus < 300 ? theme.palette.success.main :
                          responseStatus >= 400 && responseStatus < 500 ? theme.palette.warning.main :
                            responseStatus >= 500 ? theme.palette.error.main :
                              theme.palette.text.primary,
                    }}>
                      {responseStatus} {responseStatusText}
                    </Box>
                  ) : 'N/A'}
                </Typography>
              )}
              {settings.showRequestTime && requestTime && (
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Time: {requestTime} ms ⏱️
                </Typography>
              )}
            </Box>

            {/* Response Tabs */}
            <Tabs
              value={activeResponseTab}
              onChange={(event, newValue) => setActiveResponseTab(newValue)}
              aria-label="response tabs"
              sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 1, minHeight: '55px' }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Body" sx={{ textTransform: 'none', minHeight: '40px' }} />
              <Tab label="Headers" sx={{ textTransform: 'none', minHeight: '40px' }} />
              <Tab label="Cookies" sx={{ textTransform: 'none', minHeight: '40px' }} />
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 ,p:"10px"}}>
                <Tooltip title="Copy Response Body">
                  <Button
                    variant="outlined"
                    startIcon={<CopyIcon />}
                    onClick={copyResponseBody}
                    size="small"
                  >
                    {copyFeedback.includes('Copied!') && activeResponseTab === 0 ? copyFeedback : 'Copy Body'} 📋
                  </Button>
                </Tooltip>
                <Tooltip title="Save Response Body as JSON">
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={saveResponseBodyAsJson}
                    size="small"
                  >
                    Save 💾
                  </Button>
                </Tooltip>
                <Tooltip title="Clear Response">
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={clearResponseBody}
                    size="small"
                    color="warning"
                  >
                    Clear 🧹
                  </Button>
                </Tooltip>
              </Box>
            </Tabs>

            {/* Response Body Content */}
            {activeResponseTab === 0 && (
              <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.paper', borderRadius: 1, p: 1.5,
                border: '1px solid', borderColor: 'divider',
                fontFamily: 'monospace', fontSize: settings.responseBodyFontSize,
                whiteSpace: settings.responseTextWrap ? 'pre-wrap' : 'pre',
                wordWrap: settings.responseTextWrap ? 'break-word' : 'normal',
              }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  responseBody ? (
                    settings.highlightSyntaxInResponse ? (
                      <SyntaxHighlighter
                        language={getLanguage(responseBody)}
                        style={syntaxStyle}
                        customStyle={{
                          background: 'transparent',
                          padding: 0,
                          margin: 0,
                          fontSize: settings.responseBodyFontSize,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflowX: 'hidden',
                        }}
                        codeTagProps={{
                          style: {
                            fontFamily: 'monospace',
                            fontSize: settings.responseBodyFontSize,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          },
                        }}
                        wrapLines={true}
                        wrapLongLines={true}
                      >
                        {responseBody}
                      </SyntaxHighlighter>
                    ) : (
                      responseBody
                    )
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {error ? `Error: ${error}` : 'Make a request to see the response here. 🚀'}
                    </Typography>
                  )
                )}
              </Box>
            )}

            {/* Response Headers Content */}
            {activeResponseTab === 1 && (
              <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.paper', borderRadius: 1, p: 1.5,
                border: '1px solid', borderColor: 'divider',
                fontFamily: 'monospace', fontSize: settings.responseBodyFontSize,
              }}>
                {Object.keys(responseHeaders).length > 0 ? (
                  Object.entries(responseHeaders).map(([key, value]) => (
                    <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
                      <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{key}</Box>: {value}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No response headers. 🤷‍♀️
                  </Typography>
                )}
                {Object.keys(responseHeaders).length > 0 && (
                  <Button startIcon={<CopyIcon />} onClick={copyResponseHeaders} variant="outlined" size="small" sx={{ mt: 1 }}>
                    {copyFeedback.includes('Copied Headers') ? copyFeedback : 'Copy All Headers'}
                  </Button>
                )}
              </Box>
            )}

            {/* Response Cookies Content */}
            {activeResponseTab === 2 && (
              <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.paper', borderRadius: 1, p: 1.5,
                border: '1px solid', borderColor: 'divider',
                fontFamily: 'monospace', fontSize: settings.responseBodyFontSize,
              }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>Response Cookies</Typography>
                {responseCookies.length > 0 ? (
                  responseCookies.map((cookie, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                      <Box component="span" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>{cookie.key}</Box>=<Box component="span" sx={{ fontWeight: 'normal' }}>{cookie.value}</Box>
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No cookies received in response. 🍪
                  </Typography>
                )}
                 {responseCookies.length > 0 && (
                  <Button startIcon={<CopyIcon />} onClick={copyResponseCookies} variant="outlined" size="small" sx={{ mt: 1 }}>
                    {copyFeedback.includes('Copied Cookies') ? copyFeedback : 'Copy All Cookies'}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Dialogs */}
        {/* Save Request Dialog */}
        <Dialog open={isSaveRequestDialogOpen} onClose={() => setIsSaveRequestDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Save Request</DialogTitle>
          <DialogContent dividers>
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
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="select-collection-label">Select Collection</InputLabel>
              <Select
                labelId="select-collection-label"
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                label="Select Collection"
              >
                {collections.map(collection => (
                  <MenuItem key={collection.id} value={collection.id}>{collection.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {collections.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                No collections available. Create one first. 📝
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsSaveRequestDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRequest} variant="contained" disabled={!newRequestName.trim() || !selectedCollectionId}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* New Collection Dialog */}
        <Dialog open={isNewCollectionDialogOpen} onClose={() => setIsNewCollectionDialogOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogContent dividers>
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
            <Button onClick={handleNewCollection} variant="contained" disabled={!newCollectionName.trim()}>Create</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Collection Dialog */}
        <Dialog open={isEditCollectionDialogOpen} onClose={() => setIsEditCollectionDialogOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>Edit Collection Name</DialogTitle>
          <DialogContent dividers>
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
            <Button onClick={handleEditCollectionName} variant="contained" disabled={!editCollectionName.trim()}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Dialog */}
        <Dialog
          open={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle id="confirm-dialog-title">{confirmDialogDetails.title}</DialogTitle>
          <DialogContent dividers>
            <Typography id="confirm-dialog-description">
              {confirmDialogDetails.message}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsConfirmDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDialogDetails.onConfirm} color="error" variant="contained" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Import Conflict Resolution Dialog */}
        <Dialog
          open={isImportConflictDialogOpen}
          onClose={() => { setIsImportConflictDialogOpen(false); setImportDataPending(null); fileInputRef.current.value = null; }}
          aria-labelledby="import-conflict-dialog-title"
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle id="import-conflict-dialog-title">Import Collections Conflict</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" sx={{ mb: 2 }}>
              It looks like you're trying to import collections. How would you like to handle existing collections with the same name?
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                aria-label="import-resolution"
                name="import-resolution-group"
                value={importConflictResolution}
                onChange={(e) => setImportConflictResolution(e.target.value)}
              >
                <FormControlLabel
                  value="merge"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="subtitle1">Merge Collections (Default) 🤝</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Existing collections with the same name will have new requests appended. Requests with identical names within the same collection will be skipped.
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="overwrite"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="subtitle1">Overwrite All Collections 🚨</Typography>
                      <Typography variant="body2" color="error">
                        **WARNING**: This will delete all your current collections and replace them entirely with the imported collections. This action cannot be undone.
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setIsImportConflictDialogOpen(false); setImportDataPending(null); fileInputRef.current.value = null; }}>
              Cancel
            </Button>
            <Button onClick={handleImportCollections} variant="contained" color="primary">
              Proceed with Import
            </Button>
          </DialogActions>
        </Dialog>


        {/* Settings Dialog */}
        <Dialog open={isSettingsDialogOpen} onClose={() => setIsSettingsDialogOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>Application Settings ⚙️</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, p: 0 }}>
            <Tabs
              orientation={window.innerWidth < 600 ? "horizontal" : "vertical"}
              variant="scrollable"
              value={activeSettingsTab}
              onChange={(e, newValue) => setActiveSettingsTab(newValue)}
              aria-label="settings tabs"
              sx={{ borderRight: { sm: 1 }, borderColor: 'divider', minWidth: { sm: 180 }, flexShrink: 0, borderBottom: { xs: 1, sm: 0 } }}
            >
              <Tab label="General" sx={{ textTransform: 'none' }} />
              <Tab label="Theme & Display" sx={{ textTransform: 'none' }} />
              <Tab label="History" sx={{ textTransform: 'none' }} />
              <Tab label="Environments" sx={{ textTransform: 'none' }} />
              <Tab label="Advanced" sx={{ textTransform: 'none' }} />
              <Tab label="Import/Export" sx={{ textTransform: 'none' }} />
            </Tabs>
            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', maxHeight: { xs: '60vh', sm: '70vh' } }}>
              {activeSettingsTab === 0 && ( // General Settings
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Default Request Values</Typography>
                    <TextField
                      fullWidth
                      label="Default URL"
                      value={settings.defaultUrl}
                      onChange={(e) => handleSettingChange('defaultUrl', e.target.value)}
                      margin="normal"
                      size="small"
                    />
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Default Method</InputLabel>
                      <Select
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
                    </FormControl>
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Default Body Type</InputLabel>
                      <Select
                        value={settings.defaultBodyType}
                        label="Default Body Type"
                        onChange={(e) => handleSettingChange('defaultBodyType', e.target.value)}
                      >
                        <MenuItem value="none">No Body</MenuItem>
                        <MenuItem value="raw-json">Raw JSON</MenuItem>
                        <MenuItem value="form-urlencoded">x-www-form-urlencoded</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Default Auth Type</InputLabel>
                      <Select
                        value={settings.defaultAuthType}
                        label="Default Auth Type"
                        onChange={(e) => handleSettingChange('defaultAuthType', e.target.value)}
                      >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="bearer">Bearer Token</MenuItem>
                        <MenuItem value="basic">Basic Auth</MenuItem>
                      </Select>
                    </FormControl>
                    {(settings.defaultAuthType === 'bearer') && (
                      <TextField
                        fullWidth
                        label="Default Bearer Token"
                        value={settings.defaultAuthToken}
                        onChange={(e) => handleSettingChange('defaultAuthToken', e.target.value)}
                        margin="normal"
                        size="small"
                        multiline
                        rows={3}
                      />
                    )}
                    {(settings.defaultAuthType === 'basic') && (
                      <Box>
                        <TextField
                          fullWidth
                          label="Default Basic Auth Username"
                          value={settings.defaultBasicAuthUsername}
                          onChange={(e) => handleSettingChange('defaultBasicAuthUsername', e.target.value)}
                          margin="normal"
                          size="small"
                        />
                        <TextField
                          fullWidth
                          label="Default Basic Auth Password"
                          type="password"
                          value={settings.defaultBasicAuthPassword}
                          onChange={(e) => handleSettingChange('defaultBasicAuthPassword', e.target.value)}
                          margin="normal"
                          size="small"
                        />
                      </Box>
                    )}

                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>Default Headers</Typography>
                    {settings.defaultHeaders.map((header) => (
                      <Grid container spacing={1} key={header.id} alignItems="center" sx={{ mb: 1 }}>
                        <Grid item xs={5}>
                          <TextField fullWidth placeholder="Key" value={header.key} onChange={(e) => handleDefaultHeadersChange(header.id, 'key', e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField fullWidth placeholder="Value" value={header.value} onChange={(e) => handleDefaultHeadersChange(header.id, 'value', e.target.value)} size="small" />
                        </Grid>
                        <Grid item xs={1}>
                          <IconButton onClick={() => removeDefaultHeader(header.id)} size="small" color="error">
                            <XIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}
                    <Button startIcon={<PlusIcon />} onClick={addDefaultHeader} variant="outlined" size="small" sx={{ mt: 1 }}> Add Default Header </Button>
                  </Grid>
                </Grid>
              )}

              {activeSettingsTab === 1 && ( // Theme & Display
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Theme</Typography>
                    <FormControl component="fieldset" margin="normal">
                      <RadioGroup row value={settings.theme} onChange={(e) => handleSettingChange('theme', e.target.value)}>
                        <FormControlLabel value="light" control={<Radio />} label="Light ☀️" />
                        <FormControlLabel value="dark" control={<Radio />} label="Dark 🌙" />
                      </RadioGroup>
                    </FormControl>

                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>Response Display</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.responseTextWrap}
                          onChange={(e) => handleSettingChange('responseTextWrap', e.target.checked)}
                          name="responseTextWrap"
                          color="primary"
                        />
                      }
                      label="Wrap Response Text"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.highlightSyntaxInResponse}
                          onChange={(e) => handleSettingChange('highlightSyntaxInResponse', e.target.checked)}
                          name="highlightSyntaxInResponse"
                          color="primary"
                        />
                      }
                      label="Highlight Syntax in Response"
                    />
                    <TextField
                      label="Response Body Font Size"
                      type="number"
                      value={settings.responseBodyFontSize}
                      onChange={(e) => handleSettingChange('responseBodyFontSize', Number(e.target.value))}
                      inputProps={{ min: 8, max: 24, step: 1 }}
                      margin="normal"
                      size="small"
                      sx={{ width: '100%', maxWidth: 200 }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.showResponseStatus}
                          onChange={(e) => handleSettingChange('showResponseStatus', e.target.checked)}
                          name="showResponseStatus"
                          color="primary"
                        />
                      }
                      label="Show Response Status"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.showRequestTime}
                          onChange={(e) => handleSettingChange('showRequestTime', e.target.checked)}
                          name="showRequestTime"
                          color="primary"
                        />
                      }
                      label="Show Request Time"
                    />
                     <TextField
                      label="JSON Indent Spaces"
                      type="number"
                      value={settings.jsonIndentSpaces}
                      onChange={(e) => handleSettingChange('jsonIndentSpaces', Number(e.target.value))}
                      inputProps={{ min: 0, max: 10, step: 1 }}
                      margin="normal"
                      size="small"
                      sx={{ width: '100%', maxWidth: 200 }}
                    />
                  </Grid>
                </Grid>
              )}

              {activeSettingsTab === 2 && ( // History Settings
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 1 }}>History Management</Typography>
                    <TextField
                      fullWidth
                      label="Max History Items (0 for unlimited)"
                      type="number"
                      value={settings.maxHistoryItems}
                      onChange={(e) => handleSettingChange('maxHistoryItems', Number(e.target.value))}
                      inputProps={{ min: 0 }}
                      margin="normal"
                      size="small"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.clearHistoryOnAppLoad}
                          onChange={(e) => handleSettingChange('clearHistoryOnAppLoad', e.target.checked)}
                          name="clearHistoryOnAppLoad"
                          color="primary"
                        />
                      }
                      label="Clear History on Application Load"
                    />
                  </Grid>
                </Grid>
              )}

              {activeSettingsTab === 3 && ( // Environments Settings
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Environments</Typography>
                    <Button
                      variant="contained"
                      startIcon={<PlusIcon />}
                      onClick={handleAddEnvironment}
                      size="small"
                      sx={{ mb: 2 }}
                    >
                      Add New Environment
                    </Button>

                    {settings.environments.map(env => (
                      <Box key={env.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '4px', p: 1.5, mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <TextField
                            label="Environment Name"
                            value={env.name}
                            onChange={(e) => handleUpdateEnvironmentName(env.id, e.target.value)}
                            size="small"
                            sx={{ flexGrow: 1, mr: 1 }}
                            disabled={env.name === 'No Environment'}
                          />
                          {env.name !== 'No Environment' && (
                            <Tooltip title="Delete Environment">
                              <IconButton onClick={() => handleDeleteEnvironment(env.id, env.name)} color="error" size="small">
                                <TrashIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Variables</Typography>
                        {env.variables.length === 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                            No variables yet.
                          </Typography>
                        )}
                        {env.variables.map(variable => (
                          <Grid container spacing={1} key={variable.id} alignItems="center" sx={{ mb: 0.5 }}>
                            <Grid item xs={5}>
                              <TextField fullWidth placeholder="Key" value={variable.key} onChange={(e) => handleUpdateEnvironmentVariable(env.id, variable.id, 'key', e.target.value)} size="small" />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField fullWidth placeholder="Value" value={variable.value} onChange={(e) => handleUpdateEnvironmentVariable(env.id, variable.id, 'value', e.target.value)} size="small" />
                            </Grid>
                            <Grid item xs={1}>
                              <Tooltip title="Remove Variable">
                                <IconButton onClick={() => handleRemoveEnvironmentVariable(env.id, variable.id)} size="small" color="error" >
                                  <XIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Grid>
                          </Grid>
                        ))}
                        <Button startIcon={<PlusIcon />} onClick={() => handleAddEnvironmentVariable(env.id)} variant="outlined" size="small" sx={{ mt: 1 }}>
                          Add Variable
                        </Button>
                      </Box>
                    ))}
                  </Grid>
                </Grid>
              )}

              {activeSettingsTab === 4 && ( // Advanced Settings
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Request Processing</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoFormatRequestJson}
                          onChange={(e) => handleSettingChange('autoFormatRequestJson', e.target.checked)}
                          name="autoFormatRequestJson"
                          color="primary"
                        />
                      }
                      label="Auto-format Request JSON"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoFormatResponseJson}
                          onChange={(e) => handleSettingChange('autoFormatResponseJson', e.target.checked)}
                          name="autoFormatResponseJson"
                          color="primary"
                        />
                      }
                      label="Auto-format Response JSON"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableRequestBodyValidation}
                          onChange={(e) => handleSettingChange('enableRequestBodyValidation', e.target.checked)}
                          name="enableRequestBodyValidation"
                          color="primary"
                        />
                      }
                      label="Enable Request Body JSON Validation"
                    />
                    <TextField
                      fullWidth
                      label="Request Timeout (ms)"
                      type="number"
                      value={settings.requestTimeout}
                      onChange={(e) => handleSettingChange('requestTimeout', Number(e.target.value))}
                      inputProps={{ min: 1000 }}
                      margin="normal"
                      size="small"
                    />

                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>CORS Proxy</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.enableCorsProxy}
                          onChange={(e) => handleSettingChange('enableCorsProxy', e.target.checked)}
                          name="enableCorsProxy"
                          color="primary"
                        />
                      }
                      label="Enable CORS Proxy"
                    />
                    {settings.enableCorsProxy && (
                      <TextField
                        fullWidth
                        label="CORS Proxy URL"
                        value={settings.corsProxyUrl}
                        onChange={(e) => handleSettingChange('corsProxyUrl', e.target.value)}
                        margin="normal"
                        size="small"
                        placeholder="e.g., https://your-cors-proxy.com/?url="
                      />
                    )}
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                      If enabled, requests will be sent to this proxy URL, which should then forward them to the target API. This helps bypass browser-enforced CORS restrictions. 🌐
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {activeSettingsTab === 5 && ( // Import/Export Settings
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Manage Collections & Settings</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        // startIcon={<DownloadIcon />}
                        onClick={exportData}
                        size="small"
                      >
                        📤 Export All Data  
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
                        // startIcon={<UploadIcon />}
                        onClick={() => fileInputRef.current.click()}
                        size="small"
                      >
                        📥 Import Data  
                      </Button>
                    </Box>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                      Export saves your current collections and most settings to a JSON file. Importing will prompt for how to handle existing collections.
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