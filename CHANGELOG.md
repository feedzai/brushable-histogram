# Brushable Histogram

## 1.2.1 (2019/04/9)
- Allow the user to define a custom `brushDomain` via `props`.
- Update Storybook to 5.x
- The scales are updared if `yAccessor` or `xAccessor` are changed
- Update eslint config

## 1.2.0
- This version is broken, do not use it.

## 1.1.10 (2019/03/29)

- Fix Histogram's `onIntervalChange` method not being called when the graph's histogram data changes (and the graph itself) but the domain min and max remains the same. This change will cause a little degradation in the brushing performance, since the `setState` method will be invoke many times, even when there was no changes in the brush range. We will try to address this side effect in the next version.

## 1.1.9 (2019/03/20)

- Fix a bug related with data replacement on update ([#36](https://github.com/feedzai/brushable-histogram/pull/36#issue-262504945))

## 1.1.8 (2019/03/15)

- Fix a bug related with screen resizing events

## 1.1.7 (2019/02/19)
- Fix a bug related with the zooming interactions between the histogram
  and brushing areas ([#26](https://github.com/feedzai/brushable-histogram/issues/26))
- Fix bug related with brush size resizing ([#30](https://github.com/feedzai/brushable-histogram/issues/30))
- Exports a css file
- Ignoring directories that are irrelevant for this component releases.
  Like unit tests, documentation and storybook files.
- Updates .babelrc file in order to ship the source code without unit
  tests.
- Fixes Javascript import path.

## 1.1.6 - BUMP

## 1.1.5 (2018/12/26)
- Adds missing check that cause the histogram to blow-up in some cases

## 1.1.4 (2018/12/26)
- Handles the case when `props.data` is empty
- Fixes error when switching between storybook stores

## 1.1.3 (2018/12/23)
- Fixes tooltip not rendering properlly (it appeared and disappeared)

## 1.1.2 (2018/12/19)
- Reduces the minimum height to 100 pixels to allow for some internal
  Feedzai use cases

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
    - Brushing works with 70k data points, and smoothly with 25k data
      points
- Handle different widths and heights correctly
- Remove global selectors
- Create a static page with the story book
- Added a `CONTRIBUTING.md`
- Setup CI with coverage and badges

## 1.0.5 (2018/12/05)
- Removes usage of `.toString()` to avoid requiring core-js.

## 1.0.4 (2018/12/05)
- Reduces dependencies of the transpiled code to reduce the bundle size
  of the package consumers.

## 1.0.3 (2018/12/04)
- Adds missing antd dependency

## 1.0.2 (2018/11/30)
- Adds a build step to compile the src files

## 1.0.1 (2018/11/30)
- Fixes index.js link and changes the dependencies version to match the
  ones in genome

## 1.0.0 (2018/11/30)
- Copied the implementation from Genome
- Copied the styles from Genome
- Added a basic story to demo the histogram
- Added a basic unit test
