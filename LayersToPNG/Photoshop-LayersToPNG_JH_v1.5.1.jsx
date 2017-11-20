// Spine Layers to png
// This script exports photoshop layers as individual PNGs. It also
// writes a JSON file that can be imported into Spine where the images
// will be displayed in the same positions and draw order.

// Mod by JanusHuang
// E-mail : januswow@gmail.com
// QQ : 2646089959
//
// v1.0.0
// - Allow defining custom scale and rotation to specified layer by adding suffixes to the layer name, and will apply to exported images and JSON data.
// v1.1.0
// - Prevent getting a crash from incorrect suffixes.
// - Now export images through 'Save For Web'.
// - Calculate transform data by layer bounds.
// - Allow corp pixels out of canvas.
// - Fixed incorrect position after layer rotated.
// - Setup template attachment correctly after 'Import Data' in Spine.
// v1.2.0
// - Allow merge group automatically.
// - Allow trim layer or not.
// - Can now ignore layers with the gray color label (Photoshop CC Only!!).
// - Can now ignore layers start with an underscore ("_").
// v1.3.0
// - Allow group as a slot (need to add suffix " #SLOT"), and each layer inside as attachment.
// - Fixed wrong slot order while has skins.
// - JSON data format now is the same as exported from Spine.
// v1.3.1
// - Fixed information of done dialog.
// v1.4.0
// - Added "Use '_ROOT' layer as origin", will set Spine origin position as the center of layer's bound.
// - Fixed incorrect JSON data when there is only one layer in the slot.
// - Fixed 'use ruler origin as 0,0'.
// - JSON data now include layer's blend mode.
// - JSON data now include layer's opacity.
// - Can now set resample method for resizing.
// v1.4.1
// - Fixed group with mask bug in PS CS6.(Merge group with mask on CS6 will delete pixels out of canvas.)
// v1.5
// - Add trim away settings.
// - Now have multi-languages(English, Traditional Chinese, Simplified Chinese).
// - Fixed layer's opacity function. (Incorrect opacity value calculation and forgot to reset layer's opacity to 100.)
// - Fixed failure of writing blendmode when layer has custom suffixes. (Record the wrong layer name, need to record in clean layer name.)
// - Fixed JSON format.
// - Fixed write template slot to default skin only.
// - Fixed wrong display order with default skin(All slots in default skin will go on top of skins).
//      (But disable the fix "Fixed wrong slot order while has skins." in v1.3.0, forgot what actually the bug is...)
// v1.5.1
// - Can resample to screen dpi (72dpi) automatically.
// - Close the temporarily document for merging gourps immediately.
// - More resample medthods.
//
// ## How to define custom scale and rotation
// Gives you more ability to optimize texture resolution.
// 		You are able to set export scale and rotation values for a specific layer in Photoshop and keep the size and rotation of attachments after importing to Spine, just the same as you see in Photoshop.
// 
// Define scale and rotation by adding suffixes to the layer name.
// Define scale by adding suffix ' #s' to the layer name.
// Define rotation by adding suffix ' #r' to the layer name.
// 
// ex.
// 'thisislayername #s0.5' (scale = 50%)
// 'thisislayername #s0.8 #r-12' (scale = 80%, rotation = -12 degree)
// Note: Suffix is case-sensitive.
// 
// ## How to use group as slot
// Adding suffix ' #SLOT' to the group name will export group as a slot, and each layer in the group will export as an attachment(PNG).
// Note: Suffix is case-sensitive.
//
// ## How to use '_ROOT' as origin
// Create a layer named '_ROOT', and draw a dot at the origin position. To prevent exporting '_ROOT' layer, you can hide the layer or enable 'Ignore starts with an underscore'.
// Note: Layer name is case-sensitive.
//
// Original Version : https://gist.github.com/NathanSweet/c8e2f6e1d79dedd56e8c

// Setting defaults.
var writePngs = true;
var writeTemplate = false;
var writeJson = true;
var ignoreHiddenLayers = true;
var pngScale = 1;
var groupsAsSkins = false;
var useRulerOrigin = false;
var imagesDir = "./images/";
var projectDir = "";
var padding = 1;

// Setting defaults. JH Version.
var currentLanguage = "EN";
var languagesList = ["English", "繁體中文", "简体中文"];
var languagesListValue = ["EN", "TC", "SC"];

var corpToCanvas = false;
var mergeGroups = true;
var allowTrimLayers = true;
var ignoreGrayLabelLayers = false;
var ignoreStartsWithUnderscoreLayers = true;
var useRootLayer = false;
var resampleToScreenDpi = false;
var screenDpi = 72;
var trimAwayLeft = true;
var trimAwayRight = true;
var trimAwayTop = true;
var trimAwayBottom = true;
var resample = 0;
var resampleObject;
var resampleMethods = {
    "Automatic" : ResampleMethod.AUTOMATIC,
    "Bicubic Automatic" : ResampleMethod.BICUBICAUTOMATIC,
	"Bicubic" : ResampleMethod.BICUBIC, 
	"Bicubic Sharper" : ResampleMethod.BICUBICSHARPER,
	"Bicubic Smoother" : ResampleMethod.BICUBICSMOOTHER, 
	"Bilinear" : ResampleMethod.BILINEAR, 
	"Nearest Neighbor" : ResampleMethod.NEARESTNEIGHBOR,
    "None" : ResampleMethod.NONE,
    "Preseve Details" : ResampleMethod.PRESERVEDETAILS
};

// JH Version Variables
var JHVersion = "1.5.1";
var patternRotate = " #r";
var patternScale = " #s";
var patternNoSkin = "-NOSKIN";
var patternAsSlot = " #SLOT";
var rootLayerName = "_ROOT";
// Minimum width/height pixels of output image
var customScaleMin = 4;
var docWidth;
var docHeight;
var startTime; 
var endTime;
var autoCloseDoc = true;
var mergeDoc;

// IDs for saving settings.
const settingsID = stringIDToTypeID("settings");
const writePngsID = stringIDToTypeID("writePngs");
const writeTemplateID = stringIDToTypeID("writeTemplate");
const writeJsonID = stringIDToTypeID("writeJson");
const ignoreHiddenLayersID = stringIDToTypeID("ignoreHiddenLayers");
const groupsAsSkinsID = stringIDToTypeID("groupsAsSkins");
const useRulerOriginID = stringIDToTypeID("useRulerOrigin");
const corpToCanvasID = stringIDToTypeID("corpToCanvas");
const mergeGroupsID = stringIDToTypeID("mergeGroups");

const allowTrimLayersID = stringIDToTypeID("allowTrimLayers");
const ignoreGrayLabelLayersID = stringIDToTypeID("ignoreGrayLabelLayers");
const ignoreStartsWithUnderscoreLayersID = stringIDToTypeID("ignoreStartsWithUnderscoreLayers");
const useRootLayerID = stringIDToTypeID("useRootLayer");
const pngScaleID = stringIDToTypeID("pngScale");
const imagesDirID = stringIDToTypeID("imagesDir");
const projectDirID = stringIDToTypeID("projectDir");
const paddingID = stringIDToTypeID("padding");
const resampleID = stringIDToTypeID("resample");
const trimAwayLeftID = stringIDToTypeID("trimAwayLeft");
const trimAwayRightID = stringIDToTypeID("trimAwayRight");
const trimAwayTopID = stringIDToTypeID("trimAwayTop");
const trimAwayBottomID = stringIDToTypeID("trimAwayBottom");
const currentLanguageID = stringIDToTypeID("currentLanguage");
const resampleToScreenDpiID = stringIDToTypeID("resampleToScreenDpi");

