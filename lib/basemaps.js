// Basemap options
export const defaultBasemap = 'refill';

export const basemaps = {
    // No basemap
    'none': () => {
      return {};
    },

    // XYZ basemaps
    'dots': () => {
        return {
            import: 'https://sensescape.github.io/xyz-dots/scene.yaml'
        };
    },
    'pixel': () => {
        return {
            import: 'https://sensescape.github.io/xyz-pixel/scene.yaml'
        };
    },
    'satellite': () => {
        return {
            import: [
                'https://www.nextzen.org/carto/refill-style/refill-style.zip',
                'satellite.yaml'
            ]
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
            ]
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
            ]
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
                'https://www.nextzen.org/carto/walkabout-style/8/walkabout-style.zip',
                'https://www.nextzen.org/carto/walkabout-style/8/themes/walkabout-road-shields-usa.zip',
                'https://www.nextzen.org/carto/walkabout-style/8/themes/walkabout-road-shields-international.zip'
            ]
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
