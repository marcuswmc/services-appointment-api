# Sattis Backend API

A comprehensive backend API for a professional appointment booking system built with Node.js, TypeScript, and MongoDB.

## 🚀 Features

- **User Management**: Registration, authentication, and role-based access control
- **Professional Management**: Manage service providers with their associated services
- **Service Management**: Create and manage services with categories and pricing
- **Appointment Booking**: Complete appointment scheduling system with status tracking
- **Availability Management**: Handle professional availability and scheduling
- **Email Notifications**: Automated email services for appointments
- **File Upload**: Cloudinary integration for image uploads
- **Security**: JWT authentication, password hashing, and input validation

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **File Upload**: Multer + Cloudinary
- **Email Service**: Nodemailer + Resend
- **Validation**: Express Validator
- **Security**: Helmet, CORS
- **Development**: Nodemon, TypeScript Compiler

## 📁 Project Structure

```
src/
├── @types/           # TypeScript type definitions
├── controllers/      # Request handlers
├── middlewares/      # Custom middleware (auth, file upload)
├── models/          # MongoDB schemas and interfaces
├── routers/         # Express routes
├── services/        # Business logic layer
└── main.ts          # Application entry point
```

## 🗄️ Database Models

### User
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password
- `role`: User role (USER/ADMIN)

### Professional
- `name`: Professional's name
- `services`: Array of service IDs
- `image`: Profile image URL

### Service
- `name`: Service name
- `description`: Service description
- `price`: Service price
- `duration`: Service duration in minutes
- `category`: Reference to category

### Category
- `name`: Category name (unique)

### Appointment
- `customerName`: Customer's name
- `customerEmail`: Customer's email
- `customerPhone`: Customer's phone
- `serviceId`: Reference to service
- `professionalId`: Reference to professional
- `date`: Appointment date
- `time`: Appointment time
- `status`: Appointment status (CONFIRMED/CANCELED/FINISHED)
- `isMissed`: Missed appointment flag
- `cancelToken`: Unique token for cancellation

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sattis-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   
   # Email Configuration
   EMAIL_HOST=your_email_host
   EMAIL_PORT=587
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Build and Run**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Professionals
- `GET /api/professionals` - Get all professionals
- `POST /api/professionals` - Create new professional
- `PUT /api/professionals/:id` - Update professional
- `DELETE /api/professionals/:id` - Delete professional

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointment/:id` - Get appointment by ID
- `POST /api/appointment/create` - Create new appointment
- `PATCH /api/appointment/:id` - Update appointment status
- `GET /api/appointment/cancel/:token` - Cancel appointment by token
- `POST /api/appointment/cancel/confirm/:token` - Confirm cancellation
- `GET /api/appointments/missed/:email` - Get missed appointments by email
- `PATCH /api/appointment/toggle-missed/:id` - Toggle missed flag
- `PATCH /api/appointments/reset-missed-count/:customerEmail` - Reset missed count

### Availability
- `GET /api/availability` - Get availability
- `POST /api/availability` - Create availability

## 🔐 Authentication

The API uses JWT tokens for authentication. Protected routes require a valid token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Role-based Access Control
- **USER**: Basic access to appointment booking
- **ADMIN**: Full access to all endpoints

## 📧 Email Features

The system includes automated email notifications for:
- Appointment confirmations
- Appointment reminders
- Cancellation confirmations

## 🖼️ File Upload

Professional profile images are handled through Cloudinary integration using Multer middleware.

## 🚀 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prestart` - Build before starting production

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- CORS configuration
- Helmet security headers
- Role-based access control

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `NODE_ENV` | Environment mode | No |
| `EMAIL_HOST` | SMTP host | Yes |
| `EMAIL_PORT` | SMTP port | Yes |
| `EMAIL_USER` | SMTP username | Yes |
| `EMAIL_PASS` | SMTP password | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is under the MIT license. See the `LICENSE` file for more details.
---

Developed with ❤️ for Sattis Studio 
