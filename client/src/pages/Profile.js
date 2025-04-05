import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { profileSchema, passwordChangeSchema } from '../utils/validationSchemas';
import FormError from '../components/forms/FormError';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (values, { setSubmitting }) => {
    try {
      setProfileError('');
      setProfileSuccess('');
      setLoading(true);
      const data = await updateProfile(values.name, values.email);
      updateUser(data);
      setProfileSuccess('Profile updated successfully');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setPasswordError('');
      setPasswordSuccess('');
      setLoading(true);
      await changePassword(values.currentPassword, values.newPassword);
      setPasswordSuccess('Password updated successfully');
      resetForm();
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>

              {profileError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {profileError}
                </Alert>
              )}

              {profileSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {profileSuccess}
                </Alert>
              )}

              <Formik
                initialValues={{
                  name: user?.name || '',
                  email: user?.email || '',
                }}
                validationSchema={profileSchema}
                onSubmit={handleProfileSubmit}
                enableReinitialize
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form>
                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      label="Full Name"
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />

                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      label="Email"
                      name="email"
                      type="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={isSubmitting || loading}
                      sx={{ mt: 3 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>

              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}

              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {passwordSuccess}
                </Alert>
              )}

              <Formik
                initialValues={{
                  currentPassword: '',
                  newPassword: '',
                  confirmNewPassword: '',
                }}
                validationSchema={passwordChangeSchema}
                onSubmit={handlePasswordSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form>
                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      error={touched.currentPassword && Boolean(errors.currentPassword)}
                      helperText={touched.currentPassword && errors.currentPassword}
                    />

                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      label="New Password"
                      name="newPassword"
                      type="password"
                      error={touched.newPassword && Boolean(errors.newPassword)}
                      helperText={touched.newPassword && errors.newPassword}
                    />

                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      label="Confirm New Password"
                      name="confirmNewPassword"
                      type="password"
                      error={touched.confirmNewPassword && Boolean(errors.confirmNewPassword)}
                      helperText={touched.confirmNewPassword && errors.confirmNewPassword}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={isSubmitting || loading}
                      sx={{ mt: 3 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Update Password'}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile; 