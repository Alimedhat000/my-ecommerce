import { vi } from 'vitest';

export const v2 = {
    uploader: {
        upload: vi.fn().mockResolvedValue({
            secure_url: 'https://mocked.cloudinary.com/fake-image.jpg',
            public_id: 'mocked_public_id',
            width: 800,
            height: 600,
            format: 'jpg',
            bytes: 12345,
        }),
        destroy: vi.fn().mockResolvedValue({ result: 'ok' }),
    },
    config: vi.fn(),
    url: vi.fn().mockImplementation((publicId: string, options: any) => {
        return `https://mocked.cloudinary.com/${publicId}-${options.width}x${options.height}.${options.format || 'jpg'}`;
    }),
};
