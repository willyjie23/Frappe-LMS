# Frappe LMS Local Setup Checklist for macOS Apple Silicon

This comprehensive guide will help you set up Frappe LMS locally on macOS Apple Silicon (M1/M2/M3 chips) using both native bench installation and Docker fallback options.

## Prerequisites

- macOS with Apple Silicon (M1/M2/M3)
- Administrative access to install dependencies
- Internet connection for downloads

---

## Method 1: Native Setup with Bench (Recommended)

### Step 1: Install System Dependencies

#### 1.1 Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
**Expected Output:** Installation progress messages ending with "Installation successful!"

#### 1.2 Install Python 3.11 (Frappe recommended version)
```bash
brew install python@3.11
```
**Expected Output:** Python 3.11.x installed successfully
**File Location:** `/opt/homebrew/bin/python3.11`

#### 1.3 Install Node.js 18 LTS (Apple Silicon optimized)
```bash
brew install node@18
brew link node@18 --force
```
**Expected Output:** Node.js v18.x.x installed
**Verification:** `node --version` should show v18.x.x

#### 1.4 Install Yarn Package Manager
```bash
npm install -g yarn
```
**Expected Output:** Yarn version installed globally
**Verification:** `yarn --version`

#### 1.5 Install Redis
```bash
brew install redis
brew services start redis
```
**Expected Output:** Redis installed and started as service
**Verification:** `redis-cli ping` should return `PONG`
**Config Location:** `/opt/homebrew/etc/redis.conf`

#### 1.6 Install MariaDB (Apple Silicon native)
```bash
brew install mariadb
brew services start mariadb
```
**Expected Output:** MariaDB installed and started
**Setup Root Password:**
```bash
sudo mysql_secure_installation
```
Follow prompts:
- Set root password: `frappe123` (or your choice)
- Remove anonymous users: Y
- Disallow root login remotely: Y
- Remove test database: Y
- Reload privilege tables: Y

**Config Location:** `/opt/homebrew/etc/my.cnf`

#### 1.7 Install Additional Dependencies
```bash
brew install git curl wget
```

### Step 2: Install Bench

#### 2.1 Install Bench CLI
```bash
pip3 install frappe-bench
```
**Expected Output:** Successfully installed frappe-bench
**Verification:** `bench --version`

**Apple Silicon Note:** If you encounter build errors, install these additional dependencies:
```bash
brew install pkg-config cairo pango gdk-pixbuf libffi
export PKG_CONFIG_PATH="/opt/homebrew/lib/pkgconfig"
```

#### 2.2 Initialize Frappe Bench
```bash
cd ~/Projects  # or your preferred development directory
bench init --frappe-branch version-15 frappe-bench
cd frappe-bench
```
**Expected Output:** 
```
Frappe bench init successful
Site name not specified, creating new site
```
**Directory Created:** `~/Projects/frappe-bench/`
**Key Files:** 
- `~/Projects/frappe-bench/sites/`
- `~/Projects/frappe-bench/apps/frappe/`

**Common Apple Silicon Issues & Fixes:**
- **Issue:** `cairo` build errors
  **Fix:** `brew install cairo pkg-config` then retry
- **Issue:** Permission denied on `/opt/homebrew`
  **Fix:** `sudo chown -R $(whoami) /opt/homebrew/`

### Step 3: Create New Site

#### 3.1 Start Bench (in background)
```bash
cd ~/Projects/frappe-bench
bench start &
```
**Expected Output:** Multiple services starting (web, socketio, schedule, etc.)
**Process:** Runs in background, accessible at http://localhost:8000

#### 3.2 Create Learning Site (in new terminal)
```bash
cd ~/Projects/frappe-bench
bench new-site learning.test --admin-password admin --mariadb-root-password frappe123
```
**Expected Output:**
```
Installing frappe...
Created site: learning.test
```
**Database Created:** `_2a665c5d6b6f8b29` (or similar hash)
**Site Config:** `~/Projects/frappe-bench/sites/learning.test/site_config.json`

#### 3.3 Add Site to Hosts
```bash
bench --site learning.test add-to-hosts
```
**Expected Output:** `Added learning.test to hosts`
**File Modified:** `/etc/hosts` (adds `127.0.0.1 learning.test`)

### Step 4: Install LMS App

#### 4.1 Get LMS App from Your Fork
```bash
bench get-app lms https://github.com/willyjie23/Frappe-LMS.git
```
**Expected Output:** 
```
Getting lms
Cloning into 'lms'...
```
**Directory Created:** `~/Projects/frappe-bench/apps/lms/`

#### 4.2 Install LMS on Site
```bash
bench --site learning.test install-app lms
```
**Expected Output:**
```
Installing lms...
Updating DocTypes for lms : [==========] 100%
```
**Duration:** ~2-3 minutes

### Step 5: Access Your Local LMS

#### 5.1 Ensure Bench is Running
```bash
cd ~/Projects/frappe-bench
bench start
```
**Expected Output:** All services running without errors

#### 5.2 Open in Browser
Navigate to: **http://learning.test:8000/lms**

**Default Credentials:**
- Username: `Administrator`
- Password: `admin`

#### 5.3 Verify Installation
- LMS dashboard should load
- Check: Create a new course
- Check: Frontend assets loading correctly

