export default class Indices {
    constructor() {
        this.init();
    }
    init() {
        this.indices = 0;
    }
    get() {
        return this.indices;
    }
    next() {
        this.indices++;
    }
    getAndNext() {
        let result = this.indices;
        this.next();
        return result;
    }
}
