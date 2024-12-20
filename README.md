# Hajj Social
A modern platform connecting pilgrims with certified Hajj agents, facilitating seamless communication and travel planning for religious pilgrimages.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [Development Guidelines](#development-guidelines)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [License](#license)

## Overview

Hajj Board is a comprehensive platform designed to modernize the Hajj and Umrah planning process. It connects pilgrims with verified agents, provides resource management, and facilitates communication through a social media-like interface.

## Features

- **User Authentication**
  - Multi-role support (Pilgrim, Agent, Admin)
  - Secure authentication via Supabase
  - Profile management

- **Social Features**
  - Post creation with media support
  - Live streaming capabilities
  - Mentions and hashtags
  - Real-time interactions

- **Connection System**
  - Pilgrim-Agent connections
  - Connection requests
  - Verified agent badges

- **Resource Management**
  - Document sharing
  - Travel itineraries
  - Educational content

## Tech Stack

- **Frontend**
  - Next.js 15.0.3
  - React 19
  - TypeScript
  - Tailwind CSS
  - Framer Motion

- **Backend**
  - Supabase
  - PostgreSQL
  - Real-time subscriptions

- **Media Handling**
  - Supabase Storage
  - WebRTC (Live streaming)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm/yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hajj-board.git
cd hajj-board
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

### Environment Setup

Create a `.env.local` file with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key        
```


## Architecture

The application follows a modern Next.js architecture with:

- App Router for routing
- Server Components for improved performance
- Client Components for interactive features
- Real-time capabilities via Supabase
- Responsive design with Tailwind CSS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style Guidelines

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add appropriate documentation
- Include unit tests for new features

## Development Guidelines

### Component Structure

- Place components in appropriate directories under `src/components`
- Use TypeScript interfaces for props
- Implement error boundaries where necessary
- Follow atomic design principles

### State Management

- Use React hooks for local state
- Implement context for shared state
- Utilize Supabase real-time subscriptions for live updates

### Testing

- Write unit tests for utilities
- Add integration tests for complex features
- Test components in isolation
- Ensure mobile responsiveness

## API Documentation

### Supabase Schema

Key tables:
- profiles
- posts
- connections
- reviews
- live_streams
- media_uploads

### Real-time Subscriptions

Available channels:
- post_updates
- connection_requests
- live_stream_events

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to Vercel:
```bash
vercel
```


2. Deploy to your preferred platform (Vercel recommended)

3. Set up environment variables in your deployment platform

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

---

## Support

For support, email support@hajjboard.com or join our Slack channel.

## Acknowledgments

- Supabase team for the excellent backend service
- Next.js team for the framework
- Kenneth Owusu for Developing
- Yussif for the idea
- All the contributors and supporters#
