import React, { useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from "react-router-dom";
import { Container, TextField, Button, Alert, Paper } from '@mui/material';

function Register() {
  const [formData, setFormData] = useState({ login: '', email: '', password: '', password_confirmation: ''});
  const [registerError, setRegisterError] = useState(null);
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
    axios.post('http://localhost:3000/api/auth/register', formData)
      .then(response => {
        console.log('Регистрация успешна:', response.data);
        navigate('/');
      })
      .catch(error => {
        setRegisterError(`Ошибка: ${error.response.data.message}`);
      });
  };

  return (
    <Container maxWidth="xs" style={{ textAlign: 'center', marginTop: '5%', marginBottom: '7%'}}>
      <Paper elevation={3} style={{ padding: '20px'}}>
        <h1>Registration</h1>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Login"
            variant="outlined"
            fullWidth
            margin="normal"
            name="login"
            value={formData.login}
            onChange={handleChange}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            name="email"
            value={formData.email}
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
          />
          <TextField
            label="Confirm the password"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
          />
          <br />
          {registerError && <Alert severity="error">{registerError}</Alert>}<br/>
          <Button variant="contained" color="primary" type="submit">
            Registration
          </Button>
        </form>
      </Paper>
      <br/>
      <Paper elevation={3} style={{ padding: '20px' }}>
        Already have an account? <NavLink to="/">Login</NavLink>
      </Paper>
      <br/>
    </Container>
  );
}

export default Register;
