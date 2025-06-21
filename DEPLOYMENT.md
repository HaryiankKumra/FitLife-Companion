# 🚀 Deployment Guide - FitLife Companion

## Quick Deploy to Vercel

### 1. Prerequisites
- GitHub account
- Vercel account (free)
- Your environment variables ready

### 2. Environment Variables
Set these in your Vercel dashboard:

\`\`\`
DATABASE_URL=postgresql://neondb_owner:npg_pJDti4UoV0LO@ep-snowy-term-a9na0ox8-pooler.gwc.azure.neon.tech/neondb?sslmode=require
JWT_SECRET=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
OPENAI_API_KEY=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
\`\`\`

### 3. Deploy Steps

#### Option A: GitHub Integration (Recommended)
1. Push this code to a GitHub repository
2. Connect your GitHub account to Vercel
3. Import the repository in Vercel
4. Add environment variables in Vercel dashboard
5. Deploy automatically

#### Option B: Vercel CLI
\`\`\`bash
npm install -g vercel
vercel login
vercel --prod
\`\`\`

### 4. Post-Deployment Setup

After deployment, your database will be automatically set up. The app includes:

- ✅ Automatic database schema creation
- ✅ Demo user account (demo@fitlife.com / demo123)
- ✅ All API endpoints configured
- ✅ AI features enabled

### 5. Custom Domain (Optional)
1. Go to your Vercel project dashboard
2. Navigate to Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed

### 6. Monitoring & Analytics
- Vercel provides built-in analytics
- Monitor API usage in Vercel dashboard
- Check database performance in Neon dashboard

## 🔧 Troubleshooting

### Common Issues:
1. **Database Connection**: Ensure DATABASE_URL is correct
2. **AI Features**: Verify OPENAI_API_KEY is valid
3. **Authentication**: Check JWT_SECRET is set

### Support:
- Check Vercel deployment logs
- Monitor Neon database logs
- Review Next.js build output

---

Your FitLife Companion will be live at: `https://your-project-name.vercel.app`
