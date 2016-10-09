# Photoshop-LayersToPNG_JH
**Gives you the ability to easily do more optimization to texture resolution.**
  
You are able to set export **scale** and **rotation** values for a specific layer in Photoshop and maintain
the size and rotation of attachments after importing to Spine, just the same as you see in Photoshop.

## How to use
You can define scale and rotation by adding suffixes to layer name.
- Define scale by adding suffix ' #s' to layer name.
- Define rotation by adding suffix ' #r' to layer name.

ex.
- 'thisislayername #s0.5' *(scale = 50%)*
- 'thisislayername #s0.8 #r-12' *(scale = 80%, rotation = -12 degree)*
  
## Release notes
v1.1.0

1. Prevent getting error from incorrect suffixes.
2. Export images through Save For Web.
3. Calculate data by layer bounds.
4. Allow corp pixles out of canvas or not.
5. Fixed incorrect position after layer rotated.
6. Setup template attachment correctly after Import Data in Spine.

v1.0.0

1. When exporting images, scale and rotation values will automatically apply according to the parameters specified in the Photoshop layer name.
2. When exporting JSON, scale and rotation values specified in the Photoshop layer name will be written as JSON data.

### Original Version by NathanSweet
https://gist.github.com/NathanSweet/c8e2f6e1d79dedd56e8c
