const path = require('path');

/**
 * serverless-esbuild supports `custom.esbuild.plugins` pointing at a JS file.
 * We use it to alias `class-transformer/storage` (required by @nestjs/mapped-types)
 * to the actual file shipped by class-transformer v0.5.x.
 */
module.exports = [
  {
    name: 'alias-class-transformer-storage',
    setup(build) {
      build.onResolve({ filter: /^class-transformer\/storage$/ }, () => {
        // class-transformer ships this file under `cjs/storage.js`
        const resolved = require.resolve('class-transformer/cjs/storage.js');
        return { path: resolved };
      });

      // Optional: in case something uses the bare file without extension.
      build.onResolve({ filter: /^class-transformer\/storage\.js$/ }, () => {
        const resolved = require.resolve('class-transformer/cjs/storage.js');
        return { path: resolved };
      });
    }
  }
];


