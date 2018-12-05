# Brushable Histogram

# 1.1.0 (TBD)
[x] Document the props and have better defaults
[ ] Add more unit tests
[x] Extract the "timeline" to another module
[x] Remove the dependency on andtd
[x] Remove the dependency on lodash
[x] Stop `_playLapseAtInterval` if the component was unmounted
[x] Improve method order inside main component
[ ] Add missing jsdoc
[x] Remove the `randomString` key hack
[x] Make the play button optional
[ ] Benchmark with a lot of nodes
[ ] Handle different widths and heights correctly
[x] Remove global selectors
[ ] Create a static page with the story book

# 1.0.5 (2018/12/05)
- Removes usage of `.toString()` to avoid requiring core-js.

# 1.0.4 (2018/12/05)
- Reduces dependencies of the transpiled code to reduce the bundle size of the package consumers.

# 1.0.3 (2018/12/04)
- Adds missing antd dependency

# 1.0.2 (2018/11/30)
- Adds a build step to compile the src files

# 1.0.1 (2018/11/30)
- Fixes index.js link and changes the dependencies version to match the ones in genome

## 1.0.0 (2018/11/30)
- Copied the implementation from Genome
- Copied the styles from Genome
- Added a basic story to demo the histogram
- Added a basic unit test