/**
 * draw china map with d3.js
 * json from https://github.com/zhshi/d3js-footprint/tree/master/json
 * demo from http://d3.decembercafe.org/index.html
 */

// define svg dimension
let elMap = d3.select('#map');

const w = parseInt(elMap.style('width'), 10);
const h = parseInt(elMap.style('height'), 10);

// create svg element
var svg = elMap.append('svg')
	.attr('width', w)
	.attr('height', h);

//Define map projection
var projection = d3.geo.mercator()
					   .center([108, 38])	
					   .translate([w/2, h/2])
					   .scale(4200);

//Define path generator
var path = d3.geo.path()
				 .projection(projection);

// define color linear
var color = d3.scale.linear()
					.range(["rgb(244,237,165)", "rgb(191,68,76)"]);
					//Colors taken from colorbrewer.js, included in the D3 download

// highlight color
const HIGHLIGHTCOLOR = 'yellow';

const PADDING = 45;

const labelRectHeight = 150;
const labelRectWidth = 20;

// load json data draw map
d3.json('china.geo.json', function (json) {
	// add pm2.5 random from 0 to 1000
	for (let i=0, len=json.features.length; i<len; i++) {
		// random pm 0 ~~ 1000
		let pm = Math.floor(Math.random() * 1000);
		json.features[i].properties.pm = pm;
	}

	//Set input domain for color scale
	color.domain([0, 1000]);

	//包含中国各省路径的分组元素
	var china = svg.append("g")
		.attr('id', 'chinaMap');

	// draw provinces path
	var provinces = china.selectAll('path')
		.data(json.features)
		.enter()
		.append('path') // append enough path element to combine data
		.attr('d', path)
		.attr('class', 'province')
		.style({
			stroke: 'black',
			'stroke-width': 1,
			fill: function (d) {
				return color(d.properties.pm);
			},
			'cursor': 'pointer'
		})
		.on('mouseover', function (d) {

			// fix tooltip
			let x = projection([d.properties.cp[0], d.properties.cp[1]])[0];
			let y = projection([d.properties.cp[0], d.properties.cp[1]])[1];

			let tooltip = d3.select('#tooltip')
				.classed('hidden', false)
				.transition()
				.duration(500)
				.style({
					left: x + 'px',
					top: y + 'px'
				})

			tooltip.select('#prov-label')
				.text(d.properties.name);

			tooltip.select('#prov-value')
				.text(d.properties.pm);

			// dark this color
			d3.select(this)
				.style('fill', HIGHLIGHTCOLOR);

			// 与标尺互动
			var labelIndicator = d3.select('#label')
				.append('g')
				.attr('id', 'labelIndicator');

			var labelH = parseInt(labelLinearReverse(d.properties.pm), 10);

			let points = function () {
				let x = PADDING + labelRectWidth;
				let y = h - PADDING - labelH;

				let arr = [];
				arr[0] = x;
				arr[1] = y;
				arr[2] = x + 5;
				arr[3] = y - 5;
				arr[4] = x + 5;
				arr[5] = y + 5;

				return arr;
			}

			labelIndicator.append('polygon')
				.attr({
					points: points().join(',')
				})
				.style({
					fill: color(d.properties.pm)
				});

			labelIndicator.append('text')
				.text(d.properties.pm)
				.attr({
					x: points()[0] + 10,
					y: points()[1] + 5
				})
				.style({
					'font-size': 12,
					fill: '#333'
				})
			
		})
		.on('mouseout', function (d) {
			d3.select('#tooltip').classed('hidden', true);
			d3.select(this)
				.style('fill', color(d.properties.pm));

			d3.select('#labelIndicator').remove();
		})


	// draw province name
	svg.append('g')
		.selectAll('text')
		.data(json.features)
		.enter()
		.append('text')
		.text(function (d) {
			return d.properties.name
		})
		.attr("text-anchor", "middle")
		.attr('x', function (d) {
			return projection([d.properties.cp[0], d.properties.cp[1]])[0];
		})
		.attr('y', function (d) {
			return projection([d.properties.cp[0], d.properties.cp[1]])[1];
		})	
		.attr('transform', function (d) {
			if (d.id === 'xiang_gang') {
				return 'translate(15, 10)';
			}

			if (d.id === 'ao_men') {
				return 'translate(-5, 10)';
			}
			
		})	
		.attr("font-family", "sans-serif")
		.attr('font-size', '11px')
		.attr('fill', 'black')

	// add lenged
	var lenged = svg.append('g');

	lenged.append('text')
		.text('中国空气质量地图图表')
		.attr('class', 'main-title')
		.attr('x', w/2)
		.attr('y', PADDING)
		.style('text-anchor', 'middle')
		.style('font-size', '18px')
		.style('fill', '#333');

	lenged.append('text')
		.text('纯属虚构')
		.attr('class', 'main-title')
		.attr('x', w/2)
		.attr('y', PADDING + 25)
		.style('text-anchor', 'middle')
		.style('font-size', '14px')
		.style('fill', '#999');

	// 定义一个线性渐变
	var defs = svg.append("defs");

	var linearGradient = defs.append("linearGradient")
							.attr("id","linearColor")
							.attr("x1","0%")
							.attr("y1","0%")
							.attr("x2","0%")
							.attr("y2","100%");

	var stop1 = linearGradient.append("stop")
					.attr("offset","0%")
					.style("stop-color", color(1000).toString());

	var stop2 = linearGradient.append("stop")
					.attr("offset","100%")
					.style("stop-color", color(0).toString());

	//添加一个矩形，并应用线性渐变
	var label = svg.append('g')
			.attr('id', 'label');

	var labelLinear = d3.scale.linear()
							  .domain([0, labelRectHeight])
							  .range([0, 1000]);

    var labelLinearReverse = d3.scale.linear()
    								 .domain([0, 1000])
    								 .range([0, labelRectHeight]);

	// 矩形标尺的下角标						 
	let polygonBottom = {
		x: PADDING + labelRectWidth,
		y: h - PADDING,
		w: 10,
		points: function () {
			let arr = [];

			arr[0] = this.x;
			arr[1] = this.y;
			arr[2] = arr[0] + this.w;
			arr[3] = this.y;
			arr[4] = this.x + this.w;
			arr[5] = this.y + this.w;

			return arr;
		}
	};

	// 矩形标尺的上角标
	let polygonTop = {
		x: PADDING + labelRectWidth,
		y: h - PADDING - labelRectHeight,
		w: 10,
		points: function () {
			let arr = [];

			arr[0] = this.x;
			arr[1] = this.y;
			arr[2] = arr[0] + this.w;
			arr[3] = this.y;
			arr[4] = this.x + this.w;
			arr[5] = this.y - this.w;

			return arr;
		}
	};

	// 鼠标点的y坐标
	var coordinatesY = 0;

	// 标尺互动
	var colorRect = label.append("rect")
				.attr("x", PADDING)
				.attr("y", (h - PADDING - labelRectHeight))
				.attr("width", labelRectWidth)
				.attr("height", labelRectHeight)
				.style("fill","url(#" + linearGradient.attr("id") + ")")
				.style('cursor', 'move')
				.on("mouseover", function () {
					// 计算鼠标移动的坐标位置
					let coordinates = [];
					coordinates = d3.mouse(this);

					let y = coordinates[1];

					coordinatesY = y;

					// 鼠标位置的标尺高度
					let _h = h - y - PADDING;
					// 映射出对应的pm值
					let pm = parseInt(labelLinear(_h), 10);

					let points = function () {
						let x = PADDING + labelRectWidth;
						let arr = [];
						arr[0] = x;
						arr[1] = y - 5;
						arr[2] = x + 5;
						arr[3] = y;
						arr[4] = x;
						arr[5] = y + 5;

						return arr;
					}

					// labelIndicator
					var labelIndicator = label.append('g')
						.attr('id', 'labelIndicator');

					// 添加数值指示标
					labelIndicator.append('polygon')
						.attr({
							id: 'labelIndicatorPolygon',
							points: points().join(',')
						})
						.style({
							fill: color(pm)
						});

					labelIndicator.append('text') 	
						.text(pm)
						.attr({
							id: 'labelIndicatorText',
							x: points()[2] + 5,
							y: points()[3] + 5
						})
						.style({
							'font-size': '12px',
							color: '#333'
						})

					
				})
				.on("mousemove", function () {
					// 计算鼠标移动的坐标位置
					let coordinates = [];
					coordinates = d3.mouse(this);

					let y = coordinates[1];
					

					// 鼠标位置所代表的pm值
					let _h = h - y - PADDING;
					let pm = parseInt(labelLinear(_h), 10);


					let transY = y - coordinatesY;

					d3.select('#labelIndicator')
						.attr({
							transform: 'translate(0, '+ transY +')'
						});

					d3.select('#labelIndicatorPolygon')
						.style({
							fill: color(pm)
						});

					d3.select('#labelIndicatorText')
						.text(pm);



					// 对应区域高亮
					provinces.style("fill", function (d) {
						let _pm = d.properties.pm;

						if (Math.abs(pm - _pm) < 20) {
							return HIGHLIGHTCOLOR;
						} else {
							return color(d.properties.pm)
						}
					})	
				})
				.on("mouseout", function () {
					provinces.style("fill", function (d) {
						return color(d.properties.pm)
					});

					label.select('#labelIndicator').remove();

					coordinatesY = 0;
				})

	// 标尺的上下极值标注
	var labelBottom = label.append('g');
	labelBottom.append('polygon')
		.attr({
			points: polygonBottom.points().join(',')
		})
		.style({
			fill: color(0)
		});

	labelBottom.append('text')
		.text('0')
		.attr({
			x: polygonBottom.points()[4] + 5,
			y: polygonBottom.points()[5]
		})
		.style({
			'font-size': 12,
			fill: '#333'
		})

	labelBottom.append('text')
		.text('低')
		.attr('text-anchor', 'middle')
		.attr('x', PADDING + labelRectWidth/2)
		.attr('y', h - PADDING + 20)
		.attr('font-size', 12);

	var labelTop = label.append('g');
	labelTop.append('polygon')
		.attr({
			points: polygonTop.points().join(',')
		})
		.style({
			fill: color(1000)
		});

	labelTop.append('text')
		.text('1000')
		.attr({
			x: polygonTop.points()[2] + 5,
			y: polygonTop.points()[3]
		})
		.style({
			'font-size': 12,
			fill: '#333'
		})


	labelTop.append('text')
		.text('高')
		.attr('text-anchor', 'middle')
		.attr('x', PADDING + 10)
		.attr('y', h - PADDING - labelRectHeight - 10)
		.attr('font-size', 12)
});


// draw southchinasea
d3.xml("southchinasea.svg", function(error, xmlDocument) {
	svg.html(function(d){
		return d3.select(this).html() + xmlDocument.getElementsByTagName("g")[0].outerHTML;
	});
	
	var gSouthSea = d3.select("#southsea");
	
	gSouthSea
		.attr("transform","translate(880,520) scale(0.45)")
		.attr("class","southsea")
		.attr("stroke", "#000")
		.attr("stroke-width", 1)
		.attr("fill", "#ccc")
});
