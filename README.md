# Swearing Map

Welcome to the Swearing Map, an interactive map component built with React and Leaflet. This map component is designed to display swear words from countries and additional information based on user interaction.

## Features

- Interactive Map: Utilizes the Leaflet library to create an interactive and dynamic map.
- Country Borders: Displays country borders using GeoJSON data.
- Popup Information: Provides popup information about a selected country, including words associated with the country.

## Project status

The current application is a proof of concept. It is being evolved through reviewed tickets and
architecture decisions toward a production product. See the accepted decisions in
[`docs/adr`](docs/adr) and the current foundation epic in
[`docs/tickets/EPIC-00-engineering-foundation.md`](docs/tickets/EPIC-00-engineering-foundation.md).

## Development

Prerequisites are Node.js from `.nvmrc` and Corepack.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Run all local quality gates before opening a pull request:

```sh
pnpm check
```

Individual commands include `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`,
`pnpm test:coverage`, `pnpm audit`, and `pnpm build`.

The ticket, branch, commit, review, and Definition of Done workflow is documented in
[`CONTRIBUTING.md`](CONTRIBUTING.md).

## Data Source

The map utilizes GeoJSON data for country borders. The GeoJSON data is loaded from the Borders file located in the data directory.

## Screenshots

![Main page](screenshot.png)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## TODO

- no wrapping map (only one instance of tiles)
- clicking one more time on the same country
- submitting new words
- sidebar
  - filter
  - all words
- statistics of countries
