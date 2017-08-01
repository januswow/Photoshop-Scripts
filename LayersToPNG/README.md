# Photoshop-LayersToPNG_JH

## How to define custom scale and rotation
Gives you more ability to optimize texture resolution.

You are able to set export **scale** and **rotation** values for a specific layer in Photoshop and keep
the size and rotation of attachments after importing to Spine, just the same as you see in Photoshop.

Define scale and rotation by adding suffixes to the layer name.
- Define scale by adding suffix ' #s' to the layer name.
- Define rotation by adding suffix ' #r' to the layer name.

ex.
- 'thisislayername #s0.5' *(scale = 50%)*
- 'thisislayername #s0.8 #r-12' *(scale = 80%, rotation = -12 degree)*
* Note: Suffix is case-sensitive.*

## How to use group as slot
Adding suffix ' #SLOT' to the group name will export group as a slot, and each layer in the group will export as an attachment(PNG).
* Note: Suffix is case-sensitive.*

## How to use '_ROOT' as origin
Create a layer named '_ROOT', and draw a dot at the origin position.
To prevent exporting '_ROOT' layer, you can hide the layer or enable 'Ignore starts with an underscore'.

## Release notes

v1.0.0
1. Allow defining custom scale and rotation to specified layer by adding suffixes to the layer name, and will apply on exported images and JSON data.

v1.1.0
1. Prevent getting a crash from incorrect suffixes.
2. Now export images through 'Save For Web'.
3. Calculate transform data by layer bounds.
4. Allow corp pixels out of canvas.
5. Fixed incorrect position after layer rotated.
6. Setup template attachment correctly after 'Import Data' in Spine.

v1.2.0
1. Allow merge group automatically.
2. Allow trim layer or not.
3. Can now ignore layers with the gray color label (Photoshop CC Only!!).
4. Can now ignore layers start with an underscore ("_").

v1.3.0
1. Allow group as a slot (need to add suffix " #SLOT"), and each layer inside as attachment.
2. Fixed wrong slot order while has skins.
3. JSON data format now is the same as exported from Spine.

v1.3.1
1. Fixed information of done dialog.

v1.4.0
1. Added "Use '_ROOT' layer as origin", will set Spine origin position as the center of layer's bound.
2. Fixed incorrect JSON data when there is only one layer in the slot.
3. Fixed 'use ruler origin as 0,0'.
4. JSON data now include layer's blend mode.
5. JSON data now include layer's opacity (opacity and fill opacity).
6. Can now set resample method for resizing.

### Original Version by NathanSweet
https://gist.github.com/NathanSweet/c8e2f6e1d79dedd56e8c
