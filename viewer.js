(async () => {
    // Test XYZ project ids
    // daf86376-b159-4b9e-bee3-04aa6aca6a10 // school polys
    // 8ec36215-1d0c-4c63-8120-fad8770dd36c // lines/subways
    // 33c236e0-d0ef-4338-b0e0-5de3b97f4c0c // NYC transit
    // a2449f3f-e72a-4076-a927-7ac539a05b0e // points/flags
    // bdc2d760-a580-11e8-897b-3f13b99e70ae // Amsterdam
    // ac2b5bc0-a58b-11e8-897b-3f13b99e70ae // HERE offices
    // da5107a0-a56a-11e8-897b-3f13b99e70ae // SF parks/parklets

    // Get `project_id` query string parameter
    let xyzProjectId;
    const params = new URLSearchParams(document.location.search.slice(1));
    if (params.get('project_id')) {
        xyzProjectId = params.get('project_id');
    }
    else {
        document.getElementById('no-viz').style.display = 'block';
    }

    // Load XYZ studio viz JSON
    const xyzURL = `https://xyz.api.here.com/project-api/projects/${xyzProjectId}`;
    const xyzStyle = await fetch(xyzURL).then(r => {
        if (!r.ok) {
            // alert(`Couldn't load XYZ Studio project id ${xyzProjectId}!`);
            document.getElementById('no-viz').style.display = 'block';
            document.getElementById('no-viz').innerHTML =
                `Couldn't load XYZ Studio project id '${xyzProjectId}'!`;
            throw Error(`Couldn't load XYZ Studio project id ${xyzProjectId}!`);
        }
        return r.json();
    });

    // Convert to Tangram scene
    const tgScene = xyzToTangram(xyzStyle, { /*collide: true*/ });

    window.console.log('tangram scene', tgScene);

    // Create a Leaflet map
    const map = L.map('map', {
        maxZoom: 22,
        zoomControl: false,
        zoomSnap: 0,
        keyboard: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Default start position
    map.setView([40.70531887544228, -74.00976419448853], 11);

    let basemap = {
        import: [
            // 'https://www.nextzen.org/carto/refill-style/11/refill-style.zip',
            // 'https://www.nextzen.org/carto/refill-style/11/themes/label-5.zip',
            // 'https://www.nextzen.org/carto/refill-style/11/themes/no-texture.zip',

            // 'https://www.nextzen.org/carto/refill-style/refill-style.zip',
            // 'https://www.nextzen.org/carto/refill-style/themes/color-gray-gold.zip',
            // 'https://www.nextzen.org/carto/refill-style/themes/label-4.zip',
            // 'https://www.nextzen.org/carto/refill-style/11/themes/no-texture.zip',

            'https://www.nextzen.org/carto/walkabout-style/walkabout-style.zip',

            // 'https://sensescape.github.io/xyz-dots/scene.yaml',
        ]
    };

    // Create Tangram as a Leaflet layer
    const layer = Tangram.leafletLayer({
        scene: {
            ...basemap,
            global: { sdk_api_key: 'NaqqS33fTUmyQcvbuIUCKA' },
            ...tgScene
        },
        events: {
            // hover: e => featureSelection(e, 'hover'),
            click: e => featureSelection(e, 'click')
        },
        // introspection: true,
        // logLevel: 'debug'
    });

    layer.addTo(map);

    // Feature selection
    function featureSelection(event, type) {
        // console.log(event, type);
        const { feature, changed, pixel, leaflet_event } = event;

        // skip event if doesn't match expected type
        if ((showCardsOnHover && type === 'click') ||
            (!showCardsOnHover && type === 'hover')) {
            return;
        }

        // if (xyzMeta.publish_settings.display && !xyzMeta.publish_settings.display.cards) {
        //     return; // don't show if cards aren't enabled
        // }

        // Update and show card if feature changed
        if (feature) {
            if (changed) {
                // Find XYZ card info
                const xyzLayer = xyzMeta.layers.find(l => l.meta.title === feature.source_name);
                if (xyzLayer &&
                    xyzLayer.cards &&
                    xyzLayer.cards[0] &&
                    xyzLayer.cards[0].length > 0 &&
                    xyzLayer.cards[0][0] !== '__id') { // special default identifier, empty card (?)

                    const items = Array.from(xyzLayer.cards[0]); // copy array to not modify original

                    // first card item is title
                    const title = items.shift();
                    document.querySelector('.card .card-title').innerText = feature.properties[title];

                    // rest of the items are rows below
                    document.querySelector('.card .card-rows-container').innerHTML = buildCardRows(feature, items);

                    document.querySelector('.card').style.display = 'block';

                    // now update the sidebar content as well
                    document.querySelector('.card-sidebar .card-title').innerText = feature.properties[title];

                    // rest of the items are rows below
                    let separatorIndex;
                    if (xyzLayer.cards[1] && xyzLayer.cards[1].length > 0) {
                        separatorIndex = items.length;
                        items.push(...xyzLayer.cards[1]);
                    }

                    document.querySelector('.card-sidebar .card-rows-container').innerHTML = buildCardRows(feature, items, separatorIndex);
                }
                else {
                    document.querySelector('.card').style.display = 'none';
                }

                document.querySelector('.card').style.left = pixel.x + 'px';
                document.querySelector('.card').style.top = pixel.y + 'px';
            }
        }
        // Hide card if no feature to show, but not on mouse out events
        // (otherwise card gets hidden when user tries to house over it to click)
        else if (leaflet_event.type !== 'mouseout') {
            document.querySelector('.card').style.display = 'none';
        }
    }

    // build HTML for cards (either standalone/floating card, or fixed "more info" sidebar card)
    function buildCardRows (feature, items, separatorIndex = null) {
        return items.map((prop, index) => {
            return `
                <div class="card-row ${index === separatorIndex ? 'card-row-separator' : ''}">
                    <div class="card-row-title">
                        ${prop}
                    </div>
                    <div class="card-row-description">
                        ${feature.properties[prop] == null ? '' : feature.properties[prop]}
                    </div>
                </div>`;
        }).join('');
    }

    // Set document title and sidebar
    const xyzMeta = tgScene.meta.xyz;
    document.title = 'XYZ Studio - ' + xyzMeta.meta.name;

    const display = xyzMeta.publish_settings.display;
    if (display && display.name) {
        document.querySelector('.project-details > .name').innerText = xyzMeta.meta.name;
    }
    else {
        document.querySelector('.project-details > .name').style.display = 'none';
    }

    if (display && display.description) {
        document.querySelector('.project-details > .description').innerText = xyzMeta.meta.description;
    }
    else {
        document.querySelector('.project-details > .description').style.display = 'none';
    }

    // if (display && !display.cards) {
    //     document.querySelector('.project-details > .card-toggle-container').style.display = 'none';
    // }

    // show sidebar
    document.querySelector('.sidebar').style.display = 'flex';

    // Setup project box collapse/show
    // let project
    document.querySelector('.project-collapse-button').onclick = () => {
        if (document.querySelector('.project-details').style.display === 'none') {
            document.querySelector('.project-collapse-button').classList.remove('closed');
            document.querySelector('.project-details').style.display = 'block';
        }
        else {
            document.querySelector('.project-collapse-button').classList.add('closed');
            document.querySelector('.project-details').style.display = 'none';
        }
    };

    // Setup sidebar hover toggle/animation
    let showCardsOnHover = false;
    document.querySelector('.card-toggle-container').onclick = () => {
        if (Array.from(document.querySelector('.card-toggle').classList).indexOf('right') === -1) {
            document.querySelector('.card-toggle').classList.add('right');
            showCardsOnHover = true;
            layer.setSelectionEvents({
                hover: e => featureSelection(e, 'hover'),
                click: null
            });
        }
        else {
            document.querySelector('.card-toggle').classList.remove('right');
            showCardsOnHover = false;
            layer.setSelectionEvents({
                hover: null,
                click: e => featureSelection(e, 'click'),
            });
        }
    };

    // Setup card sidebar open link and close button
    document.querySelector('.card-more-link').onclick = () => {
        // enable full-height column for stacked module layout
        document.querySelector('.sidebar').style.height = 'calc(100vh - 40px)';
        document.querySelector('.card-sidebar').style.display = 'flex';
    };

    document.querySelector('.card-more-close-button').onclick = () => {
        // disable full-height column (blocks pointer events)
        document.querySelector('.sidebar').style.height = '';
        document.querySelector('.card-sidebar').style.display = 'none';
    };

    // Debug
    Object.assign(window, { xyzStyle, tgScene, layer, scene: layer.scene });
})();
