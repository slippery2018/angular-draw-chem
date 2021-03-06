var styleExpanded = "circle.atom:hover{" +
		"opacity:0.3;" +
	"}" +
	"circle.arom:hover{" +
		"opacity:0.3;" +
		"stroke:black;" +
		"stroke-width:0.80;" +
		"fill:black;" +
	"}" +
	"rect.focus{" +
		"opacity:0;" +
		"stroke:black;" +
	"}" +
	"rect.focus:hover{" +
		"opacity:0.3;" +
	"}" +
	"text.edit:hover{" +
		"opacity:0.3;" +
	"}" +
	"circle.atom{" +
		"opacity:0;" +
		"stroke:black;" +
		"stroke-width:0.80;" +
	"}" +
	"circle.edit{" +
		"stroke:black;" +
		"fill:none;" +
	"}" +
	"circle.label{" +
		"opacity:0;" +
	"}" +
	"rect.selection{" +
		"stroke:black;" +
		"stroke-dasharray:10 5;" +
		"fill:none;" +
	"}",
	styleBase = "path{" +
		"stroke:black;" +
		"stroke-width:0.80;" +
		"fill:none;" +
	"}" +
	"path.wedge{" +
		"fill:black;" +
	"}" +
	"path.arrow{" +
		"fill:black;" +
	"}" +
	"path.arrow-eq{" +
		"fill:none;" +
	"}" +
	"circle.arom{" +
		"stroke:black;" +
		"stroke-width:0.80;" +
		"fill:none;" +
	"}" +
	"circle.tr-arom{" +
		"stroke:black;" +
		"stroke-width:0.80;" +
		"fill:none;" +
	"}" +
	"text{" +
		"font-family:Arial;" +
		"cursor:default;" +
		"font-size:18px;" +
	"}" +
	"tspan.sub{" +
		"font-size:14px;" +
	"}" +
	"text.text-area{" +
		"font-family:Arial;" +
		"cursor:default;" +
		"font-size:14px;" +
	"}" +
	"tspan.text-area-sub{" +
		"font-size:10px;" +
	"}";

