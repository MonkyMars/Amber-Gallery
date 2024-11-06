/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    POSTGRES_URL: process.env.POSTGRES_URL,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
}

module.exports = nextConfig
