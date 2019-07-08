// Basemap options
export const defaultBasemap = 'refill';

// this gets merged into basemaps to change 'mapzen' vector tile source definitions to their XYZ HERE equivalent
// TODO: this does not yet override terrain/normal tiles for hillshading
const xyzTilezenSourceOverride = {
    sources: {
        mapzen: {
            url: 'https://xyz.api.here.com/tiles/osmbase/512/all/{z}/{x}/{y}.mvt',
            url_params: {
                'access_token': 'global.xyz_access_token'
            }
        }
    }
};

// basemap scene definitions
// each is a function that takes an options object, and returns a Tangram scene object
export const basemaps = {
    // No basemap
    'none': () => {
      return {};
    },

    // XYZ basemaps
    'dots': () => {
        return {
            import: 'https://sensescape.github.io/xyz-dots/scene.yaml',
            ...xyzTilezenSourceOverride
        };
    },
    'pixel': () => {
        return {
            import: 'https://sensescape.github.io/xyz-pixel/scene.yaml',
            ...xyzTilezenSourceOverride
        };
    },
    'satellite': () => {
        return {
            import: [
                'https://www.nextzen.org/carto/refill-style/refill-style.zip',
                'satellite.yaml'
            ],
            ...xyzTilezenSourceOverride
        };
    },

    // Mapzen basemaps
    'refill': ({ labelsOnTop }) => {
        const basemap = {
            import: [
                'https://www.nextzen.org/carto/refill-style/refill-style.zip',
                'https://www.nextzen.org/carto/refill-style/themes/label-4.zip',
                'https://www.nextzen.org/carto/refill-style/themes/terrain-shading-dark.zip',
                'https://www.nextzen.org/carto/refill-style/themes/no-texture.zip'
            ],
            ...xyzTilezenSourceOverride
        };
        if (labelsOnTop) {
            basemap.styles = {
                // temp override to put basemap labels on top
                'text-blend-order': {
                    blend_order: 100
                },
                mapzen_icon_library: {
                    blend_order: 100
                }
            };
        }
        return basemap;
    },
    'refill-dark': ({ labelsOnTop }) => {
        const basemap = {
            import: [
                'https://www.nextzen.org/carto/refill-style/refill-style.zip',
                'https://www.nextzen.org/carto/refill-style/themes/color-gray-gold.zip',
                'https://www.nextzen.org/carto/refill-style/themes/label-4.zip',
                // 'https://www.nextzen.org/carto/refill-style/themes/terrain-shading-dark.zip',
            ],
            ...xyzTilezenSourceOverride
        };
        if (labelsOnTop) {
            basemap.styles = {
                // temp override to put basemap labels on top
                'text-blend-order': {
                    blend_order: 100
                },
                mapzen_icon_library: {
                    blend_order: 100
                }
            };
        }
        return basemap;
    },
    'walkabout': ({ labelsOnTop }) => {
        const basemap = {
            import: [
                'https://www.nextzen.org/carto/walkabout-style/walkabout-style.zip',
                'https://www.nextzen.org/carto/walkabout-style/themes/walkabout-road-shields-usa.zip',
                'https://www.nextzen.org/carto/walkabout-style/themes/walkabout-road-shields-international.zip'
            ],
            ...xyzTilezenSourceOverride
        };
        if (labelsOnTop) {
            basemap.styles = {
                // temp override to put basemap labels on top
                'text-blend-order': {
                    blend_order: 100
                },
                mapzen_icon_library: {
                    blend_order: 100
                }
            };
        }
        return basemap;
    }
};
