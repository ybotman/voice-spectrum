# Voice Spectrum Analyzer

Audio spectrum analyzer with real-time frequency filtering and visualization.

**JIRA Project**: [VOICE](https://hdtsllc.atlassian.net/browse/VOICE)
**GitHub**: https://github.com/ybotman/voice-spectrum

## Project Vision

A web-based audio tool that allows you to:

1. **Record or Load Audio**
   - Record from local microphone
   - Load pre-recorded audio files from a public folder
   - Support for simple single-note sustained sounds

2. **Continuous Playback & Looping**
   - Loop audio continuously for sustained analysis
   - Real-time playback control

3. **Real-Time Spectrum Visualization**
   - **Y-axis**: Frequency (0 Hz - 20,000 Hz) - Low to High
   - **X-axis**: Time (continuous scrolling)
   - Visual representation of audio spectrum as it plays

4. **Frequency Band Filtering**
   - Interactive band-pass filter controls
   - Narrow listening range to specific frequency bands (e.g., 200 Hz range)
   - Filter output to focus on vocal spectrum, horn spectrum, or custom ranges
   - Filtered audio plays through local speakers
   - Adjustable frequency range: 0-20,000 Hz with customizable band width

## Technology Stack

### Core Technologies

- **Framework**: React 18 with TypeScript
- **Build Tool**: Create React App (CRA)
- **Audio Processing**: Web Audio API (native browser API)
- **Visualization**: Canvas API (native, optimized for real-time rendering)
- **State Management**: Zustand (lightweight, 1KB state management)
- **UI Framework**: TailwindCSS (utility-first CSS framework)

### Development Tools

- **TypeScript**: Strict mode enabled for maximum type safety
- **ESLint**: Code quality and consistency
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing

### Deployment

- **Development/Staging**: Vercel (automatic deployments from DEVL branch)
- **Production**: Cloudflare Pages (future migration for global CDN performance)

### Why These Choices?

- **Canvas API**: Best performance for real-time audio visualization compared to SVG-based solutions
- **Zustand**: Minimal overhead, simple API, perfect for real-time audio state
- **TailwindCSS**: Maximum flexibility for custom audio UI components
- **Web Audio API**: Native browser API, no external dependencies, excellent performance

## Getting Started

### Development

```bash
npm start
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### Linting

```bash
npm run lint
```

Runs ESLint to check code quality and TypeScript compliance.

### Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

### Testing

```bash
npm test
```

Launches the test runner in interactive watch mode.

### Quality Gates

Before merging to DEVL or main, all commits must pass:

1. **ESLint** - `npm run lint` (no errors)
2. **Build** - `npm run build` (successful compilation)
3. **Tests** - `npm test` (all tests passing)

## Project Structure

```
voice-spectrum/
├── public/           # Static assets and sample audio files
├── src/
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks (Web Audio API)
│   ├── utils/        # Utility functions
│   └── App.tsx       # Main application component
└── .ybotbot/         # JIRA integration tools
```

## Use Cases

- Isolate specific frequency ranges in complex audio
- Analyze vocal formants and harmonics
- Study instrument frequency characteristics
- Educational tool for understanding sound and frequencies
- Audio engineering and sound design

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
