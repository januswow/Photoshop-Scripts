#target photoshop
app.bringToFront();

//////////////////////////////////////////////////
// MULTI-LANGUAGE BITMAP TEXT TOOL
//////////////////////////////////////////////////
var scriptVersion = 0.1; // This is incremented every time the script is modified, so you know if you have the latest.

var originalDoc;
try {
    originalDoc = activeDocument;
} catch (ignored) {}

var defaultSettings = {
    autoFontSize: false,
    autoHorizontalScale: true,
    ignoreSourceLanguage: true,
    sourceLanguageIndex: 1, // Source language DDL default selection.
    languageNames: "英文,繁體,簡體,泰文,越南文,日文,韓文",
    stringsSource: "Free Spins,免費旋轉,免费旋转,ฟรีสปิน,miễn quay,フリースピン,자유로운 회전 급강하",
};
var settings = loadSettings();
showSettingsDialog();

//////////////////////////////////////////////////
// MAIN PROCESS - RUN
//////////////////////////////////////////////////
function run(){
    // Input data, convert string to array.
    var languageNamesArray = settings.languageNames.split(",");
    var stringsSourceArray = settings.stringsSource.split(",");
    if (arrayIncludesEmpty(languageNamesArray)) {
        alert("語系中有空白的項目, 請檢查後再執行!");
        return;
    }
    if (languageNamesArray.length != stringsSourceArray.length) {
        alert("語系與文字的數量不一致, 請檢查後再執行!");
        return;
    }

    // Ignore source language.
    if (settings.ignoreSourceLanguage) {
        if (settings.sourceLanguageIndex > -1 & settings.sourceLanguageIndex < languageNamesArray.length) {
            languageNamesArray.splice(settings.sourceLanguageIndex, 1);
            stringsSourceArray.splice(settings.sourceLanguageIndex, 1);
        }
    }

    // Photoshop handling.
    // Get layer source from layer selected.
    var sourceLayer = originalDoc.activeLayer;
    var sourceLayerType = sourceLayer.kind;
    var sourceLayerWidth = sourceLayer.bounds[2] - sourceLayer.bounds[0];
    var sourceLayerHeight = sourceLayer.bounds[3] - sourceLayer.bounds[1];
    // Get safe bounds from current selection.
    var hasTextSafeBounds = false;
    try {
        var textSafeBounds = originalDoc.selection.bounds;
        var textSafeBoundsWidth = textSafeBounds[2] - textSafeBounds[0];
        var textSafeBoundsHeight = textSafeBounds[3] - textSafeBounds[1];
        hasTextSafeBounds = true;
    } catch (e) {
        // Warning if selection is not exist.
        if (settings.autoFontSize | settings.autoHorizontalScale) {
            var autoScaleWarningConfirm = confirm("尚未選取安全範圍, 將無法自動調整文字尺寸, 是否要繼續執行?");
            if (!autoScaleWarningConfirm) return;
        }
    }

    // Start to create layers for other languages.
    var skippedCount = 0;
    var skippedLanguages = [];
    if (sourceLayerType == LayerKind.TEXT) {
        // Is text layer.
        for (var i = 0; i < stringsSourceArray.length; i++) {
            // Create.
            if (stringsSourceArray[i] != "") {
                var newLayer = sourceLayer.duplicate();
                newLayer.name = languageNamesArray[i];
                newLayer.textItem.contents = stringsSourceArray[i];

                // Auto scale size, checking width.
                if (hasTextSafeBounds) {
                    var newLayerWidth = newLayer.bounds[2] - newLayer.bounds[0];
                    if (newLayerWidth > textSafeBoundsWidth){
                        // Text's width is bigger than bounds, scale down.
                        var diffScale = Math.round(textSafeBoundsWidth / newLayerWidth * 100) / 100;
                        // Scale down in 3 ways, according to settings.
                        if (settings.autoFontSize & settings.autoHorizontalScale) {
                            var scaleBalance = 0.5;
                            var modFontSize = (1 - diffScale) * scaleBalance;
                            var modHorizontalScale = (1 - diffScale) * (1 - scaleBalance);
                            newLayer.textItem.size = Math.round(newLayer.textItem.size * (diffScale + modFontSize));
                            newLayer.textItem.horizontalScale = Math.round(newLayer.textItem.horizontalScale * (diffScale + modHorizontalScale));
                            newLayer.name += "!!";
                        } else if (settings.autoFontSize) {
                            newLayer.textItem.size = Math.round(newLayer.textItem.size * diffScale);
                            newLayer.name += "!!";
                        } else if (settings.autoHorizontalScale) {
                            newLayer.textItem.horizontalScale = Math.round(newLayer.textItem.horizontalScale * diffScale);
                            newLayer.name += "!!";
                        }
                    }                
                }
            } else {
                skippedCount += 1;
                skippedLanguages.push(languageNamesArray[i]);
            }
        }
    }
    var doneString = "執行完畢!";
    if (skippedCount > 0) {
        doneString += "\n略過了 " + skippedCount + " 個文字, 因為內容是空的.";
        doneString += "\n略過的語系是 : " + skippedLanguages.join(",");
    }
    alert(doneString);
}

