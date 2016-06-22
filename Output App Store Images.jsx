// Output iOS Icons.jsx
// 2014 Todd Linkner
// License: none (public domain)
// v1.2
//
// This script is for Photoshop CS6. It outputs iOS icons of the following 
// sizes from a source 1024px x 1024px PSD
//
// [name]-29.png
// [name]-29@2x.png
// [name]-29@3x.png
// [name]-40.png
// [name]-40@2x.png
// [name]-40@3x.png
// [name]-60@2x.png
// [name]-60@3x.png
// [name]-76.png
// [name]-76@2x.png
// [name]-512.png		(512px x 512px)
// [name]-512@2x.png	(1024px x 1024px)

// modified by Janus Huang, januswow@gmail.com
// reference : https://gist.github.com/julienhay/9118898

// bring Photoshop into focus
#target Photoshop

main();

function main() {

    // 請在此修改預設的輸出尺寸
    var outputSizeArray_default = [];
    outputSizeArray_default = [ [960, 640], [1136, 640], [2048,1536], [1334,750], [2208,1242], [2732,2048] ];
    // outputSizeArray_default= [ [960, 640], [1136, 640]]

    alert("此 Script 可自動輸出 App Store Images 所需的各個尺寸,\n"
        + "請選擇PNG檔案進行轉換, 目前只適用於 Landscape 比例.\r\r");

    // define output sizes
    //var outputSizeArray = prompt("--:"+outputSizeArray_default+".\r\r","")
    var outputSizeArray = ""

    if (outputSizeArray != null && outputSizeArray != "")
    {
        outputSizeArray = outputSizeArray.split(",");
    } else {
        outputSizeArray = outputSizeArray_default;//iOS App Store Images 必須尺寸
    }
    // alert(outputSizeArray);


///*
    // Ask user for input folder
	var inputFile = File.openDialog("Select a PNG file","PNG File:*.png");
	if (inputFile == null) throw "No file selected. Exting script.";

	// Open file
	open(inputFile);

    // Set ruler untis to pixels
    app.preferences.typeUnits = TypeUnits.PIXELS

    // iOS 8 Icons default settings of this script
    /*
    resize(29,1);
    resize(29,2);
    resize(29,3);
    resize(40,1);
    resize(40,2);
    resize(40,3);
    resize(60,2);
    resize(60,3);
    resize(76,1);
    resize(76,2);
    resize(512,1);
    resize(512,2);
    //*/
///*
    for (var i = 0; i < outputSizeArray.length; i++) {
        resize(outputSizeArray[i], 1);
    }

    // Clean up
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    alert("Done!");
//*/
}

function resize(size,scaleFactor) {
     // Setup file name
    var pname = app.activeDocument.path + "/";
    var fname = app.activeDocument.name;
    var append = "";
    var fsizeX = size[0] * scaleFactor;
    var fsizeY = size[1] * scaleFactor;
    if (scaleFactor > 1) {
		append =  "@" + scaleFactor + "x";   
    }
    n = fname.lastIndexOf(".");
    if (n > 0) {
        var basename = fname.substring(0,n);
        fname = basename+"_"+fsizeX+"x"+fsizeY+".png";
    } else {
        fname = fsizeX+"x"+fsizeY+".png";
    }

   // Set export options
    var opts, file;
    opts = new ExportOptionsSaveForWeb();
    opts.format = SaveDocumentType.PNG;
    opts.PNG8 = false; 
    opts.transparency = true;
    opts.interlaced = 0;
    opts.includeProfile = false;
    opts.optimized = true;

    // Duplicate, resize and export ( work for Landscape )
    var tempfile = app.activeDocument.duplicate();
    // tempfile.resizeImage(UnitValue(fsizeX,"px"),null,null,ResampleMethod.BICUBIC);
    tempfile.resizeImage(UnitValue(fsizeX,"px"),null,null,ResampleMethod.BICUBICAUTOMATIC);

    // calculate how much will be cropped out on top/bottom
    var offsetTop = (tempfile.height - fsizeY) / 2;
    var offsetBottom = tempfile.height - offsetTop;

    // crop - left, top, right, bottom
    tempfile.crop([0, offsetTop, tempfile.width, offsetBottom]);
    
    file = new File(pname+fname);
    tempfile.exportDocument(file, ExportType.SAVEFORWEB, opts);
    tempfile.close(SaveOptions.DONOTSAVECHANGES);
}