// Updates `Map state` parameter of control UI
var updateMapState = () => {
    console.log("inside updateMapState");
    let center = rts.map.getCenter(),
        zoom = rts.map.getZoom();

    let lat = center["lat"].toFixed(6),
        lng = center["lng"].toFixed(6);

    let mapPosition = `${lat},${lng},${zoom}`;

    let mapStateParams = [
        `resource=${rts.getResourceParam()}`,
        `format=${rts.getFormatParam()}`,
        rts.getQueryParamsString(),
    ];

    let mapStateParamsString = rts.filterEmptyStrings(mapStateParams).join("&");

    rts.mapState = `${mapPosition}/${mapStateParamsString}`;

    rts.preset = rts.presets[0];

    // rts.mapStateTextBox.updateDisplay();
    rts.presetsDropDown.updateDisplay();
};

// Positions Map and Control UI
var positionMapAndControlUI = () => {
    let mapElement = document.getElementById("map"),
        rtsControlUIElement = document.getElementById("rtsControlUI");

    if (rtsControlUIElement) {
        // if (window.location.href.endsWith("demo.html")) {
        if (mapElement) {
            // Updating `map` size depending on available view port
            let mapParentElement = mapElement.parentNode;
            mapElement.style.height = mapParentElement.offsetHeight + "px";
            mapElement.style.width = mapParentElement.offsetWidth + "px";
            rts.map.getViewPort().resize(); // Map resize to utilize available space

            // Positioning control UI w.r.t. map
            rtsControlUIElement.style.display = "block";

            let mapElementBounds = mapElement.getBoundingClientRect();
            rtsControlUIElement.style.left = mapElementBounds.left - 1 + "px";
            rtsControlUIElement.style.top = mapElementBounds.top - 1 + "px";

            setTimeout(function () {
                if (mapElement) {
                    mapElement.click();
                }
            }, 1);
        }

        // Setting light vs dark theme for Control UI based on availability of theme option button
        let lightThemeButtonElement =
                document.getElementsByClassName("ico-light-mode"),
            lightThemeCssElement = document.getElementById("lightTheme");
        if (lightThemeCssElement) {
            lightThemeCssElement.disabled =
                lightThemeButtonElement.length != 0 ? true : false;
        }
        // } else {
        //     rtsControlUIElement.style.display = "none";
        // }
    }
};

var scrollEventListener = () => {
    // let tocElement = document.getElementById("zDocsToc");
    // let tocElementTop = tocElement.getBoundingClientRect().top;
    // let lhsHeaderElementTopLimit = lhsHeaderElementTop + 15;

    let mapElement = document.getElementById("map"),
        rtsControlUIElement = document.getElementById("rtsControlUI");
    let mapElementTop = mapElement.getBoundingClientRect().top;

    let start = mapElement.offsetTop;
    let p = document.documentElement.scrollTop;

    mapElement.style.position = p > start ? "fixed" : "";
    mapElement.style.top = p > start ? "0px" : "";

    console.log(mapElement.style.top);

    // if (mapElementTop < lhsHeaderElementTopLimit) {
    //     mapElement.style.top = lhsHeaderElementTopLimit + "px";
    //     rtsControlUIElement.style.top = lhsHeaderElementTopLimit + "px";
    // }

    // mapElement.style.top = Math.max(0, 90 - mapElement.scrollTop);
    // rtsControlUIElement.style.top = Math.max(0, 90 - mapElement.scrollTop);

    // if (lhsHeaderElementTop == mapElementTop) {
    //     console.log(`header gone: ${mapElementTop}`);
    // } else {
    //     console.log(`header present: ${mapElementTop}`);
    // }

    // if (mapElementTop < tocElementTop) {
    //     mapElementTop.style.top = tocElementTop - 1 + "px";
    //     // } else {
    //     //     mapElement.style.position = "static";
    // }
};