//////////////////////////////////////////////////
// UI - SETTINGS DIALOG
//////////////////////////////////////////////////
function showSettingsDialog () {
    if (parseInt(app.version) < 10) {
        alert("僅支援 CS3 以上的 Photoshop 版本.");
        return;
    }
    if (!originalDoc) {
        alert("執行工具前必須先開啟 PSD 文件.");
        return;
    }
    try {
        decodeURI(activeDocument.path);
    } catch (e) {
        alert("執行工具前必須先儲存 PSD 文件.");
        return;
    }

    // UI - Layout.
    var dialog = new Window("dialog", "多國語系美術字 Photoshop 工具 v" + scriptVersion), group;
    dialog.alignChildren = "fill";

    // UI - Settings - Auto Scale Size Group.
    var autoScaleSizeGroupGroup = dialog.add("panel", undefined, "自動調整文字尺寸 ");
        autoScaleSizeGroupGroup.margins = [10,15,10,10];
        autoScaleSizeGroupGroup.alignChildren = "fill";
        autoScaleSizeGroupGroup.orientation = "column";
        var checkboxGroup = autoScaleSizeGroupGroup.add("group");
            checkboxGroup.alignChildren = ["fill", ""];
            checkboxGroup.orientation = "column";
            group = checkboxGroup.add("group");
                group.orientation = "column";
                group.alignChildren = ["fill", ""];
                group.alignment = ["fill", ""];
                group.add("statictext", undefined, "會依據正在選取中的安全範圍, 自動縮小過寬的文字尺寸, 複數勾選時會按比例分配.");
                group.add("statictext", undefined, " ** 處理過的圖層會在圖層名稱添加後綴 \"!!\"");
            group = checkboxGroup.add("group");
                group.orientation = "row";
                group.alignChildren = ["fill", ""];
                group.alignment = ["left", ""];;
                var autoFontSizeCheckbox = group.add("checkbox", undefined, " 自動調整字體大小 (Font size)");
                autoFontSizeCheckbox.value = settings.autoFontSize;
                var autoHorizontalScaleCheckbox = group.add("checkbox", undefined, " 自動調整文字寬度 (Horizontally scale)");
                autoHorizontalScaleCheckbox.value = settings.autoHorizontalScale;

    // UI - Settings - Basic.
    var settingsGroup = dialog.add("panel", undefined, "設定 ");
        settingsGroup.margins = [10,15,10,10];
        settingsGroup.alignChildren = "fill";
        settingsGroup.orientation = "column";
        // Ignore source language.
        var ignoreSourceLanguageGroup = settingsGroup.add("group");
            ignoreSourceLanguageGroup.alignChildren = ["fill", ""];
            ignoreSourceLanguageGroup.orientation = "column";
            group = ignoreSourceLanguageGroup.add("group");
                group.orientation = "row";
                group.alignChildren = ["fill", ""];
                group.alignment = ["left", ""];
                var ignoreSourceLanguageCheckbox = group.add("checkbox", undefined, " 忽略來源語系");
                ignoreSourceLanguageCheckbox.value = settings.ignoreSourceLanguage;
                var sourceLanguageDDL = group.add("dropdownlist", undefined, settings.languageNames.split(","));
                sourceLanguageDDL.selection = sourceLanguageDDL.items[settings.sourceLanguageIndex];

    // Input Group.
    var inputDataGroup = dialog.add("panel", undefined, "語系及文字設定 ");
        inputDataGroup.alignChildren = ["fill", ""];
        inputDataGroup.margins = [10,15,10,10];
        var languageNamesInput, stringsSourceInput;
        var textGroup = inputDataGroup.add("group");
        textGroup.orientation = "column";
        textGroup.alignChildren = ["fill", ""];
        // Language.
        group = textGroup.add("group");
            group.orientation = "column";
            group.alignChildren = ["fill", ""];
            group.add("statictext", undefined, "語系");
            languageNamesInput = group.add("edittext", undefined, settings.languageNames);
        // Text.
        group = textGroup.add("group");
            group.orientation = "column";
            group.alignChildren = ["fill", ""];
            group.add("statictext", undefined, "文字");
            stringsSourceInput = group.add("edittext", [0, 0, 250, 100], settings.stringsSource, {multiline: true});

    // UI - Readme before buttons.
    group = dialog.add("group");
        group.orientation = "column";
        group.alignChildren = ["right", ""];
        group.add("statictext", undefined, "執行前, 必須先選擇來源文字圖層! 要自動調整文字尺寸還要選取安全範圍!");

    // UI - Buttons.
    var buttonGroup = dialog.add("group");
        var helpButton;
        helpButton = buttonGroup.add("button", undefined, "使用說明");
        group = buttonGroup.add("group");
            group.alignment = ["fill", ""];
            group.alignChildren = ["right", ""];
            var runButton = group.add("button", undefined, "執行");
            var cancelButton = group.add("button", undefined, "關閉");

    // Tooltips.
    autoFontSizeCheckbox.helpTip = "勾選時, 依據 安全範圍 自動等比調整 文字寬度與高度. (必須先選取安全範圍)";
    autoHorizontalScaleCheckbox.helpTip = "勾選時, 依據安全範圍 自動調整 文字寬度. (必須先選取安全範圍)";
    ignoreSourceLanguageCheckbox.helpTip = "勾選時, 將會從輸入的語系資料中, 自動忽略來源語系.";
    sourceLanguageDDL.helpTip = "指定來源語系.";
    languageNamesInput.helpTip = "輸入需要產生的語系中文名稱(按照規則), 複數語系時請使用\",\"分隔, 順序必須跟 文字 一致.";
    stringsSourceInput.helpTip = "輸入需要產生的文字, 複數語系時請使用\",\"分隔, 順序必須跟 語系 一致.";

    // Functions.
    function updateSettings () {
        settings.autoFontSize = autoFontSizeCheckbox.value;
        settings.autoHorizontalScale = autoHorizontalScaleCheckbox.value;
        settings.ignoreSourceLanguage = ignoreSourceLanguageCheckbox.value;
        settings.sourceLanguageIndex = sourceLanguageDDL.selection.index;
        settings.languageNames = languageNamesInput.text;
        settings.stringsSource = stringsSourceInput.text;
    }
    // Button function.
    helpButton.onClick = showHelpDialog;
    cancelButton.onClick = function () {
        cancel = true;
        dialog.close();
        return;
    };
    runButton.onClick = function () {
        if (originalDoc.activeLayer.kind != LayerKind.TEXT) {
            alert("必須先選擇來源文字圖層!!");
            return;
        }
        if (languageNamesInput.text < 0) {
            alert("語系欄位不可空白!");
            return;
        }
        if (stringsSourceInput.text < 0) {
            alert("文字欄位不可空白!");
            return;
        }

        updateSettings();
        saveSettings();

        autoFontSizeCheckbox.enabled = false;
        autoHorizontalScaleCheckbox.enabled = false;
        ignoreSourceLanguageCheckbox.enabled = false;
        sourceLanguageDDL.enabled = false;
        languageNamesInput.enabled = false;
        stringsSourceInput.enabled = false;
        helpButton.enabled = false;
        runButton.enabled = false;
        cancelButton.enabled = false;
        var rulerUnits = app.preferences.rulerUnits;
        app.preferences.rulerUnits = Units.PIXELS;
        try {
            // var start = new Date().getTime();
            // Run in one history step by suspendHistory.
            originalDoc.suspendHistory("Multi-language Tool", "run()");
            // alert(new Date().getTime() - start);
        } catch (e) {
            alert("發生不可預期的錯誤!");
            debugger;
        } finally {
            if (activeDocument != originalDoc) activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            app.preferences.rulerUnits = rulerUnits;
            dialog.close();
        }
    };

    dialog.center();
    dialog.show();
}

