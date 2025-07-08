# EasyN8N

<div align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Next.js-14-black.svg" alt="Next.js">
</div>

<div align="center">
  <h3>🤖 Transform ideas into n8n workflows with AI</h3>
  <p>The open-source platform that generates professional n8n workflows from natural language descriptions in seconds.</p>
</div>

<div align="center">
  <a href="#quick-start"><strong>Quick Start</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a> ·
  <a href="#community"><strong>Community</strong></a>
</div>

<br />

## Why EasyN8N?

Building n8n workflows can be complex and time-consuming. EasyN8N bridges that gap by letting you describe your automation needs in plain English and instantly generating professional, ready-to-use workflows.

**Before EasyN8N:**
- Hours spent learning n8n node configurations
- Complex workflow design and debugging
- Technical barriers for non-developers

**With EasyN8N:**
- Describe your automation in natural language
- Get a complete n8n workflow in seconds
- Download and import directly into n8n

## ✨ Features

- 🤖 **AI-Powered Generation** - Advanced AI understands your requirements and creates optimized workflows
- ⚡ **Instant Export** - Download n8n-compatible JSON files ready for import
- 📚 **Template Library** - Curated collection of workflows for common use cases
- 🎯 **Smart Categorization** - Automatically detects and optimizes for your workflow type
- 🔐 **Secure Authentication** - Google and GitHub OAuth integration
- 📊 **Usage Analytics** - Track your workflow generation and usage patterns
- 🎨 **Beautiful UI** - Modern, responsive design built with Next.js and Tailwind CSS

## 🚀 Quick Start

Get EasyN8N running in under 2 minutes:

```bash
# Clone the repository
git clone https://github.com/yourusername/easyn8n.git
cd easyn8n

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your API keys (see setup guide below)

# Initialize database
npm run db:setup

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start generating workflows!

## 🛠️ Setup Guide

### 1. Environment Variables

Create `.env.local` with:

```bash
# Database (SQLite for development)
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (optional for development)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Provider
GEMINI_API_KEY="your-gemini-api-key"
```

### 2. Get API Keys

- **Gemini API**: Get your free API key from [Google AI Studio](https://makersuite.google.com/)
- **Google OAuth** (optional): Set up at [Google Cloud Console](https://console.cloud.google.com/)

### 3. Database Setup

```bash
# Generate Prisma client and create database
npm run db:setup

# Start development
npm run dev
```

## 📖 Documentation

- **[Setup Guide](docs/setup.md)** - Detailed installation instructions
- **[API Reference](docs/api.md)** - API endpoints and usage
- **[Contributing Guide](docs/contributing.md)** - How to contribute
- **[Deployment](docs/deployment.md)** - Production deployment guide

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Authentication**: NextAuth.js
- **AI**: Google Gemini API
- **UI Components**: shadcn/ui

## 🤝 Contributing

We love contributions! EasyN8N is open source and we welcome:

- 🐛 Bug reports and fixes
- ✨ New features and improvements
- 📚 Documentation updates
- 🎨 UI/UX enhancements

### Quick Contribution Steps

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

See our [Contributing Guide](docs/contributing.md) for detailed information.

## 🌟 Community

Join our growing community of automation enthusiasts:

- **Discord**: [Join our server](https://discord.gg/easyn8n) for real-time discussions
- **GitHub Discussions**: Share ideas and get help
- **Twitter**: [@EasyN8N](https://twitter.com/easyn8n) for updates
- **Blog**: [Latest tutorials and tips](https://easyn8n.com/blog)

## 🎯 Roadmap

### 🚀 Current Focus
- [ ] Advanced AI prompt engineering
- [ ] Workflow validation and testing
- [ ] Direct n8n integration
- [ ] Community template sharing

### 🔮 Future Plans
- [ ] Multi-language support
- [ ] Enterprise features
- [ ] API marketplace
- [ ] Workflow analytics

## 📊 Project Stats

- ⭐ **Stars**: Help us reach 1,000 stars!
- 🍴 **Forks**: Join our contributors
- 🐛 **Issues**: We're responsive to bug reports
- 💬 **Discussions**: Active community support

## 📝 License

EasyN8N is open source software licensed under the [MIT License](LICENSE).

## 💖 Sponsors

Support EasyN8N development:

- [GitHub Sponsors](https://github.com/sponsors/easyn8n)
- [Open Collective](https://opencollective.com/easyn8n)

---

<div align="center">
  <p>Built with ❤️ by the open source community</p>
  <p>
    <a href="https://easyn8n.com">Website</a> ·
    <a href="https://twitter.com/easyn8n">Twitter</a> ·
    <a href="https://discord.gg/easyn8n">Discord</a>
  </p>
</div>
