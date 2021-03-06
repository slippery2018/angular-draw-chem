(function () {
	"use strict";
	angular.module("mmAngularDrawChem")
		.factory("DrawChemDirectiveMouseActions", DrawChemDirectiveMouseActions);

	DrawChemDirectiveMouseActions.$inject = [
    "DrawChemDirectiveFlags",
    "DrawChemDirectiveUtils",
    "DrawChemModStructure",
    "DrawChemCache",
    "DrawChemConst",
    "DCLabel",
		"DCStructure",
		"DCSelection"
  ];

	function DrawChemDirectiveMouseActions(Flags, DirUtils, ModStructure, Cache, Const, DCLabel, DCStructure, DCSelection) {

		var service = {},
      Label = DCLabel.Label,
			Selection = DCSelection.Selection,
			Structure = DCStructure.Structure,
      mouseFlags = Flags.mouseFlags,
			currWorkingStructure = null;

		/**
		* Function telling what to do on `mousedown` event.
		* @param {Object} $event - event object,
		* @param {Object} scope - scope object,
		* @param {Object} element - element object listening to this event
		*/
    service.doOnMouseDown = function ($event, scope, element) {
      var elem, structure;
			// if button other than left was used
      if ($event.which !== 1) { return; }
			// set mouse coords
      mouseFlags.downMouseCoords = DirUtils.innerCoords(element, $event);
			// set flag
      mouseFlags.mouseDown = true;
			// get current working structure (copy it from Cache)
			currWorkingStructure = angular.copy(Cache.getCurrentStructure());

			// check if the event occurred on an atom
			// if content is not empty and (label is selected or structure is selected or delete is selected)
			// otherwise there is no necessity for checking this
			if (currWorkingStructure !== null && DirUtils.performSearch(["label", "removeLabel", "resizeArrow", "customLabel", "structure", "delete"])) {
        // if content is not empty
				// check if label was clicked
				// if so, replace mouseCoords with coords of an underlying atom
        if ($event.target.nodeName === "tspan") {
          elem = angular.element($event.target).parent();
          mouseFlags.downMouseCoords = [parseFloat(elem.attr("atomx")), parseFloat(elem.attr("atomy"))];
        }
        checkIfDownOnAtom(); // checks if mouseCoords are within an atom
				if (!mouseFlags.downOnAtom) {
					// if mouseCoords are not within an atom,
					// then check if they are within a bond
					checkIfDownOnBond();
				}
				if (!mouseFlags.downOnBond) {
					// if mouseCoords are not within an atom nor a bond,
					// then check if they are within an arrow
					checkIfDownOnArrow();
				}
      }

      function checkIfDownOnAtom() {
				var withinObject = ModStructure.isWithinAtom(currWorkingStructure, mouseFlags.downMouseCoords);
        if (typeof withinObject.foundAtom !== "undefined") {
          // set flags if atom was found
          mouseFlags.downOnAtom = true;
					mouseFlags.downAtomObject = withinObject.foundAtom;
					mouseFlags.downAtomCoords = withinObject.absPos;
					mouseFlags.downAtomPrevAtom = withinObject.prevAtom;
					mouseFlags.downAtomLeadingBond = withinObject.leadingBond;
					mouseFlags.downAtomFirst = withinObject.firstAtom;
					mouseFlags.downAtomHasDuplicate = withinObject.hasDuplicate;
        }
      }

			function checkIfDownOnArrow() {
				var withinObject = ModStructure.isWithinArrow(currWorkingStructure, mouseFlags.downMouseCoords);
        if (typeof withinObject.foundArrow !== "undefined") {
          // set flags if arrow was found
          mouseFlags.downOnArrow = true;
					mouseFlags.downArrowObject = withinObject.foundArrow;
					mouseFlags.downArrowStartCoords = withinObject.absPos;
					mouseFlags.downArrowWhere = withinObject.where;
        }
      }

			function checkIfDownOnBond() {
				var withinObject = ModStructure.isWithinBond(currWorkingStructure, mouseFlags.downMouseCoords);
        if (typeof withinObject.foundBond !== "undefined") {
					// set flags if bond was found
          mouseFlags.downOnBond = true;
					mouseFlags.downBondObject = withinObject.foundBond;
					mouseFlags.downBondEndAtomPos = withinObject.endAtomAbsPos;
					mouseFlags.downBondStartAtom = withinObject.startAtom;
        }
      }
    }

		/**
		* Function telling what to do on `mouseup` event.
		* @param {Object} $event - event object,
		* @param {Object} scope - scope object,
		* @param {Object} element - element object listening to this event
		*/
    service.doOnMouseUp = function ($event, scope, element) {
      var mouseCoords = DirUtils.innerCoords(element, $event), drawn, changedStructure = true;

			// if button other than left was released do nothing
			// or if selected flag is empty do nothing
      if ($event.which !== 1 || Flags.selected === "") {
				DirUtils.resetMouseFlags();
				return;
			}

			if (currWorkingStructure !== null && Flags.selected === "select") {
				// if selection tool was selected
				currWorkingStructure = ModStructure.makeSelection(
					currWorkingStructure,
					mouseCoords,
					mouseFlags.downMouseCoords
				);
				// remove `Selection` object afterwards
				currWorkingStructure.getStructure().pop();
			} else if (currWorkingStructure !== null && Flags.selected === "moveStructure") {
				// if `move` tool was selected
				ModStructure.moveStructure(
					currWorkingStructure,
					mouseCoords,
					mouseFlags.downMouseCoords
				);
			} else if (Flags.selected === "textArea") {
				// if `textArea` was selected
				currWorkingStructure = ModStructure.addTextArea(
					currWorkingStructure,
					mouseFlags.downMouseCoords,
					Flags.textArea
				);
			} else if (Flags.selected === "arrow") {
				// if arrow was selected,
				// and click was done on empty space
				currWorkingStructure = ModStructure.addArrowOnEmptySpace(
					currWorkingStructure,
					mouseCoords,
					mouseFlags.downMouseCoords,
					scope.chosenArrow
				);
			} else if (mouseFlags.downOnAtom && Flags.selected === "removeLabel") {
        // if atom has been found and label is selected
        ModStructure.removeLabel(
					mouseFlags.downAtomObject,
					Flags.selected,
					scope.chosenLabel,
					Flags.customLabel
				);
      } else if (mouseFlags.downOnAtom && Flags.selected === "delete") {
				// if delete was selected
				ModStructure.deleteAtom(
					currWorkingStructure,
					mouseFlags.downAtomObject,
					mouseFlags.downAtomCoords,
					mouseFlags.downAtomLeadingBond,
					mouseFlags.downAtomPrevAtom,
					mouseFlags.downAtomHasDuplicate
				);
				ModStructure.labelSingleAtoms(currWorkingStructure);
			} else if (mouseFlags.downOnAtom && DirUtils.performSearch(["label", "customLabel"])) {
        // if atom has been found and label is selected
        ModStructure.modifyLabel(
					mouseFlags.downAtomObject,
					Flags.selected,
					scope.chosenLabel,
					Flags.customLabel
				);
      } else if (mouseFlags.downOnAtom && Flags.selected === "structure" && $event.ctrlKey) {
				// if atom has been found and structure has been selected and ctrl key is pressed
        ModStructure.modifyAtom(
					currWorkingStructure,
					mouseFlags.downAtomObject,
					mouseFlags.downAtomFirst,
					mouseFlags.downAtomCoords,
					mouseCoords,
					scope.chosenStructure,
					true
				);
      } else if (mouseFlags.downOnAtom && Flags.selected === "structure") {
        // if atom has been found and structure has been selected
        ModStructure.modifyAtom(
					currWorkingStructure,
					mouseFlags.downAtomObject,
					mouseFlags.downAtomFirst,
					mouseFlags.downAtomCoords,
					mouseCoords,
					scope.chosenStructure
				);
      } else if (mouseFlags.downOnBond && Flags.selected === "structure") {
        // if atom has been found and structure has been selected
        changedStructure = ModStructure.modifyBond(
					mouseFlags.downBondObject,
					mouseFlags.downBondStartAtom,
					scope.chosenStructure
				);
      } else if (mouseFlags.downOnBond && Flags.selected === "delete") {
        // if atom has been found and structure has been selected
        ModStructure.deleteBond(
					currWorkingStructure,
					mouseFlags.downBondObject,
					mouseFlags.downBondStartAtom,
					mouseFlags.downBondEndAtomPos
				);
				ModStructure.labelSingleAtoms(currWorkingStructure);
      } else if (mouseFlags.downOnArrow && Flags.selected === "delete") {
        // if atom has been found and label is selected
        ModStructure.deleteArrow(
					currWorkingStructure,
					mouseFlags.downArrowObject
				);
      } else if (mouseFlags.downOnArrow && Flags.selected === "resizeArrow") {
        // if atom has been found and label is selected
        ModStructure.resizeArrow(
					mouseFlags.downArrowObject,
					mouseFlags.downArrowStartCoords,
					mouseFlags.downArrowWhere,
					mouseCoords,
					$event.ctrlKey
				);
      } else if (Flags.selected === "structure" && $event.ctrlKey) {
				// if content is empty or atom was not found
        currWorkingStructure = ModStructure.addStructureOnEmptySpace(
					currWorkingStructure,
					mouseCoords,
					mouseFlags.downMouseCoords,
					scope.chosenStructure,
					true
				);
      } else if (Flags.selected === "structure") {
				// if content is empty or atom was not found
        currWorkingStructure = ModStructure.addStructureOnEmptySpace(
					currWorkingStructure,
					mouseCoords,
					mouseFlags.downMouseCoords,
					scope.chosenStructure
				);
      }

      if (currWorkingStructure !== null && changedStructure) {
        // if the structure has been successfully set to something
				// then add it to Cache and draw it
        Cache.addStructure(angular.copy(currWorkingStructure));
				drawn = DirUtils.drawStructure(currWorkingStructure);
				Cache.setCurrentSvg(drawn.wrap("full", "g").wrap("full", "svg").elementFull);
      }
			// reset mouse flags afterwards
      DirUtils.resetMouseFlags();
    };

		/**
		* Function telling what to do on `mousemove` event.
		* @param {Object} $event - event object,
		* @param {Object} scope - scope object,
		* @param {Object} element - element object listening to this event
		*/
    service.doOnMouseMove = function ($event, scope, element) {
      var mouseCoords = DirUtils.innerCoords(element, $event),
			  drawn, frozenStructure, frozenAtomObj = {}, frozenArrowObj = {};

      if ($event.which !== 1 || DirUtils.performSearch(["label", "labelCustom", "delete", ""])) {
				// if mousedown event did not occur, then do nothing
        // if label is selected or nothing is selected, then also do nothing
        return;
      }

			frozenStructure = angular.copy(currWorkingStructure);

			if (frozenStructure !== null) {
				frozenAtomObj = ModStructure.isWithinAtom(frozenStructure, mouseFlags.downMouseCoords);
				if (typeof frozenAtomObj.foundAtom === "undefined") {
					frozenArrowObj = ModStructure.isWithinArrow(frozenStructure, mouseFlags.downMouseCoords);
				}
			}

			if (Flags.selected === "select") {
				// if selection tool was selected
				ModStructure.makeSelection(frozenStructure, mouseCoords, mouseFlags.downMouseCoords);
			} else if (Flags.selected === "moveStructure") {
				// if move tool was selected
				ModStructure.moveStructure(frozenStructure, mouseCoords, mouseFlags.downMouseCoords);
			} else if (Flags.selected === "arrow") {
				// the content is either empty or the mousedown event occurred somewhere outside of the current `Structure` object
				frozenStructure = ModStructure.addArrowOnEmptySpace(
					frozenStructure,
					mouseCoords,
					mouseFlags.downMouseCoords,
					scope.chosenArrow
				);
      } else if (typeof frozenAtomObj.foundAtom !== "undefined" && $event.ctrlKey) {
				// if atom has been found and structure has been selected and ctrl key is pressed
        ModStructure.modifyAtom(
					frozenStructure,
					frozenAtomObj.foundAtom,
					frozenAtomObj.firstAtom,
					frozenAtomObj.absPos,
					mouseCoords,
					scope.chosenStructure,
					true
				);
      } else if (typeof frozenAtomObj.foundAtom !== "undefined") {
				// if atom has been found and structure has been selected
        ModStructure.modifyAtom(
					frozenStructure,
					frozenAtomObj.foundAtom,
					frozenAtomObj.firstAtom,
					frozenAtomObj.absPos,
					mouseCoords,
					scope.chosenStructure
				);
      } else if (Flags.selected === "structure" && $event.ctrlKey) {
				// if content is empty or atom was not found
        frozenStructure = ModStructure.addStructureOnEmptySpace(
					frozenStructure,
					mouseCoords,
					mouseFlags.downMouseCoords,
					scope.chosenStructure,
					true
				);
      } else if (typeof frozenArrowObj.foundArrow !== "undefined" && Flags.selected === "resizeArrow") {
        // if atom has been found and label is selected
        ModStructure.resizeArrow(
					frozenArrowObj.foundArrow,
					frozenArrowObj.absPos,
					frozenArrowObj.where,
					mouseCoords,
					$event.ctrlKey
				);
      } else if (Flags.selected === "structure") {
				// if content is empty or atom was not found
        frozenStructure = ModStructure.addStructureOnEmptySpace(
					frozenStructure,
					mouseCoords,
					mouseFlags.downMouseCoords,
					scope.chosenStructure
				);
      }

			if (frozenStructure !== null) {
				drawn = DirUtils.drawStructure(angular.copy(frozenStructure));
				Cache.setCurrentSvg(drawn.wrap("full", "g").wrap("full", "svg").elementFull);
			}
    }

		return service;
	}
})();
