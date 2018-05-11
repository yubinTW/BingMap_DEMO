var map;
var mapContainer;
var dtool; // drawing tool
var dm; // drawing manager
var shapeType; // 'polyline', 'polygon'


function initMap() {
    map = new Microsoft.Maps.Map(document.getElementById('myMap'), {
        zoom: 7
    });
    drawTargetLayer = new Microsoft.Maps.Layer();
    maskStrokeColor = new Microsoft.Maps.Color(200, 100, 100, 100);
    shapeStrokeColor = new Microsoft.Maps.Color(200, 0, 0, 200);
    shapeFillColor = new Microsoft.Maps.Color(100, 000, 100, 000);

    // Module
    Microsoft.Maps.registerModule('PointBasedClusteringModule', "Scripts/bingmap/PointBasedClustering.js");
    Microsoft.Maps.registerModule("ImageOverlayV8Module", "Scripts/bingmap/ImageOverlayV8Module.js");
    Microsoft.Maps.registerModule("WKTModule", "Scripts/bingmap/WKTModule.js");
	Microsoft.Maps.loadModule("WKTModule");
	Microsoft.Maps.loadModule("PointBasedClusteringModule");



	// DrawingTool
	Microsoft.Maps.loadModule('Microsoft.Maps.DrawingTools', function () {
	    var dt = Microsoft.Maps.DrawingTools;
	    var da = dt.DrawingBarAction;
	    dtool = new dt(map);
	    dtool.showDrawingManager(function (manager) {
	        dm = manager;
	        manager.setOptions({
	            drawingBarActions: da.polyline | da.polygon
	        });
	        Microsoft.Maps.Events.addHandler(manager, 'drawingStarted', function () { console.log('Drawing started.'); });
	        Microsoft.Maps.Events.addHandler(manager, 'drawingEnded', function () { console.log('Drawing ended.'); });
	        
	    });
	});

	// 雙擊滑鼠結束繪製
	Microsoft.Maps.Events.addHandler(map, 'dblclick', function () {
		let shapes = dm.getPrimitives();
		console.log('shapes ', shapes);
		dm.setDrawingMode(Microsoft.Maps.DrawingTools.DrawingMode.none); // 結束圖形繪製
		
		// 計算距離
		if(shapeType === 'polyline') {
			let geometry = shapes[0].geometry;
			let distance = calcPolyLineDistance(geometry);
			document.getElementById('caculateResult').innerText = distance + " m";
		}else if(shapeType === 'polygon') {
			let geometry = shapes[0].geometry;
			console.log('geometry', geometry);
			let area = calcPolygonArea(geometry);
		}
	});

} // end of initMap()


function caculateDistance() {
	shapeType = 'polyline';
	dm.setDrawingMode(Microsoft.Maps.DrawingTools.DrawingMode.polyline);
} // end of drawLine()


function caculateArea() {
	shapeType = 'polygon';
	dm.setDrawingMode(Microsoft.Maps.DrawingTools.DrawingMode.polygon);
} // end of drawPolygon()


function clearDrawing() {
	dm.clear();
	document.getElementById('caculateResult').innerText = "";
} // end of clearDrawing()


function calcPolyLineDistance(geometry){
	let distance = 0;
	for(let i = 0; i < geometry.x.length - 1; i++){
		let p1 = {x:geometry.x[i], y:geometry.y[i]};
		let p2 = {x:geometry.x[i+1], y:geometry.y[i+1]};
		distance += getLineDistance(p1, p2);
	}
	return distance;
} // end of calcPolyLineDistance()


function calcPolygonArea(vertices) {
    var total = 0;
    for (var i = 0, l = vertices.length; i < l; i++) {
      var addX = vertices[i].x;
      var addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
      var subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
      var subY = vertices[i].y;
      total += (addX * addY * 0.5);
      total -= (subX * subY * 0.5);
    }
    return Math.abs(total);
} // end of calcPolygonArea()


var rad = function (x) {
    return x * Math.PI / 180;
};


var getLineDistance = function (p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.x - p1.x);
    var dLong = rad(p2.y - p1.y);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.x)) * Math.cos(rad(p2.x)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
}; // end of getLineDistance()