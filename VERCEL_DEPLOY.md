# Vercel Deploy (Git Push Ready)

1) Install the Vercel CLI (already added to devDependencies):

```
npm install
```

2) Link the repo to your Vercel project (one-time):

```
npx vercel link
```

3) Set up automatic Git deployments in Vercel:

- In the Vercel dashboard, connect the Git repository and select the main branch.
- Ensure the build settings use:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

4) Deploy from CLI when needed:

```
npm run vercel:deploy
```

Once linked, pushes to the connected branch will trigger deployments automatically.
