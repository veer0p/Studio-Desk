# 🚀 Multi-VPS Docker CI/CD Setup (Zero Downtime + Per-Server Credentials)

## 📌 Objective

* Same code deployed to multiple VPS
* Each VPS uses **its own credentials (.env)**
* Fully automated via GitHub Actions
* Zero downtime deployment
* No manual intervention

---

## 🧠 Architecture

* CI/CD: GitHub Actions
* Image Registry: Docker Hub / GHCR
* Runtime: Multiple VPS
* Reverse Proxy: Nginx (per VPS)
* Deployment Strategy: Rolling container swap (per VPS)
* Config Strategy: `.env` file per VPS

---

## 🔑 Core Principle

> Docker image = same everywhere
> Environment (.env) = different per VPS

---

## 1️⃣ VPS SETUP (Run on EACH VPS)

### Install dependencies

```bash
sudo apt update
sudo apt install -y docker.io nginx git curl
```

### Enable Docker

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

---

## 2️⃣ CREATE ENV FILE (PER VPS)

```bash
mkdir -p /opt/app
nano /opt/app/.env
```

### Example (VPS 1)

```env
NODE_ENV=production
PORT=3000
DB_URL=postgres://prod-db-url
API_KEY=prod-secret
```

### Example (VPS 2)

```env
NODE_ENV=production
PORT=3000
DB_URL=postgres://staging-db-url
API_KEY=staging-secret
```

---

## 3️⃣ NGINX SETUP (PER VPS)

```bash
sudo nano /etc/nginx/sites-available/app
```

```nginx
upstream app_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://app_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Enable

```bash
sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 4️⃣ DOCKERFILE (IN REPO)

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 5️⃣ GITHUB SECRETS

Add in GitHub:

```
DOCKER_USER=your_dockerhub_username
DOCKER_PASS=your_dockerhub_password

SSH_KEY=your_private_ssh_key

VPS1_HOST=ip1
VPS2_HOST=ip2
VPS_USER=root
```

---

## 6️⃣ GITHUB ACTIONS (MULTI-VPS DEPLOY)

Create:

```
.github/workflows/deploy.yml
```

```yaml
name: Multi VPS Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        host:
          - ${{ secrets.VPS1_HOST }}
          - ${{ secrets.VPS2_HOST }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Login Docker
        run: echo "${{ secrets.DOCKER_PASS }}" | docker login -u ${{ secrets.DOCKER_USER }} --password-stdin

      - name: Build Image
        run: docker build -t ${{ secrets.DOCKER_USER }}/app:latest .

      - name: Push Image
        run: docker push ${{ secrets.DOCKER_USER }}/app:latest

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ matrix.host }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            set -e

            IMAGE=${{ secrets.DOCKER_USER }}/app:latest

            echo "Pull latest image"
            docker pull $IMAGE

            echo "Run new container on port 3001"
            docker run -d \
              --env-file /opt/app/.env \
              -p 3001:3000 \
              --name new_app \
              $IMAGE

            echo "Wait for app"
            sleep 5

            echo "Health check"
            curl -f http://localhost:3001 || exit 1

            echo "Switch nginx"
            sed -i 's/3000/3001/g' /etc/nginx/sites-available/app
            systemctl reload nginx

            echo "Cleanup old container"
            docker stop app || true
            docker rm app || true

            echo "Rename container"
            docker rename new_app app
```

---

## 7️⃣ SSH SETUP (IMPORTANT)

On EACH VPS:

```bash
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
```

Paste your public SSH key.

---

## 8️⃣ DEPLOY

```bash
git push origin main
```

---

## 🔁 ROLLBACK

```bash
docker run -d \
  --env-file /opt/app/.env \
  -p 3001:3000 \
  youruser/app:previous-tag
```

Then switch nginx back.

---

## ⚠️ CRITICAL NOTES

* Never store credentials in Docker image
* `.env` must exist on each VPS
* Keep same env structure across servers
* Do not use `docker-compose down` (causes downtime)

---

## 🔥 OPTIONAL IMPROVEMENTS

* Use version tags instead of `latest`
* Add HTTPS (Certbot)
* Add Docker HEALTHCHECK
* Use rolling deploy instead of parallel
* Add centralized logging

---

## ✅ FINAL RESULT

* Push → auto deploy to ALL VPS
* Same image everywhere
* Different credentials per server
* Zero downtime deployment
* Fully automated pipeline
