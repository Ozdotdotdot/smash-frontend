# How It Works

This project integrates data collection, processing, and visualization to provide competitive analytics for the Georgia Super Smash Bros. scene. Here's a technical overview of the architecture and implementation.

## Data Collection

The foundation of this system is built on tournament data from start.gg's GraphQL API. The API provides raw tournament data including player information, match results, and event details. Data collection focused initially on Georgia tournaments before expanding to cover the broader United States.

The API queries return structured JSON data containing player statistics, including player IDs, gamer tags, match records, event attendance, and timestamps. This raw data serves as the foundation for all subsequent analysis and visualization.

## Data Processing and Storage

### Initial Analysis

Once collected, the raw data required extensive processing to extract meaningful insights. Using Python DataFrames and Microsoft Excel, the dataset was analyzed to identify key metrics such as opponent strength (calculated from win rates and power rankings) and individual player performance statistics.

### Data Cleaning

A significant challenge in working with tournament data is inconsistency. Player profiles often have missing information, and geographic data isn't always complete. To address this, a classification system was implemented: if more than 60% of a player's tournaments occurred in Georgia, they were classified as a GA player. This heuristic approach improved accuracy as the dataset grew larger, though edge cases initially appeared with players who attended limited events in the region.

### Database Architecture

The volume of data—over 5,000 individual files for US tournament data—necessitated a more robust storage solution. The system uses SQLite (smash.db) as its database format, providing a lightweight yet powerful solution for managing tournament records.

To ensure data accessibility across the application while managing hosting costs, the database is self-hosted. This approach eliminates ongoing cloud storage expenses while maintaining reliable access to tournament data.

## API Layer

A custom REST API serves as the interface between the database and client applications. The API accepts query parameters for state, time range, and result limits, then returns formatted JSON responses.

Example endpoint:
```
https://server.cetacean-tuna.ts.net/precomputed?state=GA&months_back=3&limit=0
```

This endpoint returns precomputed weighted win rates and opponent strength averages for all players in Georgia over the last three months. The API architecture allows for flexible querying while maintaining separation between data storage and presentation layers.

## Frontend Implementation

### Technology Stack

The web interface is built using Next.js, a TypeScript framework that provides both development efficiency and production-ready performance. The site is hosted on Vercel, which offers free hosting for hobby projects with reasonable traffic limits.

### Design Philosophy

Rather than using website builders like WordPress or Wix, the frontend was built from scratch. This approach provides complete control over the user experience and eliminates ongoing subscription costs beyond domain registration for smash.watch.

The interface translates complex backend data into accessible visualizations, making competitive analytics available to users without technical backgrounds. Data visualization was developed iteratively using Jupyter Notebooks, which provide an interactive environment for prototyping charts and graphs before implementing them in the production website.

## Development Process

This project was built incrementally through consistent daily progress. The development workflow involved:

- Automated data collection scripts (some running for extended periods to gather comprehensive datasets)
- Iterative testing and refinement of data processing algorithms
- Progressive enhancement of the web interface
- Continuous integration between frontend and backend systems

## Architecture Overview

The complete system comprises several integrated components:

1. **Data Collection**: GraphQL API queries to start.gg
2. **Processing Pipeline**: Python scripts for data cleaning and metric calculation
3. **Storage Layer**: SQLite database (smash.db)
4. **API Service**: Custom REST API for data access
5. **Frontend**: Next.js web application hosted on Vercel

Each component operates independently while communicating through well-defined interfaces, allowing for modular updates and maintenance.

## Metrics and Filtering

The system tracks several key performance indicators:

- **Weighted Win Rate**: Calculated from set wins and losses with adjustments for opponent quality
- **Opponent Strength**: Derived from opponent win rates and power ranking positions
- **Event Participation**: Average and maximum event sizes, large event attendance percentage
- **Geographic Classification**: Based on tournament location frequency
- **Temporal Data**: Latest event participation and computation timestamps

These metrics combine to provide a comprehensive view of player performance within the competitive scene, enabling head-to-head comparisons and trend analysis over time.