// LANGUAGES START --------------------------------------------------------------------------------
const STR_ROOT_LAYER_NOT_FOUND = {
    EN : "Root layer ('_ROOT') not found! Reset to default origin.",
    TC : "找不到 Root 圖層 ('_ROOT')! 重置成預設設定.",
    SC : "找不到 Root 图层 ('_ROOT')! 重置成预设设定."
}
const STR_OPEN_DOC_FIRST = {
    EN : "Please open a document before running the LayersToPNG script.",
    TC : "欲執行腳本請先開啟文件.",
    SC : "欲运行脚本请先开启文件."
}
const STR_SAVE_DOC_FIRST = {
    EN : "Please save the document before running the LayersToPNG script.",
    TC : "欲執行腳本請先儲存文件.",
    SC : "欲运行脚本请先储存文件."
}
const STR_WINDOW_TITLE = {
    EN : "Spine LayersToPNG JH v" + JHVersion + " by JanusHuang",
    TC : "Spine LayersToPNG JH v" + JHVersion + " by JanusHuang",
    SC : "Spine LayersToPNG JH v" + JHVersion + " by JanusHuang"
}
const STR_WRITE_LAYERS_AS_PNGS = {
    EN : " Write layers as PNGs",
    TC : " 輸出圖層為 PNG",
    SC : " 导出图层为 PNG"
}
const STR_WRITE_TEMPLATE_PNG = {
    EN : " Write a template PNG",
    TC : " 輸出範本 PNG",
    SC : " 导出样本 PNG"
}
const STR_WRITE_SPINE_JSON = {
    EN : " Write Spine JSON",
    TC : " 輸出 Spine JSON",
    SC : " 导出 Spine JSON"
}
const STR_WRITE_LAYER_OPACITY = {
    EN : " Write layer opacity",
    TC : " 寫入圖層透明度",
    SC : " 写入图层透明度"
}
const STR_WRITE_LAYER_BLENDMODE = {
    EN : " Write layer blendmode",
    TC : " 寫入圖層混合模式",
    SC : " 写入图层混合模式"
}
const STR_WRITE_CUSTOM_SCALE_AND_ROTATION = {
    EN : " Write custom S/R ( #s/ #r)",
    TC : " 寫入圖層自訂比例與旋轉值( #s/ #r)",
    SC : " 写入图层自订比例与旋转值( #s/ #r)"
}
const STR_IGNORE_HIDDEN_LAYERS = {
    EN : " Ignore hidden layers",
    TC : " 忽略隱藏的圖層",
    SC : " 忽略隐藏的图层"
}
const STR_IGNORE_STARTS_WITH_AN_UNDERSCORE = {
    EN : " Ignore starts with an underscore",
    TC : " 忽略名稱開頭為底線符號的圖層",
    SC : " 忽略名称开头为底线符号的图层"
}
const STR_IGNORE_GRAY_LABEL_LAYERS = {
    EN : " Ignore gray label layers (CC Only)",
    TC : " 忽略顏色標籤為灰色的圖層(限CC以上)",
    SC : " 忽略颜色标签为灰色的图层(限CC以上)"
}
const STR_TRIM_LAYERS = {
    EN : " Trim layers",
    TC : " 修剪圖層",
    SC : " 修剪图层"
}
const STR_CORP_TO_CANVAS = {
    EN : " Corp to canvas",
    TC : " 裁切圖層以符合版面",
    SC : " 裁切图层以符合版面"
}
const STR_USE_GROUPS_AS_SKINS = {
    EN : " Use groups as skins",
    TC : " 將第一層群組視為皮膚",
    SC : " 将第一层群组视为皮肤"
}
const STR_ALLOW_GROUP_AS_SLOT = {
    EN : " Allow group as slot ( #SLOT)",
    TC : " 將群組視為SLOT( #SLOT)",
    SC : " 将群组视为SLOT( #SLOT)"
}
const STR_MERGE_GROUPS = {
    EN : " Merge groups",
    TC : " 自動合併群組",
    SC : " 自动合并群组"
}
const STR_RESAMPLE_TO_SCREEN_DPI = {
    EN : " Resample to " + screenDpi + " dpi",
    TC : " 重新取樣至 " + screenDpi + " dpi",
    SC : " 重新取样至 " + screenDpi + " dpi"
}
const STR_TRIM_AWAY_TITLE = {
    EN : "Trim Away",
    TC : "修剪部位",
    SC : "修剪部位"
}
const STR_TRIM_AWAY_LEFT = {
    EN : " Left",
    TC : " 左邊",
    SC : " 左边"
}
const STR_TRIM_AWAY_RIGHT = {
    EN : " Right",
    TC : " 右邊",
    SC : " 右边"
}
const STR_TRIM_AWAY_TOP = {
    EN : " Top",
    TC : " 頂部",
    SC : " 顶部"
}
const STR_TRIM_AWAY_BOTTOM = {
    EN : " Bottom",
    TC : " 底部",
    SC : " 底部"
}
const STR_ORIGIN_SETTINGS_TITLE = {
    EN : "Origin Settings (as 0,0)",
    TC : "Spine 原點設定",
    SC : "Spine 原点设定"
}
const STR_ORIGIN_DEFAULT = {
    EN : " Default (LB)",
    TC : " 預設(PS版面左下)",
    SC : " 预设(PS版面左下)"
}
const STR_ORIGIN_USE_PS_RULER = {
    EN : " Use ruler origin",
    TC : " PS尺標原點",
    SC : " PS尺标原点"
}
const STR_ORIGIN_USE_ROOT_LAYER = {
    EN : " Use '_ROOT' layer",
    TC : " 依據_ROOT圖層",
    SC : " 依据_ROOT图层"
}
const STR_RESAMPLE_METHOD_TITLE = {
    EN : "Resample Method",
    TC : "重新取樣演算法",
    SC : "重新取样演算法"
}
// "Bicubic", "Bicubic Sharper", "Bicubic Smoother", "Bilinear", "Nearest Neighbor"
const STR_RESAMPLE_METHOD_AUTOMATIC = {
    EN : "Automatic",
    TC : "Automatic",//自動
    SC : "Automatic"
}
const STR_RESAMPLE_METHOD_BICUBIC_AUTOMATIC = {
    EN : "Bicubic Automatic",
    TC : "Bicubic Automatic",//環迴增值法自動選擇
    SC : "Bicubic Automatic"
}
const STR_RESAMPLE_METHOD_BICUBIC = {
    EN : "Bicubic",
    TC : "Bicubic",//環迴增值法(適合平滑漸層)
    SC : "Bicubic"
}
const STR_RESAMPLE_METHOD_BICUBIC_SHARPER = {
    EN : "Bicubic Sharper",
    TC : "Bicubic Sharper",//環迴增值法更銳利(適合縮小)
    SC : "Bicubic Sharper"
}
const STR_RESAMPLE_METHOD_BICUBIC_SMOOTHER = {
    EN : "Bicubic Smoother",
    TC : "Bicubic Smoother",//環迴增值法更平滑(適合放大)
    SC : "Bicubic Smoother"
}
const STR_RESAMPLE_METHOD_BILINEAR = {
    EN : "Bilinear",
    TC : "Bilinear",//縱橫增值法
    SC : "Bilinear"
}
const STR_RESAMPLE_METHOD_NEAREST_NEIGHBOR = {
    EN : "Nearest Neighbor",
    TC : "Nearest Neighbor",//最接近像素(保留硬邊)
    SC : "Nearest Neighbor"
}
const STR_RESAMPLE_METHOD_NONE = {
    EN : "None",
    TC : "None",//無
    SC : "None"
}
const STR_RESAMPLE_METHOD_PRESERVEDETAILS = {
    EN : "Preseve Details",
    TC : "Preseve Details",//保持細節
    SC : "Preseve Details"
}
const STR_PNG_SCALE = {
    EN : "PNG scale",
    TC : "PNG比例",
    SC : "PNG比例"
}
const STR_PADDING = {
    EN : "Padding",
    TC : "邊距",
    SC : "边距"
}
const STR_OUTPUT_DIRECTORIES_TITLE = {
    EN : "Output directories",
    TC : "輸出目錄",
    SC : "导出目录"
}
const STR_OUTPUT_DIRECTORIES_IMAGES = {
    EN : "Images",
    TC : "圖像",
    SC : "图像"
}
const STR_OUTPUT_DIRECTORIES_JSON = {
    EN : "JSON",
    TC : "JSON",
    SC : "JSON"
}
const STR_OUTPUT_DIRECTORIES_HINT = {
    EN : "Begin paths with \"./\" to be relative to the PSD file.",
    TC : "路徑以 \"./\" 起始時會視為相對路徑.",
    SC : "路径以 \"./\" 起始时会视为相对路径."
}
const STR_BUTTON_OK = {
    EN : "OK",
    TC : "確認",
    SC : "确认"
}
const STR_BUTTON_CANCEL = {
    EN : "Cancel",
    TC : "取消",
    SC : "取消"
}
const STR_JH_HELP = {
    EN : "Adding suffix...\n\
◆ Define scale and rotation by adding suffixes to layer name.\n\
\t∙ Scale suffix ' #s'.\n\
\t∙ Rotation suffix ' #r'.\n\
\tex. 'thisislayername #s0.5'\r\t\t(scale = 50%)\n\
\tex. 'thisislayername #s0.8 #r-12'\r\t\t(scale = 80%, rotation = -12 degree)\n\
◆ Set group as slot by adding suffix ' #SLOT' to group name, and the layers/groups inside will be attchments.\n\
\tex. 'thisisgroupname #SLOT'\n\
*** Suffix is case-sensitive.",
    TC : "圖層名稱後綴說明\n\
◆ 自訂圖層輸出比例與旋轉 :\r為圖層名稱添加比例或旋轉後綴,輸出時會套用到圖層上\n\
\t∙ 比例後綴 ' #s'.\n\
\t∙ 旋轉後綴 ' #r'.\n\
\tex. 'layer1 #s0.5'\r\t\t(縮小成50%)\n\
\tex. 'layer2 #s0.8 #r-12'\r\t\t(縮小成80%, 旋轉-12度)\n\
◆ 將群組視為 SLOT :\r為群組名稱添加後綴 ' #SLOT', 輸出時會把該群組視為 SLOT, 群組內的圖層或群組則各別輸出成PNG(Spine附件).\n\
\tex. 'group1 #SLOT'\n\
*** 注意後綴有區分大小寫.\r\
*** 注意後綴皆以空白為開頭.",
    SC : "图层名称后缀说明\n\
◆ 自订图层导出比例与旋转 :\r为图层名称添加比例或旋转后缀,导出时会应用到图层上\n\
\t∙ 比例后缀 ' #s'.\n\
\t∙ 旋转后缀 ' #r'.\n\
\tex. 'layer1 #s0.5'\r\t\t(缩小成50%)\n\
\tex. 'layer2 #s0.8 #r-12'\r\t\t(缩小成80%, 旋转-12度)\n\
◆ 将群组视为 SLOT :\r为群组名称添加后缀 ' #SLOT', 导出时会把该群组视为 SLOT, 群组内的图层或群组则个别导出成PNG(Spine附件).\n\
\tex. 'group1 #SLOT'\n\
*** 注意后缀有区分大小写.\r\
*** 注意后缀皆以空白为开头."
}
const STR_DONE_HEAD = {
    EN : "Done!\nSkins",
    TC : "完成!\n皮膚",
    SC : "完成!\n皮肤"
}
const STR_DONE_TOTAL_EXPORTED = {
    EN : "Total exported : ",
    TC : "輸出總計 : ",
    SC : "导出总计 : "
}
const STR_DONE_RESAMPLE_METHOD = {
    EN : "Resample method : ",
    TC : "重新取樣演算法 : ",
    SC : "重新取样演算法 : "
}
const STR_DONE_ELAPSED = {
    EN : "Elapsed time : ",
    TC : "耗時 : ",
    SC : "耗时 : "
}
const STR_PNG_SCALE_MUST_BE_BETWEEN = {
    EN : "PNG scale must be between > 0 and <= 100.",
    TC : "PNG 比例必須介於 0 與 100.",
    SC : "PNG 比例必须介于 0 与 100."
}
const STR_PNG_PADDING_MUST_BE = {
    EN : "Padding must be >= 0.",
    TC : "邊距必須大於零.",
    SC : "边距必须大于零"
}
const STR_UNEXPECTED_ERROR_HAS_OCCURRED = {
    EN : "An unexpected error has occurred.\n\
To debug, run the LayersToPNG script using Adobe ExtendScript with \"Debug > Do not break on guarded exceptions\" unchecked.",
    TC : "發生了未知的錯誤.\n\
To debug, run the LayersToPNG script using Adobe ExtendScript with \"Debug > Do not break on guarded exceptions\" unchecked.",
    SC : "发生了未知的错误.\n\
To debug, run the LayersToPNG script using Adobe ExtendScript with \"Debug > Do not break on guarded exceptions\" unchecked."
}
// LANGUAGES END --------------------------------------------------------------------------------

