# Tokenomics Web

A web application for managing token economics and project management.

## Project Structure

The project consists of two main parts:

### Client (Frontend)
- React-based user interface
- Material-UI components
- Redux for state management
- Axios for API requests

### Server (Backend)
- Node.js and Express
- MongoDB database
- JWT authentication
- RESTful API

## Technology Stack

### Frontend
- React
- Material-UI
- Redux
- Axios
- React Router

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT

## Components

### Frontend Components
- ProjectList: Displays the list of projects
- ProjectCreate: Form for creating new projects
- ProjectDetail: Detailed view of a project
- ProjectEdit: Form for editing projects
- UserManagement: User management interface

### Backend Components
- Project Model: Database schema for projects
- User Model: Database schema for users
- Authentication: JWT-based authentication system
- API Routes: RESTful API endpoints

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
3. Start the development servers:
   ```bash
   # Terminal 1 - Frontend
   cd client && npm start
   
   # Terminal 2 - Backend
   cd server && npm run dev
   ```

## Features

- Project creation and management
- Token economics management
- User authentication and authorization
- Project sharing and collaboration
- Real-time updates

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 