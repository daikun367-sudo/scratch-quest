import type { NextConfig } from 'next';

// Vinext inspects multipart POSTs before API routing; allow file plus form overhead.
const nextConfig: NextConfig = {experimental:{serverActions:{bodySizeLimit:'11mb'}}};

export default nextConfig;
