import { vec4 } from 'gl-matrix'; // eslint-disable-line no-unused-vars
export default class TextureCoordinator {
    static calcTextureCoordinate(textureSize, texturePosition, pixelWidth) {
        let minWidth = pixelWidth * texturePosition[0];
        let minHeight = pixelWidth * texturePosition[1];
        let maxWidth = pixelWidth * texturePosition[0] + pixelWidth;
        let maxHeight = pixelWidth * texturePosition[1] + pixelWidth;
        if (minWidth < 0 || minHeight < 0 || maxWidth > textureSize[0] || maxHeight > textureSize[1]) {
            throw new Error("incorrect texture coordinate.");
        }
        return vec4.fromValues(minWidth / textureSize[0], minHeight / textureSize[1], maxWidth / textureSize[0], maxHeight / textureSize[1]);
    }
}
