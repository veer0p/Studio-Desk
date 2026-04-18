FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Placeholder env vars to satisfy build-time validation in lib/env.
# Real values are supplied at runtime via --env-file on the VPS.
# NOTE: NEXT_PUBLIC_* values are baked into client bundles at build time;
# for production deploys, re-run the build with real NEXT_PUBLIC_* values
# passed as --build-arg or via CI secrets.
ENV NEXT_PUBLIC_SUPABASE_URL=http://placeholder.local
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
ENV SUPABASE_SERVICE_ROLE_KEY=placeholder
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=placeholder
ENV RAZORPAY_KEY_SECRET=placeholder
ENV RAZORPAY_WEBHOOK_SECRET=placeholder
ENV WHATSAPP_API_KEY=placeholder
ENV IMMICH_BASE_URL=http://placeholder.local
ENV IMMICH_API_KEY=placeholder
ENV ENCRYPTION_KEY=placeholderplaceholderplaceholder32

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3001
CMD ["npx", "next", "start", "-p", "3001"]
