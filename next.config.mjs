/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['sharp'],
  // pnpm keeps sharp's native libvips in its own .pnpm folder, which file tracing
  // misses; without it sharp fails on Vercel with "libvips-cpp.so: cannot open".
  outputFileTracingIncludes: {
    '/api/og-image/[slug]': [
      './node_modules/sharp/**/*',
      './node_modules/.pnpm/sharp@*/**/*',
      './node_modules/.pnpm/@img+sharp-linux-x64@*/**/*',
      './node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/**/*',
      './node_modules/.pnpm/@img+colour@*/**/*',
    ],
  },
}

export default nextConfig
