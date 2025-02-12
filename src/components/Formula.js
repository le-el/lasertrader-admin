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
    Snackbar,
    Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const Formula = ({ openSidebar }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('adminTrade');
    const [formulas, setFormulas] = useState([]);

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedFormula, setSelectedFormula] = useState(null);
    const [newFormula, setNewFormula] = useState({
        name: '',
        formula: '',
    });
    const [errors, setErrors] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        if (!token) {
            setLoading(true);
            navigate('/login');
        } else {
            fetchFormulas();
        }
        setLoading(false);
    }, [token]);

    const fetchFormulas = async () => {
        try {
            const res = await axios.get(`${config.BackendEndpoint}/getFormula`, {
                headers: { Authorization: token ? token : '' },
            });
            setFormulas(res.data.formulas);
        } catch (err) {
            console.error('Error fetching formulas', err);
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toISOString().split('T')[0];
    };

    const handleNewFormulaChange = (field, value) => {
        setNewFormula((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const tempErrors = {};
        if (!newFormula.name) tempErrors.name = 'Name is required';
        if (!newFormula.formula) tempErrors.formula = 'Formula is required';
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCreateFormula = async () => {
        if (validate()) {
            try {
                const res = await axios.post(`${config.BackendEndpoint}/createFormula`, newFormula, {
                    headers: { Authorization: token ? token : '' },
                });
                fetchFormulas();
                showSnackbar(res.data.message);
                setNewFormula({ name: '', formula: '' });
                setErrors({});
                setOpenCreateModal(false);
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'An error occurred';
                showSnackbar(errorMessage, 'error');
            }
        }
    };

    const handleEditFormula = (formula) => {
        setSelectedFormula({ ...formula, formulaId: formula.id });
        setOpenEditModal(true);
    };

    const handleUpdateFormula = async () => {
        try {
            const res = await axios.post(`${config.BackendEndpoint}/updateFormula`, selectedFormula, {
                headers: { Authorization: token ? token : '' },
            });
            fetchFormulas();
            showSnackbar(res.data.message);
            setOpenEditModal(false);
            setSelectedFormula(null);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            showSnackbar(errorMessage, 'error');
        }
    };

    const handleDeleteFormula = async () => {
        try {
            const res = await axios.post(`${config.BackendEndpoint}/deleteFormula`, { formulaId: selectedFormula.id }, {
                headers: { Authorization: token ? token : '' },
            });
            fetchFormulas();
            showSnackbar(res.data.message);
            setOpenDeleteModal(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            showSnackbar(errorMessage, 'error');
        }
    };

    const handleConfirmDelete = (formula) => {
        setSelectedFormula(formula);
        setOpenDeleteModal(true);
    };

    return (
        <Container style={{ marginTop: '30px', width: '100%', textAlign: 'center' }}>
            <Box flexGrow={1} display="flex" flexDirection="column" alignItems="flex-start">
                <Typography variant="h4" style={{ marginLeft: '20vw', color: 'white', fontFamily: 'nycd', fontWeight: '1000' }}>
                    Formula Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCreateModal(true)}
                    style={{ marginBottom: '20px', marginTop: '20px' }}
                >
                    Create Formula
                </Button>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <CircularProgress />
                    </Box>
                ) : formulas.length > 0 ? (
                    <TableContainer component={Paper} style={{ width: '100%' }}>
                        <Table style={{ backgroundColor: '#f5f5f5' }}>
                            <TableHead>
                                <TableRow style={{ backgroundColor: 'rgb(13, 191, 150)', color: '#fff' }}>
                                    <TableCell style={{ color: '#fff', textAlign: 'center' }}>Name</TableCell>
                                    <TableCell style={{ color: '#fff', textAlign: 'center' }}>Formula</TableCell>
                                    <TableCell style={{ color: '#fff', textAlign: 'center' }}>CreateAt</TableCell>
                                    <TableCell style={{ color: '#fff', textAlign: 'center' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formulas.map((formula) => (
                                    <TableRow key={formula.id}>
                                        <TableCell style={{ textAlign: 'center' }}>{formula.name}</TableCell>
                                        <TableCell style={{ textAlign: 'center' }}>{formula.formula}</TableCell>
                                        <TableCell style={{ textAlign: 'center' }}>{formatDate(formula.createdAt)}</TableCell>
                                        <TableCell style={{ textAlign: 'center' }}>
                                            <IconButton color="primary" onClick={() => handleEditFormula(formula)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="secondary" onClick={() => handleConfirmDelete(formula)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography>No formulas available</Typography>
                )}
            </Box>

            {/* Create Formula Modal */}
            <Dialog
                open={openCreateModal}
                onClose={() => {
                    setNewFormula({
                        name: '',
                        formula: '',
                    });
                    setErrors({});
                    setOpenCreateModal(false);
                }}
            >
                <DialogTitle>Create Formula</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newFormula.name}
                        onChange={(e) =>
                            handleNewFormulaChange('name', e.target.value)
                        }
                        error={!!errors.name}
                        helperText={errors.email}
                        required
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Formula"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newFormula.formula}
                        onChange={(e) =>
                            handleNewFormulaChange('formula', e.target.value)
                        }
                        error={!!errors.formula}
                        helperText={errors.formula}
                        required
                    />

                    {errors.formula && (
                        <Typography color="error">
                            {errors.formula}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setNewFormula({
                                name: '',
                                formula: '',
                            });
                            setErrors({});
                            setOpenCreateModal(false);
                        }}
                        color="secondary"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleCreateFormula} color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Formula Modal */}
            <Dialog
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
            >
                <DialogTitle>Edit Formula</DialogTitle>
                <DialogContent>
                    {selectedFormula && (
                        <>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Name"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={selectedFormula.name}
                                onChange={(e) =>
                                    setSelectedFormula({
                                        ...selectedFormula,
                                        name: e.target.value,
                                    })
                                }
                                error={!!errors.email}
                                helperText={errors.email}
                                required
                            />
                            <TextField
                                label="Formula"
                                type='text'
                                margin='dense'
                                fullWidth
                                variant='outlined'
                                value={selectedFormula.formula}
                                onChange={(e) => {
                                    setSelectedFormula({
                                        ...selectedFormula,
                                        formula: e.target.value,
                                    });
                                }}
                                error={!!errors.email}
                                helperText={errors.email}
                                required
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenEditModal(false)}
                        color="secondary"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateFormula} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this Formula?
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setOpenDeleteModal(false);
                            setNewFormula({
                                name: '',
                                formula: '',
                            });
                        }}
                        color="secondary"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteFormula} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
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
        </Container>
    );
};

export default Formula;