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
  const [companyEmails, setCompanyEmail] = useState([]);

  // Modal States
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    url: ''
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
      .get(`${config.BackendEndpoint}/getCompaniesUser`, {
        headers: {
          Authorization: token ? token : ''
        }
      })
      .then((res) => {
        setAccounts(res.data.companiesuser || []);
        setCompanyEmail(res.data.companyEmail || []);
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

  const handleToggle = (event) => {
    setSelectedUser({
      ...selectedUser,
      allow: event.target.checked ? 'Allow' : 'Block'
    });
  };

  // Validation function
  const validate = () => {
    const tempErrors = {};

    if (!newUser.email || !newUser.email.includes('@')) {
      tempErrors.email = 'Valid email is required';
    }

    if (!newUser.name) {
      tempErrors.name = 'Name is required';
    }
    if (!newUser.url) {
      tempErrors.url = 'Url is required';
    }

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
    if (validate()) {
      // Reset the form
      await axios
        .post(`${config.BackendEndpoint}/createCompanyUser`, newUser, {
          headers: {
            Authorization: token ? token : ''
          }
        })
        .then((res) => {
          fetchAccounts();
          showSnackbar(res.data.message, 'success');
          setNewUser({
            email: '',
            name: '',
            url: ''
          });
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.message || 'An error occurred';
          showSnackbar(errorMessage, 'error');
          setNewUser({
            email: '',
            name: '',
            url: ''
          });
        });
      setOpenCreateModal(false);
    }
  };

  const handleEditUser = (user) => {
    user = { ...user, companyUserId: user.id };
    setSelectedUser(user);
    setOpenEditModal(true);
  };

  const handleUpdateUser = async () => {
    // Logic for updating user information
    await axios
      .post(`${config.BackendEndpoint}/updateCompanyUser`, selectedUser, {
        headers: {
          Authorization: token ? token : ''
        }
      })
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
        `${config.BackendEndpoint}/deleteCompanyUser`,
        { companyUserId: selectedUser.id },
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
            User Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
            style={{ marginBottom: '20px', marginTop: '20px' }}
          >
            Create Company
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
                <TableHead style={{ width: '110%' }}>
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
                      Email
                    </TableCell>
                    <TableCell
                      style={{
                        color: '#fff',
                        textAlign: 'center'
                      }}
                    >
                      Name
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
                        {account.email}
                      </TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        {account.name}
                      </TableCell>
                      {/* <TableCell
                                                style={{ textAlign: 'center' }}
                                            >
                                                {account.url}
                                            </TableCell> */}
                      <TableCell style={{ textAlign: 'center' }}>
                        {account.api_key}
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
              No users found.
            </Typography>
          )}
        </Box>

        {/* Create User Modal */}
        <Dialog
          open={openCreateModal}
          onClose={() => {
            setNewUser({
              email: '',
              name: '',
              url: ''
            });
            setErrors({});
            setOpenCreateModal(false);
          }}
        >
          <DialogTitle>Create Company</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={newUser.email}
              onChange={(e) => handleNewUserChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              margin="dense"
              label="Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newUser.name}
              onChange={(e) => handleNewUserChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              margin="dense"
              label="Company URL"
              type="text"
              fullWidth
              variant="outlined"
              value={newUser.url}
              onChange={(e) => handleNewUserChange('url', e.target.value)}
              error={!!errors.url}
              helperText={errors.url}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenCreateModal(false);
                setNewUser({
                  email: '',
                  name: '',
                  url: ''
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
          <DialogTitle>Edit Company</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      email: e.target.value
                    })
                  }
                  required
                />
                <TextField
                  margin="dense"
                  label="Name"
                  type="text"
                  fullWidth
                  required
                  variant="outlined"
                  value={selectedUser.name}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      name: e.target.value
                    })
                  }
                />
                {/* <TextField
                                    margin="dense"
                                    label="Endpoint"
                                    type="text"
                                    fullWidth
                                    required
                                    variant="outlined"
                                    value={selectedUser.url}
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            url: e.target.value,
                                        })
                                    }
                                /> */}
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
