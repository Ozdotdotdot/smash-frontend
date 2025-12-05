# Smash Watch - User Documentation

**Smash Watch** helps you visualize competitive Super Smash Bros. player performance in your region. See who's overperforming, who's consistent, and who you should watch out for.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Understanding the Chart](#understanding-the-chart)
- [Using Filters](#using-filters)
- [View Types](#view-types)
- [Advanced Filtering](#advanced-filtering)
- [Reading the Data](#reading-the-data)

---

## Getting Started

1. Navigate to the [Dashboard page](http://localhost:3000/dashboard)
2. Select a **View Type** (State or Tournament)
3. Enter a **State** code (e.g., `GA`, `NY`, `CA`)
4. Choose a **Timeframe** (30 days, 60 days, or 3 months)
5. Click **Apply Filters**

<!-- SCREENSHOT: Dashboard with empty state showing the filter panel and "No data yet" message -->

The scatter chart will populate with player data from your selected region.

---

## Understanding the Chart

### What You're Looking At

The scatter plot shows **two key metrics** for each player:

- **Y-axis (Vertical)**: **Weighted Win Rate** (0-100%)
  - Not just raw wins - accounts for bracket difficulty and opponent quality
  - Higher = player wins more consistently

- **X-axis (Horizontal)**: **Opponent Strength**
  - Measures the average skill level of opponents faced
  - Higher = player competes against tougher competition

<!-- SCREENSHOT: Annotated scatter chart showing axes, data points, and tooltip -->

### Reading the Positions

| Position | What It Means |
|----------|---------------|
| **Top-left** | High win rate, weaker opponents - dominating local scene |
| **Top-right** | High win rate, strong opponents - elite player |
| **Bottom-left** | Low win rate, weaker opponents - developing player |
| **Bottom-right** | Low win rate, strong opponents - punching up, facing tough competition |

<!-- DIAGRAM: Simple 2x2 grid showing these four quadrants with example labels -->

### Interactive Features

- **Hover over dots** to see player details:
  - Gamer tag
  - Exact win rate percentage
  - Opponent strength value
- **Scroll down** to view the full data table
- **Toggle "Hide outliers"** to remove extreme statistical outliers

---

## Using Filters

### View Types

#### State View
Analyzes **all players** from a specific state over your selected timeframe.

**Best for:**
- Regional power rankings
- Identifying rising talent in your scene
- Comparing player performance across the state

<!-- SCREENSHOT: State view filter panel with "GA" entered -->

**Example:** Setting State to `GA` with 3 months shows everyone who competed in Georgia during that period.

---

#### Tournament View
Focuses on **specific tournament series** or individual events.

**Best for:**
- Weekly series analysis (e.g., who's improving at your local)
- Major tournament deep-dives
- Comparing performance within a specific event series

<!-- SCREENSHOT: Tournament view filter panel with series options -->

**You can filter by:**
- **Tournament Series** - Enter series name (e.g., `4o4`, `Guildhouse`)
- **Tournament URL/Slug** - Paste a start.gg URL or slug directly

**Multi-Series Toggle:**
When enabled, combines data from multiple matching tournament series. When disabled and multiple series are found, you'll see buttons to select one specific series.

<!-- SCREENSHOT: Multiple series selection buttons appearing after filtering -->

---

### Primary Filters

#### State
**What it does:** Filters players by their home state (2-letter code).

**Format:** Two-letter abbreviation (e.g., `GA`, `NY`, `FL`)

**Example:** Entering `CA` shows California players only.

---

#### Timeframe
**What it does:** Limits data to events within the selected time window.

**Options:**
- Last 30 days
- Last 60 days
- Last 3 months

**Note:** More recent timeframes show current form. Longer windows smooth out variance but may include retired/inactive players.

---

#### Hide Outliers
**What it does:** Removes players in the top ~1% of opponent strength to prevent extreme values from distorting the chart scale.

**Exception:** Players with win rates ≥70% are always kept, even if they're statistical outliers.

<!-- SCREENSHOT: Chart before/after hiding outliers, showing the difference in scale -->

**When to use:**
- Chart is too "zoomed out" due to a few players with extremely high opponent strength
- You want to focus on the bulk of your regional scene
- A few top players are making it hard to see everyone else

**When to disable:**
- You specifically want to see elite player performance
- Analyzing majors where high-strength opponents are expected
- Small dataset where every data point matters

---

## Advanced Filtering

Click **Advanced** in the filter panel to reveal additional options.

<!-- SCREENSHOT: Advanced filter section expanded -->

### Filter State(s)
**What it does:** Overrides the main state filter with a custom comma-separated list.

**Format:** `GA, FL, AL`

**Use case:** Analyze a multi-state region (e.g., Southeast players)

---

### Character Filters
**What it does:** Shows only players who main specific characters.

**Format:** `Falco, Sheik, Fox`

**Example:** Enter `Marth` to see how Marth players perform in your region.

**Note:** Uses the first character if multiple are listed for weighted calculations.

---

### Min/Max Entrants (average)
**What it does:** Filters by average bracket size.

- **Min Entrants:** Keeps players whose average event had **at least** this many people
- **Max Entrants:** Keeps players whose average event had **at most** this many people

**Use cases:**
- `Min: 32` - Focus on players who compete in established locals/regionals
- `Max: 64` - Exclude players who primarily attend majors
- `Min: 16, Max: 48` - Target mid-size bracket competitors

---

### Min Largest Event Entrants
**What it does:** Requires players to have attended at least one event with this minimum entrant count.

**Example:** Setting `64` means "show only players who've competed in at least one 64+ person bracket."

**Use case:** Filter for players with major tournament experience.

---

### Large Event Threshold
**What it does:** Defines what counts as a "large event" for the share calculation below.

**Default:** 32 entrants

**Example:** Set to `48` if you consider only 48+ brackets to be "large" in your region.

---

### Min Large Event Share
**What it does:** Requires a minimum fraction (0-1) of a player's events to be "large."

**Format:** Decimal between 0 and 1 (e.g., `0.33` = 33%)

**Example:**
- Large Event Threshold: `32`
- Min Large Event Share: `0.5`
- **Result:** Only players where at least 50% of their events had 32+ entrants

**Use case:** Find players who consistently compete at higher-level events, not just locals.

---

### Start After
**What it does:** Excludes players whose most recent event started on or after this date.

**Format:** Date picker (MM/DD/YYYY)

**Use case:** Filter out inactive players or analyze a specific historical window.

---

## Reading the Data

### The Data Table

Below the chart, you'll find a sortable table with:

| Column | Description |
|--------|-------------|
| **Player** | Gamer tag |
| **Win rate** | Weighted win rate as percentage |
| **Opp strength** | Opponent strength (3 decimal precision) |
| **State** | Player's home state |

<!-- SCREENSHOT: Data table showing several rows of player data -->

**Row count** displays at the top: "X rows"

**Hidden data notes:**
- "X row(s) skipped (missing win rate or opponent strength)" - Invalid/incomplete data
- "X outlier(s) hidden" - Appears when "Hide outliers" is enabled

---

## Tips & Best Practices

### Finding Rising Talent
1. Use **State View** with **3 months** timeframe
2. Set **Min Entrants: 24** to focus on established brackets
3. Look for players in the **top-left** (high win rate, moderate opponent strength)
4. Enable **Hide outliers** to avoid top players dominating the view

---

### Analyzing a Weekly Series
1. Switch to **Tournament View**
2. Enter the series name (e.g., `Guildhouse`)
3. Use **30 days** to see recent trends
4. Leave **Allow multiple series** disabled
5. Select the specific series from the buttons if multiple match

---

### Comparing Character Performance
1. Use **Advanced → Character Filters**
2. Enter one character (e.g., `Fox`)
3. Apply filters
4. Note the average opponent strength and win rate positions
5. Repeat for other characters to compare

---

### Identifying Bracket Difficulty
Players with **high opponent strength** face tougher competition:
- **< 0.3:** Local/regional level competition
- **0.3 - 0.6:** Established regional/national level
- **> 0.6:** Elite/top-level competition

*(These ranges vary by region and game - use them as relative guides)*

---

## Troubleshooting

### "No data found"
**Causes:**
- State code typo (must be exact 2-letter code)
- Timeframe too narrow for your region
- Filters too restrictive (try relaxing Min Entrants)
- State doesn't have tournament data in the database

**Solutions:**
1. Click **Reset** to clear all filters
2. Try a more populous state (e.g., `CA`, `NY`, `GA`)
3. Increase timeframe to 3 months
4. Remove advanced filters

---

### "Select a series from the options"
**Cause:** Multiple tournament series match your filters.

**Solution:**
- Click one of the series buttons that appear below the filters
- **OR** enable "Allow multiple series" to combine all matching series

---

### Chart looks "squished"
**Cause:** Statistical outliers are compressing the scale.

**Solution:** Enable **Hide outliers** toggle to zoom into the main cluster.

---

### Players missing from chart but in table
**Cause:** Missing or invalid `weighted_win_rate` or `opponent_strength` values.

**Note:** Check the table footer for "X row(s) skipped" message.

---

## Understanding the Metrics

### Weighted Win Rate
Unlike raw win percentage, weighted win rate emphasizes:
- **Set count:** Players who compete more frequently
- **Opponent quality:** Wins against stronger players count more
- **Recency:** More recent results may be weighted higher

**Why it matters:** A 60% weighted win rate against strong players is more impressive than 80% against weak opposition.

---

### Opponent Strength
Calculated based on:
- Historical performance of opponents faced
- Placement results of those opponents
- Iterative strength calculations across the scene

**Why it matters:** Reveals who's challenging themselves vs. who's farming easier brackets.

---

## Mobile Usage

On mobile devices:

1. Tap **Filters** button (bottom of screen)
2. Filter panel slides in from left
3. Adjust settings
4. Tap **Apply Filters**
5. Tap outside panel or **Close** to return to chart

<!-- GIF: Mobile interaction showing filter drawer opening, filtering, and closing -->

The chart and table are fully responsive and scrollable.

---

## Questions?

For bugs, feature requests, or questions:
- **GitHub Issues:** [github.com/ozdotdotdot/smashDA/issues](https://github.com/ozdotdotdot/smashDA/issues)
- **Email:** hello@smash.watch

---

*Documentation for Smash Watch v0.1*