describe("DrawChemEditor directive tests - part1", function () {
	beforeEach(module("mmAngularDrawChem"));

	var $scope, element, $rootScope, DrawChem, DrawChemModStructure, DrawChemStructures, DrawChemCache, template;

	beforeEach(inject(function ($httpBackend, $compile, _$rootScope_, _DrawChem_, _DrawChemModStructure_, _DrawChemStructures_, _DrawChemCache_) {
		// configure path for static files
		jasmine.getFixtures().fixturesPath = "base/assets/";
		// load template of the editor
		template = readFixtures("draw-chem-editor-modal.html");

		DrawChem = _DrawChem_;
		DrawChemCache = _DrawChemCache_;
		DrawChemModStructure = _DrawChemModStructure_;
		DrawChemStructures = _DrawChemStructures_;
		$rootScope = _$rootScope_;

		$scope = $rootScope.$new();
		element = angular.element(
			"<div draw-chem-editor dc-modal></div>"
		);
		temp = $compile(element)($scope);
		$httpBackend
			.expectGET("draw-chem-editor-modal.html")
			.respond(template);
		$scope.$digest();
		$httpBackend.flush();
	}));

	it("should close the editor", function () {
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		// if the close button has been clicked
		temp.find(".dc-editor-close").click();
		expect(DrawChem.showEditor()).toEqual(false);

		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		// if the background has been clicked
		temp.find(".dc-editor-overlay").click();
		expect(DrawChem.showEditor()).toEqual(false);
	});

	it("should choose a scaffold", function () {
		var custom = DrawChemStructures.benzene();
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());
	});

	it("should store the current structure (as a Structure object)", function () {
		var custom = DrawChemStructures.benzene();
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());
		mouseClick(temp, 2, 2);
		expect(DrawChemCache.getCurrentStructure()).toBeDefined();
	});

	it("should set the content after clicking on the 'transfer' button", function () {
		var parallelScope = $rootScope.$new(),
			custom = DrawChemStructures.benzene();

		parallelScope.input = function () {
			return DrawChem.getContent("test");
		};
		parallelScope.run = function () {
			DrawChem.runEditor("test");
		};

		parallelScope.run();
		expect(DrawChem.showEditor()).toEqual(true);
		expect(parallelScope.input()).toEqual("");
		temp.find("#dc-" + custom.name).click();
		mouseClick(temp, 100, 100);
		temp.find("#dc-transfer").click();
		expect(parallelScope.input())
			.toEqual(
				"<svg viewBox='50.68 68.00 94.64 100.00' height='100%' width='100%' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' >" +
					"<g id='transfer' >" +
						"<style type=\"text/css\">" +
							styleBase +
						"</style>" +
						"<path d='M 98.00 98.00 L 115.32 108.00 L 115.32 128.00 L 98.00 138.00 L 80.68 128.00 L 80.68 108.00 L 98.00 98.00 '></path>" +
						"<circle class='tr-arom' cx='98.00' cy='118.00' r='9.00' ></circle>" +
					"</g>" +
				"</svg>"
			);
	});

	it("should be able to transfer empty content", function () {
		var parallelScope = $rootScope.$new();

		parallelScope.input = function () {
			return DrawChem.getContent("test");
		};
		parallelScope.run = function () {
			DrawChem.runEditor("test");
		};

		parallelScope.run();
		expect(DrawChem.showEditor()).toEqual(true);
		expect(parallelScope.input()).toEqual("");
		temp.find("#dc-transfer").click();
		expect(parallelScope.input())
			.toEqual("");
	});

	it("should change content of the output after clicking on the drawing area", function () {
		var custom = DrawChemStructures.benzene();
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());
		mouseClick(temp, 2, 2);
		expect(normZeroes(temp.find(".dc-editor-dialog-content").html()))
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								styleBase + styleExpanded +
							"</style>" +
							"<path d=\"M 0.00 0.00 L 17.32 10.00 L 17.32 30.00 L 0.00 40.00 L -17.32 30.00 L -17.32 10.00 L 0.00 0.00 \"></path>" +
							"<rect class=\"focus\" x=\"1.50\" y=\"-2.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(30.00, 1.50, -2.60)\"></rect>" +
							"<rect class=\"focus\" x=\"20.32\" y=\"10.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(90.00, 20.32, 10.00)\"></rect>" +
							"<rect class=\"focus\" x=\"18.82\" y=\"32.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(150.00, 18.82, 32.60)\"></rect>" +
							"<rect class=\"focus\" x=\"-1.50\" y=\"42.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-150.00, -1.50, 42.60)\"></rect>" +
							"<rect class=\"focus\" x=\"-20.32\" y=\"30.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, -20.32, 30.00)\"></rect>" +
							"<rect class=\"focus\" x=\"-18.82\" y=\"7.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-30.00, -18.82, 7.40)\"></rect>" +
							"<circle class=\"atom\" cx=\"0.00\" cy=\"0.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"17.32\" cy=\"10.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"17.32\" cy=\"30.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"0.00\" cy=\"40.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"-17.32\" cy=\"30.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"-17.32\" cy=\"10.00\" r=\"3.40\"></circle>" +
							"<circle class=\"arom\" cx=\"0.00\" cy=\"20.00\" r=\"9.00\"></circle>" +
						"</g>" +
				"</svg>"
			);
	});

	it("should clear the content after clicking on the 'clear' button", function () {
		var custom = DrawChemStructures.benzene();
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());
		mouseClick(temp, 2, 2);
		temp.find("#dc-clear").click();
		expect(temp.find(".dc-editor-dialog-content").html()).toEqual("");
	});

	it("should do nothing if undo has been clicked, but the associated input is empty", function () {
		var custom = DrawChemStructures.benzene();
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		temp.find("#dc-undo").click();
		expect(temp.find(".dc-editor-dialog-content").html()).toEqual("");
		temp.find("#dc-" + custom.name).click();
		mouseClick(temp, 2, 2);
		temp.find("#dc-undo").click();
		expect(temp.find(".dc-editor-dialog-content").html()).toEqual("");
	});

	it("should render a modified structure", function () {
		var custom = DrawChemStructures.benzene(),
			add = DrawChemStructures.singleBond();
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());
		mouseClick(temp, 100, 100);
		temp.find("#dc-single-bond").click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(add.getDefault());
		mouseClick(temp, 101, 99);
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								styleBase + styleExpanded +
							"</style>" +
							"<path d=\"M 98.00 98.00 L 115.32 108.00 L 115.32 128.00 L 98.00 138.00 L 80.68 128.00 L 80.68 108.00 L 98.00 98.00 \"></path>" +
							"<path d=\"M 98.00 98.00 L 98.00 78.00 \"></path>" +
							"<rect class=\"focus\" x=\"99.50\" y=\"95.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(30.00, 99.50, 95.40)\"></rect>" +
							"<rect class=\"focus\" x=\"118.32\" y=\"108.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(90.00, 118.32, 108.00)\"></rect>" +
							"<rect class=\"focus\" x=\"116.82\" y=\"130.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(150.00, 116.82, 130.60)\"></rect>" +
							"<rect class=\"focus\" x=\"96.50\" y=\"140.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-150.00, 96.50, 140.60)\"></rect>" +
							"<rect class=\"focus\" x=\"77.68\" y=\"128.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 77.68, 128.00)\"></rect>" +
							"<rect class=\"focus\" x=\"79.18\" y=\"105.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-30.00, 79.18, 105.40)\"></rect>" +
							"<rect class=\"focus\" x=\"95.00\" y=\"98.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 95.00, 98.00)\"></rect>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"98.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"138.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"78.00\" r=\"3.40\"></circle>" +
							"<circle class=\"arom\" cx=\"98.00\" cy=\"118.00\" r=\"9.00\"></circle>" +
						"</g>" +
				"</svg>"
			);
		mouseClick(temp, 118, 109);
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								styleBase + styleExpanded +
							"</style>" +
							"<path d=\"M 98.00 98.00 L 115.32 108.00 L 115.32 128.00 L 98.00 138.00 L 80.68 128.00 L 80.68 108.00 L 98.00 98.00 \"></path>" +
							"<path d=\"M 115.32 108.00 L 132.64 98.00 \"></path>" +
							"<path d=\"M 98.00 98.00 L 98.00 78.00 \"></path>" +
							"<rect class=\"focus\" x=\"99.50\" y=\"95.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(30.00, 99.50, 95.40)\"></rect>" +
							"<rect class=\"focus\" x=\"118.32\" y=\"108.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(90.00, 118.32, 108.00)\"></rect>" +
							"<rect class=\"focus\" x=\"116.82\" y=\"130.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(150.00, 116.82, 130.60)\"></rect>" +
							"<rect class=\"focus\" x=\"96.50\" y=\"140.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-150.00, 96.50, 140.60)\"></rect>" +
							"<rect class=\"focus\" x=\"77.68\" y=\"128.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 77.68, 128.00)\"></rect>" +
							"<rect class=\"focus\" x=\"79.18\" y=\"105.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-30.00, 79.18, 105.40)\"></rect>" +
							"<rect class=\"focus\" x=\"113.82\" y=\"105.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-30.00, 113.82, 105.40)\"></rect>" +
							"<rect class=\"focus\" x=\"95.00\" y=\"98.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 95.00, 98.00)\"></rect>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"98.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"138.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"132.64\" cy=\"98.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"78.00\" r=\"3.40\"></circle>" +
							"<circle class=\"arom\" cx=\"98.00\" cy=\"118.00\" r=\"9.00\"></circle>" +
						"</g>" +
				"</svg>"
			);
	});

	it("should be able to draw further, on the recently added structure", function () {
		var custom = DrawChemStructures.benzene(),
			add = DrawChemStructures.singleBond();
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());
		mouseClick(temp, 100, 100);
		temp.find("#dc-single-bond").click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(add.getDefault());
		mouseClick(temp, 101, 99);
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								styleBase + styleExpanded +
							"</style>" +
							"<path d=\"M 98.00 98.00 L 115.32 108.00 L 115.32 128.00 L 98.00 138.00 L 80.68 128.00 L 80.68 108.00 L 98.00 98.00 \"></path>" +
							"<path d=\"M 98.00 98.00 L 98.00 78.00 \"></path>" +
							"<rect class=\"focus\" x=\"99.50\" y=\"95.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(30.00, 99.50, 95.40)\"></rect>" +
							"<rect class=\"focus\" x=\"118.32\" y=\"108.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(90.00, 118.32, 108.00)\"></rect>" +
							"<rect class=\"focus\" x=\"116.82\" y=\"130.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(150.00, 116.82, 130.60)\"></rect>" +
							"<rect class=\"focus\" x=\"96.50\" y=\"140.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-150.00, 96.50, 140.60)\"></rect>" +
							"<rect class=\"focus\" x=\"77.68\" y=\"128.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 77.68, 128.00)\"></rect>" +
							"<rect class=\"focus\" x=\"79.18\" y=\"105.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-30.00, 79.18, 105.40)\"></rect>" +
							"<rect class=\"focus\" x=\"95.00\" y=\"98.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 95.00, 98.00)\"></rect>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"98.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"138.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"78.00\" r=\"3.40\"></circle>" +
							"<circle class=\"arom\" cx=\"98.00\" cy=\"118.00\" r=\"9.00\"></circle>" +
						"</g>" +
				"</svg>"
			);
		mouseClick(temp, 100, 80);
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								styleBase + styleExpanded +
							"</style>" +
							"<path d=\"M 98.00 98.00 L 115.32 108.00 L 115.32 128.00 L 98.00 138.00 L 80.68 128.00 L 80.68 108.00 L 98.00 98.00 \"></path>" +
							"<path d=\"M 98.00 98.00 L 98.00 78.00 L 80.68 68.00 \"></path>" +
							"<rect class=\"focus\" x=\"99.50\" y=\"95.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(30.00, 99.50, 95.40)\"></rect>" +
							"<rect class=\"focus\" x=\"118.32\" y=\"108.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(90.00, 118.32, 108.00)\"></rect>" +
							"<rect class=\"focus\" x=\"116.82\" y=\"130.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(150.00, 116.82, 130.60)\"></rect>" +
							"<rect class=\"focus\" x=\"96.50\" y=\"140.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-150.00, 96.50, 140.60)\"></rect>" +
							"<rect class=\"focus\" x=\"77.68\" y=\"128.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 77.68, 128.00)\"></rect>" +
							"<rect class=\"focus\" x=\"79.18\" y=\"105.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-30.00, 79.18, 105.40)\"></rect>" +
							"<rect class=\"focus\" x=\"95.00\" y=\"98.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 95.00, 98.00)\"></rect>" +
							"<rect class=\"focus\" x=\"96.50\" y=\"80.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-150.00, 96.50, 80.60)\"></rect>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"98.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"138.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"78.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"68.00\" r=\"3.40\"></circle>" +
							"<circle class=\"arom\" cx=\"98.00\" cy=\"118.00\" r=\"9.00\"></circle>" +
						"</g>" +
				"</svg>"
			);
		mouseClick(temp, 101, 79);
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								styleBase + styleExpanded +
							"</style>" +
							"<path d=\"M 98.00 98.00 L 115.32 108.00 L 115.32 128.00 L 98.00 138.00 L 80.68 128.00 L 80.68 108.00 L 98.00 98.00 \"></path>" +
							"<path d=\"M 98.00 98.00 L 98.00 78.00 L 80.68 68.00 \"></path>" +
							"<path d=\"M 98.00 78.00 L 115.32 68.00 \"></path>" +
							"<rect class=\"focus\" x=\"99.50\" y=\"95.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(30.00, 99.50, 95.40)\"></rect>" +
							"<rect class=\"focus\" x=\"118.32\" y=\"108.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(90.00, 118.32, 108.00)\"></rect>" +
							"<rect class=\"focus\" x=\"116.82\" y=\"130.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(150.00, 116.82, 130.60)\"></rect>" +
							"<rect class=\"focus\" x=\"96.50\" y=\"140.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-150.00, 96.50, 140.60)\"></rect>" +
							"<rect class=\"focus\" x=\"77.68\" y=\"128.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 77.68, 128.00)\"></rect>" +
							"<rect class=\"focus\" x=\"79.18\" y=\"105.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-30.00, 79.18, 105.40)\"></rect>" +
							"<rect class=\"focus\" x=\"95.00\" y=\"98.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 95.00, 98.00)\"></rect>" +
							"<rect class=\"focus\" x=\"96.50\" y=\"80.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-150.00, 96.50, 80.60)\"></rect>" +
							"<rect class=\"focus\" x=\"96.50\" y=\"75.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-30.00, 96.50, 75.40)\"></rect>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"98.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"138.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"78.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"68.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"68.00\" r=\"3.40\"></circle>" +
							"<circle class=\"arom\" cx=\"98.00\" cy=\"118.00\" r=\"9.00\"></circle>" +
						"</g>" +
				"</svg>"
			);
	});

	it("should be able to choose an atom on 'mousedown' and draw on 'mouseup', if the 'mouseup' is within the enclosing circle", function () {
		var custom = DrawChemStructures.benzene(),
			add = DrawChemStructures.singleBond();
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());
		mouseClick(temp, 100, 100);
		temp.find("#dc-single-bond").click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(add.getDefault());
		mouseClick(temp, 101, 99);
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								styleBase + styleExpanded +
							"</style>" +
							"<path d=\"M 98.00 98.00 L 115.32 108.00 L 115.32 128.00 L 98.00 138.00 L 80.68 128.00 L 80.68 108.00 L 98.00 98.00 \"></path>" +
							"<path d=\"M 98.00 98.00 L 98.00 78.00 \"></path>" +
							"<rect class=\"focus\" x=\"99.50\" y=\"95.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(30.00, 99.50, 95.40)\"></rect>" +
							"<rect class=\"focus\" x=\"118.32\" y=\"108.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(90.00, 118.32, 108.00)\"></rect>" +
							"<rect class=\"focus\" x=\"116.82\" y=\"130.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(150.00, 116.82, 130.60)\"></rect>" +
							"<rect class=\"focus\" x=\"96.50\" y=\"140.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-150.00, 96.50, 140.60)\"></rect>" +
							"<rect class=\"focus\" x=\"77.68\" y=\"128.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 77.68, 128.00)\"></rect>" +
							"<rect class=\"focus\" x=\"79.18\" y=\"105.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-30.00, 79.18, 105.40)\"></rect>" +
							"<rect class=\"focus\" x=\"95.00\" y=\"98.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 95.00, 98.00)\"></rect>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"98.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"138.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"78.00\" r=\"3.40\"></circle>" +
							"<circle class=\"arom\" cx=\"98.00\" cy=\"118.00\" r=\"9.00\"></circle>" +
						"</g>" +
				"</svg>"
			);
	});

	it("should be able to choose an atom on 'mousedown' and draw on 'mouseup', if the 'mouseup' is outside of the enclosing circle", function () {
		var custom = DrawChemStructures.benzene(),
			add = DrawChemStructures.singleBond();
		DrawChem.runEditor("test");
		expect(DrawChem.showEditor()).toEqual(true);
		temp.find("#dc-" + custom.name).click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(custom.getDefault());
		mouseClick(temp, 100, 100);
		temp.find("#dc-single-bond").click();
		expect(element.isolateScope().chosenStructure.getDefault()).toEqual(add.getDefault());
		mouseDown(temp, 101, 99);
		mouseUp(temp, 100, -90);
		// expects 'N' bond
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								styleBase + styleExpanded +
							"</style>" +
							"<path d=\"M 98.00 98.00 L 115.32 108.00 L 115.32 128.00 L 98.00 138.00 L 80.68 128.00 L 80.68 108.00 L 98.00 98.00 \"></path>" +
							"<path d=\"M 98.00 98.00 L 98.00 78.00 \"></path>" +
							"<rect class=\"focus\" x=\"99.50\" y=\"95.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(30.00, 99.50, 95.40)\"></rect>" +
							"<rect class=\"focus\" x=\"118.32\" y=\"108.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(90.00, 118.32, 108.00)\"></rect>" +
							"<rect class=\"focus\" x=\"116.82\" y=\"130.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(150.00, 116.82, 130.60)\"></rect>" +
							"<rect class=\"focus\" x=\"96.50\" y=\"140.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-150.00, 96.50, 140.60)\"></rect>" +
							"<rect class=\"focus\" x=\"77.68\" y=\"128.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 77.68, 128.00)\"></rect>" +
							"<rect class=\"focus\" x=\"79.18\" y=\"105.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-30.00, 79.18, 105.40)\"></rect>" +
							"<rect class=\"focus\" x=\"95.00\" y=\"98.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 95.00, 98.00)\"></rect>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"98.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"138.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"78.00\" r=\"3.40\"></circle>" +
							"<circle class=\"arom\" cx=\"98.00\" cy=\"118.00\" r=\"9.00\"></circle>" +
						"</g>" +
				"</svg>"
			);

		mouseDown(temp, 101, 99);
		mouseUp(temp, 100, 190);
		// expects 'S' bond
		expect(temp.find(".dc-editor-dialog-content").html())
			.toEqual(
				"<svg>" +
						"<g id=\"cmpd1\">" +
							"<style type=\"text/css\">" +
								styleBase + styleExpanded +
							"</style>" +
							"<path d=\"M 98.00 98.00 L 115.32 108.00 L 115.32 128.00 L 98.00 138.00 L 80.68 128.00 L 80.68 108.00 L 98.00 98.00 \"></path>" +
							"<path d=\"M 98.00 98.00 L 98.00 78.00 \"></path>" +
							"<path d=\"M 98.00 98.00 L 98.00 118.00 \"></path>" +
							"<rect class=\"focus\" x=\"99.50\" y=\"95.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(30.00, 99.50, 95.40)\"></rect>" +
							"<rect class=\"focus\" x=\"118.32\" y=\"108.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(90.00, 118.32, 108.00)\"></rect>" +
							"<rect class=\"focus\" x=\"116.82\" y=\"130.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(150.00, 116.82, 130.60)\"></rect>" +
							"<rect class=\"focus\" x=\"96.50\" y=\"140.60\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-150.00, 96.50, 140.60)\"></rect>" +
							"<rect class=\"focus\" x=\"77.68\" y=\"128.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 77.68, 128.00)\"></rect>" +
							"<rect class=\"focus\" x=\"79.18\" y=\"105.40\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-30.00, 79.18, 105.40)\"></rect>" +
							"<rect class=\"focus\" x=\"95.00\" y=\"98.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(-90.00, 95.00, 98.00)\"></rect>" +
							"<rect class=\"focus\" x=\"101.00\" y=\"98.00\" rx=\"2.00\" ry=\"2.00\" width=\"20.00\" height=\"6.00\" transform=\"rotate(90.00, 101.00, 98.00)\"></rect>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"98.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"115.32\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"138.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"128.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"80.68\" cy=\"108.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"78.00\" r=\"3.40\"></circle>" +
							"<circle class=\"atom\" cx=\"98.00\" cy=\"118.00\" r=\"3.40\"></circle>" +
							"<circle class=\"arom\" cx=\"98.00\" cy=\"118.00\" r=\"9.00\"></circle>" +
						"</g>" +
				"</svg>"
			);
	});
});

function stringCompare(str1, str2) {
	var i;
	for (i = 0; i < str1.length; i += 1) {
		if (str1.substr(i, 1) !== str2.substr(i, 1)) {
			console.log(str1.substr(i, 5), str2.substr(i, 5));
			break;
		}
	}
}

function mouseDown(element, x, y) {
	element.find(".dc-editor-dialog-content").triggerHandler({
		type : "mousedown",
		which: 1,
		clientX: x,
		clientY: y
	});
}

function mouseUp(element, x, y) {
	element.find(".dc-editor-dialog-content").triggerHandler({
		type : "mouseup",
		which: 1,
		clientX: x,
		clientY: y
	});
}

function mouseClick(element, x, y) {
	mouseDown(element, x, y);
	mouseUp(element, x, y);
}

function normZeroes(str) {
	var arr = str.split(" "), i, index;
	for (i = 0; i < arr.length; i += 1) {
		index = arr[i].indexOf("-0.00");
		if (index >= 0) {
			arr[i] = arr[i].replace("-0.00", "0.00");
		}
	}
	return arr.join(" ");
}
