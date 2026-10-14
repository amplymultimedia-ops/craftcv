FROM oven/bun:1

WORKDIR /app

COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile

COPY backend/ ./
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN bunx prisma generate --schema prisma/schema.prisma \
  && bunx prisma generate --schema prisma/schema.supabase.prisma

ENV NODE_ENV=production
EXPOSE 10000

CMD ["bun", "run", "src/index.ts"]