// For debug
startTime = new Date().getTime();

var originalDoc;
try {
	originalDoc = app.activeDocument;
} catch (ignored) {}
var settings, progress;
loadSettings();
showDialog();

// RUN ----------------------------------------------------------------------------------------------------
// Execute while OK button pressed.
function run () {
	// Output dirs.
	var absProjectDir = absolutePath(projectDir);
	new Folder(absProjectDir).create();
	var absImagesDir = absolutePath(imagesDir);
	var imagesFolder = new Folder(absImagesDir);
	imagesFolder.create();
	var relImagesDir = imagesFolder.getRelativeURI(absProjectDir);
	relImagesDir = relImagesDir == "." ? "" : (relImagesDir + "/");

    // Save For Web options
 	var outputExtension = ".png";
    var sfwOptions;
    sfwOptions = new ExportOptionsSaveForWeb();
    sfwOptions.format = SaveDocumentType.PNG;
    // Save to PNG24
    sfwOptions.PNG8 = false;

	activeDocument.duplicate();
    
    // Auto Resize Image
    if (resampleToScreenDpi && activeDocument.resolution != screenDpi) activeDocument.resizeImage(null, null, screenDpi, ResampleMethod.AUTOMATIC);
    
	var xOffSet = 0, yOffSet = 0;
	if (useRootLayer) {
        // Custom Origin : set origin by '_ROOT' layer.
        // Get root layer.
		try{
			var rootLayer = app.activeDocument.layers.getByName(rootLayerName);
		} catch (e) {
			alert(STR_ROOT_LAYER_NOT_FOUND[currentLanguage]);
			useRootLayer = false;
		}
        // Get center position of root layer's bounds.
		if (rootLayer) {
			var rootLayerCenter = getBoundsCenter(rootLayer);
			xOffSet = rootLayerCenter[0];
			yOffSet = rootLayerCenter[1];
		}
	} else if (useRulerOrigin) {
		// Get ruler origin.
		var ref = new ActionReference();
		ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
		var desc = executeActionGet(ref);
		xOffSet = desc.getInteger(stringIDToTypeID("rulerOriginH")) >> 16;
		yOffSet = desc.getInteger(stringIDToTypeID("rulerOriginV")) >> 16;
	}

	// Output template image.
	if (writeTemplate) {
		if (pngScale != 1) {
			scaleImage();
			storeHistory();
		}

		var file = new File(absImagesDir + "template" + outputExtension);
		if (file.exists) file.remove();

		activeDocument.exportDocument(file, ExportType.SAVEFORWEB, sfwOptions);

		if (pngScale != 1) restoreHistory();
	}

	// Merge all groups, except slot groups and skin group while groupsAsSkins.
	if (mergeGroups) {
		mergeDoc = activeDocument;
		var groups = [];
		collectGroups(activeDocument, groups);
		mergeEachGroups(groups);

		activeDocument.duplicate();
        
        if (mergeDoc) mergeDoc.close(SaveOptions.DONOTSAVECHANGES);
	}

	if (writeJson == false && writePngs == false) {
		activeDocument.close(SaveOptions.DONOTSAVECHANGES);
		return;
	}
	
	// Rasterize all layers.
	try {
		executeAction(stringIDToTypeID( "rasterizeAll" ), undefined, DialogModes.NO);
	} catch (ignored) {}

	// Collect and hide layers.
	var layers = [];
	var layersOpacity = {};
	var layersBlend = {};
	collectLayers(activeDocument, layers, layersOpacity, layersBlend);
	var layersCount = layers.length;

	storeHistory();
	
	// Store the slot names and layers for each skin.
	var slots = {};
	var skins = { "default": [] };
	var skinsOnlySlots = { "default": [] };
	var lastSlotName = "";

	for (var i = layersCount - 1; i >= 0; i--) {
		var layer = layers[i];
		var currentSlotName = "";

		// Use groups as skin names.
		var potentialSkinName;
		if (isGroupAsSlot(layer.parent)) {
			// Current layer is in slot group.
			potentialSkinName = trim(layer.parent.parent.name);
			currentSlotName = layerName(layer.parent)
		} else {
			// Current layer is in skin group.
			potentialSkinName = trim(layer.parent.name);
			currentSlotName = layerName(layer)
		}
		var layerGroupSkin = potentialSkinName.indexOf(patternNoSkin) == -1;
		var skinName = (groupsAsSkins && layer.parent.typename == "LayerSet" && layerGroupSkin) ? potentialSkinName : "default";

		// Store skins' layers
		var skinLayers = skins[skinName];
		if (!skinLayers) skins[skinName] = skinLayers = [];
		skinLayers[skinLayers.length] = layer;

		// Store skins' slots
		if (lastSlotName != currentSlotName) {
			var skinSlots = skinsOnlySlots[skinName];
			if (!skinSlots) skinsOnlySlots[skinName] = skinSlots = [];
			skinSlots[skinSlots.length] = currentSlotName;
		}

		slots[currentSlotName] = true;

		lastSlotName = currentSlotName;
	}

	// Resort slots order to fix the orders while groupsAsSkins.
	if (groupsAsSkins) slots = resortSlotsOrder(slots, skinsOnlySlots);
	
	// Output skeleton and bones --------------------------------------------------
	var json = '{\n"skeleton": { "images": "' + relImagesDir + '" },';
	json += '\n"bones": [\n\t{ "name": "root" }\n],\n';

	// Output slots data --------------------------------------------------
	json += '"slots": [\n';
	var slotsCount = countAssocArray(slots);
	var slotIndex = 0;

	// Output template slot to JSON.
	if (writeTemplate) {
		json += '\t{ "name": "' + "template" + '", "bone": "root", "attachment": "' + "template" + '" }';
		json += slotsCount > 0 ? ",\n" : "\n";
	}

	// Output slots ----------------------------------------------------------------------------------------------------
	for (var slotName in slots) {

		if (!slots.hasOwnProperty(slotName)) continue;

		// Use image prefix if slot's attachment is in the default skin.
		var attachmentName = slotName;
		var defaultSkinLayers = skins["default"];
		
		for (var i = defaultSkinLayers.length - 1; i >= 0; i--) {
			if (layerName(defaultSkinLayers[i]) == slotName) {
				attachmentName = slotName;
				break;
			}
		}
		// Write slot name and attachment name
		json += '\t{ "name": "' + slotName + '", "bone": "root", "attachment": "' + attachmentName + '"';
		// Write opacity
		if (layersOpacity[slotName] != null) {
            // Convert opacity value from 0-100 to 0-255.
			json += ', "color": "ffffff' + Math.round(layersOpacity[slotName] * 2.55).toString(16) + '"';
		}
		// Write blendmode
		if (layersBlend[slotName] != null) {
			json += ', "blend": "' + layersBlend[slotName] + '"';
		}
		json += ' }';
		slotIndex++;
		json += slotIndex < slotsCount ? ",\n" : "\n";
	}

	// Output skins ----------------------------------------------------------------------------------------------------
	json += '],\n"skins": {\n';

	var skinsCount = countAssocArray(skins);
	var skinIndex = 0;
	docWidth = activeDocument.width.as("px");
	docHeight = activeDocument.height.as("px");

	// For debug
	var imagesExportedCount = 0;
	var imagesExportedCountTotal = 0;
	var doneString = STR_DONE_HEAD[currentLanguage] + " ----------";
	
	for (var skinName in skins) {
		if (!skins.hasOwnProperty(skinName)) continue;

		var skinLayers = skins[skinName];
		var skinLayersCount = skinLayers.length;
		var skinLayerIndex = 0;

		json += '\t"' + skinName + '": {';
		if (skinLayersCount > 0) json += "\n";
        
		// Output template in skin to JSON
        var templateX = docWidth / 2;
        var templateY = docHeight / 2;
        if (useRulerOrigin || useRootLayer) {
            templateX -= xOffSet;
            templateY -= (docHeight - yOffSet);
        }
		if (writeTemplate && skinName == "default") {
			json += '\t\t"' + "template" + '": {\n\t\t\t"' + "template" + '": {'
            json += '"x": ' + templateX + ',"y": ' + templateY;
			json += ',"width": ' + docWidth + ',"height": ' + docHeight + '}\n\t\t}';
			json += skinLayersCount > 0 ? ",\n" : "\n";
		}

		var layersInSlotIndex = 0;

		for (var i = skinLayersCount - 1; i >= 0; i--) {
			var layer = skinLayers[i];

			var sourceLayerName = srcLayerName(layer);
			var slotName;
			var currentLayerName = layerName(layer);

			if (isGroupAsSlot(layer.parent)) {
				// Target layer's parent is group as slot
				slotName = layerName(layer.parent);
			} else {
				slotName = currentLayerName;
			}
			
			var placeholderName, attachmentName;
			if (skinName == "default") {
				placeholderName = currentLayerName;
				attachmentName = currentLayerName;
			} else {
				placeholderName = currentLayerName;
				attachmentName = skinName + "/" + currentLayerName;
			}

			layer.visible = true;

			// Get data from bounds
			var x = docWidth * 0.5;
			var y = docHeight * 0.5;
			// *** Avoid Corping pixels in group - Method 2 :
				// Extend canvas
				// Merge Layers
				// Get layer bounds
				// Calculate bounds center (with original canvas size)
			var boundsCenter = getBoundsCenter(layer);
			if (allowTrimLayers) {
				x = boundsCenter[0];
				y = boundsCenter[1];
			}

			var customRotate = 0;
			var customScale = 1;

			// Get custom scale and rotation from layer name
			if (hasCustomParameters(sourceLayerName)) {
				customRotate = getRotate(sourceLayerName);
				customScale = getScale(sourceLayerName);
				// Prevent resolution of output image too small
				if (customScale != 1) customScale = checkMinimumCustomScale(layer, customScale);
			}
			
			// Rotate image
			if (customRotate != 0) {
				layer.rotate(customRotate, AnchorPosition.MIDDLECENTER);
				var rotatedCenter = getBoundsCenter(layer);
				var fixedCenter = fixRotatedOffset(rotatedCenter, boundsCenter, customRotate);
				x = fixedCenter[0];
				y = fixedCenter[1];
			}
			
			// Corp to canvas and trim layer
			if (corpToCanvas == false || customRotate != 0) extendCanvas(layer);
            // .trim(trimtype, top, left, bottom, right)
			if (layer.isBackgroundLayer == false && allowTrimLayers) activeDocument.trim(TrimType.TRANSPARENT, false, false, trimAwayBottom, trimAwayRight);
			if (corpToCanvas && customRotate == 0) {
				x = getCorpBoundsCenter(layer)[0];
				y = getCorpBoundsCenter(layer)[1];
			}
			if (layer.isBackgroundLayer == false && allowTrimLayers) activeDocument.trim(TrimType.TRANSPARENT, trimAwayTop, trimAwayLeft, false, false);

			// Scale image
			if (pngScale != 1 || customScale != 1) {
				scaleImage(customScale);
			}

			// Padding
			if (padding > 0) {
				var canvasWidth = activeDocument.width.as("px") + padding * 2;
				var canvasHeight = activeDocument.height.as("px") + padding * 2;
				activeDocument.resizeCanvas(canvasWidth, canvasHeight, AnchorPosition.MIDDLECENTER);
			}

			// Save image
			if (writePngs) {
				if (skinName != "default") new Folder(absImagesDir + skinName).create();
				activeDocument.exportDocument(new File(absImagesDir + attachmentName + outputExtension), ExportType.SAVEFORWEB, sfwOptions);
				imagesExportedCount += 1;
			}

			restoreHistory();
			layer.visible = false;

			// Shift root position, Convert root position's coordinate from Left-Top(Photoshop) to Left-Bottom(Spine)
			y = docHeight - y;
            // Calculate root position offset
			if (useRulerOrigin || useRootLayer) {
				x -= xOffSet;
				y -= (docHeight - yOffSet);
			}

			var outScale = mathRound(1 / customScale, 2);

			// Write JSON
			// example :
			// 		"emo_brows": {
			// 			"emo_brows-hit": { "name": "skin1/emo_brows-hit", "x": 418,"y": 713,"width": 100,"height": 60 },
			//			"emo_brows-win": { "name": "skin1/emo_brows-win", "x": 410,"y": 710,"width": 103,"height": 63 }
			// 		},
			if (layersInSlotIndex == 0) {
				json += '\t\t"' + slotName + '": {';
			}
			
			if (attachmentName == placeholderName) {
				json += '\n\t\t\t"' + placeholderName + '": {';
			} else {
				json += '\n\t\t\t"' + placeholderName + '": { "name": "' + attachmentName + '", ';
			}
			
			// Write position
			json += '"x": ' + mathRound(x, 1) + ',"y": ' + mathRound(y, 1);
			// Write custom scale
			if (customScale != 1) json += ',"scaleX": ' + outScale + ',"scaleY": ' + outScale;
			// Write custom rotate
			if (customRotate != 0) json += ',"rotation": ' + customRotate;
			// Write size
			json += ',"width": ' + Math.round(canvasWidth) + ',"height": ' + Math.round(canvasHeight);
			// Write end of code
			skinLayerIndex++;
			if (isGroupAsSlot(layer.parent) && layer.parent.layers && layersInSlotIndex < getVisibleSiblingLayersCount(layer, skinLayers) - 1)
			{
				// Run next layer in slot
				json += ' },'
				layersInSlotIndex++;
			} else {
				// End the slot
				json += ' }\n\t\t}';
				layersInSlotIndex = 0;
				json += skinLayerIndex < skinLayersCount ? ",\n" : "\n";
			}
		}
		if (skinLayersCount > 0) json += "\t";
		json += "\}";

		// For debug
		imagesExportedCountTotal += imagesExportedCount;
		doneString += "\n\t" + skinName + ": " + imagesExportedCount;
		imagesExportedCount = 0;

		skinIndex++;
		json += skinIndex < skinsCount ? ",\n" : "\n";
	}

	// Output animations. --------------------------------------------------
	json += '},\n"animations":{\n\t"animation": {}\n}\n}';

	if (autoCloseDoc) activeDocument.close(SaveOptions.DONOTSAVECHANGES);

	// Output JSON file.
	if (writeJson) {
		var name = decodeURI(originalDoc.name);
		name = name.substring(0, name.indexOf("."));
		var file = new File(absProjectDir + name + ".json");
		file.remove();
		file.open("w", "TEXT");
		file.lineFeed = "\n";
		file.write(json);
		file.close();
	}

	// For debug
	doneString += "\n- " + STR_DONE_TOTAL_EXPORTED[currentLanguage] + imagesExportedCountTotal;
	doneString += "\n\n" + STR_DONE_RESAMPLE_METHOD[currentLanguage] + resampleObject.toString();
	endTime = new Date().getTime();
	var elapsedTime = mathRound(( endTime - startTime ) / 1000, 0);
	doneString += "\n" + STR_DONE_ELAPSED[currentLanguage] + elapsedTime + "s";
	alert(doneString);
}

