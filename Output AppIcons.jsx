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

// bring Photoshop into focus
#target Photoshop

main();

function main() {

    // 請在此修改預設的輸出尺寸
    var outputSizeArray_default = [];
    //outputSizeArray_default = [29, 40, 48, 50, 57, 58, 72, 76, 80, 100, 114, 120, 144, 152, 167, 180, 512];//其他工具預設尺寸
    outputSizeArray_default = [40,57,58,72,76,80,120,152,157,180];

    alert("此Script可將圖檔自動輸出成多個尺寸的PNG, 用於輸出AppIcon,\n"
        + "請選擇尺寸為1024px x 1024px的PSD檔案進行轉換.\r\r");

    // define output sizes
    var outputSizeArray = prompt("請輸入要輸出的尺寸,\n輸入範例:29,40,48,50,\n如要以預設尺寸輸出則不要輸入任何資料!\n預設尺寸為:"+outputSizeArray_default+".\r\r","")

    if (outputSizeArray != null && outputSizeArray != "")
    {
        outputSizeArray = outputSizeArray.split(",");
    } else {
        outputSizeArray = outputSizeArray_default;//iOS AppIcons 必須尺寸
    }
    // alert(outputSizeArray);


///*
    // Ask user for input folder
	var inputFile = File.openDialog("Select a 1024px x 1024px PSD file","PSD File:*.psd");
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
    fname = "";//dont include file name
    var append = "";
    var fsize = size * scaleFactor;
    if (scaleFactor > 1) {
		append =  "@" + scaleFactor + "x";   
    }
    n = fname.lastIndexOf(".");
    if (n > 0) {
        var basename = fname.substring(0,n);
        fname = basename+"-"+size+append+".png";
    } else {
        fname = size+append+".png";
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

    // Duplicate, resize and export
    var tempfile = app.activeDocument.duplicate();
    tempfile.resizeImage(fsize+"px",fsize+"px");
    file = new File(pname+fname);
    tempfile.exportDocument(file, ExportType.SAVEFORWEB, opts);
    tempfile.close(SaveOptions.DONOTSAVECHANGES);
}