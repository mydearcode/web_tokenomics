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

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (values, { setSubmitting }) => {
    try {
      setProfileError('');
      setProfileSuccess('');
      setLoading(true);
      await updateProfile(values.name, values.email);
      setProfileSuccess('Profil başarıyla güncellendi');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Profil güncellenemedi');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      setPasswordError('');
      setPasswordSuccess('');
      setLoading(true);
      await updatePassword(values.currentPassword, values.newPassword);
      setPasswordSuccess('Şifre başarıyla güncellendi');
      resetForm();
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Şifre güncellenemedi');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profil Ayarları
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Profil Bilgileri
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
                      label="Ad Soyad"
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />

                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      label="E-posta"
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
                      {loading ? <CircularProgress size={24} /> : 'Profili Güncelle'}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Şifre Değiştir
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
                      label="Mevcut Şifre"
                      name="currentPassword"
                      type="password"
                      error={touched.currentPassword && Boolean(errors.currentPassword)}
                      helperText={touched.currentPassword && errors.currentPassword}
                    />

                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      label="Yeni Şifre"
                      name="newPassword"
                      type="password"
                      error={touched.newPassword && Boolean(errors.newPassword)}
                      helperText={touched.newPassword && errors.newPassword}
                    />

                    <Field
                      as={TextField}
                      fullWidth
                      margin="normal"
                      label="Yeni Şifre Tekrar"
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
                      {loading ? <CircularProgress size={24} /> : 'Şifreyi Güncelle'}
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