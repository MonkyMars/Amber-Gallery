/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  env: {
    POSTGRES_URL: process.env.POSTGRES_URL,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
}

module.exports = nextConfig
