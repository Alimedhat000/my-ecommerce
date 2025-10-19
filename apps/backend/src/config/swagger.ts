import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ecommerce API',
            version: '1.0.0',
            description:
                'RESTful Ecommerce API built with Express, TypeScript, and Prisma. Includes authentication, product management, orders, payments, and user management.',
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}/api`,
                description: 'Local development server',
            },
            {
                url: 'https://api.yourecommerce.com',
                description: 'Production server(Not live)',
            },
        ],
        tags: [
            { name: 'Auth', description: 'User authentication and authorization' },
            { name: 'Products', description: 'Product catalog and details' },
            { name: 'Orders', description: 'Customer orders and order management' },
            { name: 'Payments', description: 'Payment processing and transactions' },
        ],
    },
    apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
