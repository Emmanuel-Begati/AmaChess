import { register } from 'ts-node';

register({
  esm: true,
  project: './tsconfig.server.json',
  experimentalSpecifierResolution: 'node'
});
