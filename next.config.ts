import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'reelboost.online',
        port: '',
        pathname: '/**',
      },
    
      {
        protocol: "https",
        hostname: 'maps.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: 'reelboost.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "media3.giphy.com",
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "media0.giphy.com",
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "media1.giphy.com",
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "media2.giphy.com",
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "media4.giphy.com",
        port: '',
        pathname: '/**',
      },
      {
        protocol:"https",
        hostname:"d1yb64k1jgx7ak.cloudfront.net",
        port:'',
        pathname:'/**'
      },
      {
        protocol:"http",
        hostname:"3.225.161.94",
        port:'3000',
        pathname:'/**'
      },
 {
        protocol: "http",
        hostname: "3.225.161.94",
        port: "3001", // ✅ Correct port
        pathname: "/**",
      },
	  {
        protocol: "https",
        hostname: "yourdomain.com", // replace with real domain from error
        pathname: "/**",
      },
      
    ]
  }
};

export default nextConfig;