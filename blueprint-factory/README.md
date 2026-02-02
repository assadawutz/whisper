# Blueprint Factory 🏭

This directory contains the automated tools and specialized builds for the Whisper Image-to-UI engine.

## 📁 Structure

- **`/scripts`**: Contains Node.js generator scripts (`.mjs`) used to bootstrap core modules and toolkits.
- **`/output`**: Contains the generated project folders (`image-to-ui-monorepo`, etc.) and their corresponding portable `.zip` bundles.
- **`/builds`**: Legacy build artifacts and snapshots.

## 🛠️ Usage

To regenerate the monorepo with fresh assets, run:

```bash
node scripts/create_complete_repo.mjs
```

The verified zip will be available in `/output`.
