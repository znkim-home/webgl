var RenderableObjectList = /** @class */ (function () {
    function RenderableObjectList() {
        this.init();
    }
    RenderableObjectList.prototype.init = function () {
        this.renderableObjects = [];
    };
    RenderableObjectList.prototype.findById = function (id) {
        return this.renderableObjects.find(function (renderableObject) {
            return renderableObject.id === id;
        });
    };
    RenderableObjectList.prototype.set = function (renderableObjects) {
        this.renderableObjects = renderableObjects;
    };
    RenderableObjectList.prototype.get = function () {
        return this.renderableObjects;
    };
    RenderableObjectList.prototype.push = function (renderableObject) {
        this.renderableObjects.push(renderableObject);
    };
    RenderableObjectList.prototype.pop = function () {
        return this.renderableObjects.pop();
    };
    RenderableObjectList.prototype.size = function () {
        return this.renderableObjects.length;
    };
    RenderableObjectList.prototype.removeAll = function () {
        this.renderableObjects.length = 0;
    };
    return RenderableObjectList;
}());
export default RenderableObjectList;
