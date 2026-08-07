# Deploying SuppAI to a Hostinger VPS

Next.js 16 app, run as a Node process behind Nginx.

## 0. What this app needs

- **Node.js 20.9+** (22 LTS recommended, see `.nvmrc`)
- No database. All demo data lives in the browser's `localStorage`, so there
  is nothing to provision server side.
- **One env value**: the Razorpay Key ID (`NEXT_PUBLIC_RAZORPAY_KEY_ID`),
  set before the build (see step 3). It is a public identifier, not a secret.
- `sharp` is installed for `next/image` optimisation in production.

## 1. Prepare the VPS (Ubuntu)

SSH in as root from hPanel > VPS > SSH access.

```bash
# Node 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs git nginx
npm install -g pm2

node -v   # expect v22.x
```

Create a non-root user to run the app (recommended):

```bash
adduser --disabled-password --gecos "" suppai
usermod -aG sudo suppai
su - suppai
```

## 2. Get the code

```bash
cd ~
git clone https://github.com/nitin1129/SuppAI.git
cd SuppAI
```

## 3. Set the environment

`.env.local` is gitignored, so it is not in the clone. Create it on the server
before building (`NEXT_PUBLIC_` values are inlined at build time):

```bash
cp .env.example .env.local
nano .env.local      # set NEXT_PUBLIC_RAZORPAY_KEY_ID to your rzp_live_... key
```

Without it, the plan checkout falls back to demo mode (no real charge).

## 4. Install and build

```bash
npm ci          # clean install from package-lock.json
npm run build   # production build (reads .env.local)
```

`npm ci` needs the dev dependencies to build, so do **not** use `--omit=dev`
before the build. You can prune afterwards with `npm prune --omit=dev`.

## 5. Start with PM2

```bash
mkdir -p logs
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup    # run the command it prints, so the app survives reboots
```

The app now listens on `127.0.0.1:3000` (loopback only — Nginx will expose it).

Useful:

```bash
pm2 status
pm2 logs suppai
pm2 reload suppai      # zero-downtime restart
```

## 6. Nginx reverse proxy

Create `/etc/nginx/sites-available/suppai`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Next.js build assets are immutable and safe to cache hard.
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    client_max_body_size 20M;
}
```

Enable it and reload:

```bash
sudo ln -s /etc/nginx/sites-available/suppai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 7. Point the domain

In hPanel > Domains > DNS, add an **A record** for `@` (and `www`) pointing to
the VPS IP. Wait for propagation, then check `http://your-domain.com`.

## 8. HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot rewrites the Nginx config for TLS and sets up auto-renewal.

## 9. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Port 3000 stays closed: the app binds to loopback and is only reachable
through Nginx.

## Deploying updates

```bash
cd ~/SuppAI
git pull
npm ci
npm run build
pm2 reload suppai
```

## Troubleshooting

- **502 Bad Gateway** — the app isn't running. `pm2 status`, `pm2 logs suppai`.
- **Build runs out of memory** on a small VPS — add swap:
  ```bash
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```
- **Images not loading** — `sharp` must be installed (it is a dependency).
  Reinstall with `npm ci` on the server, not by copying `node_modules` from
  a different OS.
- **Port already in use** — change `PORT` in `ecosystem.config.js` and the
  `proxy_pass` in the Nginx config to match.
