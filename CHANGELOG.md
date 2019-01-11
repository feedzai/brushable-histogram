# Brushable Histogram

## 1.7.0 (TBD)
- Exports a css file
- Ignoring directories that are irrelevant for this component releases.
  Like unit tests, documentation and storybook files.
- Updates .babelrc file in order to ship the source code without unit
  tests.
- Fixes Javascript import path.
- Adds missing check that cause the histogram to blow-up in some cases

## 1.1.5 & 1.1.6 (2018/12/26) BUMPED

## 1.1.4 (2018/12/26)
- Handles the case when `props.data` is empty
- Fixes error when switching between storybook stores

## 1.1.3 (2018/12/23)
- Fixes tooltip not rendering properlly (it appeared and disappeared)

## 1.1.2 (2018/12/19)
- Reduces the minimum height to 100 pixels to allow for some internal Feedzai use cases

## 1.1.1 (2018/12/17)
- Publishes the `lib` folder

## 1.1.0 (2018/12/17)
- Document the props and have better defaults
- Add more unit tests (still missing for Histogram.js)
- Extract the "timeline" to another module
- Remove the dependency on andtd
- Remove the dependency on lodash
- Stop `_playLapseAtInterval` if the component was unmounted
- Improve method order inside main component
- Add missing jsdoc
- Remove the `randomString` key hack
- Make the play button optional
- Benchmark with a lot of nodes
    - Initial render is relativelly fast with 100k data points
    - Tooltip highlight works smoothly with 300k data points
    - Brushing works with 70k data points, and smoothly with 25k data points
- Handle different widths and heights correctly
- Remove global selectors
- Create a static page with the story book
- Added a `CONTRIBUTING.md`
- Setup CI with coverage and badges

## 1.0.5 (2018/12/05)
- Removes usage of `.toString()` to avoid requiring core-js.

## 1.0.4 (2018/12/05)
- Reduces dependencies of the transpiled code to reduce the bundle size of the package consumers.

## 1.0.3 (2018/12/04)
- Adds missing antd dependency

## 1.0.2 (2018/11/30)
- Adds a build step to compile the src files

## 1.0.1 (2018/11/30)
- Fixes index.js link and changes the dependencies version to match the ones in genome

## 1.0.0 (2018/11/30)
- Copied the implementation from Genome
- Copied the styles from Genome
- Added a basic story to demo the histogram
- Added a basic unit test
