import buble from 'rollup-plugin-buble';

export default {
    input: 'index.js',
    output: {
        file: 'dist/xyz-to-tangram.js',
        format: 'umd',
        name: 'xyzToTangram'
    },
    plugins: [
        buble({
            transforms: {
                dangerousForOf: true
            }
        })
    ]
};
