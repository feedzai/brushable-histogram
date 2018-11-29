# Component Boilerpate

This is a boilerpate project for Feedzai internal component packages.

Out of the box provides:
- Storybook setup
- Integration with Victor's deploy-tasks
- Baseline babel config
- Integration with Jest and enzyme
- Integrates with Feedzai's eslint config

## How to install it?
Clone this repo and change the name of the project.

## Repo Organization
```
 - (root folder)
  |
  |\_ .storybook - This is the place of the storybook configurations (you should not need to change this often)
  |
  |\_ src - Here you should add the source code and the unit tests
  |
  |\_ stories - Here you should add the different stories for this component (Story Book)

```
## Develop process

### `npm` tasks

#### Development tasks
- `npm run storybook` - generate the component interactive (access to the storybook server using `http://localhost:9000`)
- `npm run test` - run the unit tests (using jest)
- `npm run test:watch` - run the unit tests in watch mode (using jest)
- `npm run lint` - run the ESLint linter

#### Deployment tasks

**NOTE:** Those tasks should be executed only on the `master` branch.

- `npm run publish:dry` - runs all the publish steps but doesn't actualy publishes
- `npm run publish:major` - creates a tag and publish the X.0.0 version
- `npm run publish:minor` - creates a tag and publish the X.Y.0 version
- `npm run publish:patch` - creates a tag and publish the X.Y.Z version