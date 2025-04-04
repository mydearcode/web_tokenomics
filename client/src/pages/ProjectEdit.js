import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { projectSchema } from '../utils/validationSchemas';
import FormError from '../components/forms/FormError';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ProjectEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/projects/${id}`);
        setInitialValues({
          name: response.data.name,
          description: response.data.description,
          isPublic: response.data.isPublic,
          tokenomics: {
            tokenName: response.data.tokenomics.tokenName,
            tokenSymbol: response.data.tokenomics.tokenSymbol,
            totalSupply: response.data.tokenomics.totalSupply,
            allocation: {
              team: response.data.tokenomics.allocation.team,
              marketing: response.data.tokenomics.allocation.marketing,
              development: response.data.tokenomics.allocation.development,
              liquidity: response.data.tokenomics.allocation.liquidity,
              treasury: response.data.tokenomics.allocation.treasury,
              community: response.data.tokenomics.allocation.community,
              advisors: response.data.tokenomics.allocation.advisors,
              partners: response.data.tokenomics.allocation.partners,
            },
          },
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Proje yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setLoading(true);
      await axios.put(`/api/projects/${id}`, {
        ...values,
        userId: user.id,
      });
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Proje güncellenemedi');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (loading && !initialValues) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!initialValues) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">Proje bulunamadı</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Projeyi Düzenle
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <Formik
            initialValues={initialValues}
            validationSchema={projectSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Temel Bilgiler
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Proje Adı"
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      multiline
                      rows={4}
                      label="Proje Açıklaması"
                      name="description"
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Field
                          as={Switch}
                          name="isPublic"
                          checked={values.isPublic}
                          onChange={(e) => setFieldValue('isPublic', e.target.checked)}
                        />
                      }
                      label="Projeyi Herkese Açık Yap"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Token Bilgileri
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Token Adı"
                      name="tokenomics.tokenName"
                      error={touched.tokenomics?.tokenName && Boolean(errors.tokenomics?.tokenName)}
                      helperText={touched.tokenomics?.tokenName && errors.tokenomics?.tokenName}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Token Sembolü"
                      name="tokenomics.tokenSymbol"
                      error={touched.tokenomics?.tokenSymbol && Boolean(errors.tokenomics?.tokenSymbol)}
                      helperText={touched.tokenomics?.tokenSymbol && errors.tokenomics?.tokenSymbol}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Toplam Token Arzı"
                      name="tokenomics.totalSupply"
                      type="number"
                      error={touched.tokenomics?.totalSupply && Boolean(errors.tokenomics?.totalSupply)}
                      helperText={touched.tokenomics?.totalSupply && errors.tokenomics?.totalSupply}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Token Dağılımı (%)
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Takım"
                      name="tokenomics.allocation.team"
                      type="number"
                      error={touched.tokenomics?.allocation?.team && Boolean(errors.tokenomics?.allocation?.team)}
                      helperText={touched.tokenomics?.allocation?.team && errors.tokenomics?.allocation?.team}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Pazarlama"
                      name="tokenomics.allocation.marketing"
                      type="number"
                      error={touched.tokenomics?.allocation?.marketing && Boolean(errors.tokenomics?.allocation?.marketing)}
                      helperText={touched.tokenomics?.allocation?.marketing && errors.tokenomics?.allocation?.marketing}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Geliştirme"
                      name="tokenomics.allocation.development"
                      type="number"
                      error={touched.tokenomics?.allocation?.development && Boolean(errors.tokenomics?.allocation?.development)}
                      helperText={touched.tokenomics?.allocation?.development && errors.tokenomics?.allocation?.development}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Likidite"
                      name="tokenomics.allocation.liquidity"
                      type="number"
                      error={touched.tokenomics?.allocation?.liquidity && Boolean(errors.tokenomics?.allocation?.liquidity)}
                      helperText={touched.tokenomics?.allocation?.liquidity && errors.tokenomics?.allocation?.liquidity}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Hazine"
                      name="tokenomics.allocation.treasury"
                      type="number"
                      error={touched.tokenomics?.allocation?.treasury && Boolean(errors.tokenomics?.allocation?.treasury)}
                      helperText={touched.tokenomics?.allocation?.treasury && errors.tokenomics?.allocation?.treasury}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Topluluk"
                      name="tokenomics.allocation.community"
                      type="number"
                      error={touched.tokenomics?.allocation?.community && Boolean(errors.tokenomics?.allocation?.community)}
                      helperText={touched.tokenomics?.allocation?.community && errors.tokenomics?.allocation?.community}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Danışmanlar"
                      name="tokenomics.allocation.advisors"
                      type="number"
                      error={touched.tokenomics?.allocation?.advisors && Boolean(errors.tokenomics?.allocation?.advisors)}
                      helperText={touched.tokenomics?.allocation?.advisors && errors.tokenomics?.allocation?.advisors}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="İş Ortakları"
                      name="tokenomics.allocation.partners"
                      type="number"
                      error={touched.tokenomics?.allocation?.partners && Boolean(errors.tokenomics?.allocation?.partners)}
                      helperText={touched.tokenomics?.allocation?.partners && errors.tokenomics?.allocation?.partners}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={isSubmitting || loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Değişiklikleri Kaydet'}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProjectEdit; 