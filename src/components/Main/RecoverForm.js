import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import { Container, TextField, Button, Alert, Paper } from '@mui/material';

function RecoverForm() {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState(null);
  const {token} = useParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setAuthError('Password mismatch');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3000/api/auth/password-reset/${token}`, {
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword
      });

      const data = response.data;
      alert(data.message);
      navigate('/');
    } catch (error) {
      if (error.response) {
        setAuthError(`Ошибка: ${error.response.data.message}`);
      } else {
        setAuthError('Произошла ошибка при отправке запроса');
      }
    }
  };

  return (
    <Container maxWidth="xs" style={{ textAlign: 'center', marginTop: '10%', marginBottom: '10%'}}>
      <Paper elevation={3} style={{ padding: '20px'}}>
        <h1>Password recovery</h1>
        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          /><br/>
          <TextField
            label="Confirm the password"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          /><br/>
          {authError && <Alert severity="error">{authError}</Alert>}<br/>
          <Button variant="contained" color="primary" type="submit">
            Change password
          </Button>
        </form>
      </Paper>
      <br/>
    </Container>
  );
}

export default RecoverForm;
