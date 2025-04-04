import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getProject, deleteProject } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import ShareProject from '../components/ShareProject';

// Renk paleti
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C43', '#A4DE6C', '#D0ED57'];

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVestingCategory, setSelectedVestingCategory] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [projectAccess, setProjectAccess] = useState('viewer'); // Default access level

  const fetchProject = async () => {
    setLoading(true);
    try {
      const data = await getProject(id);
      console.log("Project data received:", data);
      
      // Verify and format project data if needed
      const projectData = data?.data || data;
      
      setProject(projectData);
      
      // Determine project access level
      if (user && projectData.owner._id === user.id) {
        setProjectAccess('owner');
      } else if (projectData.collaborators && projectData.collaborators.some(c => c.user && c.user._id === user?.id && c.role === 'editor')) {
        setProjectAccess('editor');
      } else {
        setProjectAccess('viewer');
      }
      
      // Set the first allocation category as the default selected category
      if (projectData.tokenomics?.allocation) {
        const categories = Object.keys(projectData.tokenomics.allocation);
        if (categories.length > 0) {
          setSelectedVestingCategory(categories[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching project:", err);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id, user]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        navigate('/');
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  // Vesting hesaplama fonksiyonu
  const calculateVestingSchedule = (category) => {
    if (!project?.vesting?.[category]) {
      return [];
    }

    const vestingData = project.vesting[category];
    const allocationData = project.tokenomics.allocation[category];
    
    if (!allocationData) {
      return [];
    }

    const categoryAllocation = allocationData.percentage; // Kategorinin toplam allocation yüzdesi
    const tgePercentage = vestingData.tgePercentage; // TGE'de açılacak yüzde (kategorinin kendi yüzdesinden)
    const remainingPercentage = 100 - tgePercentage; // Vesting ile açılacak kalan yüzde
    const monthlyPercentage = remainingPercentage / vestingData.vestingMonths; // Her ay açılacak yüzde
    
    const schedule = [];
    
    // TGE (M0)
    schedule.push({
      month: 0,
      monthDisplay: "M0",
      percentage: tgePercentage,
      amount: (project.tokenomics.totalSupply * categoryAllocation * tgePercentage) / 10000
    });
    
    // Cliff dönemi
    for (let i = 1; i < vestingData.cliffMonths; i++) {
      schedule.push({
        month: i,
        monthDisplay: `M${i}`,
        percentage: tgePercentage,
        amount: (project.tokenomics.totalSupply * categoryAllocation * tgePercentage) / 10000
      });
    }
    
    // Vesting dönemi
    let currentPercentage = tgePercentage;
    for (let i = 0; i < vestingData.vestingMonths; i++) {
      // Vesting aylarını cliff sonrasından başlat ama doğru ay numarasını kullan
      const month = Number(vestingData.cliffMonths) + i;
      currentPercentage += monthlyPercentage;
      
      schedule.push({
        month: month,
        monthDisplay: `M${month}`,
        percentage: Math.min(currentPercentage, 100), // Maksimum 100%'ü geçmemeli
        amount: (project.tokenomics.totalSupply * categoryAllocation * Math.min(currentPercentage, 100)) / 10000
      });
    }
    
    // Ayları sayısal olarak sırala
    schedule.sort((a, b) => a.month - b.month);
    
    return schedule;
  };

  // Tüm kategorilerin vesting verilerini birleştiren fonksiyon
  const getAllCategoriesVestingData = () => {
    if (!project?.tokenomics?.allocation || !project?.vesting) {
      return [];
    }

    const categories = Object.keys(project.tokenomics.allocation);
    const maxMonths = Math.max(...categories.map(category => {
      const vestingData = project.vesting[category];
      return vestingData ? vestingData.cliffMonths + vestingData.vestingMonths - 1 : 0;
    }));

    const combinedData = [];
    
    // Her ay için veri oluştur
    for (let month = 0; month <= maxMonths; month++) {
      const monthData = { month };
      let totalCirculation = 0;
      
      // Her kategori için o aydaki yüzdeyi ekle
      categories.forEach(category => {
        const schedule = calculateVestingSchedule(category);
        const monthEntry = schedule.find(entry => entry.month === month);
        const lastEntry = schedule[schedule.length - 1];
        const categoryAllocation = project.tokenomics.allocation[category].percentage;
        
        let categoryCirculation;
        if (monthEntry) {
          // Bu ay için veri varsa ekle
          categoryCirculation = (monthEntry.percentage * categoryAllocation) / 100;
          monthData[category] = categoryCirculation;
        } else if (lastEntry && month > lastEntry.month) {
          // Vesting bitmiş, son değeri kullan
          categoryCirculation = (lastEntry.percentage * categoryAllocation) / 100;
          monthData[category] = categoryCirculation;
        } else {
          // Henüz vesting başlamamış veya veri yok
          categoryCirculation = 0;
          monthData[category] = 0;
        }
        
        totalCirculation += categoryCirculation;
      });
      
      monthData.totalCirculation = totalCirculation;
      combinedData.push(monthData);
    }
    
    return combinedData;
  };

  // Allocation verilerini pie chart için hazırlayan fonksiyon
  const prepareAllocationData = () => {
    if (!project?.tokenomics?.allocation) {
      return [];
    }

    return Object.entries(project.tokenomics.allocation).map(([name, data]) => ({
      name,
      value: data.percentage
    }));
  };

  const handleShareProject = () => {
    setShareDialogOpen(true);
  };

  if (loading) {
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

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Project not found</Alert>
      </Container>
    );
  }

  const isOwner = user && project.userId === user.id;
  const allocationData = prepareAllocationData();
  const allCategoriesVestingData = getAllCategoriesVestingData();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {project.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {project.isPublic ? (
                <PublicIcon color="action" />
              ) : (
                <LockIcon color="action" />
              )}
              <Typography variant="body2" color="text.secondary">
                {project.isPublic ? 'Public Project' : 'Private Project'}
              </Typography>
            </Box>
          </Box>
          
          {/* Action buttons with role-based access control */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Edit button - only for owner and editor */}
            {(projectAccess === 'owner' || projectAccess === 'editor') && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => {
                  navigate(`/projects/${id}/edit`);
                }}
              >
                Edit
              </Button>
            )}
            
            {/* Delete button - only for owner */}
            {projectAccess === 'owner' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}

            {/* Share button - only for owner */}
            {projectAccess === 'owner' && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ShareIcon />}
                onClick={handleShareProject}
              >
                Share
              </Button>
            )}
          </Box>
        </Box>

        <Typography variant="body1" paragraph>
          {project.description}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom>
          Token Information
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Token Name
            </Typography>
            <Typography variant="body1">{project.tokenomics?.tokenName || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Token Symbol
            </Typography>
            <Typography variant="body1">{project.tokenomics?.tokenSymbol || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Supply
            </Typography>
            <Typography variant="body1">
              {project.tokenomics?.totalSupply ? project.tokenomics.totalSupply.toLocaleString() : 'N/A'}
            </Typography>
          </Grid>
        </Grid>

        <Typography variant="h5" gutterBottom>
          Token Allocation
        </Typography>
        
        {/* Allocation Pie Chart */}
        <Box sx={{ height: 400, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        
        <Grid container spacing={2}>
          {project.tokenomics?.allocation ? Object.entries(project.tokenomics.allocation).map(([key, value]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {value.percentage}%
                </Typography>
              </Paper>
            </Grid>
          )) : (
            <Grid item xs={12}>
              <Alert severity="info">No allocation data available</Alert>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom>
          Vesting Schedule (Month 0 - {allCategoriesVestingData[allCategoriesVestingData.length - 1]?.month}, Total Supply: {project.tokenomics?.totalSupply?.toLocaleString()})
        </Typography>
        
        {/* Combined Vesting Schedule Chart */}
        <Box sx={{ height: 400, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={allCategoriesVestingData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                label={{ value: 'Month', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis 
                label={{ value: 'Percentage of Total Supply (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'totalCirculation') return [`${parseFloat(value).toFixed(2)}% Total Circulation`, 'Total'];
                  const currentValue = parseFloat(value).toFixed(2);
                  return [`${currentValue}%`, name];
                }}
                labelFormatter={(label) => `Month ${label}`}
              />
              <Legend />
              {Object.keys(project.tokenomics?.allocation || {}).reverse().map((category, index) => (
                <Area
                  key={category}
                  type="monotone"
                  dataKey={category}
                  name={category}
                  stackId="1"
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
              <Area
                type="monotone"
                dataKey="totalCirculation"
                name="totalCirculation"
                stroke="#000000"
                fill="none"
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={selectedVestingCategory}
            onChange={(e, newValue) => setSelectedVestingCategory(newValue)}
          >
            {project?.tokenomics?.allocation ? Object.keys(project.tokenomics.allocation).map((category) => (
              <Tab
                key={category}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                value={category}
              />
            )) : null}
          </Tabs>
        </Box>

        {project?.vesting?.[selectedVestingCategory] ? (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Percentage</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calculateVestingSchedule(selectedVestingCategory).map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{row.monthDisplay}</TableCell>
                    <TableCell align="right">{row.percentage}%</TableCell>
                    <TableCell align="right">{row.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">No vesting schedule available for this category.</Alert>
        )}
      </Paper>
      {projectAccess === 'owner' && (
        <ShareProject
          project={project}
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          onUpdate={fetchProject}
        />
      )}
    </Container>
  );
};

export default ProjectDetails; 