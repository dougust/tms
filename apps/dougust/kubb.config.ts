import { defineConfig } from '@kubb/core';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginReactQuery } from '@kubb/plugin-react-query';
import { pluginTs } from '@kubb/plugin-ts';

export default defineConfig(() => {
  return {
    root: '.',
    input: {
      path: './dougust-api-specs.json',
    },
    output: {
      path: '../../libs/autogen-clients/src/autogen',
      clean: true,
      format: 'prettier',
    },
    plugins: [
      pluginOas({ validate: false }),
      pluginTs(),
      pluginReactQuery({
        suspense: false,
        group: {
          type: 'tag',
          name: ({group}) => `${group}`
        },
        client: {
          importPath: '../../../client',
        },
      }),
    ],
  };
});
