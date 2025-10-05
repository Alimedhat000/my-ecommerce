import type { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['cdn.shopify.com', 'res.cloudinary.com', 'gonative.eg'],
  },
};

export default nextConfig;
