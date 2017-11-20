// Author : Janus Huang
// E-MAIL : januswow@gmail.com
// QQ : 2646089959
//
// This script is for Photoshop-LayersToPNG_JH.
// Auto detect layer's best rotate degree and add rotate parameter to layer name automatically.
// 
// Instruction:
// 1. Select the layer(or group) you want to rotate.
// 2. Run script.
// 5. Wait finish message.
//
// 此腳本為搭配 Photoshop-LayersToPNG_JH 使用.
// 脚本會自動偵測最佳的旋轉角度並添加自訂旋轉值參數到圖層名稱內(圖層名稱範例:"layerName #r40").
// 使用方法：
// 1. 使用時先選取欲旋轉的圖層(或群組).
// 2. 執行此腳本.
// 3. 等待結束的訊息框.

var docRef;
try {
	docRef = app.activeDocument;
} catch (ignored) {}

run();

function run () {
    // SETTINGS START --------------------
    // Script will detect layer's bounds every 'rotateStep'.
    var rotateStep = 5;
    // Detect in this range.
    var degreeRange = 90;
    // Script will execute optimization when the bounds is reduced more than 'minPixels'(square).
    var defMinPixels = 10;
    var minPixels;
    // Threshold is disbaled Now.
//    var threshold = 0.7;
    // Toogle debug messages.
    var debug = false;
    // SETTINGS END --------------------
    var executeFlag = true;
    
    minPixels = defMinPixels;

    if (executeFlag) {
        var tempDocName = "RotateTestDocument";
        // Save initial history state.
//        var initialState = app.activeDocument.activeHistoryState;
        var originalLayer = docRef.activeLayer;

        // Duplicate layer to temp document to optimzing execution speed.
        duplicateLayerToNewDocument(originalLayer.id,tempDocName);
        var tempDoc = app.documents.getByName(tempDocName);        
        var layer = tempDoc.activeLayer;
        
        var boundsAreaList = new Array();

        // If current layer is group, merge it first.
        if (layer.visible && layer.layers && layer.layers.length > 0) layer = layer.merge();

        // Save non-rotated and merged history state.
        var nonRotatedAndMergedState = app.activeDocument.activeHistoryState;

        // Check layer's bounds area of each rotateStep.
        for (var i = 0; i < (degreeRange / rotateStep); i++) {
            // Rotate layer.
            if (i != 0) layer.rotate(i * rotateStep, AnchorPosition.MIDDLECENTER);

            // get bounds area and save to array.
            var boundsArea = getBoundsArea(layer.bounds);
            boundsAreaList.push(boundsArea);

            // Restore non-rotated and merged history.
            app.activeDocument.activeHistoryState = nonRotatedAndMergedState;

            if (debug) $.writeln("Degree : " + (i * rotateStep).toString() + ", Area : " + boundsArea.toString());
        }

        // Find minimum bounds area.
        var minIndex = indexOfSmallest(boundsAreaList);
        var rotateValue = indexToDegree(minIndex, rotateStep);
        var optimizePercent = getOptimizePercentage(boundsAreaList, minIndex);
        var boundsAreaDiff = getOptimizeAreaDiff(boundsAreaList, minIndex);

        if (debug) $.writeln("MinArea : " + boundsAreaList[minIndex] + ", MinDegree : " + rotateValue.toString() + ", OptPct : " + optimizePercent.toString() + "%, OptPixelsInSquare : " + boundsAreaDiff.toString() + "px");

        if (boundsAreaDiff > minPixels) {
        // if (optimizePercent < threshold && boundsAreaDiff > minPixels) {
            // Execute optimization, Add rotate parameter to layer name.
            var newLayerName = "";
            var indexOfRotaParam = layer.name.indexOf(" #r");
            var indexOfNextSpace = layer.name.indexOf(" ", indexOfRotaParam + 3);

            if ( indexOfRotaParam != -1) {
                var origRotaParam = layer.name.substr(indexOfRotaParam + 3, indexOfNextSpace - indexOfRotaParam - 3);
                var nameBefore = layer.name.substr(0, indexOfRotaParam + 3);
                var nameAfter = "";
                if (indexOfNextSpace != -1) {
                    nameAfter = layer.name.substr(indexOfNextSpace);
                }
                newLayerName = nameBefore + rotateValue.toString() + nameAfter;
            } else {
                newLayerName = layer.name + " #r" + rotateValue.toString();
            }
            
            tempDoc.close(SaveOptions.DONOTSAVECHANGES);

            originalLayer.name = newLayerName;
        }
        
        // Reselect layer
        app.activeDocument = docRef;
        docRef.activeLayer = originalLayer;
        
        if (boundsAreaDiff > minPixels) {
            alert("完成!\n\
減少了" + boundsAreaDiff + " 像素(正方形).\r\
面積可縮小至" + optimizePercent + "%\n\
圖層名稱更新為 : \r" + newLayerName);
        } else {
            alert("取消.\n減少的面積過少, 低於 " + minPixels.toString() + " 像素(正方形).");
        }
    }
}

function getBoundsArea(bounds) {
    return (( bounds[2] - bounds[0] ) * ( bounds[3] - bounds[1] ));
}

function indexOfSmallest(ary) {
    var lowest = 0;
    for (var i = 1; i < ary.length; i++) {
        if (ary[i] < ary[lowest]) lowest = i;
    }
    return lowest;
}

function indexToDegree(idx, degreeStep) {
    return (idx * degreeStep);
}

function getOptimizePercentage(ary, idx) {
    return (Math.round(ary[idx] / ary[0] * 100));
}

function getOptimizeAreaDiff(ary, idx) {
    return (Math.round(Math.sqrt(ary[0] - ary[idx])))
}
  
function duplicateLayerToNewDocument(ID,filename) {  
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID("Lyr "), ID);
    
    var desc = new ActionDescriptor();
    desc.putReference(charIDToTypeID("null"), ref );
    
    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO );
    desc = new ActionDescriptor();
    ref = new ActionReference();
    ref.putClass( charIDToTypeID("Dcmn") );
    desc.putReference( charIDToTypeID("null"), ref );
    desc.putString( charIDToTypeID("Nm  "), filename );
    var ref2 = new ActionReference();
    //This line does not work!!!!!!!!!!!
    //It still wants the selected layer(s)
    ref2.putIdentifier(charIDToTypeID("Lyr "), ID);
    desc.putReference( charIDToTypeID("Usng"), ref2 );
    desc.putInteger( charIDToTypeID("Vrsn"), 5 );
    executeAction( charIDToTypeID("Mk  "), desc, DialogModes.NO );
}