// Dialog and settings --------------------------------------------------------------------------------

function showDialog () {
	if (!originalDoc) {
		alert(STR_OPEN_DOC_FIRST[currentLanguage]);
		return;
	}
	if (!hasFilePath()) {
		alert(STR_SAVE_DOC_FIRST[currentLanguage]);
		return;
	}

	var dialog = new Window("dialog", STR_WINDOW_TITLE[currentLanguage]);
	dialog.alignChildren = "fill";

	var checkboxGroup = dialog.add("group");
		var group = checkboxGroup.add("group");
			group.orientation = "column";
			group.alignChildren = "left";
			var writePngsCheckbox = group.add("checkbox", undefined, STR_WRITE_LAYERS_AS_PNGS[currentLanguage]);
			writePngsCheckbox.value = writePngs;
			var writeTemplateCheckbox = group.add("checkbox", undefined, STR_WRITE_TEMPLATE_PNG[currentLanguage]);
			writeTemplateCheckbox.value = writeTemplate;
			var writeJsonCheckbox = group.add("checkbox", undefined, STR_WRITE_SPINE_JSON[currentLanguage]);
			writeJsonCheckbox.value = writeJson;
			var emptyCheckbox = group.add("checkbox", undefined, STR_WRITE_LAYER_OPACITY[currentLanguage]);
			emptyCheckbox.value = true;
			emptyCheckbox.enabled = false;
			var emptyCheckbox = group.add("checkbox", undefined, STR_WRITE_LAYER_BLENDMODE[currentLanguage]);
			emptyCheckbox.value = true;
			emptyCheckbox.enabled = false;
			var emptyCheckbox = group.add("checkbox", undefined, STR_WRITE_CUSTOM_SCALE_AND_ROTATION[currentLanguage]);
			emptyCheckbox.value = true;
			emptyCheckbox.enabled = false;
			var corpToCanvasCheckbox = group.add("checkbox", undefined, STR_CORP_TO_CANVAS[currentLanguage]);
			corpToCanvasCheckbox.value = corpToCanvas;
			var allowTrimLayersCheckbox = group.add("checkbox", undefined, STR_TRIM_LAYERS[currentLanguage]);
			allowTrimLayersCheckbox.value = allowTrimLayers;
		group = checkboxGroup.add("group");
			group.orientation = "column";
			group.alignChildren = "left";
			var ignoreHiddenLayersCheckbox = group.add("checkbox", undefined, STR_IGNORE_HIDDEN_LAYERS[currentLanguage]);
			ignoreHiddenLayersCheckbox.value = ignoreHiddenLayers;
			var ignoreStartsWithUnderscoreLayersCheckbox = group.add("checkbox", undefined, STR_IGNORE_STARTS_WITH_AN_UNDERSCORE[currentLanguage]);
			ignoreStartsWithUnderscoreLayersCheckbox.value = ignoreStartsWithUnderscoreLayers;
			var ignoreGrayLabelLayersCheckbox = group.add("checkbox", undefined, STR_IGNORE_GRAY_LABEL_LAYERS[currentLanguage]);
			ignoreGrayLabelLayersCheckbox.value = ignoreGrayLabelLayers;
			var groupsAsSkinsCheckbox = group.add("checkbox", undefined, STR_USE_GROUPS_AS_SKINS[currentLanguage]);
			groupsAsSkinsCheckbox.value = groupsAsSkins;
			var emptyCheckbox = group.add("checkbox", undefined, STR_ALLOW_GROUP_AS_SLOT[currentLanguage]);
			emptyCheckbox.value = true;
			emptyCheckbox.enabled = false;
			var mergeGroupsCheckbox = group.add("checkbox", undefined, STR_MERGE_GROUPS[currentLanguage]);
			mergeGroupsCheckbox.value = mergeGroups;
			var resampleToScreenDpiCheckbox = group.add("checkbox", undefined, STR_RESAMPLE_TO_SCREEN_DPI[currentLanguage]);
			resampleToScreenDpiCheckbox.value = resampleToScreenDpi;
    /*
			var emptyCheckbox = group.add("checkbox", undefined, " Empty");
			emptyCheckbox.visible = false;
			emptyCheckbox.enabled = false;
			var emptyCheckbox = group.add("checkbox", undefined, " Empty");
			emptyCheckbox.visible = false;
			emptyCheckbox.enabled = false;
    */

    var trimAwayGroup = dialog.add("panel", undefined, STR_TRIM_AWAY_TITLE[currentLanguage]);
		trimAwayGroup.orientation = "row";
		trimAwayGroup.margins = [10,15,10,10];
        trimAwayGroup.enabled = allowTrimLayersCheckbox.value;
		var trimAwayLeftCheckbox = trimAwayGroup.add("checkbox", undefined, STR_TRIM_AWAY_LEFT[currentLanguage]);
        trimAwayLeftCheckbox.value = trimAwayLeft;
		var trimAwayRightCheckbox = trimAwayGroup.add("checkbox", undefined, STR_TRIM_AWAY_RIGHT[currentLanguage]);
        trimAwayRightCheckbox.value = trimAwayRight;
		var trimAwayTopCheckbox = trimAwayGroup.add("checkbox", undefined, STR_TRIM_AWAY_TOP[currentLanguage]);
        trimAwayTopCheckbox.value = trimAwayTop;
		var trimAwayBottomCheckbox = trimAwayGroup.add("checkbox", undefined, STR_TRIM_AWAY_BOTTOM[currentLanguage]);
        trimAwayBottomCheckbox.value = trimAwayBottom;
    
        allowTrimLayersCheckbox.onClick = function () {
            trimAwayGroup.enabled = allowTrimLayersCheckbox.value;
        };
    
	var originGroup = dialog.add("panel", undefined, STR_ORIGIN_SETTINGS_TITLE[currentLanguage]);
		originGroup.orientation = "row";
		originGroup.margins = [10,15,10,10];
		var useDefaultOriginCheckbox = originGroup.add("radiobutton", undefined, STR_ORIGIN_DEFAULT[currentLanguage]);
		var useRulerOriginCheckbox = originGroup.add("radiobutton", undefined, STR_ORIGIN_USE_PS_RULER[currentLanguage]);
		useRulerOriginCheckbox.value = useRulerOrigin;
		var useRootLayerCheckbox = originGroup.add("radiobutton", undefined, STR_ORIGIN_USE_ROOT_LAYER[currentLanguage]);
		useRootLayerCheckbox.value = useRootLayer;
		if (useRulerOriginCheckbox.value == false && useRootLayerCheckbox.value == false) useDefaultOriginCheckbox.value = true;

	var resampleGroup = dialog.add("group");
		group = resampleGroup.add("group");
			group.orientation = "column";
			group.alignChildren = "right";
			group.add("statictext", undefined, STR_RESAMPLE_METHOD_TITLE[currentLanguage]);
		group = resampleGroup.add("group");
			group.alignment = ["fill", ""];
			group.orientation = "column";
			group.alignChildren = ["fill", ""];
			var resampleDdl = group.add("dropdownlist", undefined, [ 
                STR_RESAMPLE_METHOD_AUTOMATIC[currentLanguage], 
                STR_RESAMPLE_METHOD_PRESERVEDETAILS[currentLanguage], 
//                STR_RESAMPLE_METHOD_BICUBIC_AUTOMATIC[currentLanguage], 
                STR_RESAMPLE_METHOD_BICUBIC_SMOOTHER[currentLanguage],
                STR_RESAMPLE_METHOD_BICUBIC_SHARPER[currentLanguage],  
                STR_RESAMPLE_METHOD_BICUBIC[currentLanguage], 
                STR_RESAMPLE_METHOD_NEAREST_NEIGHBOR[currentLanguage], 
                STR_RESAMPLE_METHOD_BILINEAR[currentLanguage], 
//                STR_RESAMPLE_METHOD_NONE[currentLanguage] 
            ]);
			resampleDdl.selection = resample;

	var slidersGroup = dialog.add("group");
		group = slidersGroup.add("group");
			group.orientation = "column";
			group.alignChildren = "right";
			group.add("statictext", undefined, STR_PNG_SCALE[currentLanguage]);
			group.add("statictext", undefined, STR_PADDING[currentLanguage]);
		group = slidersGroup.add("group");
			group.orientation = "column";
			var scaleText = group.add("edittext", undefined, pngScale * 100);
			scaleText.characters = 4;
			var paddingText = group.add("edittext", undefined, padding);
			paddingText.characters = 4;
		group = slidersGroup.add("group");
			group.orientation = "column";
			group.add("statictext", undefined, "%");
			group.add("statictext", undefined, "px");
		group = slidersGroup.add("group");
			group.alignment = ["fill", ""];
			group.orientation = "column";
			group.alignChildren = ["fill", ""];
			var scaleSlider = group.add("slider", undefined, pngScale * 100, 1, 100);
			var paddingSlider = group.add("slider", undefined, padding, 0, 4);
	scaleText.onChanging = function () { scaleSlider.value = scaleText.text; };
	scaleSlider.onChanging = function () { scaleText.text = Math.round(scaleSlider.value); };
	paddingText.onChanging = function () { paddingSlider.value = paddingText.text; };
	paddingSlider.onChanging = function () { paddingText.text = Math.round(paddingSlider.value); };

	var outputGroup = dialog.add("panel", undefined, STR_OUTPUT_DIRECTORIES_TITLE[currentLanguage]);
		outputGroup.alignChildren = "fill";
		outputGroup.margins = [10,15,10,10];
		var textGroup = outputGroup.add("group");
			group = textGroup.add("group");
				group.orientation = "column";
				group.alignChildren = "right";
				group.add("statictext", undefined, STR_OUTPUT_DIRECTORIES_IMAGES[currentLanguage]);
				group.add("statictext", undefined, STR_OUTPUT_DIRECTORIES_JSON[currentLanguage]);
			group = textGroup.add("group");
				group.orientation = "column";
				group.alignChildren = "fill";
				group.alignment = ["fill", ""];
				var imagesDirText = group.add("edittext", undefined, imagesDir);
				var projectDirText = group.add("edittext", undefined, projectDir);
		outputGroup.add("statictext", undefined, STR_OUTPUT_DIRECTORIES_HINT[currentLanguage]).alignment = "center";

	var group = dialog.add("group");
		// group.alignment = "center";
		var runButton = group.add("button", undefined, STR_BUTTON_OK[currentLanguage]);
		var cancelButton = group.add("button", undefined, STR_BUTTON_CANCEL[currentLanguage]);
        
		cancelButton.onClick = function () {
			dialog.close(0);
			return;
		};

		// JH Version Help dialog.
		var JHButton = group.add("button", undefined, "!");
		JHButton.size = [24,20];
		JHButton.onClick = function () {
			alert(STR_JH_HELP[currentLanguage]);
		};
        
        // Languages Drop Down List
        var languagesDdl = group.add("dropdownlist", undefined, languagesList);
        languagesDdl.selection = languageCodeToIndex();
        languagesDdl.onChanging = function () {
            currentLanguage = languagesListValue[languagesDdl.selection.index];
			dialog.close(0);
			return;
        }

	function updateSettings () {
		writePngs = writePngsCheckbox.value;
		writeTemplate = writeTemplateCheckbox.value;
		writeJson = writeJsonCheckbox.value;
		ignoreHiddenLayers = ignoreHiddenLayersCheckbox.value;
		var scaleValue = parseFloat(scaleText.text);
		if (scaleValue > 0 && scaleValue <= 100) pngScale = scaleValue / 100;
		groupsAsSkins = groupsAsSkinsCheckbox.value;
		useRulerOrigin = useRulerOriginCheckbox.value;
		corpToCanvas = corpToCanvasCheckbox.value;
		mergeGroups = mergeGroupsCheckbox.value;
		allowTrimLayers = allowTrimLayersCheckbox.value;
        trimAwayGroup.enabled = allowTrimLayersCheckbox.value;
		ignoreGrayLabelLayers = ignoreGrayLabelLayersCheckbox.value;
		ignoreStartsWithUnderscoreLayers = ignoreStartsWithUnderscoreLayersCheckbox.value;
		useRootLayer = useRootLayerCheckbox.value;
		imagesDir = imagesDirText.text;
		projectDir = projectDirText.text;
		var paddingValue = parseInt(paddingText.text);
		if (paddingValue >= 0) padding = paddingValue;
		resample = resampleDdl.selection.index;
		resampleObject = resampleDdl.selection;
        trimAwayLeft = trimAwayLeftCheckbox.value;
        trimAwayRight = trimAwayRightCheckbox.value;
        trimAwayTop = trimAwayTopCheckbox.value;
        trimAwayBottom = trimAwayBottomCheckbox.value;
		currentLanguage = languagesListValue[languagesDdl.selection.index];
		resampleToScreenDpi = resampleToScreenDpiCheckbox.value;
	}

	dialog.onClose = function() {
		updateSettings();
		saveSettings();
	};
	
	runButton.onClick = function () {
		if (scaleText.text <= 0 || scaleText.text > 100) {
			alert(STR_PNG_SCALE_MUST_BE_BETWEEN[currentLanguage]);
			return;
		}
		if (paddingText.text < 0) {
			alert(STR_PNG_PADDING_MUST_BE[currentLanguage]);
			return;
		}
		dialog.close(0);

		var rulerUnits = app.preferences.rulerUnits;
		app.preferences.rulerUnits = Units.PIXELS;
		try {
			run();
		} catch (e) {
			alert(STR_UNEXPECTED_ERROR_HAS_OCCURRED[currentLanguage]);
			debugger;
		} finally {
			if (activeDocument != originalDoc && autoCloseDoc) activeDocument.close(SaveOptions.DONOTSAVECHANGES);
			app.preferences.rulerUnits = rulerUnits;
		}
	};

	dialog.center();
	dialog.show();
}

