import React, { useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from "react-router-dom";
import { Container, TextField, Button, Alert, Paper } from '@mui/material';

function Auth() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3000/api/auth/login', formData)
      .then(response => {
        console.log('Результат:', response.data.message);
        const userId = response.data.user.userId;
        const jwtToken = response.data.user.jwtToken;
        localStorage.setItem('jwtToken', jwtToken);
        navigate(`/profile/${userId}`);
        window.location.reload();
      })
      .catch(error => {
        setAuthError(`Ошибка: ${error.response.data.message}`);
      });
  };

  return (
    <Container maxWidth="xs" style={{ textAlign: 'center', marginTop: '8%', marginBottom: '10%' }}>
      <Paper elevation={3} style={{ padding: '20px'}}>
      <h1>Authorization</h1>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Email or login"
          variant="outlined"
          fullWidth
          margin="normal"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          margin="normal"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        /><br/>
        {authError && <Alert severity="error">{authError}</Alert>}<br/>
        <Button variant="contained" color="primary" type="submit">
          Login
        </Button>
        <br/><br/>
        <NavLink to="/recover">Forgot the password?</NavLink>
      </form>
      </Paper>
      <br/>
      <Paper elevation={3} style={{ padding: '20px' }}>
        Don't have an account yet? <NavLink to="/register">Registration</NavLink>
      </Paper>
      <br/>
    </Container>
    
  );
}

export default Auth;