//////////////////////////////////////////////////
// FUNCTIONS
//////////////////////////////////////////////////
// Functions - Settings
function loadSettings () {
// alert("loadSettings begin");
    var options = null;
    try {
        options = app.getCustomOptions(sID("settings"));
    } catch (e) {
    }

    var settings = {};
    for (var key in defaultSettings) {
        if (!defaultSettings.hasOwnProperty(key)) continue;
        var typeID = sID(key);
        if (options && options.hasKey(typeID)) {
            settings[key] = options["get" + getOptionType(defaultSettings[key])](typeID);
        } else {
            settings[key] = defaultSettings[key];
        }
// alert("loadSettings"
//     + "\nkey : " + key
//     + ""
//     + "\ndefaultSettings[key] : " + defaultSettings[key]
//     + "\ntypeof : " + typeof(defaultSettings[key])
//     + ""
//     + "\nsettings[key] : " + settings[key]
//     + "\ntypeof : " + typeof(settings[key])
// );
    }
// alert("loadSettings end"
//     + "\nsettings.sourceLanguageIndex : " + settings.sourceLanguageIndex
//     + "\ntypeof : " + typeof(settings.sourceLanguageIndex)
// );
    return settings;
}

function saveSettings () {
// alert("saveSettings begin"
//     + "\nsettings.sourceLanguageIndex : " + settings.sourceLanguageIndex
//     + "\ntypeof : " + typeof(settings.sourceLanguageIndex)
// );
// alert("saveSettings begin");
    var action = new ActionDescriptor();
    for (var key in defaultSettings) {
        if (!defaultSettings.hasOwnProperty(key)) continue;

// alert("saveSettings for begin" 
//     + ""
//     + "\nkey : " + key 
//     + "\nhasOwnProperty : " + defaultSettings.hasOwnProperty(key) 
//     + ""
//     + "\ndefaultSettings[key] : " + defaultSettings[key] 
//     + "\ntypeof : " +  typeof(defaultSettings[key])
//     + "\ngetOptionType : " + getOptionType(defaultSettings[key])
//     + ""
//     + "\nSID : " + sID(key)
//     + ""
//     + "\nsettings[key] : " + settings[key] 
//     + "\ntypeof : " +  typeof(settings[key])
//     // + "\naction : " + action["put" + getOptionType(defaultSettings[key])](sID(key), settings[key])
// );
        action["put" + getOptionType(defaultSettings[key])](sID(key), settings[key]);

    }
    app.putCustomOptions(sID("settings"), action, true);
}

