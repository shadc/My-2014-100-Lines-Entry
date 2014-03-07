if (window.location.protocol != "https:")
    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
var map;
require([
  "esri/map", "esri/tasks/locator", "esri/SpatialReference", "esri/graphic",
  "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/Font", "esri/symbols/TextSymbol", "esri/geometry/Extent",
  "esri/geometry/webMercatorUtils", "dojo/_base/array", "dojo/_base/Color",
  "dojo/parser", "https://esri.github.io/bootstrap-map-js/src/js/bootstrapmap.js",  
  "dojo/domReady!"
], function (
  Map, Locator, SpatialReference, Graphic, SimpleLineSymbol, SimpleMarkerSymbol,
  Font, TextSymbol, Extent, webMercatorUtils, arrayUtils, Color, parser, BootstrapMap
) {
    parser.parse();
    map = new Map("mapDiv", { center: [-56.049, 38.485], zoom: 3, basemap: "hybrid" });
    BootstrapMap.bindTo(map);
    locator = new Locator("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
    locator.on("address-to-locations-complete", function (evt) {
        map.graphics.clear();
        arrayUtils.forEach(evt.addresses, function (geocodeResult, index) {
            var r = Math.floor(Math.random() * 250);
            var g = Math.floor(Math.random() * 100);
            var b = Math.floor(Math.random() * 100);
            var symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 20, new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID, new Color([r, g, b, 0.5]), 10), new Color([r, g, b, 0.9]));
            var pointMeters = webMercatorUtils.geographicToWebMercator(geocodeResult.location);
            var locationGraphic = new Graphic(pointMeters, symbol);
            var font = new Font().setSize("12pt").setWeight(Font.WEIGHT_BOLD);
            var textSymbol = new TextSymbol( (index + 1) + ".) " + geocodeResult.address, font, new Color([r, g, b, 0.8]) ).setOffset(5, 15);
            map.graphics.add(locationGraphic);
            map.graphics.add(new Graphic(pointMeters, textSymbol));
        });
        var ptAttr = evt.addresses[0].attributes;
        var minx = parseFloat(ptAttr.Xmin);
        var maxx = parseFloat(ptAttr.Xmax);
        var miny = parseFloat(ptAttr.Ymin);
        var maxy = parseFloat(ptAttr.Ymax);
        var esriExtent = new Extent(minx, miny, maxx, maxy, new SpatialReference({ wkid: 4326 }));
        map.setExtent(webMercatorUtils.geographicToWebMercator(esriExtent));
    });
    //-- Wire up annyang 
    if (annyang) {
        annyang.debug()
        $('#welcome').fadeIn('fast');
        var locate = function (place) { geoLocate(place); };
        var pan = function (type) {
            if (type === "left") map.panLeft();
            if (type === "right") map.panRight();
            if (type === "up") map.panUp();
            if (type === "down") map.panDown();
        };
        var zoom = function (type) {
            if (type === "in") map.setZoom(map.getZoom() + 1);
            if (type === "out") map.setZoom(map.getZoom() - 1);
        };
        var setBasemap = function (basemap) {
            var baseMaps = $("a[data-basemapname='" + basemap + "']");
            if (baseMaps.length > 0) map.setBasemap($(baseMaps[0]).attr("data-basemapvalue"));
        };
        var close = function () {
            $('#welcome').fadeOut('fast');
            $('#help').modal('hide');
        };
        var showHelp = function () { $('#help').modal('show'); };
        var commands = {
            'zoom :type': zoom,
            'pan :type': pan,
            'locate *place': locate,
            'set base map *basemap': setBasemap,
            'close': close,
            'help': showHelp
        };
        annyang.addCallback('resultNoMatch', function () {
            $('#nomatch').fadeIn('fast').delay(3000).fadeOut('slow'); $('#welcome').fadeOut('fast');
        });
        annyang.addCallback('resultMatch', function () { $('#welcome').fadeOut('fast'); });
        annyang.addCommands(commands);
        annyang.start();
    } else {
        $('#notsupported').fadeIn('fast');
    }
    //-- Helper functions
    function geoLocate(place) {
        var address = { SingleLine: place };
        var options = { address: address, outFields: ["*"] };
        locator.addressToLocations(options);
    }
    //-- Event Binding
    $(".dropdown-menu a").click(function () {
        map.setBasemap($(this).attr("data-basemapvalue"));
    });
    $("form").submit(function (e) {
        geoLocate($("#search").val());
        e.preventDefault();
    });



    function loadData() {
        //var url = 'https://www.arcgis.com/sharing/rest/search?q=Terrestrial Ecoregions -type:"web mapping application" -type:"Layer Package" (type:"Web Map") &num=10&f=json';
        var url = 'https://www.arcgis.com/sharing/rest/search?q=deschutes type:"Feature Service" &num=20&f=json';
        $.getJSON(url, function (data) {

            var furl = data.results[0].url.replace("http://", "https://") + "/0";
            //$.getJSON(nurl, function (ndata) {
            //    console.log(ndata);
            //});

            console.log(furl);
            var featureLayer = new FeatureLayer(furl, {
                mode: esri.layers.FeatureLayer.MODE_ONDEMAND
            });
            //map.addLayer(featureLayer);
            console.log('1')
            featureLayer.on("load", function () {
                console.log(featureLayer.graphics);
            });
            console.log('2')

            //dojo.connect(featureLayer, "load", function () {
            //    console.log("loaded");
            //    //var zoomExtent = esri.graphicsExtent(sessionLayer.graphics);
            //    //map.setExtent(zoomExtent.expand(1.5));
            //});


            //var zoomExtent = esri.graphicsExtent(featureLayer.graphics);
            //console.log(zoomExtent);

            //var query = new esri.tasks.Query();
            //query.geometry = map.extent;

            ////console.log(featureLayer);

            //featureLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (features) {

            //    var g = new esri.layers.GraphicsLayer();

            //    for (var i = 0, il = features.length; i < il; i++) {

            //        var pt = features[i].geometry.getExtent().getCenter();
            //        console.log(pt);
            //        //var graphic = features[i].geometry;
            //        g.add(new esri.Graphic(pt));
            //        console.log(graphic);
            //    }

            //    console.log(g);

            //    //var extent = esri.graphicsExtent(features);
            //    //console.log(extent);
            //    //console.log(features);
            //    //var roomExtent = features[0].geometry.getExtent();
            //    //console.log(roomExtent);
            //    //map.setExtent(roomExtent);

            //});

            //x = featureLayer.getSelectedFeatures();
            //console.log(x);

            //var ex = new esri.geometry.Extent(featureLayer.initialExtent, featureLayer.SpatialReference);
            //console.log(ex);

            //var find = new esri.tasks.FindTask("https://services.arcgis.com/VYsrLd1WbPJ93eyz/ArcGIS/rest/services/OR_Deschutes_SalesActivity/FeatureServer");
            //var params = new esri.tasks.FindParameters();
            //params.layerIds = [0];
            //params.searchFields = ["TitleCompa"];
            //params.searchText = "WESTERN TITLE & ESCROW CO";
            //find.execute(params, function () {
            //    console.log("OK");
            //});

            //var findTask = new esri.tasks.FindTask(url);
            //var findParams = new esri.tasks.FindParameters();
            //findParams.returnGeometry = true;
            ////findParams.layerIds = [0];
            ////findParams.searchFields = ["RoomName"];
            ////findParams.searchText = room;
            //findTask.execute(findParams, function (results) {
            //    console.log(results);
            //});


            //console.log(map.extent);
            //console.log(featureLayer.initialExtent)
            //map.setExtent(featureLayer.initialExtent);
            //setWebMap(data.results[0].id);
        });

    }

});








//-- TEST CODE --//
//setWebMap("4778fee6371d4e83a22786029f30c7e1");
//setWebMap("7a560116489a43e0ad699c3d35f1f5e1");

//var url = 'https://www.arcgis.com/sharing/rest/search?q=Terrestrial Ecoregions -type:"web mapping application" -type:"Layer Package" (type:"Web Map") &num=10&f=json';
////var url = 'http://www.arcgis.com/sharing/rest/search?q=zoning type:"Feature Service" &num=20&f=json';
//$.getJSON(url, function (data) {
//    setWebMap(data.results[0].id);
//});

//function setWebMap(id) {
//    var mapDefered = arcgisUtils.createMap(id, "mapDiv");
//    mapDefered.then(function (response) {
//        console.log(response);
//        if (map) map.destroy();
//        map = response.map;
//        BootstrapMap.bindTo(map);
//    })
//}
