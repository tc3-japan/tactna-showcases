// [DEV PURPOSE]
import {
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ViewListIcon from '@mui/icons-material/ViewList';
import CodeIcon from '@mui/icons-material/Code';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';
import { useCallback, useEffect, useState } from "react";
import { useOidcConfig } from "../contexts/OidcConfigContext";

interface ConfigurationPanelProps {
  onConfigChange?: () => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ onConfigChange }) => {
  const {
    authority,
    clientId,
    redirectUri,
    signupEndpoint,
    postSignupRedirectUri,
    audience,
    teamId,
    updateConfig,
    savedConfigs,
    currentConfigName,
    saveCurrentConfig,
    loadConfig,
    deleteConfig
  } = useOidcConfig();

  const [localAuthority, setLocalAuthority] = useState<string>(authority);
  const [localClientId, setLocalClientId] = useState<string>(clientId);
  const [localRedirectUri, setLocalRedirectUri] = useState<string>(redirectUri);
  const [localSignupEndpoint, setLocalSignupEndpoint] = useState<string>(signupEndpoint);
  const [localPostSignupRedirectUri, setLocalPostSignupRedirectUri] = useState<string>(postSignupRedirectUri);
  const [localAudience, setLocalAudience] = useState<string>(audience);
  const [localTeamId, setLocalTeamId] = useState<string>(teamId);

  const [configName, setConfigName] = useState<string>("");
  const [loadMenuAnchor, setLoadMenuAnchor] = useState<null | HTMLElement>(null);
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form');
  const [jsonValue, setJsonValue] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const darkTextFieldSx = {
    width: "340px",
    "& .MuiOutlinedInput-root": {
      color: "#ffffff",
      "& fieldset": { borderColor: "#555" },
      "&:hover fieldset": { borderColor: "#888" },
      "&.Mui-focused fieldset": { borderColor: "#4a9eff", borderWidth: 2 }
    },
    "& .MuiInputLabel-root": { color: "#bbb" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#4a9eff" },
    "& .MuiInputBase-input::placeholder": { color: "#888", opacity: 1 }
  };

  // Sync configName with currentConfigName from context
  useEffect(() => {
    if (currentConfigName) {
      setConfigName(currentConfigName);
    }
  }, [currentConfigName]);

  // Sync form values to JSON when switching to JSON view
  useEffect(() => {
    if (viewMode === 'json') {
      const configObj = {
        configName: configName,
        authority: localAuthority,
        clientId: localClientId,
        redirectUri: localRedirectUri,
        signupEndpoint: localSignupEndpoint,
        postSignupRedirectUri: localPostSignupRedirectUri,
        audience: localAudience,
        teamId: localTeamId,
      };
      setJsonValue(JSON.stringify(configObj, null, 2));
    }
  }, [viewMode, configName, localAuthority, localClientId, localRedirectUri, localSignupEndpoint, localPostSignupRedirectUri, localAudience, localTeamId]);

  // Update context when local values change (debounced to reduce re-renders)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateConfig({
        authority: localAuthority,
        clientId: localClientId,
        redirectUri: localRedirectUri,
        signupEndpoint: localSignupEndpoint,
        postSignupRedirectUri: localPostSignupRedirectUri,
        audience: localAudience,
        teamId: localTeamId,
      });
      onConfigChange?.();
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [localAuthority, localClientId, localRedirectUri, localSignupEndpoint, localPostSignupRedirectUri, localAudience, localTeamId, updateConfig, onConfigChange]);

  const handleJsonChange = useCallback((newJson: string) => {
    setJsonValue(newJson);
    try {
      const parsed = JSON.parse(newJson);
      if (parsed.configName !== undefined) setConfigName(parsed.configName);
      if (parsed.authority !== undefined) setLocalAuthority(parsed.authority);
      if (parsed.clientId !== undefined) setLocalClientId(parsed.clientId);
      if (parsed.redirectUri !== undefined) setLocalRedirectUri(parsed.redirectUri);
      if (parsed.signupEndpoint !== undefined) setLocalSignupEndpoint(parsed.signupEndpoint);
      if (parsed.postSignupRedirectUri !== undefined) setLocalPostSignupRedirectUri(parsed.postSignupRedirectUri);
      if (parsed.audience !== undefined) setLocalAudience(parsed.audience);
      if (parsed.teamId !== undefined) setLocalTeamId(parsed.teamId);
    } catch (e) {
      // Invalid JSON, just update the text value
    }
  }, []);

  const handleSaveConfig = useCallback(() => {
    if (configName.trim()) {
      saveCurrentConfig(configName.trim());
      setConfigName("");
    }
  }, [configName, saveCurrentConfig]);

  const handleLoadConfig = useCallback((name: string) => {
    loadConfig(name);
    setConfigName(name); // Set the config name in the text field
    setLoadMenuAnchor(null);
  }, [loadConfig]);

  const handleDeleteConfig = useCallback((name: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteConfig(name);
  }, [deleteConfig]);

  return (
    <>
      {/* Toggle button when panel is closed */}
      {!isOpen && (
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            position: "fixed",
            top: "50%",
            right: 16,
            transform: "translateY(-50%)",
            zIndex: 1000,
            bgcolor: "#4a9eff",
            color: "#fff",
            width: 48,
            height: 48,
            "&:hover": {
              bgcolor: "#3a7ecc",
            },
            boxShadow: 4,
            border: "2px solid #fff",
          }}
        >
          <SettingsIcon />
        </IconButton>
      )}

      {/* Configuration Panel */}
      {isOpen && (
        <>
          {/* Close handle bar - positioned independently */}
          <Box
            onClick={() => setIsOpen(false)}
            sx={{
              position: "fixed",
              left: "calc(100vw - 400px)",
              top: "50vh",
              transform: "translateY(-50%)",
              width: 24,
              height: 80,
              bgcolor: "#4a9eff",
              borderRadius: "8px 0 0 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": {
                bgcolor: "#3a7ecc",
              },
              boxShadow: 4,
              zIndex: 1002,
            }}
          >
            <ChevronRightIcon sx={{ color: "#fff" }} />
          </Box>

          <Box
            sx={{
              position: "fixed",
              top: 64,
              right: 0,
              p: 2,
              maxHeight: "calc(100vh - 64px)",
              overflowY: "auto",
              overflowX: "hidden",
              zIndex: 1,
              bgcolor: "#1a1a1a",
              borderLeft: "1px solid",
              borderColor: "#333",
              boxShadow: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                bgcolor: "#0a0a0a",
              },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "#555",
                borderRadius: "4px",
                "&:hover": {
                  bgcolor: "#777",
                },
              },
            }}
          >

        <Box sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: 600, mb: 0.5 }}>
            Configurations
          </Typography>
          {currentConfigName && (
            <Typography
              variant="body2"
              sx={{
                color: "#4a9eff",
                bgcolor: "#2a3a4a",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 500,
                display: "inline-block"
              }}
            >
              {currentConfigName}
            </Typography>
          )}
        </Box>

        {/* Save/Load Configuration Section */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", width: "340px" }}>
          <TextField
            label="Config Name"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            size="small"
            sx={{
              width: "160px",
              "& .MuiOutlinedInput-root": {
                color: "#ffffff",
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#4a9eff" }
              },
              "& .MuiInputLabel-root": { color: "#bbb" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#4a9eff" }
            }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleSaveConfig}
            disabled={!configName.trim()}
            startIcon={<SaveIcon />}
            sx={{
              bgcolor: "#4a9eff",
              "&:hover": { bgcolor: "#3a7ecc" },
              "&:disabled": { bgcolor: "#333", color: "#666" },
              minWidth: "80px"
            }}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => setLoadMenuAnchor(e.currentTarget)}
            startIcon={<FolderOpenIcon />}
            disabled={savedConfigs.length === 0}
            sx={{
              borderColor: "#555",
              color: "#bbb",
              "&:hover": { borderColor: "#888", bgcolor: "#2a2a2a" },
              "&:disabled": { borderColor: "#333", color: "#666" },
              minWidth: "80px"
            }}
          >
            Load
          </Button>
        </Box>

        {/* View Mode Toggle */}
        <Box sx={{ width: "340px", display: "flex", justifyContent: "center" }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                color: "#bbb",
                borderColor: "#555",
                "&:hover": {
                  bgcolor: "#2a2a2a",
                  borderColor: "#888",
                },
                "&.Mui-selected": {
                  bgcolor: "#4a9eff",
                  color: "#fff",
                  "&:hover": {
                    bgcolor: "#3a7ecc",
                  },
                },
              },
            }}
          >
            <ToggleButton value="form">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="json">
              <CodeIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Menu
          anchorEl={loadMenuAnchor}
          open={Boolean(loadMenuAnchor)}
          onClose={() => setLoadMenuAnchor(null)}
          slotProps={{
            paper: {
              sx: {
                bgcolor: "#2a2a2a",
                color: "#fff",
                maxHeight: 300
              }
            }
          }}
        >
          {savedConfigs.map((config) => (
            <MenuItem
              key={config.name}
              onClick={() => handleLoadConfig(config.name)}
              sx={{
                "&:hover": { bgcolor: "#3a3a3a" },
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>{config.name}</span>
                {config.isFromEnv && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#4a9eff",
                      bgcolor: "#1a2a3a",
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 0.5,
                      fontSize: "0.65rem"
                    }}
                  >
                    ENV
                  </Typography>
                )}
              </Box>
              {!config.isFromEnv && (
                <IconButton
                  size="small"
                  onClick={(e) => handleDeleteConfig(config.name, e)}
                  sx={{ color: "#ff6b6b", "&:hover": { bgcolor: "#4a2a2a" } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </MenuItem>
          ))}
        </Menu>

        <Divider sx={{ borderColor: "#444", my: 1 }} />

        {viewMode === 'form' ? (
          <>
            <TextField
              label="OpenID Provider (Authority)"
              value={localAuthority}
              onChange={(e) => setLocalAuthority(e.target.value)}
              sx={darkTextFieldSx}
            />
            <TextField
              label="Client ID"
              value={localClientId}
              onChange={(e) => setLocalClientId(e.target.value)}
              sx={darkTextFieldSx}
            />
            <TextField
              label="Redirect URI for authorize endpoint"
              value={localRedirectUri}
              onChange={(e) => setLocalRedirectUri(e.target.value)}
              sx={darkTextFieldSx}
            />
            <TextField
              label="Myaccount URL (Signup Endpoint)"
              value={localSignupEndpoint}
              onChange={(e) => setLocalSignupEndpoint(e.target.value)}
              placeholder="https://myaccount.example.com/signup"
              sx={darkTextFieldSx}
            />
            <TextField
              label="Redirect URI for signup"
              value={localPostSignupRedirectUri}
              onChange={(e) => setLocalPostSignupRedirectUri(e.target.value)}
              placeholder="https://example.com"
              sx={darkTextFieldSx}
            />
            <TextField
              label="Audience (Resource Server)"
              value={localAudience}
              onChange={(e) => setLocalAudience(e.target.value)}
              placeholder="https://showcase.tactna.gigops-dev.net"
              sx={darkTextFieldSx}
            />
            <TextField
              label="Team ID"
              value={localTeamId}
              onChange={(e) => setLocalTeamId(e.target.value)}
              placeholder="892ef6b5-da05-4748-8ea1-cd7cdb567643"
              sx={darkTextFieldSx}
            />
          </>
        ) : (
          <TextField
            multiline
            rows={15}
            value={jsonValue}
            onChange={(e) => handleJsonChange(e.target.value)}
            sx={{
              width: "340px",
              "& .MuiOutlinedInput-root": {
                color: "#ffffff",
                fontFamily: "monospace",
                fontSize: "12px",
                "& fieldset": { borderColor: "#555" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#4a9eff", borderWidth: 2 }
              },
              "& .MuiInputBase-input": {
                color: "#fff",
              }
            }}
          />
        )}
          </Box>
        </>
      )}
    </>
  );
};

export default ConfigurationPanel;
