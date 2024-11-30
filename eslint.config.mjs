import config from '@newceptiondev/eslint-config'
import prettier from 'eslint-config-prettier'

export default [
  ...config,
  prettier,
  {
    ignores: ['node_modules/*', 'scripts/*', 'src/utils/*', 'src/template/*'],
  },
]
