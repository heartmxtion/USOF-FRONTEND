import { jwtDecode } from "jwt-decode";
import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Paper,
  Container,
  CircularProgress,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Autocomplete,
} from "@mui/material";
import ErrorPage from "./ErrorPage";

function AdminPanel() {
  const jwtToken = localStorage.getItem("jwtToken");
  const userId = jwtToken != null ? jwtDecode(jwtToken).userId : 0;
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const headers = {
    Authorization: `Bearer ${jwtToken}`,
  };
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    title: "",
    description: "",
  });


  const roles = [
    { id: 0, title: "user" },
    { id: 1, title: "admin" },
  ];

  const [selectedRole, setSelectedRole] = useState(roles[0]);

  const [userFormData, setUserFormData] = useState({
    login: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: selectedRole,
  });

  const handleRoleChange = (event, newValue) => {
    if (newValue !== null) {
      setSelectedRole(newValue);
    }
  };

  const fetchAdminData = async () => {
    try {
      await axios
        .get(`http://localhost:3000/api/admins/${userId}`, {
          headers: headers,
        })
        .then((response) => {
          const data = response.data;
          setUser(data);
        });
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
    } finally {
      setLoadingUser(false);
    }
  };
  const fetchCategories = async () => {
    try {
      await axios
        .get(`http://localhost:3000/api/categories`)
        .then((response) => {
          const data = response.data;
          setCategories(data);
        });
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
    } finally {
      setLoadingCategories(false)
    }
  };

  const fetchUsers = async () => {
    try {
      await axios.get(`http://localhost:3000/api/users`).then((response) => {
        const data = response.data;
        setUsers(data);
      });
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenCategoryDialog = () => setOpenCategoryDialog(true);
  const handleCloseCategoryDialog = () => setOpenCategoryDialog(false);
  const handleOpenUserDialog = () => setOpenUserDialog(true);
  const handleCloseUserDialog = () => setOpenUserDialog(false);

  const handleCategoryFormChange = (event) => {
    setCategoryFormData({
      ...categoryFormData,
      [event.target.name]: event.target.value,
    });
  };
  const handleUserFormChange = (event) => {
    setUserFormData({
      ...userFormData,
      [event.target.name]: event.target.value,
    });
  };

  const handleCategorySubmit = async () => {
    try {
      await axios.post('http://localhost:3000/api/categories', categoryFormData, {
        headers: headers,
      });
      setCategoryFormData({ title: '', description: '' });
      handleCloseCategoryDialog();
      fetchCategories();
    } catch (error) {
      console.error('Error while creating category:', error);
    }
  };
  
  const handleUserSubmit = async () => {
    try {
      const userData = {
        ...userFormData,
        role: selectedRole.title,
      };
      await axios.post('http://localhost:3000/api/users', userData, {
        headers: headers,
      });
      setUserFormData({
        login: '',
        email: '',
        password: '',
        passwordConfirm: '',
        role: selectedRole.title,
      });
      setSelectedRole(roles[0]);
      handleCloseUserDialog();
      fetchUsers();
    } catch (error) {
      console.error('Error while creating user:', error);
    }
  };
  

  useEffect(() => {
    if (userId !== null) {
      fetchAdminData();
      fetchCategories();
      fetchUsers();
    }
    // eslint-disable-next-line
  }, [userId]);

  if (loadingUser || loadingCategories || loadingUsers) {
    return <CircularProgress sx={{ marginTop: "18%", marginLeft: "50%" }} />;
  }

  return (
    <>
      {!user || (user && user.role !== "admin") ? (
        <ErrorPage />
      ) : (
        <Container sx={{ marginTop: "2rem", paddingBottom: "130px" }}>
          <Paper
            elevation={3}
            sx={{
              textAlign: "center",
              padding: "20px",
              marginBottom: "10px",
            }}
          >
            <Typography variant="h4" gutterBottom>
              Admin panel
            </Typography>
          </Paper>
          <Paper
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "20px",
              padding: "20px",
            }}
          >
            <Paper
              elevation={3}
              sx={{ width: "545px", height: "525px", textAlign: "center" }}
            >
              <Typography variant="h4" gutterBottom>
                Categories
              </Typography>
              <Button onClick={handleOpenCategoryDialog}>Create new</Button>
              <TableContainer sx={{maxHeight: '435px'}} component={Paper}>
                <Table stickyHeader sx={{ minWidth: 500 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell align="center">Title</TableCell>
                      <TableCell align="center">Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell align="center" scope="row">
                          {row.id}
                        </TableCell>
                        <TableCell align="center" scope="row">
                          {row.title}
                        </TableCell>
                        <TableCell align="left">{row.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Dialog
                open={openCategoryDialog}
                onClose={handleCloseCategoryDialog}
              >
                <DialogTitle>Create New Category</DialogTitle>
                <DialogContent>
                  <TextField
                    required
                    autoFocus
                    margin="dense"
                    id="title"
                    name="title"
                    label="Title"
                    type="text"
                    fullWidth
                    value={categoryFormData.title}
                    onChange={handleCategoryFormChange}
                  />
                  <TextField
                    required
                    margin="dense"
                    id="description"
                    name="description"
                    label="Description"
                    type="text"
                    fullWidth
                    value={categoryFormData.description}
                    onChange={handleCategoryFormChange}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
                  <Button onClick={handleCategorySubmit} color="primary">
                    Create
                  </Button>
                </DialogActions>
              </Dialog>
            </Paper>
            <Paper
              elevation={3}
              sx={{ width: "545px", height: "525px", textAlign: "center" }}
            >
              <Typography variant="h4" gutterBottom>
                Users
              </Typography>
              <Button onClick={handleOpenUserDialog}>Create new</Button>
              <TableContainer sx={{maxHeight: '435px'}} component={Paper}>
                <Table stickyHeader sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell align="center">Login</TableCell>
                      <TableCell align="center">FullName</TableCell>
                      <TableCell align="center">Role</TableCell>
                      <TableCell align="center">Email</TableCell>
                      <TableCell align="center">Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((row) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell scope="row">{row.id}</TableCell>
                        <TableCell align="center" scope="row">
                          {row.login}
                        </TableCell>
                        <TableCell align="center">{row.full_name}</TableCell>
                        <TableCell align="center">{row.role}</TableCell>
                        <TableCell align="center">{row.email}</TableCell>
                        <TableCell align="center">{row.rating}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Dialog open={openUserDialog} onClose={handleCloseUserDialog}>
                <DialogTitle>Create New User</DialogTitle>
                <DialogContent>
                  <TextField
                    required
                    autoFocus
                    margin="dense"
                    id="login"
                    name="login"
                    label="Login"
                    type="text"
                    fullWidth
                    value={userFormData.login}
                    onChange={handleUserFormChange}
                  />
                  <TextField
                    required
                    autoFocus
                    margin="dense"
                    id="email"
                    name="email"
                    label="Email"
                    type="email"
                    fullWidth
                    value={userFormData.email}
                    onChange={handleUserFormChange}
                  />
                  <TextField
                    required
                    autoFocus
                    margin="dense"
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    fullWidth
                    value={userFormData.password}
                    onChange={handleUserFormChange}
                  />
                  <TextField
                    required
                    autoFocus
                    margin="dense"
                    id="passwordConfirm"
                    name="passwordConfirm"
                    label="Password Confirmation"
                    type="password"
                    fullWidth
                    value={userFormData.passwordConfirm}
                    onChange={handleUserFormChange}
                  />
                  <Autocomplete
                    id="roles"
                    options={roles}
                    getOptionLabel={(option) => option.title}
                    value={selectedRole}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    onChange={handleRoleChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Role"
                        required
                      />
                    )}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseUserDialog}>Cancel</Button>
                  <Button onClick={handleUserSubmit} color="primary">
                    Create
                  </Button>
                </DialogActions>
              </Dialog>
            </Paper>
          </Paper>
        </Container>
      )}
    </>
  );
}

export default AdminPanel;
