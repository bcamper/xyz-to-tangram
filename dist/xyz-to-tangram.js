(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.xyzToTangram = factory());
}(this, function () { 'use strict';

    function xyzToTangram(xyzStyle, {
            setStartPosition = true, // create a Tangram camera to set the scene position on load
        } = {}) {
        const scene = {
            sources: makeSources(xyzStyle),
            styles: makeStyles(xyzStyle),
            layers: makeLayers(xyzStyle)
        };

        if (setStartPosition) {
            scene.cameras = makeCamera(xyzStyle);
        }

        return scene;
    }

    function makeCamera(xyz) {
        const pos = xyz.map_settings;
        if (pos &&
            pos.center &&
            pos.center.length === 2 &&
            pos.zoom) {
            return {
                xyz: {
                    position: [pos.center[1], pos.center[0], pos.zoom].map(Number),
                    active: true
                }
            };
        }
    }

    function getXYZLayerName(xyzLayer, index) {
        return (xyzLayer.meta && xyzLayer.meta.title) || `layer-${index}`;
    }

    function makeSources(xyz) {
        // https://xyz.api.here.com/hub/spaces/{space}/tile/web/{z}_{x}_{y}
        return xyz.layers.reduce((tgSources, xyzLayer, index) => {
            const spaceId = xyzLayer.geospace.id;
            const name = getXYZLayerName(xyzLayer, index);
            const access_token = xyz.rot;

            tgSources[name] = {
                type: 'GeoJSON',
                url: `https://xyz.api.here.com/hub/spaces/${spaceId}/tile/web/{z}_{x}_{y}`,
                url_params: {
                    access_token,
                    clip: true
                }
            };
            return tgSources;
        }, {});
    }

    function makeStyles(xyz) {
        return xyz.layers.reduce((tgStyles, xyzLayer, index) => {
            // One style per layer per geometry type
            const xyzLayerName = getXYZLayerName(xyzLayer, index);
            ['polygons', 'lines', 'points', 'text'].forEach((geomType, geomIndex) => {
                tgStyles[`${xyzLayerName}_${geomType}`] = {
                    base: geomType,
                    blend: (geomType === 'polygons' || geomType === 'lines') ? 'translucent' : 'overlay',
                    // blend: 'overlay',
                    blend_order: (xyz.layers.length - index + geomIndex/4) // TODO: revisit fractional blend order?
                };
            });
            return tgStyles;
        }, {});
    }

    const tgLayerOrderBase = 1000; // Tangram layer order starting position for XYZ layers
    const tgLayerOrderMultiplier = 100; // Tangram layer order "space" inserted between XYZ layers

    function makeLayers(xyz) {
        // TODO: more general handling of visible flag
        return xyz.layers.filter(x => x.visible).reduce((tgLayers, xyzLayer, xyzLayerIndex) => {
            // Make one enclosing Tangram layer for the entire XYZ layer,
            // and then one sub-layer for each geometry type present in the XYZ layer
            const xyzLayerName = getXYZLayerName(xyzLayer, xyzLayerIndex);
            tgLayers[xyzLayerName] = {
                data: {
                    source: xyzLayerName
                }
            };

            // The geometry types in this XYZ layer (Point, Line, Polygon)
            // const geomTypes = xyzLayer.geometries; // Sometimes empty?
            const geomTypes = [];
            const geomCounts = xyzLayer.geometriesCount;
            if (geomCounts['Point'] || geomCounts['MultiPoint']) geomTypes.push('Point');
            if (geomCounts['LineString'] || geomCounts['MultiLineString']) geomTypes.push('Line');
            if (geomCounts['Polygon'] || geomCounts['MultiPolygon']) geomTypes.push('Polygon');

            geomTypes.forEach(geomType => {
                makeGeometryTypeLayer({ xyz, xyzLayer, xyzLayerIndex, geomType, tgLayers });
             });

            return tgLayers;
        }, {});
    }

    function makeGeometryTypeLayer({
        xyz,
        xyzLayer,
        xyzLayerIndex,
        geomType,
        tgLayers }) {

        // Tangram sub-layer for all features with this geometry type
        const xyzLayerName = getXYZLayerName(xyzLayer, xyzLayerIndex);
        const tgGeomLayer = tgLayers[xyzLayerName][geomType] = {
            filter: {
                $geometry: geomType.toLowerCase()
            }
        };

        // Make further Tagram sub-layers, one per XYZ layer style group
        const styleGroupPrefix = `${geomType.toLowerCase()}Style`;
        const styleGroups = Object.entries(xyzLayer.styleGroups).filter(([k]) => k.startsWith(styleGroupPrefix));
        const styleRules = (xyzLayer.styleRules && xyzLayer.styleRules[geomType]) || [];

        const tgDrawGroups = []; // list of Tangram draw groups generated for this geometry layer
        const tgStyleLayers = {}; // Tangram sub-layer keyed by XYZ style group

        styleGroups.forEach(([styleGroupName, styleGroup]) => {
            // Find XYZ style rule for this style (if one exists), and create Tangram layer filter
            makeStyleGroupLayer({
                styleRules, styleGroupName, styleGroupPrefix, tgGeomLayer, tgStyleLayers, styleGroup, tgDrawGroups,
                xyz, xyzLayerName, xyzLayerIndex
            });
        });

        // Second pass to turn off visibility for Tangram draw groups from other XYZ style groups
        styleGroups.forEach(([styleGroupName]) => {
            tgDrawGroups.forEach(({ layerName, drawGroupName }) => {
                const tgStyleLayerName = tgStyleLayers[styleGroupName];
                const tgStyleLayer = tgGeomLayer[tgStyleLayerName];
                if (layerName !== tgStyleLayerName) {
                    tgStyleLayer.draw[drawGroupName] = {
                        visible: false
                    };
                }
            });
        });
    }

    function makeStyleGroupLayer({
        styleRules,
        styleGroupName,
        styleGroupPrefix,
        tgGeomLayer,
        tgStyleLayers,
        styleGroup,
        tgDrawGroups,
        xyzLayerName,
        xyz,
        xyzLayerIndex }) {

        // Match XYZ style rules for this style group, and create Tangram filter
        let { sortPrefix, tgFilter } = matchStyleRules({ styleRules, styleGroupName, styleGroupPrefix });

        // Create Tangram sub-layer for this XYZ style group
        const tgStyleLayerName = tgStyleLayers[styleGroupName] = `${sortPrefix}_${styleGroupName}`;
        const tgStyleLayer = tgGeomLayer[tgStyleLayerName] = {};
        if (tgFilter != null) {
            tgStyleLayer.filter = tgFilter;
        }

        // Combine circle styles: XYZ has two circle styles (one for the outline, one for the fill),
        // while Tangram can represent this as a single draw group, as a point with an outline.
        coalesceCircleStyles(styleGroup);

        // Create Tangram draw groups, one for each XYZ style in this style group
        tgStyleLayer.draw = styleGroup
            .filter(s => s.opacity > 0) // this seems to be used as a general filter to disable symbolizers?
            .filter(s => !s.isOutline) // filter coalesced circle outlines
            // .filter(s => s.type === 'Polygon' || s.type === 'Line') // TODO: other symbolizer types
            .reduce((draw, style, styleIndex) => {
                // Add Tangram draw groups for each XYZ style object
                if (style.type === 'Polygon') {
                    // Polygon fill
                    makePolygonStyleLayer({ tgStyleLayerName, style, styleIndex, tgDrawGroups, draw, xyzLayerName, xyz, xyzLayerIndex });
                }
                else if (style.type === 'Line') {
                    // Line stroke
                    makeLineStyleLayer({ tgStyleLayerName, style, styleIndex, tgDrawGroups, draw, xyzLayerName, xyz, xyzLayerIndex });
                }
                else if (style.type === 'Circle') {
                    // Circle point
                    makeCircleStyleLayer({ tgStyleLayerName, style, styleIndex, tgDrawGroups, draw, xyzLayerName, xyz, xyzLayerIndex });
                }
                else if (style.type === 'Image') {
                    // Circle point
                    makeImageStyleLayer({ tgStyleLayerName, style, styleIndex, tgDrawGroups, draw, xyzLayerName, xyz, xyzLayerIndex });
                }
                else if (style.type === 'Text') {
                    // Text label
                    makeTextStyleLayer({ tgStyleLayerName, style, styleIndex, tgDrawGroups, draw, xyzLayerName, xyz, xyzLayerIndex });
                }
                return draw;
            }, {});
    }

    function matchStyleRules({ styleRules, styleGroupName, styleGroupPrefix }) {
        const rule = styleRules.find(rule => styleGroupName === `${styleGroupPrefix}_${rule.id}`);
        let ruleIndex;
        let tgFilter;
        if (rule) {
            ruleIndex = styleRules.findIndex(rule => styleGroupName === `${styleGroupPrefix}_${rule.id}`);
            tgFilter = makeFilter(rule);
        }

        let sortPrefix;
        if (ruleIndex != null) {
            const sort = styleRules.length - ruleIndex;
            sortPrefix = `s${leftPad(sort, numDigits(styleRules.length))}`;
        }
        else {
            sortPrefix = `s${leftPad(0, numDigits(styleRules.length))}`;
        }

        return { sortPrefix, tgFilter };
    }

    // Build a Tangram layer filter for an XYZ style rule
    function makeFilter(styleRule) {
        if (styleRule == null) {
            return;
        }

        const rules = styleRule.r[0]; // TODO: handle multi-element OR properties (Studio doesn't currently support)
        let conditions = [];
        rules.forEach(rule => {
            switch (rule.operator) {
                case 'eq': // equals
                    conditions.push(`feature['${rule.property}'] === ${quoteValue(rule.value)}`);
                    break;
                case 'neq': // not equals
                    conditions.push(`feature['${rule.property}'] !== ${quoteValue(rule.value)}`);
                    break;
                case 'lt': // less than
                    conditions.push(`feature['${rule.property}'] < ${quoteValue(rule.value)}`);
                    break;
                case 'gt': // greater than
                    conditions.push(`feature['${rule.property}'] > ${quoteValue(rule.value)}`);
                    break;
                case 'em': // is empty
                    conditions.push(`feature['${rule.property}'] == null`);
                    break;
                case 'nem': // is not empty
                    conditions.push(`feature['${rule.property}'] != null`);
                    break;
            }
        });

        if (conditions.length === 0) {
            return;
        }

        let filter = `function() { return ${conditions/*.map(c => `(${c})`)*/.join(' && ')}; }`;
        return filter;
    }

    function makePolygonStyleLayer({ tgStyleLayerName, style, styleIndex, tgDrawGroups, draw, xyzLayerName, xyz, xyzLayerIndex }) {
        const tgFillDrawGroupName = `${tgStyleLayerName}_${style.type}_${styleIndex}_fill`;
        tgDrawGroups.push({ layerName: tgStyleLayerName, drawGroupName: tgFillDrawGroupName });
        draw[tgFillDrawGroupName] = {
            visible: true,
            interactive: true,
            style: `${xyzLayerName}_polygons`,
            color: style.fill,
            order: style.zIndex + (xyz.layers.length - xyzLayerIndex) * tgLayerOrderMultiplier + tgLayerOrderBase,
        };

        // Polygon stroke
        const tgStrokeDrawGroupName = `${tgStyleLayerName}_${style.type}_${styleIndex}_stroke`;
        tgDrawGroups.push({ layerName: tgStyleLayerName, drawGroupName: tgStrokeDrawGroupName });
        draw[tgStrokeDrawGroupName] = {
            visible: true,
            interactive: true,
            style: `${xyzLayerName}_lines`,
            color: style.stroke,
            width: `${style.strokeWidth}px`,
            // TODO: cap, join, dash
            order: style.zIndex + (xyz.layers.length - xyzLayerIndex) * tgLayerOrderMultiplier + tgLayerOrderBase,
        };
    }

    function makeLineStyleLayer({ tgStyleLayerName, style, styleIndex, tgDrawGroups, draw, xyzLayerName, xyz, xyzLayerIndex }) {
        const tgStrokeDrawGroupName = `${tgStyleLayerName}_${style.type}_${styleIndex}_stroke`;
        tgDrawGroups.push({ layerName: tgStyleLayerName, drawGroupName: tgStrokeDrawGroupName });
        draw[tgStrokeDrawGroupName] = {
            visible: true,
            interactive: true,
            style: `${xyzLayerName}_lines`,
            color: style.stroke,
            width: `${style.strokeWidth}px`,
            // TODO: cap, join, dash
            // order: style.zIndex + (xyzLayerIndex + 1) * tgLayerOrderMultiplier,
            order: style.zIndex + (xyz.layers.length - xyzLayerIndex) * tgLayerOrderMultiplier + tgLayerOrderBase,
        };
    }

    function makeCircleStyleLayer({ tgStyleLayerName, style, styleIndex, tgDrawGroups, draw, xyzLayerName, xyz, xyzLayerIndex }) {
        const tgPointDrawGroupName = `${tgStyleLayerName}_${style.type}_${styleIndex}_point`;
        tgDrawGroups.push({ layerName: tgStyleLayerName, drawGroupName: tgPointDrawGroupName });
        draw[tgPointDrawGroupName] = {
            visible: true,
            interactive: true,
            collide: false,
            style: `${xyzLayerName}_points`,
            color: style.fill,
            size: `${style.radius * 2}px`,
            // size: [`${style.width}px`, `${style.height}px`],
            order: style.zIndex + (xyz.layers.length - xyzLayerIndex) * tgLayerOrderMultiplier + tgLayerOrderBase,
        };
        if (style.outline) {
            draw[tgPointDrawGroupName].outline = {
                color: style.outline.fill,
                width: `${style.outline.radius - style.radius}px`
            };
        }
    }

    function makeImageStyleLayer({ tgStyleLayerName, style, styleIndex, tgDrawGroups, draw, xyzLayerName, xyz, xyzLayerIndex }) {
        const tgPointDrawGroupName = `${tgStyleLayerName}_${style.type}_${styleIndex}_point`;
        tgDrawGroups.push({ layerName: tgStyleLayerName, drawGroupName: tgPointDrawGroupName });
        draw[tgPointDrawGroupName] = {
            visible: true,
            interactive: true,
            collide: false,
            style: `${xyzLayerName}_points`,
            size: [`${style.width}px`, `${style.height}px`],
            texture: style.src,
            order: style.zIndex + (xyz.layers.length - xyzLayerIndex) * tgLayerOrderMultiplier + tgLayerOrderBase,
        };
    }

    function makeTextStyleLayer({ tgStyleLayerName, style, styleIndex, tgDrawGroups, draw, xyzLayerName, xyz, xyzLayerIndex }) {
        const tgTextDrawGroupName = `${tgStyleLayerName}_${style.type}_${styleIndex}_text`;
        tgDrawGroups.push({ layerName: tgStyleLayerName, drawGroupName: tgTextDrawGroupName });
        draw[tgTextDrawGroupName] = {
            visible: true,
            interactive: true,
            collide: false,
            style: `${xyzLayerName}_text`,
            text_source: `function() { var properties = feature; return ${style.textRef}; }`,
            font: {
                fill: style.fill,
                family: 'Helvetica',
                // TODO family, style, size, offset
                stroke: {
                    color: style.stroke,
                    width: `${style.strokeWidth}px`
                }
            },
            // repeat_distance: '1000px',
            order: style.zIndex + (xyz.layers.length - xyzLayerIndex) * tgLayerOrderMultiplier + tgLayerOrderBase,
        };
    }

    // If a style group has two circle styles, mark them as combined
    // Tangram can represent htem as a single `points` draw group, with an outline
    function coalesceCircleStyles(styleGroup) {
        if (styleGroup.filter(s => s.type === 'Circle').length === 2) {
            let first = styleGroup.findIndex(s => s.type === 'Circle');
            if (first > -1) {
                let second = styleGroup.slice(first + 1).findIndex(s => s.type === 'Circle');
                if (second > -1) {
                    second += first + 1;
                    if (styleGroup[first].radius > styleGroup[second].radius) {
                        [first, second] = [second, first];
                    }
                    styleGroup[first].outline = styleGroup[second];
                    styleGroup[second].isOutline = true;
                }
            }
        }
    }

    // Utility functions

    function quoteValue(value) {
        // quote non-numeric values
        return (isNaN(Number(value)) ? `'${value}'` : Number(value));
    }

    function leftPad(value, digits) {
        var sign = Math.sign(value) === -1 ? '-' : '';
        return sign + new Array(digits).concat([Math.abs(value)]).join('0').slice(-digits);
    }

    function numDigits(value) {
        return (value + '').replace('.', '').length;
    }

    return xyzToTangram;

}));
