const HERE_DOCUMENTATION_URL = "https://www.here.com/docs/bundle";
const RTS_DEVELOPER_GUIDE_URL = `${HERE_DOCUMENTATION_URL}/raster-tile-api-developer-guide/page/topics`;
const IDENTITY_AND_ACCESS_MANAGEMENT_DEVELOPER_GUIDE_URL = `${HERE_DOCUMENTATION_URL}/identity-and-access-management-developer-guide/page/topics`;

const config = {
    host: "https://maps.hereapi.com",
    apiKey: "__LION_APIKEY_PRD_PLACEHOLDER__", // Please, get your own RTS API key

    path: "v3",
    defaultResource: "base",
    projection: "mc",
    defaultFormat: "png8",
    defaultStyle: "explore.day",
    ppis: [100, 200, 400],
    defaultSize: 256,
    scales: [1, 2],

    emptyParamValue: "-none-",

    locations: {
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
        resource: `${RTS_DEVELOPER_GUIDE_URL}/examples/example-resource.html`,
        format: `${RTS_DEVELOPER_GUIDE_URL}/image-formats.html`,
        lang: `${RTS_DEVELOPER_GUIDE_URL}/languages.html`,
        lang2: `${RTS_DEVELOPER_GUIDE_URL}/languages.html`,
        pview: `${RTS_DEVELOPER_GUIDE_URL}/geopolitical-views.html`,
        style: `${RTS_DEVELOPER_GUIDE_URL}/styles.html`,
        ppi: `${RTS_DEVELOPER_GUIDE_URL}/examples/example-ppi.html`,
        size: `${RTS_DEVELOPER_GUIDE_URL}/examples/example-size.html`,
        scale: `${RTS_DEVELOPER_GUIDE_URL}/examples/example-resolution.html`,
        apiKey: `${IDENTITY_AND_ACCESS_MANAGEMENT_DEVELOPER_GUIDE_URL}/plat-using-apikeys.html`,
        congestion_zones: `${RTS_DEVELOPER_GUIDE_URL}/features.html#congestion-zones`,
        environmental_zones: `${RTS_DEVELOPER_GUIDE_URL}/features.html#environmental-zones`,
        pois: `${RTS_DEVELOPER_GUIDE_URL}/features.html#points-of-interest-pois`,
        vehicle_restrictions: `${RTS_DEVELOPER_GUIDE_URL}/features.html#vehicle-restrictions`,
        public_transit: `${RTS_DEVELOPER_GUIDE_URL}/features.html#public-transit-information`,
        low_speed_zones: `${RTS_DEVELOPER_GUIDE_URL}/features.html#lowspeed-zones`,
    },
};

module.exports = config;
