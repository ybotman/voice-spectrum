# Vercel Auto-Deployment Setup

## Connect GitHub Repository to Vercel

1. **Go to Vercel Dashboard**
   - Navigate to https://vercel.com/dashboard
   - Click on your voice-spectrum project

2. **Connect Git Repository**
   - Go to Settings → Git
   - Click "Connect Git Repository"
   - Select GitHub
   - Authorize Vercel to access your GitHub account
   - Select the `ybotman/voice-spectrum` repository
   - Choose the branch to auto-deploy (recommend: `main`)

3. **Configure Build Settings**
   - Framework Preset: Create React App (should auto-detect)
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

4. **Save and Deploy**
   - Vercel will immediately trigger a deployment
   - Future pushes to `main` branch will auto-deploy

## Branch Strategy for Auto-Deploy

**Recommended Setup:**
- `main` branch → Auto-deploys to Production (vercel.com domain)
- `DEVL` branch → Can set up Preview deployment (optional)

**To set up preview deployments for DEVL:**
- Go to Settings → Git
- Enable "Preview Deployments" for all branches
- Each push to DEVL will create a preview URL

## Manual Trigger Without Code Changes

If you just want to rebuild without changing code:

```bash
# Trigger rebuild by pushing empty commit
git commit --allow-empty -m "Trigger Vercel rebuild"
git push origin main
```

## Check Deployment Status

After pushing:
1. Go to Vercel dashboard
2. Click "Deployments" tab
3. Watch the build progress in real-time
4. Click on deployment to see build logs if errors occur

## Your Current Deployment

Since you've already deployed manually, you can:
1. Connect the GitHub repo now (Settings → Git)
2. Future pushes will auto-deploy
3. No need to manually redeploy again
