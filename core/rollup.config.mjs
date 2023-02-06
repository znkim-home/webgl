import { glMatrix } from 'gl-matrix';
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';

const name = "toygl"

export default [{
  input: 'src/index.ts',
  output: { 
    file: 'dist/toygl.js', 
    format: 'esm', 
    name,
    globals: {
      [glMatrix] : "gl-matrix"
    }
  },
  plugins: [
    babel(), 
    typescript({
      tsconfig: 'tsconfig.json',
    })
  ],
},
{
  input: 'src/index.ts',
  output: { 
    file: 'dist/toygl-min.js', 
    format: 'esm', 
    name,
    globals: {
      [glMatrix] : "gl-matrix"
    }
  },
  plugins: [
    babel(),
    typescript({
      tsconfig: 'tsconfig.json',
    }),
    sizeSnapshot(),
    terser({output: { comments: /^!/ }})
  ]
}]