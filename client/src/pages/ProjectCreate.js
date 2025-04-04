import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const ProjectCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const initialValues = {
    name: '',
    description: '',
    isPublic: false,
    tokenomics: {
      tokenName: '',
      tokenSymbol: '',
      totalSupply: '',
      allocation: {
        team: 0,
        marketing: 0,
        development: 0,
        liquidity: 0,
        treasury: 0,
        community: 0,
        advisors: 0,
        partners: 0,
      },
    },
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setLoading(true);
      await axios.post('/api/projects', {
        ...values,
        userId: user.id,
      });
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
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
          >
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Basic Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Project Name"
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
                      label="Project Description"
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
                      label="Make project public"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Token Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Token Name"
                      name="tokenomics.tokenName"
                      error={touched.tokenomics?.tokenName && Boolean(errors.tokenomics?.tokenName)}
                      helperText={touched.tokenomics?.tokenName && errors.tokenomics?.tokenName}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Token Symbol"
                      name="tokenomics.tokenSymbol"
                      error={touched.tokenomics?.tokenSymbol && Boolean(errors.tokenomics?.tokenSymbol)}
                      helperText={touched.tokenomics?.tokenSymbol && errors.tokenomics?.tokenSymbol}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Total Token Supply"
                      name="tokenomics.totalSupply"
                      type="number"
                      error={touched.tokenomics?.totalSupply && Boolean(errors.tokenomics?.totalSupply)}
                      helperText={touched.tokenomics?.totalSupply && errors.tokenomics?.totalSupply}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Token Allocation (%)
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Team"
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
                      label="Marketing"
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
                      label="Development"
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
                      label="Liquidity"
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
                      label="Treasury"
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
                      label="Community"
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
                      label="Advisors"
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
                      label="Partners"
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
                      {loading ? <CircularProgress size={24} /> : 'Create Project'}
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

export default ProjectCreate; 