var RasterTileService = class RasterTileService {
    constructor() {
        this.HERE_DOCUMENTATION_URL = "https://www.here.com/docs/bundle";
        this.RTS_DEVELOPER_GUIDE_URL = `${this.HERE_DOCUMENTATION_URL}/raster-tile-api-developer-guide/page/topics`;
        this.IDENTITY_AND_ACCESS_MANAGEMENT_DEVELOPER_GUIDE_URL = `${this.HERE_DOCUMENTATION_URL}/identity-and-access-management-developer-guide/page/topics`;

        this.SEARCH_INPUT_TYPE = {
            ZXY: "z/x/y",
            LAT_LNG_ZOOM: "lat,lng,zoom",
            LAT_LNG: "lat,lng",
            TILE_ID: "tileId",
        };

        this.SEARCH_INPUT_COLOR = {
            RED: "#ed4337",
            GREEN: "#1ed36f",
            WHITE: "#eee",
        };

        this.SEARCH_REGEX_CONFIG = {
            [this.SEARCH_INPUT_TYPE.ZXY]: "^([0-2]?[0-9])\\/(\\d+)\\/(\\d+)$",
            [this.SEARCH_INPUT_TYPE.LAT_LNG_ZOOM]:
                "^([-+]?\\d{1,3}[.]?\\d*),\\s*([-+]?\\d{1,3}[.]?\\d*),\\s*([0-2]?[0-9])$",
            [this.SEARCH_INPUT_TYPE.LAT_LNG]:
                "^([-+]?\\d{1,3}[.]?\\d*),\\s*([-+]?\\d{1,3}[.]?\\d*)$",
            [this.SEARCH_INPUT_TYPE.TILE_ID]: "^(\\d+)$",
        };

        this.config = {
            host: "https://maps.hereapi.com",
            apiKey: "bGg9an5tZmW9NgiHqiHj0m656POFOqEdImCDAj_v6kw", // Please, get your own RTS API key

            path: "v3",
            defaultResource: "base",
            projection: "mc",
            defaultFormat: "png8",
            defaultStyle: "explore.day",
            ppis: [100, 200, 400],
            defaultSize: 256,
            scales: [1, 2],

            emptyParamValue: "-none-",

            presets: {
                Berlin: { lat: 52.496, lng: 13.382 },
                Tokyo: { lat: 35.680589, lng: 139.767697 },
                Kyiv: { lat: 50.44708763, lng: 30.55505122 },
                Eindhoven: { lat: 51.44532355, lng: 5.51236077 },
                Rønde: { lat: 56.30525047, lng: 10.43803204 },
                Karlsruhe: { lat: 49.0087769, lng: 8.40030683 },
                Paris: { lat: 48.85645344, lng: 2.33003478 },
                London: { lat: 51.4859931, lng: -0.12985595 },
                NewYork: { lat: 40.69659123, lng: -73.97752134 },
                SanFrancisco: { lat: 37.81140009, lng: -122.330922 },
                HongKong: { lat: 22.28360498, lng: 114.17511092 },
                Dubai: { lat: 25.22444694, lng: 55.28394113 },
                Innsbruck: { lat: 47.23606053, lng: 11.35554248 },
                Manaslu: { lat: 28.48958022, lng: 84.5669569 },
            },

            defaultZoom: 11,

            engineType: H.Map.EngineType["HARP"],

            tooltips: {
                search: "Specify location details in the form of `lat,lng[,zoom]` or `z/x/y` or `tileId`",
                urlTemplate: "Shows RTS API URL template",
                mapState:
                    "State of the map which can be shared to load the map in corresponding state",
                setMapState:
                    "Specify map state to load the map in corresponding state",
                resource: "Select the type of tile",
                format: "Select the returned image format",
                lang: "Select the language of the map rendered",
                lang2: "Select the secondary language used in dual labeling",
                pview: "Select political view to render the map with boundaries based on international or local country views",
                style: "Select the style to use to render the map",
                ppi: "Select the relative size of labels and icons",
                size: "Select the image size in pixels",
                scale: "Select the scaling of the rendered tiles for high-resolution displays",
                apiKey: "Specify a key generated specifically to authenticate API requests",
                congestion_zones: "Display of congestion zones",
                environmental_zones: "Display of environmental zones",
                pois: "Display of points of interest",
                vehicle_restrictions:
                    "Display of road signs specific to trucks or other special vehicles",
                public_transit: "Display of public transit system",
                low_speed_zones: "Display of low speed zones",
            },

            infoUrls: {
                resource: `${this.RTS_DEVELOPER_GUIDE_URL}/examples/example-resource.html`,
                format: `${this.RTS_DEVELOPER_GUIDE_URL}/image-formats.html`,
                lang: `${this.RTS_DEVELOPER_GUIDE_URL}/languages.html`,
                lang2: `${this.RTS_DEVELOPER_GUIDE_URL}/languages.html`,
                pview: `${this.RTS_DEVELOPER_GUIDE_URL}/geopolitical-views.html`,
                style: `${this.RTS_DEVELOPER_GUIDE_URL}/styles.html`,
                ppi: `${this.RTS_DEVELOPER_GUIDE_URL}/examples/example-ppi.html`,
                size: `${this.RTS_DEVELOPER_GUIDE_URL}/examples/example-size.html`,
                scale: `${this.RTS_DEVELOPER_GUIDE_URL}/examples/example-resolution.html`,
                apiKey: `${this.IDENTITY_AND_ACCESS_MANAGEMENT_DEVELOPER_GUIDE_URL}/plat-using-apikeys.html`,
                congestion_zones: `${this.RTS_DEVELOPER_GUIDE_URL}/features.html#congestion-zones`,
                environmental_zones: `${this.RTS_DEVELOPER_GUIDE_URL}/features.html#environmental-zones`,
                pois: `${this.RTS_DEVELOPER_GUIDE_URL}/features.html#points-of-interest-pois`,
                vehicle_restrictions: `${this.RTS_DEVELOPER_GUIDE_URL}/features.html#vehicle-restrictions`,
                public_transit: `${this.RTS_DEVELOPER_GUIDE_URL}/features.html#public-transit-information`,
                low_speed_zones: `${this.RTS_DEVELOPER_GUIDE_URL}/features.html#lowspeed-zones`,
            },

            clientCodeHereMapsApiForJavaScript: `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8" />
                        <title>Client Code - HERE Maps API for JavaScript</title>
                        <script type="text/javascript" src="https://js.api.here.com/v3/3.1/mapsjs-core.js"></script>
                        <script type="text/javascript" src="https://js.api.here.com/v3/3.1/mapsjs-service.js"></script>
                        <script type="text/javascript" src="https://js.api.here.com/v3/3.1/mapsjs-mapevents.js"></script>
                        <script type="text/javascript" charset="utf-8" src="https://js.api.here.com/v3/3.1/mapsjs-ui.js" ></script>
                        <script type="text/javascript" src="https://js.api.here.com/v3/3.1/mapsjs-harp.js"></script>
                        <link rel="stylesheet" type="text/css" href="https://js.api.here.com/v3/3.1/mapsjs-ui.css" />

                        <style>
                            body {
                                width: 100%;
                                height: 100%;
                                position: absolute;
                                margin: 0px;
                                padding: 0px;
                                overflow: hidden;
                            }

                            #map {
                                position: absolute;
                                top: 0;
                                bottom: 0;
                                width: 100%;
                                height: 100%;
                            }
                        </style>
                    </head>

                    <body>
                        <div id="map"></div>

                        <script>
                            const engineType = H.Map.EngineType["HARP"];

                            // Initiate and authenticate your connection to the HERE platform
                            const platform = new H.service.Platform({
                                apikey: "%apiKey%",
                            });

                            // Create an instance of the HERE Raster Tile Service
                            const rasterTileService = platform.getRasterTileService({
                                resource: "%resource%",
                                format: "%format%",
                                queryParams: %queryParams%,
                            });

                            // Retrieve and display the map tiles by creating a Raster Tile Provider object
                            const rasterTileProvider = new H.service.rasterTile.Provider(
                                rasterTileService,
                                {
                                    tileSize: %tileSize%,
                                    engineType: engineType,
                                }
                            );

                            // Create a tile layer object by using the Raster Tile Provider
                            const rasterTileLayer = new H.map.layer.TileLayer(
                                rasterTileProvider
                            );

                            // Instantiate (and display) a map:
                            const map = new H.Map(
                                document.getElementById("map"),
                                rasterTileLayer,
                                {
                                    zoom: %zoom%,
                                    center: %center%,
                                    engineType: engineType,
                                }
                            );

                            // MapEvents enables the event system.
                            // The behavior variable implements default interactions for pan/zoom (also on touch devices).
                            const behavior = new H.mapevents.Behavior(
                                new H.mapevents.MapEvents(map)
                            );

                            // Enable dynamic resizing of the map, based on the current size of the enclosing container
                            window.addEventListener("resize", () => map.getViewPort().resize());

                            // Create zoom control UI
                            const ui = new H.ui.UI(map, {
                                zoom: {
                                    fractionalZoom: false,
                                    alignment: H.ui.LayoutAlignment.RIGHT_BOTTOM,
                                },
                            });
                        </script>
                    </body>
                </html>
            `,

            clientCodeLeaflet: `
                <!DOCTYPE html>
                <html lang="en">

                <head>
                <meta charset="UTF-8" />

                <title>Client Code - HERE Map with Leaflet</title>

                <!-- Link to Leaflet CSS for styling the map -->
                <link rel="stylesheet" href="http://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

                <style>
                    body {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    margin: 0px;
                    }
                </style>
                </head>

                <body onload="initialize_map()">
                <!-- Div element to contain the map. -->
                <div id="my_map_div" style="width: 100%; height: 100%"></div>

                <!-- Link to Leaflet JavaScript library -->
                <script src="http://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                <script>
                    function initialize_map() {
                    // Center map at specific location and zoom level
                    let map = L.map("my_map_div").setView([%latLng%], %zoom%);

                    // URL template for HERE map tiles
                    // {z} - zoom level, {x} - tile x coordinate, {y} - tile y coordinate
                    let url =
                        "https://maps.hereapi.com/v3/%resource%/mc/{z}/{x}/{y}/%format%";

                    // Append additional query parameters
                    url += "%queryParamsString%";
                    L.tileLayer(url, {
                        maxZoom: 18,
                        attribution: "&copy;%year% HERE Technologies",
                    }).addTo(map);
                    }
                </script>
                </body>

                </html>
            `,
        };

        this.gui = null;
        this.map = null;

        this.host = this.config.host;
        this.apiKey = this.config.apiKey;

        this.path = this.config.path;

        this.resources = [];
        this.resource = this.config.defaultResource;
        this.zoomLevelMin = "";
        this.zoomLevelMax = "";
        this.formats = [];
        this.format = this.config.defaultFormat;

        this.langs = [];
        this.lang = "";
        this.lang2s = [];
        this.lang2 = "";
        this.pviews = [];
        this.pview = "";
        this.styles = [];
        this.style = "";

        this.ppis = [this.config.emptyParamValue].concat(this.config.ppis);
        this.ppi = this.ppis[0];

        this.styleFeatureMapping = null;
        this.featuresSelected = {};
        this.featureControllers = [];

        this.sizes = [];
        this.size = "";

        this.scales = [this.config.emptyParamValue].concat(this.config.scales);
        this.scale = this.scales[0];

        this.presets = ["Select a value"].concat(
            Object.keys(this.config.presets)
        );
        this.preset = this.presets[1];
        this.center = this.config.presets[this.preset];
        this.zoom = this.config.defaultZoom;

        this.hiRes =
            window.devicePixelRatio && window.devicePixelRatio >= 2
                ? true
                : false;

        this.engineType = this.config.engineType;

        this.queryParamControllers = [];
        this.queryParams = [
            "lang",
            "lang2",
            "pview",
            "style",
            "ppi",
            "size",
            "scale",
        ];

        this.locationFolder =
            this.presetsDropDown =
            this.searchTextBox =
            this.searchTextBoxDomElement =
            this.urlTemplateTextBox =
            this.urlTemplateTextBoxDomElement =
            // this.mapStateTextBox =
            // this.mapStateTextBoxDomElement =
            this.setMapStateTextBox =
            this.pathParamsFolder =
            this.resourceDropdown =
            this.formatDropdown =
            this.queryParamsFolder =
            this.langDropdown =
            this.lang2Dropdown =
            this.pviewDropdown =
            this.styleDropdown =
            this.ppiDropdown =
            this.sizeDropdown =
            this.scaleDropdown =
            this.apiKeyTextBox =
            this.linksFolder =
            this.featuresFolder =
            this.featuresLink =
            this.searchUI =
            this.exportFolder =
                null;

        this.search = this.urlTemplate = this.mapState = this.setMapState = "";

        this.mapElement = document.getElementById("map");
    }

    showMetadataEndpoint = (url) => {
        window.open(`${url}`, "_blank");
    };

    info() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(
                this.host,
                this.path,
                "info",
                this.buildParamsString(this.apiKey)
            )
        );
    }

    politicalViews() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(
                this.host,
                this.path,
                "politicalViews",
                this.buildParamsString(this.apiKey)
            )
        );
    }

    features() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(
                this.host,
                this.path,
                "features",
                this.buildParamsString(this.apiKey)
            )
        );
    }

    languages() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(
                this.host,
                this.path,
                "languages",
                this.buildParamsString(this.apiKey)
            )
        );
    }

    copyright() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(
                this.host,
                this.path,
                "copyright",
                this.buildParamsString(this.apiKey)
            )
        );
    }

    openapi() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(this.host, this.path, "openapi")
        );
    }

    version() {
        this.showMetadataEndpoint(
            this.buildMetadataURI(
                this.host,
                this.path,
                "version",
                this.buildParamsString(this.apiKey)
            )
        );
    }

    copyParameters() {
        console.log("inside copyParameters()...");
        navigator.clipboard.writeText(this.mapState);
    }

    resetParameters() {
        // this.gui.reset();
        this.resourceDropdown.reset();
        this.formatDropdown.reset();
        // if (this.resourceDropdown.isModified()) {
        //     this.resourceDropdown.setValue(this.config.defaultResource);
        // }

        // if (this.formatDropdown.isModified()) {
        //     this.formatDropdown.setValue(this.config.defaultFormat);
        // }

        this.queryParamControllers.forEach((queryParamController) => {
            queryParamController.reset();
            // if (queryParamController.isModified()) {
            //     queryParamController.setValue(this.config.emptyParamValue);
            // }
        });

        this.featureControllers.forEach((featureController) => {
            // featureController.reset();
            if (featureController.getValue() != this.config.emptyParamValue) {
                featureController.setValue(this.config.emptyParamValue);
            }
        });

        // if (this.apiKeyTextBox.isModified()) {
        if (this.apiKeyTextBox.getValue() != this.config.apiKey) {
            this.apiKeyTextBox.setValue(this.config.apiKey);
            // this.updateMap();
        }
        // }
    }

    fetchObject = async (uri) => {
        return fetch(uri).then((response) => {
            if (!response.ok) {
                throw new Error(response.status + " - " + response.statusText);
            } else {
                return response.json();
            }
        });
    };

    buildMetadataURI = (hostURI, path, endpoint, params) => {
        params ? "" : (params = "");
        return `${hostURI}/${path}/${endpoint}${params}`;
    };

    buildParamsString = (apiKey) => {
        return apiKey ? `?apiKey=${apiKey}` : "";
    };

    setMapConfig = async () => {
        let params = this.buildParamsString(this.apiKey);

        let infoObjPromise,
            politicalViewsObjPromise,
            languagesObjPromise,
            featuresObjPromise = null;

        // Fetch data from endpoints
        infoObjPromise = this.fetchObject(
            this.buildMetadataURI(this.host, this.path, "info", params)
        );

        languagesObjPromise = this.fetchObject(
            this.buildMetadataURI(this.host, this.path, "languages", params)
        );
        politicalViewsObjPromise = this.fetchObject(
            this.buildMetadataURI(
                this.host,
                this.path,
                "politicalViews",
                params
            )
        );
        featuresObjPromise = this.fetchObject(
            this.buildMetadataURI(this.host, this.path, "features", params)
        );

        // Update control parameters only if data is successfully fetched from all endpoints
        return Promise.all([
            infoObjPromise,
            languagesObjPromise,
            politicalViewsObjPromise,
            featuresObjPromise,
        ])
            .then((metadataObjects) => {
                let infoObj = metadataObjects[0],
                    languagesObj = metadataObjects[1],
                    politicalViewsObj = metadataObjects[2],
                    featuresObj = metadataObjects[3],
                    resources,
                    zoomLevelMin,
                    zoomLevelMax,
                    formats,
                    langs,
                    lang2s,
                    pviews,
                    styles,
                    styleFeatureMapping,
                    sizes = null;

                langs = languagesObj[this.config.defaultResource];
                lang2s = languagesObj[this.config.defaultResource];
                pviews = politicalViewsObj[this.config.defaultResource];

                resources = infoObj.resources;
                zoomLevelMin = infoObj.zoomLevels["min"];
                zoomLevelMax = infoObj.zoomLevels["max"];
                formats = infoObj.imageFormats;
                styles = infoObj.styles;
                styleFeatureMapping = featuresObj.features;
                sizes = infoObj.imageSizes;

                // Insert empty string to optional params, so they are not passed by default
                styles = [this.config.emptyParamValue].concat(styles);
                sizes = [this.config.emptyParamValue].concat(sizes);
                pviews = [this.config.emptyParamValue].concat(pviews);
                langs = [this.config.emptyParamValue].concat(langs);
                lang2s = [this.config.emptyParamValue].concat(lang2s);

                // Set values received from endpoints
                this.resources = resources;
                this.resource =
                    this.config.defaultResource &&
                    resources.includes(this.config.defaultResource)
                        ? this.config.defaultResource
                        : resources[0];
                this.zoomLevelMin = zoomLevelMin;
                this.zoomLevelMax = zoomLevelMax;
                this.formats = formats;
                this.format =
                    this.config.defaultFormat &&
                    formats.includes(this.config.defaultFormat)
                        ? this.config.defaultFormat
                        : formats[0];

                this.langs = langs;
                this.lang = langs[0];
                this.lang2s = lang2s;
                this.lang2 = lang2s[0];
                this.pviews = pviews;
                this.pview = pviews[0];
                this.styles = styles;
                this.style = styles[0];
                this.sizes = sizes;
                this.size = sizes[0];

                this.styleFeatureMapping = styleFeatureMapping;
            })
            .catch((error) => {
                console.warn(
                    `Error while initializing/updating ui state: ${error.stack}`
                );
            });
    };

    getResourceParam() {
        return this.resource;
    }

    getFormatParam() {
        return this.format;
    }

    getLangParam() {
        return this.lang && this.lang != this.config.emptyParamValue
            ? `lang=${this.lang}`
            : "";
    }

    getLang2Param() {
        return this.lang2 && this.lang2 != this.config.emptyParamValue
            ? `lang2=${this.lang2}`
            : "";
    }

    getPviewParam() {
        return this.pview && this.pview != this.config.emptyParamValue
            ? `pview=${this.pview}`
            : "";
    }

    getStyleParam() {
        return this.style && this.style != this.config.emptyParamValue
            ? `style=${this.style}`
            : "";
    }

    getPpiParam() {
        return this.ppi && this.ppi != this.config.emptyParamValue
            ? `ppi=${this.ppi}`
            : "";
    }

    getFeaturesParam() {
        let style =
            this.style == this.config.emptyParamValue
                ? this.config.defaultStyle
                : this.style;

        if (style in this.styleFeatureMapping) {
            let featuresParams = [];

            // Traverse through features and form `features` param string
            for (let key of Object.keys(this.featuresSelected)) {
                if (this.featuresSelected[key] != this.config.emptyParamValue) {
                    featuresParams.push(key + ":" + this.featuresSelected[key]);
                }
            }

            let featuresParamString =
                this.filterEmptyStrings(featuresParams).join(",");
            return featuresParamString === ""
                ? ""
                : `features=${featuresParamString}`;
        }
    }

    getSizeParam() {
        return this.size && this.size != this.config.emptyParamValue
            ? `size=${this.size}`
            : "";
    }

    getScaleParam() {
        return this.scale && this.scale != this.config.emptyParamValue
            ? `scale=${this.scale}`
            : "";
    }

    getApiKeyParam(apiKey) {
        return apiKey ? `apiKey=${apiKey}` : "apiKey=";
    }

    filterEmptyStrings(params) {
        return params.filter(function (e) {
            return e;
        });
    }

    getQueryParamsString() {
        let queryParams = [
            this.getLangParam(),
            this.getLang2Param(),
            this.getPviewParam(),
            this.getStyleParam(),
            this.getPpiParam(),
            this.getFeaturesParam(),
            this.getSizeParam(),
            this.getScaleParam(),
        ];
        return this.filterEmptyStrings(queryParams).join("&");
    }

    // Returns query parameter string to generate Raster Tile Layer
    getQueryParamsMapping() {
        let queryParamsMapping = {};

        let queryParams = [
            this.getLangParam(),
            this.getLang2Param(),
            this.getPviewParam(),
            this.getStyleParam(),
            this.getPpiParam(),
            this.getFeaturesParam(),
            this.getScaleParam(),
        ];
        queryParams.forEach((queryParam) => {
            if (queryParam) {
                let queryParamDetails = queryParam.split("=");
                queryParamsMapping[queryParamDetails[0]] = queryParamDetails[1];
            }
        });
        return queryParamsMapping;
    }

    addFeatureControls = () => {
        // Remove features folder
        if (this.featuresFolder) {
            this.featuresLink.destroy();
            this.featuresLink = null;
            this.queryParamsFolder.removeFolder(this.featuresFolder);
            this.featuresFolder = null;
            this.featureControllers = [];
        }

        this.featuresLink = this.linksFolder
            .add(this, "features")
            .name("features");

        this.featuresFolder = this.queryParamsFolder.addFolder("Features");
        this.featuresFolder.close();

        let style =
            this.style == this.config.emptyParamValue
                ? this.config.defaultStyle
                : this.style;
        if (style in this.styleFeatureMapping) {
            let features = JSON.parse(
                JSON.stringify(this.styleFeatureMapping[style])
            );

            for (let feature of features) {
                let featureName = feature.name,
                    featureModes = feature.modes;

                // Insert empty string so optional param `features` is not passed by default
                featureModes.unshift(this.config.emptyParamValue);

                // Set feature value if feature is selected already
                let featureValue =
                    featureName in this.featuresSelected &&
                    featureModes.includes(this.featuresSelected[featureName])
                        ? this.featuresSelected[featureName]
                        : this.config.emptyParamValue;

                // Add controller for each feature
                let featureController = this.featuresFolder
                    .add(feature, "name", featureModes)
                    .name(featureName)
                    .setValue(featureValue);
                // Add tooltip and info icon
                this.addToolTip(featureController);
                this.addInfoIcon(featureController);

                featureController.onChange((val) => {
                    this.featuresSelected[featureName] = val;
                    this.updateMap();
                });
                this.featureControllers.push(featureController);
            }
        }
    };

    createControlUI() {
        // Remove control UI if exists already. This resolves the issue of duplicate control UI when user revisits the Demo Tool page.
        let rtsControlUIElement = document.getElementById("rtsControlUI");
        if (rtsControlUIElement) {
            rtsControlUIElement.parentNode.remove();
        }

        this.gui = new GUI({ width: 350 });
        this.gui.domElement.id = "rtsControlUI";
        this.gui.width = 350;

        this.locationFolder = this.gui.addFolder("Location");
        this.locationFolder.open();

        this.presetsDropDown = this.locationFolder
            .add(this, "preset", this.presets)
            .name("Presets")
            .onChange((val) => {
                this.map.setCenter(this.config.presets[val]);
            });

        this.searchTextBox = this.locationFolder
            .add(this, "search")
            .name("Search")
            .onFinishChange((val) => {
                if (val) {
                    this.matchInputAndUpdate(val);
                }
            })
            .onChange((val) => {
                // reset input color on change
                this.searchTextBoxDomElement.style.color =
                    this.SEARCH_INPUT_COLOR.RED;
            });
        this.searchTextBoxDomElement =
            this.searchTextBox.domElement.querySelector("input");
        this.searchTextBoxDomElement.placeholder =
            "lat,lng[,zoom] or z/x/y or tileId";

        this.locationFolder.add(this, "copyParameters").name("Copy parameters");
        // this.mapStateTextBoxDomElement = this.mapStateTextBox.domElement;
        // this.mapStateTextBoxDomElement.firstChild.disabled = true;
        // this.mapStateTextBoxDomElement.firstChild.style.color = "#b6681e";
        // this.addCopyToClipboardIcon(this.mapStateTextBoxDomElement, "mapState");

        this.setMapStateTextBox = this.locationFolder
            .add(this, "setMapState")
            .name("Set map state")
            .onFinishChange((val) => {
                this.updateMap(val);
            });

        this.locationFolder
            .add(this, "resetParameters")
            .name("Reset parameters");

        this.exportFolder = this.gui.addFolder("Export");

        this.urlTemplateTextBox = this.exportFolder
            .add(this, "urlTemplate")
            .name("URL template");
        this.urlTemplateTextBoxDomElement = this.urlTemplateTextBox.domElement;
        this.urlTemplateTextBoxDomElement.firstChild.disabled = true;
        this.urlTemplateTextBoxDomElement.firstChild.style.color = "#b6681e";
        this.addCopyToClipboardIcon(
            this.urlTemplateTextBoxDomElement,
            "urlTemplate"
        );

        this.exportFolder
            .add(this, "exportClientCodeHereMapsApiForJavaScript")
            .name("Client Code - HERE Maps API for JavaScript");
        this.exportFolder
            .add(this, "exportClientCodeLeaflet")
            .name("Client Code - Leaflet");

        this.pathParamsFolder = this.gui.addFolder("Path parameters");
        this.pathParamsFolder.open();

        this.resourceDropdown = this.pathParamsFolder
            .add(this, "resource", this.resources)
            .onChange((val) => {
                this.updateMap();
            });

        this.formatDropdown = this.pathParamsFolder
            .add(this, "format", this.formats)
            .onChange((val) => {
                this.updateMap();
            });

        this.queryParamsFolder = this.gui.addFolder("Query parameters");
        this.queryParamsFolder.open();

        this.langDropdown = this.queryParamsFolder
            .add(this, "lang", this.langs)
            .onChange((val) => {
                this.updateMap();
            });

        this.lang2Dropdown = this.queryParamsFolder
            .add(this, "lang2", this.langs)
            .onChange((val) => {
                this.updateMap();
            });

        this.pviewDropdown = this.queryParamsFolder
            .add(this, "pview", this.pviews)
            .onChange((val) => {
                this.updateMap();
            });

        this.styleDropdown = this.queryParamsFolder
            .add(this, "style", this.styles)
            .onChange((val) => {
                this.updateMap();
                this.addFeatureControls();
            });

        this.ppiDropdown = this.queryParamsFolder
            .add(this, "ppi", this.ppis)
            .onChange((val) => {
                this.updateMap();
            });

        this.sizeDropdown = this.queryParamsFolder
            .add(this, "size", this.sizes)
            .onChange((val) => {
                this.updateMap();
            });

        this.scaleDropdown = this.queryParamsFolder
            .add(this, "scale", this.scales)
            .onChange((val) => {
                this.updateMap();
            });

        this.apiKeyTextBox = this.queryParamsFolder
            .add(this, "apiKey")
            .onFinishChange((val) => {
                this.updateMap();
            });

        this.queryParamControllers = [
            this.langDropdown,
            this.lang2Dropdown,
            this.pviewDropdown,
            this.styleDropdown,
            this.ppiDropdown,
            this.sizeDropdown,
            this.scaleDropdown,
        ];

        this.linksFolder = this.gui.addFolder("Metadata endpoints");
        this.linksFolder.close();

        this.linksFolder.add(this, "info");
        this.linksFolder.add(this, "politicalViews");
        this.linksFolder.add(this, "languages");
        this.linksFolder.add(this, "copyright");
        this.linksFolder.add(this, "openapi");
        this.linksFolder.add(this, "version");

        this.addFeatureControls();

        this.addToolTipsAndInfoIcons();

        document.addEventListener("click", positionMapAndControlUI);

        // Handling Zoomin Light vs Dark Theme
        let lightThemeCssElement = document.getElementById("lightTheme");

        // Event listener to disable light theme
        document.addEventListener("__darkreader__cleanUp", function () {
            if (lightThemeCssElement) {
                lightThemeCssElement.disabled = false;
            }
        });

        // Event listener to enable light theme
        document.addEventListener(
            "__darkreader__inlineScriptsAllowed",
            function () {
                if (lightThemeCssElement) {
                    lightThemeCssElement.disabled = true;
                }
            }
        );
    }

    addCopyToClipboardIcon(parentElement, param) {
        // console.log(parentElement.querySelectorAll(".name")[0]);
        let paramLabelElement = parentElement.querySelectorAll(".name")[0];

        let copyIconElement = document.createElement("a");
        copyIconElement.classList.add("copyToClipboard");
        copyIconElement.innerHTML = " &#x2398;";
        paramLabelElement.appendChild(copyIconElement);

        copyIconElement.addEventListener("click", () => {
            navigator.clipboard.writeText(rts[param]);
        });
    }

    addInfoIcon(controller) {
        let controllerLabelElement =
            controller.domElement.querySelectorAll(".name")[0];
        let label = controllerLabelElement.textContent;

        let infoIconElement = document.createElement("a");
        infoIconElement.setAttribute("href", this.config.infoUrls[label]);
        infoIconElement.setAttribute("target", "_blank");
        infoIconElement.classList.add("info");
        infoIconElement.innerHTML = " &#9432;";

        controllerLabelElement.appendChild(infoIconElement);
    }

    addToolTip(controller) {
        let controllerLabelElement =
            controller.domElement.querySelectorAll(".name")[0];

        // Remove unicode characters (`Copy to clipboard` icon)
        let labelTextContent = controllerLabelElement.textContent.replace(
            /[^\x00-\x7F]/g,
            ""
        );

        // If label text includes space, convert label text to camelCase to get the tooltip value from `config`
        if (labelTextContent.includes(" ")) {
            labelTextContent = labelTextContent
                .toLowerCase()
                .split(" ")
                .reduce((s, c) => s + (c.charAt(0).toUpperCase() + c.slice(1)));
        } else {
            labelTextContent =
                labelTextContent.charAt(0).toLowerCase() +
                labelTextContent.slice(1);
        }

        controllerLabelElement.setAttribute(
            "data-title",
            this.config.tooltips[labelTextContent]
        );
    }

    addToolTipsAndInfoIcons() {
        // Location folder
        this.addToolTip(this.searchTextBox);
        // this.addToolTip(this.mapStateTextBox);
        this.addToolTip(this.setMapStateTextBox);

        // Path parameters folder
        this.addToolTip(this.resourceDropdown);
        this.addInfoIcon(this.resourceDropdown);

        this.addToolTip(this.formatDropdown);
        this.addInfoIcon(this.formatDropdown);

        // Query parameters folder
        this.queryParamControllers.forEach((queryParamController) => {
            this.addToolTip(queryParamController);
            this.addInfoIcon(queryParamController);
        });

        this.addToolTip(this.apiKeyTextBox);
        this.addInfoIcon(this.apiKeyTextBox);

        // Export folder
        this.addToolTip(this.urlTemplateTextBox);
    }

    // Updates map as per set parameters
    updateMap(mapState = "") {
        if (mapState) {
            // If map state is passed through `Set map state` parameter of control UI, set the map parameters.
            let mapStateDetails = mapState.split("/");
            let mapPosition = mapStateDetails[0].split(","),
                mapStateParams = mapStateDetails[1].split("&");

            let lat = Number(mapPosition[0]),
                lng = Number(mapPosition[1]);
            let zoom = Number(mapPosition[2]),
                center = { lat: lat, lng: lng };

            this.map.setZoom(zoom);
            this.map.setCenter(center);

            this["resource"] = mapStateParams[0].split("=")[1];
            this["format"] = mapStateParams[1].split("=")[1];

            // Set default value of query and feature parameters
            let queryParamFlag = false;
            for (let key of Object.keys(this)) {
                for (let queryParam of this.queryParams) {
                    if (key == queryParam) {
                        this[queryParam] = this.config.emptyParamValue;
                        queryParamFlag = true;
                        break;
                    }
                }

                if (!queryParamFlag) {
                    for (let featureController of this.featureControllers) {
                        featureController.setValue(this.config.emptyParamValue);
                    }
                }
            }

            // Set value of query and feature params as per `setMapState` value provided
            for (let i = 2; i < mapStateParams.length; i++) {
                let paramDetails = mapStateParams[i].split("=");
                let paramName = paramDetails[0],
                    paramValue = paramDetails[1];

                if (paramName == "features") {
                    let features = paramValue.split(",");

                    features.forEach((feature) => {
                        let featureDetails = feature.split(":");
                        let featureName = featureDetails[0],
                            modeValue = featureDetails[1];

                        // For each feature dropdown, check if feature name matches.
                        // If yes, set the value of corresponding dropdown.
                        this.featureControllers.forEach((featureController) => {
                            if (featureController.initialValue == featureName) {
                                featureController.setValue(modeValue);
                            }
                        });
                    });
                } else {
                    this[paramName] = paramValue;
                }

                if (paramName == "style") {
                    this.addFeatureControls(); // To update feature controls as per style
                }
            }
        }

        this.map.setBaseLayer(this.getRasterTileLayer());

        this.updateUrlTemplate();
        updateMapState();

        // this.gui.updateDisplay(); // Refresh controller UI
    }

    buildMapUI = (map) => {
        try {
            new H.ui.UI(map, {
                zoom: {
                    fractionalZoom: false,
                    alignment: H.ui.LayoutAlignment.RIGHT_BOTTOM,
                },
            });
        } catch (error) {
            console.warn("Error attempting to build map UI: " + error);
        }
    };

    getRasterTileLayer() {
        let tileSize =
            this.size == this.config.emptyParamValue
                ? this.config.defaultSize
                : parseInt(this.size);

        let platform = new H.service.Platform({
            apikey: this.apiKey,
        });

        let rasterTileService = platform.getRasterTileService({
            resource: this.getResourceParam(),
            format: this.getFormatParam(),
            queryParams: this.getQueryParamsMapping(),
        });

        let rasterTileProvider = new H.service.rasterTile.Provider(
            rasterTileService,
            {
                tileSize: tileSize,
                engineType: this.engineType,
            }
        );

        let rasterTileLayer = new H.map.layer.TileLayer(rasterTileProvider);
        return rasterTileLayer;
    }

    createMap() {
        // Dispose old map if exists
        this.map && this.map.dispose();

        let rasterTileLayer = this.getRasterTileLayer();
        this.map = new H.Map(this.mapElement, rasterTileLayer, {
            zoom: this.zoom,
            center: this.center,
            engineType: this.engineType,
        });

        // MapEvents enables the event system.
        // The behavior variable implements default interactions for pan/zoom (also on touch devices).
        let behavior = new H.mapevents.Behavior(
            new H.mapevents.MapEvents(this.map)
        );

        // Enable dynamic resizing of the map, based on the current size of the enclosing container
        window.addEventListener("resize", () =>
            this.map.getViewPort().resize()
        );

        // Create zoom control UI
        this.buildMapUI(this.map);

        // Update map state
        this.map.addEventListener("mapviewchangeend", updateMapState);

        window.addEventListener("scroll", scrollEventListener);
    }

    buildQueryParamsString(apiKey) {
        let queryParamsString = this.getQueryParamsString(),
            apiKeyParam = this.getApiKeyParam(apiKey);

        return queryParamsString
            ? `?${queryParamsString}&${apiKeyParam}`
            : `?${apiKeyParam}`;
    }

    updateUrlTemplate() {
        let pathParamString = `/${
            this.config.path
        }/${this.getResourceParam()}/${
            this.config.projection
        }/{z}/{x}/{y}/${this.getFormatParam()}`;

        let apiKeyTemplate = "{API_KEY}";
        let queryParamsString = this.buildQueryParamsString(apiKeyTemplate);

        this.urlTemplate = `${pathParamString}${queryParamsString}`;
        this.urlTemplateTextBox.updateDisplay();
    }

    downloadClientCodeFile(template, templateValueMapping, htmlFile) {
        let text = template.trim().replace(/%\w+%/g, function (all) {
            return templateValueMapping[all] || all;
        });
        this.downloadFile(htmlFile, text);
    }

    exportClientCodeHereMapsApiForJavaScript() {
        let tileSize =
                this.size == this.config.emptyParamValue
                    ? this.config.defaultSize
                    : parseInt(this.size),
            apiKey =
                this.apiKey == this.config.apiKey // If API key is same as default API key,
                    ? "{YOUR_API_KEY}" // Using API key template (to avoid unnecessary default API key logs).
                    : this.apiKey; // Else, using user-defined API key.

        let templateValueMapping = {
            "%resource%": this.getResourceParam(),
            "%format%": this.getFormatParam(),
            "%center%": JSON.stringify(this.map.getCenter()),
            "%zoom%": this.map.getZoom(),
            "%tileSize%": tileSize,
            "%queryParams%": JSON.stringify(this.getQueryParamsMapping()),
            "%apiKey%": apiKey,
        };

        this.downloadClientCodeFile(
            this.config.clientCodeHereMapsApiForJavaScript,
            templateValueMapping,
            "rts_here_maps_api_for_js.html"
        );
    }

    exportClientCodeLeaflet() {
        let center = this.map.getCenter();
        let latLng = [center["lat"].toFixed(6), center["lng"].toFixed(6)],
            apiKey =
                this.apiKey == this.config.apiKey // If API key is same as default API key,
                    ? "{YOUR_API_KEY}" // Using API key template (to avoid unnecessary default API key logs).
                    : this.apiKey; // Else, using user-defined API key.
        let queryParamsString = this.buildQueryParamsString(apiKey);

        let templateValueMapping = {
            "%latLng%": latLng,
            "%zoom%": this.map.getZoom(),
            "%resource%": this.getResourceParam(),
            "%format%": this.getFormatParam(),
            "%queryParamsString%": queryParamsString,
            "%year%": new Date().getFullYear(),
        };

        this.downloadClientCodeFile(
            this.config.clientCodeLeaflet,
            templateValueMapping,
            "rts_leaflet.html"
        );
    }

    downloadFile(fileName, text) {
        let element = document.createElement("a");
        element.setAttribute(
            "href",
            "data:text/plain;charset=utf-8," + encodeURIComponent(text)
        );
        element.setAttribute("download", fileName);

        element.style.display = "none";
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    // Calculates the zoom's addend based on map's pixelRatio and base layer's current tile size
    getZoomAddend = (pixelRatio, tileSize) => {
        let defaultTileSize = pixelRatio >= 1.5 ? 512 : 256,
            zoomAddend = Math.log2(defaultTileSize) - Math.log2(tileSize);

        return zoomAddend;
    };

    // Calculates x,y,z tile keys based on quadKey.
    quadKeyToXyz = (quadKey) => {
        let x = 0,
            y = 0,
            quadKeyArr = quadKey.toString().split(""),
            z = quadKey.length;

        for (let i = z; i > 0; i--) {
            let mask = 1 << (i - 1);
            let q = +quadKey[z - i];
            if (q === 1) x |= mask;
            if (q === 2) y |= mask;
            if (q === 3) {
                x |= mask;
                y |= mask;
            }
        }

        return { x, y, z };
    };

    // Calculates geo point based on x,y,z tile keys. It uses maps API's internal method `H.geo.mercator.xyToGeo`
    xyzToGeoPoint = (x, y, z) => {
        let size = Math.pow(2, z);
        return H.geo.mercator.xyToGeo((x + 0.5) / size, (y + 0.5) / size);
    };

    // Calculates LookAt {position, zoom} based on x,y,z tile keys
    xyzToLookAt = (x, y, z, pixelRatio, tileSize) => {
        let geo = this.xyzToGeoPoint(x, y, z),
            zoomAddend = this.getZoomAddend(pixelRatio, tileSize);

        return {
            position: geo,
            zoom: z - zoomAddend,
        };
    };

    // Calculates LookAt {position, zoom} based on tile ID
    tileIdToLookAt = (tileId, pixelRatio, tileSize) => {
        let quadKey = tileId.toString(4).slice(1),
            { x, y, z } = this.quadKeyToXyz(quadKey),
            geo = this.xyzToGeoPoint(x, y, z);

        z = z - this.getZoomAddend(pixelRatio, tileSize);

        return {
            position: geo,
            zoom: z,
        };
    };

    // This function matches the input against each regex and updates map if a match is found.
    matchInputAndUpdate(input) {
        let keys = Object.keys(this.SEARCH_REGEX_CONFIG),
            found = false;

        // Check the input string against each regex from the config
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i],
                regex = this.SEARCH_REGEX_CONFIG[key],
                match = input.match(regex);

            if (match) {
                found = true;
                this.searchMap(key, match);
                break;
            }
        }

        // Change input color if no match found
        if (!found) {
            this.searchTextBoxDomElement.style.color =
                this.SEARCH_INPUT_COLOR.RED;
        }
    }

    // This function updates map's lookAt point and input's color
    setLookAt(lookAt, animation) {
        this.searchTextBoxDomElement.style.color =
            this.SEARCH_INPUT_COLOR.GREEN;
        this.map.getViewModel().setLookAtData(lookAt, animation);
    }

    // Gets proper geo coordinate and zoom level and updates the map view accordingly
    searchMap(key, match) {
        let pixelRatio = this.pixelRatio,
            tileSize = this.map.getBaseLayer().tileSize;

        switch (key) {
            case this.SEARCH_INPUT_TYPE.ZXY: {
                let z = parseInt(match[1]),
                    x = parseInt(match[2]),
                    y = parseInt(match[3]),
                    lookAt = this.xyzToLookAt(x, y, z, pixelRatio, tileSize);

                this.setLookAt(lookAt, true);
                break;
            }
            case this.SEARCH_INPUT_TYPE.LAT_LNG_ZOOM: {
                let lookAt = {
                    position: { lat: match[1], lng: match[2] },
                    zoom: parseInt(match[3]),
                };

                this.setLookAt(lookAt, true);
                break;
            }
            case this.SEARCH_INPUT_TYPE.LAT_LNG: {
                let lookAt = {
                    position: { lat: match[1], lng: match[2] },
                };

                this.setLookAt(lookAt, true);
                break;
            }
            case this.SEARCH_INPUT_TYPE.TILE_ID: {
                let tileId = parseInt(match[1]),
                    lookAt = this.tileIdToLookAt(tileId, pixelRatio, tileSize);

                this.setLookAt(lookAt, true);
                break;
            }
        }
    }

    buildDemo() {
        this.setMapConfig().then(() => {
            this.createControlUI();
            this.createMap();
            this.updateUrlTemplate();

            // To position control UI on initial load
            this.mapElement.click();
        });
    }
};

rts = new RasterTileService();
rts.buildDemo();
