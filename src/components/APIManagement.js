import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from './config';
import { useNavigate } from 'react-router-dom';

import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Select,
  MenuItem,
  OutlinedInput,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const UserManagement = ({ setOpenSidebar }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('adminTrade');
  const [accounts, setAccounts] = useState([]);

  // Modal States
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    api: '',
    type: 'Rest'
  });
  // State to control the visibility and message of the Snackbar
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (!token) {
      setLoading(true);
      navigate('/login');
    } else {
      fetchAccounts();
    }
    setLoading(false);
    // eslint-disable-next-line
  }, [token, navigate]);

  // Function to handle closing the Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Example function to show a snackbar (call this where needed)
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const fetchAccounts = async () => {
    await axios
      .get(`${config.BackendEndpoint}/getAPIs`, {
        headers: {
          Authorization: token ? token : ''
        }
      })
      .then((res) => {
        setAccounts(res.data.apis || []);
      })
      .catch((error) => {
        const status = error.response.status;
        const errorMessage = error.response.data.state;
        if (status === 401) {
          showSnackbar(errorMessage, 'error');
          navigate('/login');
          localStorage.removeItem('adminTrade');
          setOpenSidebar(false);
        }
      });
  };

  // Validation function
  const validate = () => {
    const tempErrors = {};

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNewUserChange = (field, value) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));

    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // const handleAllowChange = (userId, newValue) => {
  //     setSelectedAllow((prev) => ({
  //         ...prev,
  //         [userId]: newValue,
  //     }));

  //     // Optionally, you can send the new value to the server here
  //     // to update the user's allow status
  // };

  const handleCreateUser = async () => {
    const data = {
      api: newUser.api,
      type: newUser.type === 'Rest' ? true : false
    };
    if (validate()) {
      // Reset the form
      await axios
        .post(`${config.BackendEndpoint}/createAPI`, data, {
          headers: {
            Authorization: token ? token : ''
          }
        })
        .then((res) => {
          fetchAccounts();
          showSnackbar(res.data.message, 'success');
          setNewUser({
            api: ''
          });
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.message || 'An error occurred';
          showSnackbar(errorMessage, 'error');
          setNewUser({
            api: ''
          });
        });
      setOpenCreateModal(false);
    }
  };

  const handleEditUser = (user) => {
    user = {
      ...user,
      type: user.type === true ? 'Rest' : 'Live',
      api: user.api,
      id: user.id
    };
    setSelectedUser(user);
    setOpenEditModal(true);
  };

  const handleUpdateUser = async () => {
    // Logic for updating user information
    await axios
      .post(
        `${config.BackendEndpoint}/updateAPI`,
        {
          id: selectedUser.id,
          type: selectedUser.type === 'Rest' ? true : false,
          api: selectedUser.api
        },
        {
          headers: {
            Authorization: token ? token : ''
          }
        }
      )
      .then((res) => {
        fetchAccounts();
      })
      .catch((error) => {});
    setOpenCreateModal(false);
    setOpenEditModal(false);
    setSelectedUser(null); // Clear selected user
  };

  const handleDeleteUser = async () => {
    await axios
      .post(
        `${config.BackendEndpoint}/deleteAPI`,
        { id: selectedUser.id },
        {
          headers: {
            Authorization: token ? token : ''
          }
        }
      )
      .then((res) => {
        fetchAccounts();
        showSnackbar(res.data.message, 'success');
        setOpenDeleteModal(false);
      })
      .catch((error) => {
        fetchAccounts();
        const errorMessage =
          error.response?.data?.message || 'An error occurred';
        showSnackbar(errorMessage, 'error');
        setOpenDeleteModal(false);
      });
    setOpenCreateModal(false);
  };

  const handleConfirmDelete = (user) => {
    // Logic for deleting user
    setSelectedUser(user);
    setOpenDeleteModal(true);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
  };

  return (
    <>
      <Container
        style={{
          marginTop: '30px',
          width: '100%',
          textAlign: 'center'
        }}
      >
        <Box
          flexGrow={1}
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          width={'100%'}
        >
          <Typography
            variant="h4"
            style={{
              marginLeft: '20vw',
              color: 'white',
              fontFamily: 'nycd',
              fontWeight: '1000'
            }}
          >
            API Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
            style={{ marginBottom: '20px', marginTop: '20px' }}
          >
            Create API
          </Button>

          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="200px"
            >
              <CircularProgress />
            </Box>
          ) : accounts.length > 0 ? ( // Ensure accounts is not empty
            <TableContainer component={Paper}>
              <Table style={{ backgroundColor: '#f5f5f5' }}>
                <TableHead>
                  <TableRow
                    style={{
                      backgroundColor: 'rgb(13, 191, 150)',
                      color: '#fff'
                    }}
                  >
                    <TableCell
                      style={{
                        color: '#fff',
                        textAlign: 'center'
                      }}
                    >
                      ID
                    </TableCell>
                    <TableCell
                      style={{
                        color: '#fff',
                        textAlign: 'center'
                      }}
                    >
                      API Key
                    </TableCell>
                    <TableCell
                      style={{
                        color: '#fff',
                        textAlign: 'center'
                      }}
                    >
                      Type
                    </TableCell>
                    <TableCell
                      style={{
                        color: '#fff',
                        textAlign: 'center'
                      }}
                    >
                      CreatedAt
                    </TableCell>
                    <TableCell
                      style={{
                        color: '#fff',
                        textAlign: 'center'
                      }}
                    >
                      UpdatedAt
                    </TableCell>
                    <TableCell
                      style={{
                        color: '#fff',
                        textAlign: 'center'
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell style={{ textAlign: 'center' }}>
                        {account.id}
                      </TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        {account.api}
                      </TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        {account.type === true ? 'Rest' : 'Live'}
                      </TableCell>

                      <TableCell style={{ textAlign: 'center' }}>
                        {formatDate(account.createdAt)}
                      </TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        {formatDate(account.updatedAt)}
                      </TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        <IconButton onClick={() => handleEditUser(account)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleConfirmDelete(account)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="h6" style={{ color: 'white' }}>
              No APIs found.
            </Typography>
          )}
        </Box>

        {/* Create User Modal */}
        <Dialog
          open={openCreateModal}
          onClose={() => {
            setNewUser({
              api: ''
            });
            setErrors({});
            setOpenCreateModal(false);
          }}
        >
          <DialogTitle>Create User</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="API Key"
              type="text"
              fullWidth
              variant="outlined"
              value={newUser.api}
              onChange={(e) => handleNewUserChange('api', e.target.value)}
              error={!!errors.api}
              helperText={errors.api}
            />
            <Select
              labelId="type"
              fullWidth
              placeholder="Type"
              value={newUser.type}
              onChange={(e) => handleNewUserChange('type', e.target.value)}
              input={<OutlinedInput label="" placeholder="Type" />}
              error={!!errors.companyEmail}
            >
              <MenuItem value="Rest">
                <span>Rest</span>
              </MenuItem>
              <MenuItem value="Live">
                <span>Live</span>
              </MenuItem>
            </Select>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenCreateModal(false);
                setNewUser({
                  api: '',
                  type: ''
                });
                setErrors({});
              }}
              color="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog
          open={openEditModal}
          onClose={() => {
            setOpenEditModal(false);
            setErrors({});
          }}
        >
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <>
                <TextField
                  margin="dense"
                  label="API Key"
                  type="text"
                  fullWidth
                  required
                  variant="outlined"
                  value={selectedUser.api}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      api: e.target.value
                    })
                  }
                />
                <Select
                  labelId="type"
                  fullWidth
                  placeholder="Type"
                  value={selectedUser.type}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      type: e.target.value
                    })
                  }
                  input={<OutlinedInput label="" placeholder="Type" />}
                  error={!!errors.companyEmail}
                >
                  <MenuItem value="Rest">
                    <span>Rest</span>
                  </MenuItem>
                  <MenuItem value="Live">
                    <span>Live</span>
                  </MenuItem>
                </Select>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditModal(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={openDeleteModal}
          onClose={() => {
            setOpenDeleteModal(false);
            setErrors({});
          }}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this user?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteModal(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleDeleteUser} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000} // Duration to hide automatically
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserManagement;
