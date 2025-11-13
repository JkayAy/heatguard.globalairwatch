# Heat-Risk Early-Warning Application Design Guidelines

## Design Approach
**System-Based Approach** using Material Design principles combined with weather app best practices (Apple Weather, Weather.com). This utility-focused application prioritizes information clarity, rapid scanning, and actionable health guidance for safety-critical decisions.

## Typography System

**Primary Font**: Inter or Roboto via Google Fonts CDN
**Hierarchy**:
- Location/City Name: text-3xl md:text-4xl, font-bold
- Current Temperature: text-6xl md:text-7xl, font-bold, tabular numbers
- Risk Category Label: text-xl md:text-2xl, font-semibold, uppercase tracking-wide
- Section Headers: text-lg md:text-xl, font-semibold
- Metric Labels (Humidity, Heat Index): text-sm, font-medium, uppercase tracking-wide
- Metric Values: text-2xl md:text-3xl, font-semibold
- Body Text/Health Guidance: text-base, font-normal, leading-relaxed
- Hourly Forecast Times: text-sm, font-medium
- Hourly Forecast Temps: text-lg, font-semibold

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, and 16 (e.g., p-4, gap-6, mt-8)
**Container**: max-w-4xl mx-auto px-4 md:px-6
**Vertical Rhythm**: Consistent py-6 md:py-8 between major sections
**Card Spacing**: p-6 md:p-8 for content cards

## Component Library

### Search & Location Controls
**Search Bar**:
- Full-width input with rounded-xl borders
- Height h-14, text-lg with pl-12 (icon space) pr-4
- Search icon (magnifying glass) positioned absolute left-4
- Autocomplete dropdown: rounded-lg shadow-xl with py-2, each result px-4 py-3
- Clear "X" button when text present (absolute right-4)

**Use My Location Button**:
- Prominent placement below search or as alternative action
- Icon + text layout (location pin icon from Heroicons)
- h-14 rounded-xl with px-6
- Full-width on mobile, auto-width on desktop

### Current Conditions Card (Hero Section)
**NO large hero image** - immediate data display is critical.

**Layout**: Large card with rounded-2xl, shadow-lg, p-8
- Top: City name with small country/region label beneath (text-sm opacity-75)
- Center: Dominant temperature display (tabular-nums)
- Below temp: Risk category badge (inline-block px-6 py-2 rounded-full font-semibold)
- Grid of 4 metrics (2x2 on mobile, 4x1 on desktop): Humidity, Apparent Temp, Heat Index, timestamp
- Each metric: icon + label (small, uppercase) + value (large, bold)

### Risk Level Indicator
**Design**: Full-width banner or prominent badge within current conditions card
- Rounded-full or rounded-lg based on placement
- Bold typography with icon (warning triangle, flame, etc. from Heroicons)
- High contrast treatment (achieved through visual weight, not color)
- Risk levels: Normal, Caution, Extreme Caution, Danger, Extreme Danger

### Health Guidance Section
**Card Design**: rounded-xl, shadow-md, p-6 md:p-8
- Icon header (medical cross, alert icon)
- Bulleted list with generous line-height (leading-relaxed)
- Each guidance item: pl-6 with custom bullet or icon
- Expandable/collapsible on mobile to save space (chevron icon)

### Hourly Forecast Timeline
**Layout**: Horizontal scrollable container (snap-x overflow-x-auto)
- Each hour: flex-shrink-0 w-24 md:w-28
- Vertical card structure: time → icon → temp → mini risk badge
- Cards with rounded-lg, p-4, gap-2
- Weather icons from icon library (sun, cloud-sun, etc.)
- Smooth scroll-snap-align-start behavior
- Gradient fade at edges indicating scrollability

### Loading States
**Skeleton Screens**: Animate-pulse placeholders matching final layout
- Search: h-14 rounded-xl shimmer
- Current card: rounded-2xl with internal shimmer blocks
- Hourly: 8 placeholder cards in row

**Spinner**: Center-screen or inline, size-8 md:size-10, stroke-2

### Error States
**Design**: Centered card with rounded-xl, p-8
- Large warning icon (size-16) at top
- Error message: text-lg font-semibold
- Explanation text: text-base, mt-2
- Retry button: h-12 px-6 rounded-lg, mt-6

## Icons
**Library**: Heroicons via CDN (solid and outline variants)
**Key Icons**:
- Search: MagnifyingGlassIcon
- Location: MapPinIcon
- Weather: SunIcon, CloudIcon for conditions
- Warning: ExclamationTriangleIcon
- Info: InformationCircleIcon
- Temperature: Thermometer (custom comment if needed)

## Spacing & Rhythm
- Page padding: px-4 py-6 md:px-6 md:py-8
- Section gaps: space-y-6 md:space-y-8
- Card internal spacing: p-6 md:p-8
- Metric grids: gap-4 md:gap-6
- Button spacing: gap-3 for icon+text

## Responsive Breakpoints
- Mobile-first: Base styles optimized for 375px+
- Tablet (md:): 768px - adjust to 2-column grids, larger text
- Desktop (lg:): 1024px+ - max-w-4xl constraint, refined spacing

## Animations
**Minimal & Purposeful**:
- Skeleton screen pulse for loading
- Smooth 200ms transitions on interactive elements (buttons, dropdowns)
- Hourly forecast: smooth-scroll behavior
- NO decorative animations, parallax, or scroll effects

## Mobile Optimization
- Touch targets: minimum h-12 (44px)
- Search bar prominence at top
- Sticky search header (optional on scroll)
- Swipeable hourly forecast
- Collapsible health guidance to reduce scroll depth
- Large, readable text throughout

## Accessibility
- Semantic HTML structure (header, main, section)
- ARIA labels on icon-only buttons
- Focus states on all interactive elements (ring-2 ring-offset-2)
- Sufficient contrast ratios (handled by color system later)
- Screen reader announcements for loading/error states
- Keyboard navigation support for hourly scroll

This design prioritizes **rapid information access, visual clarity, and mobile usability** for a safety-critical weather application.