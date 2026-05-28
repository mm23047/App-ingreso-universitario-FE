const sinon = {
    stubs: new Map(),

    stub(obj, method, implementation) {
        const key = `${obj.constructor.name || 'window'}.${method}`;
        const original = obj[method];
        
        if (!this.stubs.has(key)) {
            this.stubs.set(key, { original, obj, method });
        }

        obj[method] = implementation;
        obj[method].restore = () => {
            if (this.stubs.has(key)) {
                const { original: orig } = this.stubs.get(key);
                obj[method] = orig;
                this.stubs.delete(key);
            }
        };

        return obj[method];
    },

    stub: function(obj, method) {
        const key = `${obj.constructor.name || 'window'}.${method}`;
        const original = obj[method];

        if (!this.stubs.has(key)) {
            this.stubs.set(key, { original, obj, method });
        }

        const stub = {
            returns: function(value) {
                obj[method] = () => Promise.resolve(value);
                obj[method].restore = () => {
                    obj[method] = original;
                    sinon.stubs.delete(key);
                };
                return stub;
            },
            resolves: function(value) {
                obj[method] = () => Promise.resolve(value);
                obj[method].restore = () => {
                    obj[method] = original;
                    sinon.stubs.delete(key);
                };
                return stub;
            },
            rejects: function(error) {
                obj[method] = () => Promise.reject(error);
                obj[method].restore = () => {
                    obj[method] = original;
                    sinon.stubs.delete(key);
                };
                return stub;
            },
            restore: () => {
                if (sinon.stubs.has(key)) {
                    obj[method] = original;
                    sinon.stubs.delete(key);
                }
            }
        };

        return stub;
    },

    restoreAll() {
        for (const [key, { original, obj, method }] of this.stubs) {
            obj[method] = original;
        }
        this.stubs.clear();
    }
};

export default sinon;
