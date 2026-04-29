import cloudinary from '../config/cloudinary';

async function testCloudinaryConnection() {
    try {
        // Test the connection by pinging the API
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connection successful:', result);

        // Optional: Test upload with a small test image
        // You can comment this out if you don't have a test image

        const uploadResult = await cloudinary.uploader.upload(
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            {
                resource_type: 'image',
                folder: 'test',
            }
        );
        console.log('✅ Test upload successful:', uploadResult.public_id);

        // Clean up test image
        await cloudinary.uploader.destroy(uploadResult.public_id);
        console.log('✅ Test cleanup successful');
    } catch (error: any) {
        console.error('❌ Cloudinary connection failed:', error.message);

        // Check for common issues
        if (error.message.includes('Invalid API key')) {
            console.error('Check your CLOUDINARY_API_KEY');
        }
        if (error.message.includes('Invalid API secret')) {
            console.error('Check your CLOUDINARY_API_SECRET');
        }
        if (error.message.includes('cloud_name')) {
            console.error('Check your CLOUDINARY_CLOUD_NAME');
            console.error(error);
        }
    }
}

// Run the test
testCloudinaryConnection();
