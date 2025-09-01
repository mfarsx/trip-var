const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');

// Swagger definition
const swaggerDefinition = {
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
        ? `http://localhost:${config.server.port}` 
        : 'https://api.tripvar.com',
      description: config.server.isDevelopment ? 'Development server' : 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from login endpoint'
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
            example: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013']
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'User creation timestamp'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'User last update timestamp'
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
            example: '507f1f77bcf86cd799439012'
          },
          title: {
            type: 'string',
            description: 'Destination title',
            example: 'Beautiful Beach Resort'
          },
          description: {
            type: 'string',
            description: 'Destination description',
            example: 'A stunning beach resort with crystal clear waters'
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
            enum: ['Beach', 'Mountain', 'City', 'Cultural', 'Adventure'],
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
            description: 'Destination average rating',
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
            description: 'Whether destination is active',
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
            description: 'Destination last update timestamp'
          }
        }
      },
      Booking: {
        type: 'object',
        required: ['userId', 'destinationId', 'startDate', 'endDate', 'guests'],
        properties: {
          _id: {
            type: 'string',
            description: 'Booking ID',
            example: '507f1f77bcf86cd799439014'
          },
          userId: {
            type: 'string',
            description: 'User ID who made the booking',
            example: '507f1f77bcf86cd799439011'
          },
          destinationId: {
            type: 'string',
            description: 'Destination ID',
            example: '507f1f77bcf86cd799439012'
          },
          startDate: {
            type: 'string',
            format: 'date',
            description: 'Booking start date',
            example: '2024-06-01'
          },
          endDate: {
            type: 'string',
            format: 'date',
            description: 'Booking end date',
            example: '2024-06-05'
          },
          guests: {
            type: 'integer',
            minimum: 1,
            description: 'Number of guests',
            example: 2
          },
          totalPrice: {
            type: 'number',
            format: 'float',
            description: 'Total booking price',
            example: 1199.96
          },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            description: 'Booking status',
            example: 'confirmed'
          },
          specialRequests: {
            type: 'string',
            description: 'Special requests for the booking',
            example: 'Late checkout requested'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Booking creation timestamp'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Booking last update timestamp'
          }
        }
      },
      Review: {
        type: 'object',
        required: ['userId', 'destinationId', 'title', 'content', 'rating'],
        properties: {
          _id: {
            type: 'string',
            description: 'Review ID',
            example: '507f1f77bcf86cd799439015'
          },
          userId: {
            type: 'string',
            description: 'User ID who wrote the review',
            example: '507f1f77bcf86cd799439011'
          },
          destinationId: {
            type: 'string',
            description: 'Destination ID',
            example: '507f1f77bcf86cd799439012'
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
            description: 'Whether the review is verified',
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
            description: 'Review last update timestamp'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['error', 'fail'],
            description: 'Error status',
            example: 'error'
          },
          message: {
            type: 'string',
            description: 'Error message',
            example: 'Something went wrong'
          },
          code: {
            type: 'string',
            description: 'Error code',
            example: 'INTERNAL_SERVER_ERROR'
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
          }
        }
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
            description: 'Response status',
            example: 'success'
          },
          data: {
            type: 'array',
            items: {
              type: 'object'
            },
            description: 'Array of items'
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'integer',
                description: 'Current page number',
                example: 1
              },
              limit: {
                type: 'integer',
                description: 'Items per page',
                example: 10
              },
              total: {
                type: 'integer',
                description: 'Total number of items',
                example: 100
              },
              pages: {
                type: 'integer',
                description: 'Total number of pages',
                example: 10
              },
              hasNext: {
                type: 'boolean',
                description: 'Whether there is a next page',
                example: true
              },
              hasPrev: {
                type: 'boolean',
                description: 'Whether there is a previous page',
                example: false
              }
            }
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
              message: 'Invalid token. Please log in again!',
              code: 'AUTHENTICATION_ERROR',
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
              message: 'Validation failed: Email is required',
              code: 'VALIDATION_ERROR',
              details: [
                {
                  field: 'email',
                  message: 'Email is required',
                  value: ''
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
              status: 'error',
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
};

// Options for the swagger docs
const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

// Initialize swagger-jsdoc
const specs = swaggerJSDoc(options);

// Swagger UI options
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6; }
  `,
  customSiteTitle: 'Tripvar API Documentation'
};

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions
};