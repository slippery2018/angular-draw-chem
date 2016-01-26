(function () {
	"use strict";
	angular.module("mmAngularDrawChem")
		.factory("DCLabel", DCLabel);
	
	function DCLabel() {
		
		var service = {};
		
		/**
		* Creates a new Label.
		* @class
		* @param {String} label - a symbol of the atom
		* @param {Number} bonds - a maximum number of bonds this atom should be connected with
		*/
		function Label(label, bonds, mode) {
			this.labelName = label;			
			this.bonds = bonds;
			this.mode = mode;
		}
		
		Label.prototype.getLabelName = function () {
			return this.labelName;
		};
		
		Label.prototype.setLabelName = function (labelName) {
			this.labelName = labelName;
		};
		
		Label.prototype.getMaxBonds = function () {
			return this.bonds;
		};
		
		Label.prototype.setMaxBonds = function (bonds) {
			this.bonds = bonds;
		};
		
		Label.prototype.getMode = function () {
			return this.mode;
		};
		
		Label.prototype.setMode = function (mode) {
			this.mode = mode;
		};
		
		service.Label = Label;
		
		return service;
	}
})();