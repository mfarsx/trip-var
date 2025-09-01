const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tripvar API',
      version: '1.0.0',
      description: 'A comprehensive travel booking and destination management API',
      contact: {
        name: 'Tripvar Team',
        email: 'support@tripvar.com',
        url: 'https://tripvar.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: config.server.isDevelopment 
          ? `http://localhost:${config.server.port}/api/v1`
          : 'https://api.tripvar.com/api/v1',
        description: config.server.isDevelopment ? 'Development server' : 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com'
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'User date of birth',
              example: '1990-01-01'
            },
            nationality: {
              type: 'string',
              description: 'User nationality',
              example: 'United States'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
              example: 'user'
            },
            favorites: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of favorite destination IDs',
              example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
            },
            active: {
              type: 'boolean',
              description: 'Whether the user account is active',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Destination: {
          type: 'object',
          required: ['title', 'description', 'location', 'category', 'price'],
          properties: {
            _id: {
              type: 'string',
              description: 'Destination ID',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              description: 'Destination title',
              example: 'Beautiful Beach Resort'
            },
            description: {
              type: 'string',
              description: 'Destination description',
              example: 'A stunning beach resort with crystal clear waters and white sand beaches.'
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              description: 'Destination image URL',
              example: 'https://example.com/image.jpg'
            },
            location: {
              type: 'string',
              description: 'Destination location',
              example: 'Maldives'
            },
            category: {
              type: 'string',
              enum: ['Beach', 'Mountain', 'City', 'Cultural', 'Adventure', 'Nature', 'Historical'],
              description: 'Destination category',
              example: 'Beach'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Destination price per night',
              example: 299.99
            },
            rating: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 5,
              description: 'Average destination rating',
              example: 4.5
            },
            amenities: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Available amenities',
              example: ['WiFi', 'Pool', 'Spa', 'Restaurant']
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the destination is available for booking',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Destination creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Booking: {
          type: 'object',
          required: ['destinationId', 'startDate', 'endDate', 'guests'],
          properties: {
            _id: {
              type: 'string',
              description: 'Booking ID',
              example: '507f1f77bcf86cd799439011'
            },
            userId: {
              type: 'string',
              description: 'User ID who made the booking',
              example: '507f1f77bcf86cd799439011'
            },
            destinationId: {
              type: 'string',
              description: 'Destination ID',
              example: '507f1f77bcf86cd799439011'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Booking start date',
              example: '2024-01-15'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Booking end date',
              example: '2024-01-20'
            },
            guests: {
              type: 'integer',
              minimum: 1,
              maximum: 20,
              description: 'Number of guests',
              example: 2
            },
            totalPrice: {
              type: 'number',
              format: 'float',
              description: 'Total booking price',
              example: 1499.95
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'cancelled', 'completed'],
              description: 'Booking status',
              example: 'confirmed'
            },
            specialRequests: {
              type: 'string',
              description: 'Special requests or notes',
              example: 'Late check-in requested'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Booking creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Review: {
          type: 'object',
          required: ['destinationId', 'title', 'content', 'rating'],
          properties: {
            _id: {
              type: 'string',
              description: 'Review ID',
              example: '507f1f77bcf86cd799439011'
            },
            userId: {
              type: 'string',
              description: 'User ID who wrote the review',
              example: '507f1f77bcf86cd799439011'
            },
            destinationId: {
              type: 'string',
              description: 'Destination ID being reviewed',
              example: '507f1f77bcf86cd799439011'
            },
            title: {
              type: 'string',
              description: 'Review title',
              example: 'Amazing experience!'
            },
            content: {
              type: 'string',
              description: 'Review content',
              example: 'Had an incredible time at this destination. Highly recommended!'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Review rating',
              example: 5
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether the review is from a verified booking',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Review creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['fail', 'error'],
              description: 'Error status',
              example: 'fail'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed'
            },
            code: {
              type: 'string',
              description: 'Error code',
              example: 'VALIDATION_ERROR'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            },
            requestId: {
              type: 'string',
              description: 'Request ID for tracking',
              example: 'req_1234567890_abcdef'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success'],
              description: 'Response status',
              example: 'success'
            },
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            meta: {
              type: 'object',
              description: 'Additional metadata (pagination, etc.)'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'fail',
                message: 'You are not logged in! Please log in to get access.',
                code: 'UNAUTHORIZED',
                requestId: 'req_1234567890_abcdef',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Access forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'fail',
                message: 'You do not have permission to perform this action',
                code: 'FORBIDDEN',
                requestId: 'req_1234567890_abcdef',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'fail',
                message: 'Resource not found',
                code: 'RESOURCE_NOT_FOUND',
                requestId: 'req_1234567890_abcdef',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'fail',
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: [
                  {
                    field: 'email',
                    message: 'Please provide a valid email address',
                    value: 'invalid-email'
                  }
                ],
                requestId: 'req_1234567890_abcdef',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        TooManyRequestsError: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'fail',
                message: 'Too many requests from this IP, please try again later.',
                code: 'TOO_MANY_REQUESTS',
                requestId: 'req_1234567890_abcdef',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Something went very wrong!',
                code: 'INTERNAL_SERVER_ERROR',
                requestId: 'req_1234567890_abcdef',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #3b82f6; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 20px; border-radius: 8px; }
  `,
  customSiteTitle: 'Tripvar API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions
};