function loadSettings () {
	try {
		settings = app.getCustomOptions(settingsID);
	} catch (e) {
		saveSettings();
	}
	if (typeof settings == "undefined") saveSettings();
	settings = app.getCustomOptions(settingsID);
	if (settings.hasKey(writePngsID)) writePngs = settings.getBoolean(writePngsID);
	if (settings.hasKey(writeTemplateID)) writeTemplate = settings.getBoolean(writeTemplateID);
	if (settings.hasKey(writeJsonID)) writeJson = settings.getBoolean(writeJsonID);
	if (settings.hasKey(ignoreHiddenLayersID)) ignoreHiddenLayers = settings.getBoolean(ignoreHiddenLayersID);
	if (settings.hasKey(pngScaleID)) pngScale = settings.getDouble(pngScaleID);
	if (settings.hasKey(groupsAsSkinsID)) groupsAsSkins = settings.getBoolean(groupsAsSkinsID);
	if (settings.hasKey(useRulerOriginID)) useRulerOrigin = settings.getBoolean(useRulerOriginID);
	if (settings.hasKey(corpToCanvasID)) corpToCanvas = settings.getBoolean(corpToCanvasID);
	if (settings.hasKey(mergeGroupsID)) mergeGroups = settings.getBoolean(mergeGroupsID);
	if (settings.hasKey(allowTrimLayersID)) allowTrimLayers = settings.getBoolean(allowTrimLayersID);
	if (settings.hasKey(ignoreGrayLabelLayersID)) ignoreGrayLabelLayers = settings.getBoolean(ignoreGrayLabelLayersID);
	if (settings.hasKey(ignoreStartsWithUnderscoreLayersID)) ignoreStartsWithUnderscoreLayers = settings.getBoolean(ignoreStartsWithUnderscoreLayersID);
	if (settings.hasKey(useRootLayerID)) useRootLayer = settings.getBoolean(useRootLayerID);
	if (settings.hasKey(imagesDirID)) imagesDir = settings.getString(imagesDirID);
	if (settings.hasKey(projectDirID)) projectDir = settings.getString(projectDirID);
	if (settings.hasKey(paddingID)) padding = settings.getDouble(paddingID);
	if (settings.hasKey(resampleID)) resample = settings.getDouble(resampleID);
	if (settings.hasKey(trimAwayLeftID)) trimAwayLeft = settings.getBoolean(trimAwayLeftID);
	if (settings.hasKey(trimAwayRightID)) trimAwayRight = settings.getBoolean(trimAwayRightID);
    if (settings.hasKey(trimAwayTopID)) trimAwayTop = settings.getBoolean(trimAwayTopID);
    if (settings.hasKey(trimAwayBottomID)) trimAwayBottom = settings.getBoolean(trimAwayBottomID);
	if (settings.hasKey(currentLanguageID)) currentLanguage = settings.getString(currentLanguageID);
	if (settings.hasKey(resampleToScreenDpiID)) resampleToScreenDpi = settings.getBoolean(resampleToScreenDpiID);
}