### Apple Silicon Specific Considerations

#### Performance Optimizations
```bash
# Enable development mode for faster reloads
bench --site learning.test set-config developer_mode 1
bench --site learning.test clear-cache
```

#### Memory Settings for MariaDB
Edit `/opt/homebrew/etc/my.cnf`:
```ini
[mysqld]
innodb_buffer_pool_size = 512M
max_connections = 100
```
Then: `brew services restart mariadb`

### Troubleshooting Common Issues

#### Issue: "Site not found"
```bash
bench use learning.test
bench restart
```

#### Issue: Python build errors
```bash
export CFLAGS=-I/opt/homebrew/include
export LDFLAGS=-L/opt/homebrew/lib
pip3 install --upgrade pip setuptools wheel
```

#### Issue: Node.js version conflicts
```bash
brew uninstall node@18
brew install node@18
brew link --overwrite node@18
```

---

## Method 2: Docker Setup (Fallback)

### Step 1: Install Docker Desktop for Apple Silicon

#### 1.1 Download and Install
Download Docker Desktop for Apple Silicon from: https://docs.docker.com/desktop/mac/apple-silicon/

#### 1.2 Verify Installation
```bash
docker --version
docker-compose --version
```
**Expected Output:** Version numbers for both Docker and docker-compose

### Step 2: Setup Project with Docker

#### 2.1 Navigate to Docker Directory
```bash
cd /Users/willychang/Project/Frappe-LMS/docker
```

#### 2.2 Start Services
```bash
docker-compose up -d
```
**Expected Output:**
```
Creating network "docker_default" with the default driver
Creating docker_mariadb_1 ... done
Creating docker_redis_1   ... done
Creating docker_frappe_1  ... done
```

#### 2.3 Monitor Initial Setup (first time only)
```bash
docker-compose logs -f frappe
```
**Expected Output:** Bench initialization, site creation, and LMS installation
**Duration:** ~5-10 minutes for first setup

### Step 3: Access Docker LMS

#### 3.1 Open in Browser
Navigate to: **http://localhost:8000/lms**

**Default Credentials:**
- Username: `Administrator`  
- Password: `admin`

#### 3.2 Container Access (for development)
```bash
# Access the Frappe container
docker-compose exec frappe bash

# Inside container - access bench commands
su frappe
cd frappe-bench
bench --site lms.localhost console
```

### Step 4: Mount Local Fork for Development

#### 4.1 Modify docker-compose.yml for Development
Create `docker-compose.override.yml`:
```yaml
version: "3.7"
services:
  frappe:
    volumes:
      - /Users/willychang/Project/Frappe-LMS:/workspace
      - ./apps/lms:/home/frappe/frappe-bench/apps/lms
    environment:
      - DEVELOPER_MODE=1
```

#### 4.2 Restart with Override
```bash
docker-compose down
docker-compose up -d
```

### Docker Troubleshooting

#### Issue: Port 8000 already in use
```bash
docker-compose down
lsof -ti:8000 | xargs kill -9  # Kill process using port 8000
docker-compose up -d
```

#### Issue: Database connection errors
```bash
docker-compose down --volumes  # Reset all data
docker-compose up -d
```

#### Issue: Apple Silicon compatibility
The `frappe/bench:latest` image supports Apple Silicon natively. If you encounter issues:
```bash
docker pull --platform linux/arm64 frappe/bench:latest
```

---

## Development Workflow

### Frontend Development
```bash
cd ~/Projects/frappe-bench/apps/lms/frontend
yarn dev  # Start Vite dev server
```
**Access:** http://localhost:5173 (hot reload enabled)

### Backend Development
```bash
cd ~/Projects/frappe-bench
bench --site learning.test enable-scheduler
bench --site learning.test console
```

### Database Management
```bash
# Access MariaDB
mysql -u root -p

# Backup site
bench --site learning.test backup

# Restore site
bench --site learning.test restore [backup-file]
```

### Git Workflow with Your Fork
```bash
cd ~/Projects/frappe-bench/apps/lms
git remote add upstream https://github.com/frappe/lms.git
git fetch upstream
git checkout develop
git merge upstream/develop
```

---

## Quick Start Commands (TL;DR)

### Native Setup
```bash
# Install dependencies
brew install python@3.11 node@18 redis mariadb

# Install bench
pip3 install frappe-bench

# Setup bench and site
bench init --frappe-branch version-15 frappe-bench
cd frappe-bench
bench new-site learning.test --admin-password admin
bench --site learning.test add-to-hosts
bench get-app lms https://github.com/willyjie23/Frappe-LMS.git
bench --site learning.test install-app lms
bench start

# Visit: http://learning.test:8000/lms
```

### Docker Setup
```bash
cd /Users/willychang/Project/Frappe-LMS/docker
docker-compose up -d

# Visit: http://localhost:8000/lms
```

---

## Support & Resources

- **Official Documentation:** https://docs.frappe.io/learning
- **Frappe Framework Docs:** https://frappeframework.com/docs
- **Apple Silicon Specific Issues:** Check Frappe Discuss forums
- **Community:** https://t.me/frappelms

---

**Last Updated:** September 2025
**Tested On:** macOS Sonoma 14.6, Apple M2
