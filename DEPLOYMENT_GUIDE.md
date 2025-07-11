# 🚀 MindbFF Deployment Guide

## 📋 Prerequisites

### **1. Environment Variables**
Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Optional: Google Drive API (if using file uploads)
GOOGLE_DRIVE_CLIENT_ID=your_google_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_client_secret
```

### **2. Database Setup**
Ensure your Supabase database has the required tables and RLS policies from `src/sql`.

## 🔄 Running Migrations

### **Method 1: Admin Interface (Recommended)**
1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3000/admin/encryption`
3. Click "Check Status" to verify encryption setup
4. If needed, click "Run Migration" to encrypt existing messages

### **Method 2: API Endpoints**
```bash
# Check migration status
curl -X GET http://localhost:3000/api/peer-support/encrypt-messages

# Run migration (if needed)
curl -X POST http://localhost:3000/api/peer-support/encrypt-messages
```

### **Method 3: Database Migration**
```bash
# Add is_read column to peer_support_chats table
curl -X POST http://localhost:3000/api/peer-support/migrate
```

## 🌐 Deployment Options

### **Option 1: Vercel (Recommended)**

#### **Step 1: Prepare for Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

#### **Step 2: Deploy**
```bash
# Deploy to Vercel
vercel --prod

# Or use the Vercel dashboard:
# 1. Connect your GitHub repository
# 2. Add environment variables
# 3. Deploy automatically
```

#### **Step 3: Environment Variables in Vercel**
Add these to your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### **Option 2: Netlify**

#### **Step 1: Build Configuration**
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### **Step 2: Deploy**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### **Option 3: Railway**

#### **Step 1: Railway Setup**
1. Connect your GitHub repository to Railway
2. Add environment variables
3. Deploy automatically

#### **Step 2: Environment Variables**
Add the same environment variables as Vercel.

### **Option 4: Self-Hosted (VPS)**

#### **Step 1: Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### **Step 2: Deploy Application**
```bash
# Clone repository
git clone your-repo-url
cd your-project

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "mindbff" -- start
pm2 save
pm2 startup
```

#### **Step 3: Nginx Configuration**
Create `/etc/nginx/sites-available/mindbff`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mindbff /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### **Step 4: SSL with Let's Encrypt**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## 🔧 Post-Deployment Steps

### **1. Run Migrations**
After deployment, visit your admin interface:
```
https://your-domain.com/admin/encryption
```

### **2. Test Encryption**
1. Create test users
2. Send messages between users
3. Verify messages are encrypted in database
4. Confirm decryption works for recipients

### **3. Monitor Performance**
- Check Vercel/Netlify analytics
- Monitor Supabase usage
- Set up error tracking (Sentry recommended)

## 🛡️ Security Checklist

### **✅ Environment Variables**
- [ ] All sensitive keys are in environment variables
- [ ] No hardcoded secrets in code
- [ ] Production keys are different from development

### **✅ Database Security**
- [ ] RLS policies are enabled
- [ ] Encryption is working
- [ ] Backup strategy is in place

### **✅ Application Security**
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented

## 📊 Monitoring & Maintenance

### **1. Health Checks**
Create a health check endpoint:
```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'healthy', timestamp: new Date().toISOString() });
}
```

### **2. Error Tracking**
Install Sentry for error monitoring:
```bash
npm install @sentry/nextjs
```

### **3. Performance Monitoring**
- Use Vercel Analytics
- Monitor Core Web Vitals
- Track API response times

## 🚨 Troubleshooting

### **Common Issues:**

#### **1. Migration Fails**
- Check database permissions
- Verify environment variables
- Check Supabase connection

#### **2. Encryption Not Working**
- Verify encryption utilities are imported
- Check conversation key generation
- Test with simple messages first

#### **3. Build Errors**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

## 📞 Support

For deployment issues:
1. Check the logs in your hosting platform
2. Verify environment variables
3. Test locally first
4. Check Supabase dashboard for database issues

## 🎯 Recommended Deployment Flow

1. **Development**: Test locally with `npm run dev`
2. **Staging**: Deploy to staging environment
3. **Production**: Deploy to production with proper environment variables
4. **Migration**: Run encryption migration via admin interface
5. **Testing**: Verify all features work in production
6. **Monitoring**: Set up monitoring and alerts

---

**🎉 Your MindBFF app is now ready for production deployment!** 