function saveSettings () {
	var settings = new ActionDescriptor();
	settings.putBoolean(writePngsID, writePngs);
	settings.putBoolean(writeTemplateID, writeTemplate);
	settings.putBoolean(writeJsonID, writeJson);
	settings.putBoolean(ignoreHiddenLayersID, ignoreHiddenLayers);
	settings.putDouble(pngScaleID, pngScale);
	settings.putBoolean(groupsAsSkinsID, groupsAsSkins);
	settings.putBoolean(useRulerOriginID, useRulerOrigin);
	settings.putBoolean(corpToCanvasID, corpToCanvas);
	settings.putBoolean(mergeGroupsID, mergeGroups);
	settings.putBoolean(allowTrimLayersID, allowTrimLayers);
	settings.putBoolean(ignoreGrayLabelLayersID, ignoreGrayLabelLayers);
	settings.putBoolean(ignoreStartsWithUnderscoreLayersID, ignoreStartsWithUnderscoreLayers);
	settings.putBoolean(useRootLayerID, useRootLayer);
	settings.putString(imagesDirID, imagesDir);
	settings.putString(projectDirID, projectDir);
	settings.putDouble(paddingID, padding);
	settings.putDouble(resampleID, resample);
	settings.putBoolean(trimAwayLeftID, trimAwayLeft);
	settings.putBoolean(trimAwayRightID, trimAwayRight);
	settings.putBoolean(trimAwayTopID, trimAwayTop);
	settings.putBoolean(trimAwayBottomID, trimAwayBottom);
	settings.putString(currentLanguageID, currentLanguage);
	settings.putBoolean(resampleToScreenDpiID, resampleToScreenDpi);
	app.putCustomOptions(settingsID, settings, true);
}

