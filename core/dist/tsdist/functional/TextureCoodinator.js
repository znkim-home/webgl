import { vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
var TextureCoordinator = /** @class */ (function () {
    function TextureCoordinator() {
    }
    TextureCoordinator.calcTextureCoordinate = function (textureSize, texturePosition, pixelWidth) {
        var minWidth = pixelWidth * texturePosition[0];
        var minHeight = pixelWidth * texturePosition[1];
        var maxWidth = pixelWidth * texturePosition[0] + pixelWidth;
        var maxHeight = pixelWidth * texturePosition[1] + pixelWidth;
        if (minWidth < 0 || minHeight < 0 || maxWidth > textureSize[0] || maxHeight > textureSize[1]) {
            throw new Error("incorrect texture coordinate.");
        }
        return vec4.fromValues(minWidth / textureSize[0], minHeight / textureSize[1], maxWidth / textureSize[0], maxHeight / textureSize[1]);
    };
    return TextureCoordinator;
}());
export default TextureCoordinator;
