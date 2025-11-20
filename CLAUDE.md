# Voice Spectrum - Claude Code Configuration

**Project**: Voice Spectrum Analyzer
**JIRA**: [VOICE Project](https://hdtsllc.atlassian.net/browse/VOICE)
**GitHub**: https://github.com/ybotman/voice-spectrum

---

## What This Application Is

Voice Spectrum is an audio spectrum analyzer web application that provides real-time frequency visualization and filtering capabilities.

### Core Features

1. **Audio Input**
   - Record live audio from microphone
   - Load pre-recorded audio files from public folder
   - Focus on single-note sustained sounds for analysis

2. **Continuous Playback**
   - Loop audio continuously for sustained analysis
   - Real-time playback controls

3. **Spectrum Visualization**
   - Real-time frequency display (0-20,000 Hz)
   - Y-axis: Frequency (low to high)
   - X-axis: Time (continuous scroll)
   - Visual representation updates as audio plays

4. **Frequency Band Filtering**
   - Interactive band-pass filter controls
   - Narrow listening to specific frequency ranges (e.g., 200 Hz bands)
   - Isolate vocal spectrum, horn spectrum, or custom ranges
   - Filtered audio output to speakers
   - Adjustable 0-20,000 Hz range with customizable bandwidth

### Technology Stack

- **Frontend**: React 18 with TypeScript
- **Audio Processing**: Web Audio API
- **Visualization**: Canvas API / D3.js / React-vis (TBD)
- **State Management**: React Context / Zustand (TBD)

---

## Autonomous Development Workflow

### Philosophy: Maximum Autonomy

This project operates with Claude Code as a fully autonomous developer. The goal is minimal user interaction - Claude works independently until the user stops it when off track.

**Key Principle**: Claude should work for extended periods (hours if needed) without questions. Just build, test, commit, merge, and continue.

### JIRA-Driven Development

**ALL work is driven by JIRA**:
- Epics define major features
- Stories define user-facing functionality
- Tasks define technical work
- Bugs define defects to fix

**Workflow**:
1. Claude reads JIRA tickets for work assignments
2. Claude implements solutions autonomously
3. Claude tests and commits changes
4. Claude updates JIRA with progress
5. Claude continues to next ticket

**JIRA Tools**: Use `.ybotbot/jira-tools/` bash scripts for all JIRA operations (MCP is broken).

---

## Branch Strategy & Merge Policy

### Branches

- **DEVL** (default branch) - Development work, autonomous merges
- **main** - Stable code, autonomous merges from DEVL
- **TEST** - Testing environment - **REQUIRES USER APPROVAL**
- **PROD** - Production environment - **REQUIRES USER APPROVAL**

### Autonomous Merge Rules

#### ✅ AUTOMATIC (No User Approval Required)

1. **Feature branches → DEVL**
   - Claude creates feature branches from DEVL
   - Claude merges to DEVL automatically after:
     - ESLint passes
     - Build succeeds
     - Tests pass
   - No user approval needed

2. **DEVL → main**
   - Automatic merge after DEVL is stable
   - ESLint, build, and tests must pass
   - No user approval needed

#### ❌ REQUIRES USER APPROVAL

1. **main → TEST**
   - Always requires explicit user approval
   - User must initiate or approve

2. **TEST → PROD**
   - Always requires explicit user approval
   - User must initiate or approve

### Commit Requirements

Every commit to DEVL or main must:
1. Pass ESLint (no errors)
2. Pass build (`npm run build`)
3. Pass all tests (`npm test`)
4. Reference JIRA ticket (e.g., `VOICE-123: Description`)

---

## Testing & Quality Gates

### Before Every Merge to DEVL

```bash
# 1. ESLint check
npm run lint

# 2. Build verification
npm run build

# 3. Run tests
npm test
```

All three must succeed before merge. If any fail, Claude fixes issues and retries.

### Test Strategy

- Unit tests for utility functions
- Component tests for React components
- Integration tests for Web Audio API interactions
- E2E tests for critical user workflows (TBD)

---

## Autonomous Decision Making

### Claude SHOULD Do Without Asking

- Implement features from JIRA tickets
- Write tests for new code
- Fix ESLint errors
- Fix build errors
- Fix failing tests
- Commit changes with proper JIRA references
- Merge feature branches to DEVL
- Merge DEVL to main
- Update JIRA ticket status and comments
- Refactor code for quality
- Add documentation
- Optimize performance
- Handle dependencies (npm install)

### Claude MUST Ask User About

- Merging to TEST branch
- Merging to PROD branch
- Major architectural changes not specified in JIRA
- Adding external paid services
- Deleting significant amounts of code without JIRA ticket

### When Claude Gets Stuck

If Claude cannot resolve an issue after reasonable attempts:
1. Document the problem in JIRA ticket comments
2. Mark ticket as Blocked
3. Create a new JIRA ticket describing the blocker
4. Move to next available ticket
5. User will provide guidance when they check JIRA

---

## Working Hours & Extended Sessions

Claude is authorized to:
- Work for extended periods (hours) without user interaction
- Complete multiple JIRA tickets in sequence
- Run tests, builds, and deployments repeatedly
- Iterate on solutions until quality gates pass
- Work through entire epics autonomously

**No need to check in with user frequently** - just keep working until:
- Work is complete
- User stops the session
- Blocked on something requiring user decision

---

## JIRA Integration Patterns

### Starting Work

```bash
# Find available work
.ybotbot/jira-tools/jira-search.sh "project=VOICE AND status='To Do' ORDER BY priority DESC" 10

# Get ticket details
.ybotbot/jira-tools/jira-get.sh VOICE-123

# Transition to In Progress
.ybotbot/jira-tools/jira-transition.sh VOICE-123 "In Progress"
```

### During Work

```bash
# Add progress comments
.ybotbot/jira-tools/jira-comment.sh VOICE-123 "Implemented audio recording. Testing microphone input."

# Update ticket as needed
.ybotbot/jira-tools/jira-update.sh VOICE-123 '{"fields":{"description":"Updated description"}}'
```

### Completing Work

```bash
# Add completion comment
.ybotbot/jira-tools/jira-comment.sh VOICE-123 "Feature complete. All tests passing. Merged to DEVL."

# Transition to Done
.ybotbot/jira-tools/jira-transition.sh VOICE-123 "Done"
```

---

## Claude Code Permissions

### Maximum Autonomy Permissions

Claude has full permissions within this repository for:
- All git operations (add, commit, push, merge, branch, checkout)
- All npm operations (install, build, test, start)
- All file operations (read, write, edit, delete)
- All JIRA operations via bash scripts
- All GitHub operations (gh CLI)
- Running development servers
- Installing dependencies
- Modifying configuration files

### Restricted Operations

- No merges to TEST or PROD branches without user approval
- No force pushes to TEST or PROD
- No destructive operations outside this repository

---

## Configuration Files

### JIRA Configuration

`.ybotbot/user-config.ini`:
- Project key: VOICE
- JIRA URL: https://hdtsllc.atlassian.net
- Authentication via macOS keychain

### Claude Code Settings

`.claude/settings.local.json`:
- Permissions for autonomous operations
- Tool access configuration

---

## Git Commit Standards

### Commit Message Format

```
<type>: <JIRA-TICKET> <short description>

<detailed description>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding tests
- `docs`: Documentation
- `chore`: Maintenance

### Example

```
feat: VOICE-5 Implement microphone audio capture

- Added Web Audio API integration
- Created AudioRecorder hook
- Implemented start/stop recording controls
- Added error handling for missing permissions

All tests passing. ESLint clean.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Success Metrics

Claude is successful when:
1. **Velocity**: Multiple JIRA tickets completed per session
2. **Quality**: All commits pass ESLint, build, and tests
3. **Autonomy**: Minimal user intervention required
4. **Documentation**: JIRA tickets updated with clear progress
5. **Stability**: DEVL and main branches always buildable

---

## User Interaction Style

### What User Wants

- Minimal questions
- Maximum progress
- Clear JIRA updates
- Clean commits
- Working software

### What User Doesn't Want

- Constant "Should I do X?" questions
- Waiting for approval on routine decisions
- Over-communication
- Stopping work unnecessarily

**Remember**: The user will stop you if you're going wrong. Until then, keep building.
