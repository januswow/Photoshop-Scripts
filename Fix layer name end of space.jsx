// Author : Janus Huang

<javascriptresource>
<name>$$$/JavaScripts/FixLayerNameEndOfSpace/Menu=FixLayerNameEndOfSpace</name>
<category>layers</category>
<enableinfo>true</enableinfo>
</javascriptresource>

#target Photoshop

function main()
{
	var doc = app.activeDocument;

	for (var i = 0; i < doc.layers.length; i++)
	{
		var isFixed = false;
		var currName = doc.layers[i].name;
		var newName = currName;
		while (newName.lastIndexOf(" ") == newName.length-1)
		{
			isFixed = true;
			newName = newName.substr(0, newName.length-1);
			doc.layers[i].name = newName;
		}
		if (isFixed) alert("Layer [" + currName + "] is fixed!\rNew Layer name [" + newName + "]");
		isFixed = false;
	}
}

main();