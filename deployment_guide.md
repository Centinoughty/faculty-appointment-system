# Deployment Guide: Faculty Appointment System (Build & Push Workflow)
**Target OS**: Fedora Linux (Server) & Windows (Build Machine)
**Subdomain**: `famsnitc.duckdns.org`
**Docker Hub Namespace**: `famsnitc`

This guide explains how to build heavy containers on your fast laptop and deploy them to your slow Fedora PC.

---

## Step 0: DuckDNS Registration (Before you start)

Before setting up your laptop or PC, you need to claim your free domain:

1.  Go to [DuckDNS.org](https://www.duckdns.org) and sign in (using Google, GitHub, etc.).
2.  In the **"Subdomain"** box, type `famsnitc` and click **"add domain"**.
3.  If successful, your URL is now officially `famsnitc.duckdns.org`.
4.  Copy your **"token"** (a long string of characters) from the top of the DuckDNS homepage. You will need this for the automation script in Part B.

---

## Part A: Preparation on Windows Laptop (Fast Build Machine)

Since building the frontend apps is CPU/RAM intensive, we do it here first.

### Step A.1: Docker Login
Open PowerShell and log into your Docker Hub account:
```powershell
docker login
```

### Step A.2: Build and Push Images
We pass the public URL and a version tag during the build.
```powershell
# 1. Set the public API URL
$env:NEXT_PUBLIC_API_URL="https://famsnitc.duckdns.org/api"

# 2. Set the version tag (e.g., v1.0.0)
$env:APP_VERSION="v1.0.0"

# 3. Build all images
docker compose -f docker-compose.prod.yml build

# 4. Push updated images to Docker Hub
docker compose -f docker-compose.prod.yml push
```

---

## Part B: Setup on Fedora PC (Target Server)

### Step B.1: System Preparation (Optimized)
Even though we aren't building, we still need swap space for smooth operation of multiple containers.

```bash
# Create a 4GB Swap File
sudo dd if=/dev/zero of=/swapfile bs=1M count=4096
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap defaults 0 0' | sudo tee -a /etc/fstab

# Install Docker & Nginx
sudo dnf update -y
sudo dnf install -y dnf-plugins-core nginx certbot python3-certbot-nginx
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl enable --now docker nginx
sudo usermod -aG docker $USER
# Log out and log back in
```

### Step B.2: DuckDNS IP Automation
Keep `famsnitc.duckdns.org` updated with your home IP.

1. Create script: `nano ~/duckdns.sh`
```bash
#!/bin/bash
TOKEN="YOUR_DUCKDNS_TOKEN"
DOMAIN="famsnitc"
curl -s "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN&ip="
```
2. Make executable & automate:
```bash
chmod +x ~/duckdns.sh
(crontab -l 2>/dev/null; echo "*/5 * * * * ~/duckdns.sh >/dev/null 2>&1") | crontab -
```

---

## Part C: Running the App on Fedora

### Step C.1: Pull and Launch
Transfer ONLY the `docker-compose.prod.yml` and your `.env` files to the Fedora PC.

1.  Create or update your `.env` file:
    ```bash
    # Use >> to append so you don't lose existing keys
    echo "APP_VERSION=v1.0.0" >> .env
    ```
2.  Login and Pull:
    ```bash
    docker login
    docker compose -f docker-compose.prod.yml pull
    ```
3.  Start:
    ```bash
    docker compose -f docker-compose.prod.yml up -d
    ```

### Step C.2: Nginx Reverse Proxy
Configure Nginx to route traffic to your containers.
`sudo nano /etc/nginx/conf.d/fams.conf`
```nginx
server {
    listen 80;
    server_name famsnitc.duckdns.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /admin/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
    }
}
```
Reload Nginx and enable HTTPS:
```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d famsnitc.duckdns.org
```

---

## Summary of Environment Variables
On both machines, ensure your `.env` values are consistent:
- `APP_VERSION=v1.0.0` (Must match the tag you pushed from your laptop)
- `NEXT_PUBLIC_API_URL=https://famsnitc.duckdns.org/api`
- `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/fams`