function showHelpDialog () {
    var dialog = new Window("dialog", "多國語系 Photoshop 工具 - 使用說明");
    dialog.alignChildren = ["fill", ""];
    dialog.orientation = "column";
    dialog.alignment = ["", "top"];

    var helpText = dialog.add("statictext", [0, 0, 700, 300], ""
        + "本工具目的為簡化多國語系美術字製作的工作流程, 將部份程序自動化處理." 
        + "\n可依據已製作好的來源語系文字, 自動產出其他語系所需的文字圖層."
        + "\n\n功能 :"
        + "\n\t•  自動產出其他語系所需的文字圖層."
        + "\n\t•  產出的圖層名稱為語系名稱."
        + "\n\t•  自動調整過寬文字的尺寸."
        + "\n"
        + "\n使用教學 :"
        + "\n\t[1]  選擇來源文字的 Photoshop 圖層."
        + "\n\t[2]  在 Photoshop 中選取安全範圍."
        + "\n\t\t* 要使用自動調整文字尺寸功能時才需要."
        + "\n\t[3]  設定自動調整文字尺寸功能 (AUTO SCALE SIZE) 的參數."
        + "\n\t\t* 目前僅判斷寬度的差距, 無法判斷靠左或靠右."
        + "\n\t\t* 調整過的圖層, 圖層名稱會添加後綴 \"!!\"."
        + "\n\t[4]  從譯文資料表拷貝語系中文名稱到 Language 欄位."
        + "\n\t\t* 建議以CSV格式拷貝, 會包含分隔用的逗號."
        + "\n\t[5]  從譯文資料表拷貝所有語系的文案到 Text 欄位."
        + "\n\t\t* 建議以CSV格式拷貝, 會包含分隔用的逗號."
        + "\n\t[6]  執行!"
    , {multiline: true});
    helpText.preferredSize.width = 325;

    var closeButton = dialog.add("button", undefined, "關閉");
    closeButton.alignment = ["center", ""];

    closeButton.onClick = function () {
        dialog.close();
    };

    dialog.center();
    dialog.show();
}

// Functions - History
var history;
function storeHistory () {
    history = activeDocument.activeHistoryState;
}
function restoreHistory () {
    activeDocument.activeHistoryState = history;
}