// Photoshop utility:

function scaleImage (customScale) {
	if (customScale == undefined) customScale = 1;
	var imageSize = activeDocument.width.as("px");
	activeDocument.resizeImage(UnitValue(imageSize * pngScale * customScale, "px"), null, null, resampleMethods[resampleObject]);
}

function rotateImage (customRotate) {
	if (customRotate == undefined) customRotate = 0;
	activeDocument.rotateCanvas(customRotate);
}

function fixRotatedOffset(rotatedCenter, originalCenter, degrees){
	// Get right position of rotated layer to write JSON data
	var rcx = rotatedCenter[0];
	var rcy = rotatedCenter[1];
	var ocx = originalCenter[0];
	var ocy = originalCenter[1];
	// Angle must be counter-clockwise
	var theta = toRadians(degrees * -1);

	// Translate point to origin
	var tempX = ocx - rcx;
	var tempY = ocy - rcy;

	// Now apply rotation
	var rotatedX = parseFloat(tempX * Math.cos(theta) - tempY * Math.sin(theta));
	var rotatedY = parseFloat(tempX * Math.sin(theta) + tempY * Math.cos(theta));

	// Position to JSON
	var outX = ocx - rotatedX;
	var outY = ocy - rotatedY;

	return [outX, outY];
}

function checkMinimumCustomScale (layer, customScale) {
	// Prevent resolution of output image too small
	var boundsSize = getBoundsSize(layer);
	var result = customScale;
	var minPixelsOrig = Math.min(boundsSize[0], boundsSize[1]);
	var minPixels = minPixelsOrig * pngScale * customScale;

	if (minPixels < customScaleMin) result = Math.ceil(mathRound(customScaleMin / minPixelsOrig, 3));

	return result;
}

var historyIndex;
function storeHistory () {
	historyIndex = activeDocument.historyStates.length - 1;
}
function restoreHistory () {
	activeDocument.activeHistoryState = activeDocument.historyStates[historyIndex];
}

function collectLayers (layer, collect, collectOpacity, collectBlendMode) {
	for (var i = 0, n = layer.layers.length; i < n; i++) {
		var child = layer.layers[i];
		if (ignoreHiddenLayers && child.visible == false) continue;
		if (ignoreGrayLabelLayers && getLayerColorByID(child.id) == "gray") {
			child.visible = false;
			continue;
		}
		if (ignoreStartsWithUnderscoreLayers && startsWith(child.name, "_")) {
			child.visible = false;
			continue;
		}
		if (child.bounds[2] == 0 && child.bounds[3] == 0) continue;
		// Collect opacity
		if (child.opacity != 100) {
			// Opacity Types : child.opacity, child.fillOpacity
			collectOpacity[child.name] = child.opacity;
            child.opacity = 100;
		}
		// Collect blend mode
		if (child.blendMode == BlendMode.SCREEN || child.blendMode == BlendMode.LINEARDODGE || child.blendMode == BlendMode.MULTIPLY) {
            // Get clean layer name (remove custom suffixes)
            var cleanLayerName = layerName(child);
			switch(child.blendMode) {
				case BlendMode.SCREEN:
					collectBlendMode[cleanLayerName] = "screen";
					break;
				case BlendMode.LINEARDODGE:
					collectBlendMode[cleanLayerName] = "additive";
					break;
				case BlendMode.MULTIPLY:
					collectBlendMode[cleanLayerName] = "multiply";
					break;
			}
		}
		// Collect valid layers
		if (child.layers && child.layers.length > 0) {
			collectLayers(child, collect, collectOpacity, collectBlendMode);
		} else if (child.kind == LayerKind.NORMAL) {
			collect.push(child);
			child.visible = false;
		}
	}
}

function collectGroups ( layer, collect) {
	for (var i = 0; i < layer.layers.length; i++) {
        var child = layer.layers[i];
        if (child.visible && child.layers && child.layers.length > 0)
        {
        	// Current target is group
        	if (isGroupAsSlot(child)) {
        		// Group as slot, don't merge.
				collectGroups(child, collect);
        	} else if (groupsAsSkins == false) {
        		// No skins, merge all groups.
        		collect.push(child);
        	} else if (child.parent.typename == "LayerSet") {
        		// Target's parent is layerSet
				collect.push(child);
			} else {
				collectGroups(child, collect);
			}
        }
    }
}

function getVisibleSiblingLayersCount (layer, skinLayers) {
	var visibleCount = 0;
	for (var i = 0; i < layer.parent.layers.length; i++) {
		for (var j = 0; j < skinLayers.length; j++) {
			// Check layer's visibility by compares to skinLayers
			if (layer.parent.layers[i] == skinLayers[j]) {
				visibleCount += 1;
			}
		}
	}
	return visibleCount;
}

function mergeEachGroups (groups) {
	for (var i = 0; i < groups.length; i++) {
		var group = groups[i];
		activeDocument.activeLayer = group;
		if (isOutOfCanvas(group)) {
		// Extend canvas then restore, avoid corping pixels out of canvas while merging group at PS CS6 13.0
			var extendDist = Math.abs(getOutOfCanvasDist(group)) * 2;
			extendCanvas(group);
			group.merge();
			applyLayerMask();
			shrinkCanvas(extendDist);
		} else {
			group.merge();
		}
	}
}

function hasFilePath () {
	var ref = new ActionReference();
	ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
	return executeActionGet(ref).hasKey(stringIDToTypeID("fileReference"));
}

function absolutePath (path) {
	path = trim(path);
	if (path.length == 0)
		path = activeDocument.path.toString();
	else if (imagesDir.indexOf("./") == 0)
		path = activeDocument.path + path.substring(1);
	path = path.replace(/\\/g, "/");
	if (path.substring(path.length - 1) != "/") path += "/";
	return path;
}

// Mathematics utility:

function toRadians (degrees) {
	return degrees * Math.PI / 180;
}

