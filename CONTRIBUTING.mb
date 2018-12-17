# How to contribute to Brushable Histogram

This repository is set up to work under the traditional fork + Pull Request model.

## CI/CD
Quality is validated in pull requests using [travis-ci.com](https://travis-ci.com/feedzai/brushable-histogram) using the configuration that you can see in the [Travis YAML](https://raw.githubusercontent.com/feedzai/brushable-histogram/master/.travis.yml).
The `script` phase of the Travis lifecycle will run the linter and tests. The `after_script` phase sends to coverage results to [coveralls.io](https://coveralls.io/github/feedzai/brushable-histogram).

## Merging
Pull requests with failing builds will not be merged, and coverage is expected to be above 80%.

## Releasing
Releases are responsability of the maintainers. When releasing maintainers should:
- Make sure `CHANGELOG.md` is updated
- Create a git tag
- Create a new npm version
- Publish to npm
- Push the branch
