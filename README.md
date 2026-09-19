# Smart Library

A full-stack library management system designed to manage users, documents, borrowing activities, reviews, transactions, and library statistics.

The project follows a layered backend architecture and provides REST APIs for the frontend application. It also integrates JWT authentication, Spring Security, VNPay payment processing, Cloudinary image management, and statistical APIs.

## Overview

Smart Library is a web-based library management system developed as a university project.

The system supports:

- User authentication and authorization
- Document and category management
- Library document browsing and searching
- Document borrowing management
- Reviews and ratings
- Online payment processing
- Transaction management
- Revenue and usage statistics
- Image management through Cloudinary
- Role-based access control

## Features

### Authentication & Authorization

- User registration and login
- JWT-based authentication
- Spring Security
- Role-based authorization
- Protected REST API endpoints
- Password encryption

### Document Management

- Create and update documents
- Search and filter documents
- Category management
- Document activation/deactivation
- Document information management
- Borrowing statistics

### Borrowing Management

- Borrow library documents
- Track borrowing records
- Manage borrowing status
- Retrieve borrowing history
- Validate borrowing-related operations

### Reviews

- Users can submit document reviews
- Retrieve reviews for documents
- Manage review-related information

### Payment & Transactions

- VNPay payment integration
- Payment transaction creation
- Transaction status management
- Revenue calculation
- Transaction history

### Statistics

The system provides APIs for:

- Dashboard KPIs
- Revenue statistics
- Category statistics
- Library usage statistics
- Document borrowing statistics

### Image Management

Cloudinary is integrated for storing and managing document-related images.

---

## Architecture

The backend follows a layered architecture:

```text
Frontend
   |
   v
REST API Controllers
   |
   v
Service Layer
   |
   v
Repository Layer
   |
   v
Hibernate / JPA
   |
   v
MySQL

Tech Stack
Frontend
React
React Router
Axios
React Bootstrap
Context API / Reducer
Firebase Firestore
Chart libraries
Backend
Java 17
Spring
Spring MVC
Spring Boot
Spring Security
Hibernate
JWT
Maven
Database
MySQL
Hibernate / JPA
External Services
VNPay
Cloudinary
Firebase Firestore
Development Tools
Git
GitHub
Maven
Postman
Swagger / OpenAPI
Project Structure
Smart-Library/
│
├── Library-web/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
│
├── SpringLibraryApp/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/dt3/
│   │       │       ├── controllers/
│   │       │       ├── repository/
│   │       │       ├── service/
│   │       │       ├── pojo/
│   │       │       └── ...
│   │       │
│   │       └── resources/
│   │
│   └── pom.xml
│
└── README.md
Main REST APIs

The backend exposes REST APIs for the main system modules.

Users
/api/users

Provides user management and authentication-related operations.

Documents
/api/documents

Provides document search, management, and retrieval operations.

Categories
/api/categories

Provides document category management.

Borrowing
/api/borrows

Provides borrowing and borrowing-history operations.

Reviews
/api/reviews

Provides document review operations.

Transactions
/api/transactions

Provides transaction and payment-related operations.

Statistics
/api/stats

Provides dashboard KPIs, revenue, category, and usage statistics.

Authentication & Security

The backend uses Spring Security and JWT for authentication.

Authentication flow:

User Login
    |
    v
Authentication API
    |
    v
JWT Token
    |
    v
Client
    |
    v
Authorization Header
    |
    v
JWT Filter
    |
    v
Spring Security
    |
    v
Protected API

Security-related components include:

JWT service
JWT authentication filter
Spring Security configuration
Role-based authorization
Password encryption
Protected REST endpoints
Payment Integration

VNPay is integrated to support online payment processing.

Basic flow:

Client
   |
   v
Create Payment Request
   |
   v
Backend
   |
   v
VNPay
   |
   v
Payment Result
   |
   v
Transaction Processing
   |
   v
Database

Transaction information is stored and can be used for transaction history and revenue statistics.

Statistics

The backend provides statistical APIs for the administration system.

Examples include:

GET /api/stats/kpis
GET /api/stats/category-stats
GET /api/stats/revenue
GET /api/stats/usage

These APIs are used to provide information such as:

Total users
Total documents
Borrowing statistics
Revenue
Category distribution
System usage
Database

The application uses MySQL with Hibernate/JPA.

Main entities include:

User
Document
Category
Borrow
Review
Transaction

Hibernate is used as the ORM layer between the Java application and MySQL database.

Getting Started
Prerequisites

Make sure the following tools are installed:

Java 17+
Maven 3.9+
Node.js
npm
MySQL
1. Clone the repository
git clone https://github.com/duonghuy0111/Smart-Library.git
cd Smart-Library
2. Configure the backend

Create the required configuration files under:

SpringLibraryApp/src/main/resources/

The project uses configuration files for:

Database connection
JWT
Cloudinary
VNPay

Example configuration files are provided in the repository.

Do not commit real credentials or API keys.

3. Start MySQL

Create the required MySQL database and configure the database connection according to the project's configuration.

4. Run the backend

From the backend directory:

cd SpringLibraryApp
mvn spring-boot:run

Or build the application:

mvn clean package
5. Run the frontend

From the frontend directory:

cd Library-web
npm install
npm start

The frontend will then be available through the development server.

API Documentation

The backend includes Swagger/OpenAPI support for API documentation and testing.

When the application is running, Swagger can be accessed through the configured Swagger/OpenAPI endpoint.
## My Role

**Role: Backend Developer**

My main responsibilities included:

- Designing and implementing backend REST APIs
- Developing business logic for users, documents, borrowing, reviews, and transactions
- Implementing JWT authentication and Spring Security
- Designing repository and service-layer interactions
- Working with Hibernate/JPA and MySQL
- Integrating VNPay for online payments
- Integrating Cloudinary for image management
- Developing statistical APIs
- Debugging and aligning repository/service APIs across the backend
- Using Git and GitHub for version control

## What I Learned

Through this project, I gained practical experience with:

- Layered backend architecture
- REST API development
- Spring Security
- JWT authentication
- Hibernate/JPA
- MySQL database integration
- Payment gateway integration
- Cloud-based image storage
- API design and debugging
- Git-based project management
- Working with an existing multi-layer codebase

## Project Status

The project is maintained as a university portfolio project.

The backend has been compiled and packaged successfully with Maven.
