# AI Sudo — Design Brief

## Purpose
Security operations center (SOC) dashboard for AI governance. Real-time command interception, risk classification (GREEN/YELLOW/RED), and human-in-the-loop approval workflow.

## Tone & Differentiation
Authoritative, high-contrast, minimalist security tech. Near-black background with elevated card surfaces. Risk badges are the hero visual signal — instantly readable, no ambiguity. Monospace typography reinforces ops/command-line heritage. Zero ornamentation.

## Color Palette (OKLCH)

| Role | Light | Dark | Usage |
|------|-------|------|-------|
| Background | `0.99 0 0` | `0.12 0 0` | Page surfaces, near-white/near-black |
| Foreground | `0.15 0 0` | `0.96 0 0` | Text on background, high contrast |
| Card | `1.0 0 0` | `0.15 0 0` | Elevated surfaces, panels |
| Primary (Accent) | `0.35 0 0` | `0.73 0.23 245` | Cyan/electric blue, interactive, alerts |
| Success (GREEN) | `0.58 0.19 135` | `0.58 0.19 135` | Safe commands, auto-executed |
| Warning (YELLOW) | `0.72 0.15 65` | `0.72 0.15 65` | Moderate risk, requires review |
| Critical (RED) | `0.63 0.23 25` | `0.63 0.23 25` | High risk, requires approval |
| Muted | `0.95 0 0` | `0.2 0 0` | Disabled states, secondary text |
| Border | `0.9 0 0` | `0.22 0 0` | Dividers, subtle separation |

## Typography
- **Display/Body**: Space Grotesk (monospace-inspired geometric sans, technical feel)
- **Monospace**: Geist Mono (command text, code blocks)
- **Scale**: h1 `32px`, h2 `24px`, h3 `18px`, body `14px`, caption `12px`
- **Weight Hierarchy**: Regular (400) body, medium (500) UI, semibold (600) headings

## Shape Language
- **Border radius**: `4px` minimal — sharp angles reinforce authority
- **Spacing**: `8px` base unit, dense layout (cards `16px` padding)
- **Shadows**: Subtle elevation `0 4px 12px rgba(0,0,0,0.3)` in dark mode

## Structural Zones

| Zone | Background | Border | Purpose |
|------|-----------|--------|----------|
| Sidebar | `card` (`0.15 0 0`) | `border` (`0.22 0 0`) | Navigation, health status icons |
| Header | `card` (`0.15 0 0`) | `border-b` (`0.22 0 0`) | Branding, global actions |
| Main Content | `background` (`0.12 0 0`) | none | Approval queue, dashboard |
| Card (Approval Panel) | `card` (`0.15 0 0`) | `border` (`0.22 0 0`) | Command detail, approve/reject actions |
| Footer | `muted/10%` (`0.2 0 0` opacity) | `border-t` (`0.22 0 0`) | System info, user menu |

## Component Patterns
- **Risk Badge**: GREEN/YELLOW/RED pill badge with icon, no background — text only, monospace label
- **Approval Button**: Primary cyan (`0.73 0.23 245`) for "Approve", destructive red for "Reject"
- **Status Indicator**: Dot + label ("Pending", "Approved", "Rejected") with corresponding risk color
- **Command Display**: Monospace code block, subtle background tint, bordered container

## Motion & Interaction
- **Default Transition**: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` for state changes
- **Approval Action**: No animation — immediate visual feedback via status badge change
- **Polling Updates**: Card slides in from top (command received), status fades to new state

## Constraints
- No gradients, no glow effects, no blur orbs
- No color opacity blending for depth — use lightness changes only
- Every interactive element must pass AA+ contrast on dark background
- Command text must always be readable (monospace, `14px` minimum)

## Signature Detail
Risk badge trio (GREEN, YELLOW, RED) positioned as hero metric in approval panel. Each badge shows count + last action timestamp. When a command is approved, badge animates smoothly to GREEN with timestamp update — this visual confirmation is the UX centerpiece.
