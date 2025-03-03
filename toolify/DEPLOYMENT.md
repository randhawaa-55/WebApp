# Toolify Deployment Guide

This guide provides detailed instructions for deploying the Toolify application to a production environment. The application requires specific dependencies for document conversion, image processing, and OCR functionality.

## Prerequisites

Before deploying, ensure you have:
- A server with at least 2GB RAM and 1 CPU core (4GB RAM recommended)
- Ubuntu 20.04 LTS or later
- Node.js 16.x or later
- npm 8.x or later
- Git

## Deployment Options

### Option 1: DigitalOcean Droplet (Recommended)

#### Step 1: Create a Droplet
1. Sign up for a DigitalOcean account
2. Create a new Droplet with Ubuntu 20.04 LTS
3. Choose a plan with at least 2GB RAM
4. Add your SSH key for secure access

#### Step 2: Initial Server Setup
```bash
# Connect to your server
ssh root@your_server_ip

# Update system packages
apt update && apt upgrade -y

# Create a new user with sudo privileges
adduser toolify
usermod -aG sudo toolify

# Set up firewall
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable

# Switch to the new user
su - toolify
```

#### Step 3: Install Required Dependencies
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install document conversion dependencies
sudo apt install -y libreoffice ghostscript

# Install image processing dependencies
sudo apt install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Install OCR dependencies
sudo apt install -y tesseract-ocr libtesseract-dev
sudo apt install -y tesseract-ocr-eng  # Add more language packs as needed

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Verify installations
node -v
npm -v
libreoffice --version
gs --version
tesseract --version
```

#### Step 4: Clone and Set Up the Application
```bash
# Create application directory
mkdir -p ~/toolify
cd ~/toolify

# Clone the repository (replace with your actual repository URL)
git clone https://github.com/yourusername/toolify.git .

# Install server dependencies
cd server
npm install

# Create uploads directory with proper permissions
mkdir -p uploads
chmod 755 uploads

# Install client dependencies and build
cd ../client
npm install
npm run build
```

#### Step 5: Configure PM2 for the Server
```bash
cd ~/toolify/server

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOL'
module.exports = {
  apps: [{
    name: "toolify-server",
    script: "server.js",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    },
    watch: false,
    max_memory_restart: '300M'
  }]
};
EOL

# Start the server with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u toolify --hp /home/toolify
```

#### Step 6: Configure Nginx as a Reverse Proxy
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/toolify
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Client files (React build)
    location / {
        root /home/toolify/toolify/client/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Increase timeout for file uploads
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        
        # Increase max body size for file uploads
        client_max_body_size 50M;
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/toolify /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Set Up SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

#### Step 8: Set Up Automatic Cleanup for Temporary Files
```bash
# Create cleanup script
cat > ~/toolify/server/cleanup.sh << 'EOL'
#!/bin/bash
find /home/toolify/toolify/server/uploads -type f -mmin +60 -delete
EOL

# Make it executable
chmod +x ~/toolify/server/cleanup.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 * * * * /home/toolify/toolify/server/cleanup.sh") | crontab -
```

### Option 2: Docker Deployment

If you prefer a containerized approach, follow these steps:

#### Step 1: Create Dockerfile for the Server
Create a file called `Dockerfile` in the server directory:
```dockerfile
FROM node:16

# Install dependencies
RUN apt-get update && apt-get install -y \
    libreoffice \
    ghostscript \
    tesseract-ocr \
    libtesseract-dev \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create uploads directory
RUN mkdir -p uploads && chmod 755 uploads

EXPOSE 5000

CMD ["node", "server.js"]
```

#### Step 2: Create Dockerfile for the Client
Create a file called `Dockerfile` in the client directory:
```dockerfile
FROM node:16 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf` in the client directory:
```nginx
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

#### Step 3: Create Docker Compose File
Create a `docker-compose.yml` file in the root directory:
```yaml
version: '3'

services:
  server:
    build: ./server
    ports:
      - "5000:5000"
    volumes:
      - ./server/uploads:/app/uploads
    restart: unless-stopped

  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/data:/var/www/html
    depends_on:
      - client
      - server
    restart: unless-stopped
```

#### Step 4: Deploy with Docker Compose
```bash
# Install Docker and Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f
```

## Troubleshooting Document Conversion Issues

### LibreOffice Issues
If you encounter issues with LibreOffice conversions:

1. Verify LibreOffice is installed:
```bash
libreoffice --version
which soffice
```

2. Test manual conversion:
```bash
soffice --headless --convert-to pdf --outdir /tmp /path/to/document.docx
```

3. Check permissions:
```bash
sudo chown -R toolify:toolify /home/toolify/toolify/server/uploads
```

### PDF to Image Conversion Issues
If PDF to image conversion fails:

1. Verify Ghostscript is installed:
```bash
gs --version
```

2. Test manual conversion:
```bash
gs -sDEVICE=png16m -dTextAlphaBits=4 -r300 -dGraphicsAlphaBits=4 -dFirstPage=1 -dLastPage=1 -o /tmp/output.png /path/to/input.pdf
```

3. Check for missing dependencies:
```bash
sudo apt install -y libpng-dev
```

### OCR Issues
If OCR functionality is not working:

1. Verify Tesseract is installed:
```bash
tesseract --version
```

2. Check available languages:
```bash
tesseract --list-langs
```

3. Install additional languages if needed:
```bash
sudo apt install -y tesseract-ocr-fra tesseract-ocr-deu
```

## Monitoring and Maintenance

### Monitor Server Performance
```bash
# Install monitoring tools
sudo apt install -y htop

# Monitor system resources
htop
```

### Check Application Logs
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Strategy
1. Set up regular backups of your application code:
```bash
# Create a backup script
cat > ~/backup.sh << 'EOL'
#!/bin/bash
BACKUP_DIR="/home/toolify/backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
tar -czf $BACKUP_DIR/toolify_$TIMESTAMP.tar.gz -C /home/toolify toolify
EOL

# Make it executable
chmod +x ~/backup.sh

# Add to crontab (weekly backup)
(crontab -l 2>/dev/null; echo "0 0 * * 0 /home/toolify/backup.sh") | crontab -
```

## Scaling Considerations

As your application grows, consider:

1. **Vertical Scaling**: Upgrade your server to have more RAM and CPU
2. **Horizontal Scaling**: Set up multiple application servers behind a load balancer
3. **External Storage**: Move file storage to S3 or similar cloud storage
4. **CDN**: Use a CDN for static assets
5. **Database**: Add a database for storing user data and file metadata

## Security Best Practices

1. **Keep Software Updated**:
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Configure Firewall**:
```bash
sudo ufw status
```

3. **Set Up Fail2Ban** to prevent brute force attacks:
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

4. **Regular Security Audits**:
```bash
# Install security scanning tools
sudo apt install -y lynis
sudo lynis audit system
```

5. **Secure File Permissions**:
```bash
find ~/toolify -type f -exec chmod 644 {} \;
find ~/toolify -type d -exec chmod 755 {} \;
```

## Conclusion

This deployment guide covers the essential steps to deploy your Toolify application to a production environment. For additional support or questions, please refer to the project documentation or contact the development team. 