function mathRound(num, decimal) {
	var f = decimal > 0 ? Math.pow(10, decimal) : 1;
	return Math.round(num * f) / f;
}

// JavaScript utility:

function countAssocArray (obj) {
	var count = 0;
	for (var key in obj)
		if (obj.hasOwnProperty(key)) count++;
	return count;
}

function trim (value) {
	return value.replace(/^\s+|\s+$/g, "");
}

function startsWith (str, prefix) {
	return str.indexOf(prefix) == 0;
}

function endsWith (str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function stripSuffix (str, suffix) {
	if (endsWith(str.toLowerCase(), suffix.toLowerCase())) str = str.substring(0, str.length - suffix.length);
	return str;
}

function layerName (layer) {
	var result = stripSuffix(trim(layer.name), ".png").replace(/[:\/\\*\?\"\<\>\|]/g, "");
	// Get layer name without custom parameters string (customScale, customRotate, groupAsSlot).
	var endIndex = result.indexOf(" #");
	if (endIndex != -1) {
		result = result.substring(0, endIndex);
	}

	return result
}

function srcLayerName (layer) {
	// Original version of layerName function
	return stripSuffix(trim(layer.name), ".png").replace(/[:\/\\*\?\"\<\>\|]/g, "");
}

function isGroupAsSlot (layer) {
	// Target is group with pattern, and parent is not as slot.
	return (layer.name.indexOf(patternAsSlot) != -1 && layer.typename == "LayerSet" && isGroupAsSlot(layer.parent) == false) ? true : false;
}

function resortSlotsOrder (slots, skins) {
	// Fix slots' order while groupsAsSkins enabled.
    // ^^^ Fix what wrong order?? This function output wrong order with default skin. All slots in default skin will on top all skins, but the original order doesn't get this problem.
    
/*
	var result = {};
	var resorted = [];
	var exists = false;

	for (var slotName in slots) {
        // first round. send 1 slot name to resorted array.
		if (resorted.length == 0) {
			resorted.push(slotName);
			continue;
		}

		// Find current slot in skins.
		for (var skinName in skins) {
			if (exists) break;
            // Find current slot in current skin.
			for (var i = 0; i < skins[skinName].length; i++) {
				if (slotName == skins[skinName][i]) {
					// Found slot's order in skins.
					var insertIndex = 0;

					// Insert current slot after previous slot.
					if (i > 0) {
                        // Get the slot before current slot in skins.
						var previousSlotName = skins[skinName][i-1];
						for (var j = 0; j < resorted.length; j++) {
                            // Find the previous slot in resorted array, and get the next index.
							if (resorted[j] == previousSlotName) {
								insertIndex = j + 1;
								break;
							}
						}
					}
                    
                    // Insert current slot to resorted array.
					resorted.splice(insertIndex, 0, slotName);
					exists = true;
					break;
				}
			}
		}
		exists = false;
	}

	// Copy array to dictionary ** Why convert to dict??????
	for (var i in resorted) {
		result[resorted[i]] = true;
	}

	return result;
*/
    return slots;
}

// Custom properties utility :

function hasCustomParameters (layerName) {
	var result = false;
	if (layerName.search(patternRotate) != -1 || layerName.search(patternScale) != -1) {
		result = true;
	}

	return result;
}

function getPropertyInfo (layerName, pattern) {
	var result = NaN;
	var patternIndex = layerName.lastIndexOf(pattern);
	var propertyInfo;

	if (patternIndex != -1) {
		var patternEndIndex = patternIndex + pattern.length;
		var propertyString = layerName.substring( patternEndIndex, layerName.length );
		var endIndex = propertyString.indexOf(" ");
		if (endIndex != -1) {
			propertyInfo = propertyString.substring(0, endIndex);
		} else {
			propertyInfo = propertyString;
		}
		result = parseFloat(propertyInfo);
	}

	return result;
}

function getRotate (layerName) {
	var result = 0;
	var value = getPropertyInfo(layerName, patternRotate);
	if (isNaN(value) == false) result = value;

	return result;
}

function getScale (layerName) {
	var result = 1;
	var value = getPropertyInfo(layerName, patternScale);
	if (isNaN(value) == false) result = value;

	return result;
}

function getLayerColorByID( ID ) {
	var ref = new ActionReference();
	ref.putProperty( charIDToTypeID("Prpr") ,stringIDToTypeID('color'));
	ref.putIdentifier(charIDToTypeID( "Lyr " ), ID );
	return typeIDToStringID(executeActionGet(ref).getEnumerationValue(stringIDToTypeID('color')));
}

// Bounds and Corp to canvas utility :

function clampXToCanvas(num, axis) {
	return Math.min( Math.max(num, 0), docWidth );
}

function clampYToCanvas(num, axis) {
	return Math.min( Math.max(num, 0), docHeight );
}

function clampBoundsToCanvas(bounds) {
	var x1 = clampXToCanvas(bounds[0]);
	var y1 = clampYToCanvas(bounds[1]);
	var x2 = clampXToCanvas(bounds[2]);
	var y2 = clampYToCanvas(bounds[3]);

	return [x1, y1, x2, y2];
}

function getBoundsValue(layer) {
	return [layer.bounds[0].value, layer.bounds[1].value, layer.bounds[2].value, layer.bounds[3].value];
}

function getBoundsSize(layer) {
	var bounds = getBoundsValue(layer);
	var width = bounds[2] - bounds[0];
	var height = bounds[3] - bounds[1];

	return [width, height];
}

function getBoundsCenter(layer) {
	var bounds = getBoundsValue(layer);
	var size = getBoundsSize(layer);
	var x = ( bounds[0] + size[0] / 2 ) * pngScale;
	var y = ( bounds[1] + size[1] / 2 ) * pngScale;

	return [x, y];
}

function getCorpBoundsCenter(layer) {
	var clampBounds = clampBoundsToCanvas(getBoundsValue(layer));
	var x1 = clampBounds[0];
	var y1 = clampBounds[1];
	var x2 = clampBounds[2];
	var y2 = clampBounds[3];
	var width = x2 - x1;
	var height = y2 - y1;
	var x = ( x1 + width / 2 ) * pngScale;
	var y = ( y1 + height / 2 ) * pngScale;

	return [x, y];
}

function getOutOfCanvasDist(layer) {
	var bounds = getBoundsValue(layer);
	var x1 = bounds[0];
	var y1 = bounds[1];
	var x2 = activeDocument.width.as("px") - bounds[2];
	var y2 = activeDocument.height.as("px") - bounds[3];
	var dist = Math.min(x1, y1, x2, y2);

	return dist;
}

function isOutOfCanvas(layer) {
	if (getOutOfCanvasDist(layer) < 0) {
		return true;
	} else {
		return false;
	}
}

function extendCanvas(layer) {
	// Extend Canvas size for not corpping visible pixels
	if (isOutOfCanvas(layer) == false) return;
	var dist = Math.abs(getOutOfCanvasDist(layer)) * 2;
	var w = activeDocument.width.as("px") + dist;
	var h = activeDocument.height.as("px") + dist;
	activeDocument.resizeCanvas(w, h, AnchorPosition.MIDDLECENTER);
}

function shrinkCanvas(dist) {
	// Extend Canvas size for not corpping visible pixels
	var w = activeDocument.width.as("px") - dist;
	var h = activeDocument.height.as("px") - dist;
	activeDocument.resizeCanvas(w, h, AnchorPosition.MIDDLECENTER);
}

///////////////////////////////////////////////////////////////////////////////
// Function: applyLayerMask
// Usage: apply the vector mask on the current layer
// Input: <none> Must have an open document
// Return: <none>
///////////////////////////////////////////////////////////////////////////////
function applyLayerMask() {
	try{ 
		var id765 = charIDToTypeID( "Dlt " );
			var desc154 = new ActionDescriptor();
			var id766 = charIDToTypeID( "null" );
				var ref93 = new ActionReference();
				var id767 = charIDToTypeID( "Chnl" );
				var id768 = charIDToTypeID( "Ordn" );
				var id769 = charIDToTypeID( "Trgt" );
				ref93.putEnumerated( id767, id768, id769 );
			desc154.putReference( id766, ref93 );
			var id770 = charIDToTypeID( "Aply" );
			desc154.putBoolean( id770, true );
		executeAction( id765, desc154, DialogModes.NO );
	}catch(e) {
		; // do nothing
	}
}

function languageCodeToIndex() {
    var currentLanguageIndex = 0;
    for (var i = 0; i < languagesListValue.length; i++) {
        if (currentLanguage == languagesListValue[i]) {
            currentLanguageIndex = i;
        }
    }
    return currentLanguageIndex;
}