// Functions - System
function getOptionType (value) {
    switch (typeof(value)) {
        case "boolean": return "Boolean";
        case "string": return "String";
        case "number": return "Double";
    };
    throw new Error("Invalid default setting: " + value);
}
function cID (id) {
    return charIDToTypeID(id);
}
function sID (id) {
    return stringIDToTypeID(id);
}
function arrayIncludesEmpty (ary) {
    var result = false;
    for (var i in ary)
        if (ary[i] == "") result = true;
    return result;
}


/*
//////////////////////////////
// READ DOCUMENT PROPERTIES
//////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Function: hasZeroDimensions
// Usage: we read layer dimensions and if are zero then layer has zero visible pixels (they might be hidden with vector or bitmap mask)
// Input: index of desired layer
// Return: Boolean
///////////////////////////////////////////////////////////////////////////////
function hasZeroDimensions(index) {
    var desc = getLayerPropertyDescriptor(index, TID.bounds);
    var bounds = desc.getObjectValue(TID.bounds);
    var left = bounds.getDouble(TID.left);
    var right = bounds.getDouble(TID.right);
    var top = bounds.getDouble(TID.top);
    var bottom = bounds.getDouble(TID.bottom);
    var result = (left === right) && (top === bottom);
    return result;
}
///////////////////////////////////////////////////////////////////////////////
// Function: getIsClipped
// Usage: we don't want remove locked layers. There are multiple kinds of locks. We need only "protectAll"
// Input: index of desired layer
// Return: Boolean
///////////////////////////////////////////////////////////////////////////////
function getIsLocked(index) {
    var desc = getLayerPropertyDescriptor(index, TID.layerLocking);
    var descLocking = desc.getObjectValue(TID.layerLocking);
    var locked = descLocking.getBoolean(TID.protectAll);
    return locked;
}
///////////////////////////////////////////////////////////////////////////////
// Function: getIsClipped
// Usage: returns ID of layer so we can target layer no matter of layer position in layers panel
// Input: index of desired layer
// Return: Integer
///////////////////////////////////////////////////////////////////////////////
function getLayerId(index) {
    var desc = getLayerPropertyDescriptor(index, TID.layerID);
    var id = desc.getInteger(TID.layerID);
    return id;
}
///////////////////////////////////////////////////////////////////////////////
// Function: getIsClipped
// Usage: returns true if layer is clipping mask
// Input: index of desired layer
// Return: Boolean
///////////////////////////////////////////////////////////////////////////////
function getIsClipped(index) {
    var desc = getLayerPropertyDescriptor(index, TID.group);
    var group = desc.getBoolean(TID.group);
    return group;
}
///////////////////////////////////////////////////////////////////////////////
// Function: getLayerType
// Usage: returns type of layer
// Input: index of desired layer
// Return: String
///////////////////////////////////////////////////////////////////////////////
function getLayerType(index) {
    var desc = getLayerPropertyDescriptor(index, TID.layerSection);
    var type = desc.getEnumerationValue(TID.layerSection);
    switch (type) {
        case TID.layerSectionEnd:
            return 'endOfLayerSet';
        case TID.layerSectionStart:
            return 'startOfLayerSet';
        case TID.layerSectionContent:
            return 'layer';
        default:
            return undefined;
    }
}
///////////////////////////////////////////////////////////////////////////////
// Function: getNumberOfLayers
// Usage: returns number of all layers in document
// Input: <none> Must have an open document
// Return: Integer
///////////////////////////////////////////////////////////////////////////////
function getNumberOfLayers() {
    var desc = getDocumentPropertyDescriptor(TID.numberOfLayers);
    var numberOfLayers = desc.getInteger(TID.numberOfLayers);
    return numberOfLayers;
}
///////////////////////////////////////////////////////////////////////////////
// Function: getIsEmptyTextLayer
// Usage: returns number of all layers in document
// Input: index of desired layer
// Return: Boolean
///////////////////////////////////////////////////////////////////////////////
function getIsEmptyTextLayer(index) {
    var textKey = getLayerPropertyDescriptor(index, TID.textKey);
    
    var isTextLayer = textKey.hasKey(TID.textKey);
    if (!isTextLayer) {
        return false;
    }
    var contentString = textKey.getObjectValue(TID.textKey).getString(TID.textKey);
    var result = (contentString === "");
    return result;
}
///////////////////////////////////////////////////////////////////////////////
// Function: getBackgroundLayerCounter
// Usage: returns if document has background layer
// Input: <none> Must have an open document
// Return: 1 or 0
///////////////////////////////////////////////////////////////////////////////
function getBackgroundLayerCounter() {
    var desc = getDocumentPropertyDescriptor(TID.hasBackgroundLayer);
    var result = Number(desc.getBoolean(TID.hasBackgroundLayer));
    return result;
}
/////////////
// UTILITY
/////////////
///////////////////////////////////////////////////////////////////////////////
// Function: getLayerPropertyDescriptor
// Usage: shortcut helper function which return info about layer property
// Input: Index of desired layer, typeID of desired property
// Return: ActionDescriptor
///////////////////////////////////////////////////////////////////////////////
function getLayerPropertyDescriptor(index, property) {
    var ref = new ActionReference();
    ref.putProperty(TID.property, property);
    ref.putIndex(TID.layer, index);
    var desc = executeActionGet(ref);
    return desc;
}
///////////////////////////////////////////////////////////////////////////////
// Function: getDocumentPropertyDescriptor
// Usage: shortcut helper function which return info about current document property
// Input: TypeID of desired property
// Return: ActionDescriptor
///////////////////////////////////////////////////////////////////////////////
function getDocumentPropertyDescriptor(property) {
    var ref = new ActionReference();
    ref.putProperty(TID.property, property);
    ref.putEnumerated(TID.document, TID.ordinal, TID.target);
    var desc = executeActionGet(ref);
    return desc;
}
///////////////
// ACTIONS
///////////////
///////////////////////////////////////////////////////////////////////////////
// Function: runHideLayers
// Usage: sets visibility of multiple layers to hidden
// Input: Array of layerIndexes
// Return: undefined
///////////////////////////////////////////////////////////////////////////////
function runHideLayers(hideLayersList) {
    var desc = new ActionDescriptor();
    var list = new ActionList();
    for (var i = 0, len = hideLayersList.length; i < len; i++) {
        var ref = new ActionReference();
        ref.putIndex(TID.layer, hideLayersList[i]);
        list.putReference(ref);
    }
    desc.putList(TID.idNull, list);
    executeAction(TID.hide, desc, DialogModes.NO);
}
//*/
///////////////////////////////////////////////////////////////////////////////
// Function: runDeleteLayers
// Usage: deletes multiple layers one by one accoring layerID
// Input: Array of layerIDs
// Return: undefined
///////////////////////////////////////////////////////////////////////////////
/*
function runDeleteLayers (list) {
    var desc = new ActionDescriptor();
    var layerRef = new ActionReference();
    for (var i = list.length - 1, len = i; i >= 0; i--) {
        layerRef.putIdentifier(TID.layer, list[i]);
    }
    desc.putReference(TID.idNull, layerRef);
    // "Try" because document must have at least one layer ...what if all layers would be empty?
    // And single layerSet always has 2 layers so it's a bit complicated
    try{
        executeAction(TID.idDelete, desc, DialogModes.NO);
    }catch(e){
        runDeleteLayersFallBack(list);
    }
}
function runDeleteLayersFallBack(list) {
    for (var i = list.length - 1, len = i; i >= 0; i--) {
        var desc = new ActionDescriptor();
        var layerRef = new ActionReference();
        layerRef.putIdentifier(TID.layer, list[i]);
        desc.putReference(TID.idNull, layerRef);
        // Try because document must have at least one layer ...what if all layers would be empty?
        // And single layerSet always has 2 layers so it's a bit complicated
        try{
            executeAction(TID.idDelete, desc, DialogModes.NO);
        }catch(e){
            /* do nothing */
        // }
    // }
// }
//*/
/*
///////////////////////////////////////////////////////////////////////////////
// Function: acceleratePlayback
// Usage: in action preferences can be set delay between each action so we make sure that there is no delay
// Input: <none>
// Return: undefined
///////////////////////////////////////////////////////////////////////////////
function acceleratePlayback() {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    var desc2 = new ActionDescriptor();
    ref.putProperty(TID.property, TID.playbackOptions);
    ref.putEnumerated(TID.application, TID.ordinal, TID.target);
    desc.putReference(TID.idNull, ref);
    desc2.putEnumerated(TID.performance, TID.performance, TID.accelerated);
    desc.putObject(TID.to, TID.playbackOptions, desc2);
    executeAction(TID.set, desc, DialogModes.NO);
}
// End Delete All Empty Layers.jsx
//*/
