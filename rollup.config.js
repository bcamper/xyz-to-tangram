import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'lib/index.js',
    output: {
        file: 'dist/xyz-to-tangram.js',
        format: 'umd',
        name: 'xyzToTangram'
    },
    plugins: [
        resolve(),
        commonjs(),
        buble({
            transforms: {
                dangerousForOf: true
            },
            objectAssign: 'Object.assign'
        })
    ]
};
