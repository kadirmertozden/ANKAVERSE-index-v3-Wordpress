# Build and serve the prerendered site.
#
# The nginx configuration lives here rather than in Coolify's "custom nginx
# configuration" field. That field is stored outside the repository, so it kept
# drifting from deploy/nginx.conf: an edit to the file changed nothing until
# someone remembered to paste it into the panel, and every deploy restored
# whatever the panel happened to hold. Shipping the config with the code makes
# the served configuration a property of the commit.
#
# Coolify setting: Build Pack = Dockerfile. The custom nginx field should then
# be left empty.

FROM node:22-alpine AS build

WORKDIR /app

# Dependencies first, so a source-only change does not reinstall them.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Runs the prerender, sitemap, llms.txt and the SEO checks. verify-seo exits
# non-zero on a broken canonical, a one-way hreflang or untranslated copy under
# a foreign lang tag, which fails the image build rather than publishing it.
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
