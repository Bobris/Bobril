var Bobril;
(function (_Bobril) {
    var Bobril = (function () {
        function Bobril() {
        }
        Bobril.updateElement = function (el, newAttrs, oldAttrs, inNamespace) {
            if (!newAttrs)
                return undefined;
            for (var attrName in newAttrs) {
                var newAttr = newAttrs[attrName];
                var oldAttr = oldAttrs[attrName];
                if ((oldAttr === undefined) || (oldAttr !== newAttr)) {
                    oldAttrs[attrName] = newAttr;
                    if (attrName === "style") {
                        if (oldAttr) {
                            for (var rule in newAttr) {
                                var v = newAttr[rule];
                                if (oldAttr[rule] !== v)
                                    el.style[rule] = v;
                            }
                            for (var rule in oldAttr) {
                                if (!(rule in newAttr))
                                    el.style[rule] = "";
                            }
                        } else {
                            for (var rule in newAttr) {
                                el.style[rule] = newAttr[rule];
                            }
                        }
                    } else if (inNamespace) {
                        if (attrName === "href")
                            el.setAttributeNS("http://www.w3.org/1999/xlink", "href", newAttr);
                        else if (attrName === "className")
                            el.setAttribute("class", newAttr);
                        else
                            el.setAttribute(attrName, newAttr);
                    } else if (attrName in el && !(attrName == "list" || attrName == "form")) {
                        el[attrName] = newAttr;
                    } else
                        el.setAttribute(attrName, newAttr);
                }
            }
            return oldAttrs;
        };

        Bobril.createNode = function (n, inNamespace) {
            var c = n;
            if (c.component) {
                c.componentInstance = {};
                if (c.component.init) {
                    c.component.init(c.componentInstance, n);
                }
            }
            if (n.tag === "") {
                c.element = window.document.createTextNode("" + c.content);
                return c;
            } else if (n.tag === "svg") {
                c.element = window.document.createElementNS("http://www.w3.org/2000/svg", n.tag);
                inNamespace = true;
            } else {
                c.element = window.document.createElement(n.tag);
            }
            Bobril.createChildren(c, inNamespace);
            c.attrs = Bobril.updateElement(c.element, c.attrs, {}, inNamespace);
            return c;
        };

        Bobril.normalizeNode = function (n) {
            var t = typeof n;
            if (t === "string" || t === "number" || t === "boolean") {
                return { tag: "", content: n };
            }
            return n;
        };

        Bobril.createChildren = function (c, inNamespace) {
            var ch = c.children;
            if (!Array.isArray(ch)) {
                ch = Bobril.normalizeNode(ch);
                ch = Bobril.createNode(ch, inNamespace);
                c.element.appendChild(ch.element);
                c.children = ch;
                return;
            }

            for (var i = 0, l = ch.length; i < l; i++) {
                var j = ch[i] = Bobril.createNode(Bobril.normalizeNode(ch[i]), inNamespace);
                c.element.appendChild(j.element);
            }
        };

        Bobril.destroyNode = function (c) {
            var ch = c.children;

            if (!ch) {
            } else if (!Array.isArray(ch)) {
                Bobril.destroyNode(ch);
            } else {
                for (var i = 0, l = ch.length; i < l; i++) {
                    Bobril.destroyNode(ch[i]);
                }
            }
            if (c.component) {
                if (c.component.destroy)
                    c.component.destroy(c.componentInstance, c, c.element);
            }
        };

        Bobril.removeNode = function (c) {
            Bobril.destroyNode(c);
            c.element.parentNode.removeChild(c.element);
        };

        Bobril.updateNode = function (n, c, inNamespace) {
            if (n.component && c.component) {
                if (n.component.shouldChange)
                    if (!n.component.shouldChange(c.componentInstance, n, c))
                        return c;
            }
            if (n.tag === c.tag) {
                if (n.tag === "") {
                    if (c.content !== n.content) {
                        c.content = n.content;
                        if ('textContent' in c.element) {
                            c.element.textContent = "" + c.content;
                            return c;
                        }
                    } else
                        return c;
                } else if (!n.attrs && !c.attrs) {
                    Bobril.updateChildren(n, c, inNamespace);
                    return c;
                } else if (n.attrs && c.attrs && Object.keys(n.attrs).join() === Object.keys(c.attrs).join() && n.attrs.id === c.attrs.id) {
                    Bobril.updateChildren(n, c, inNamespace);
                    c.attrs = Bobril.updateElement(c.element, n.attrs, c.attrs, inNamespace);
                    return c;
                }
            }
            var r = Bobril.createNode(n, inNamespace);
            if (c.element.parentElement) {
                c.element.parentElement.insertBefore(r.element, c.element);
            }
            Bobril.removeNode(c);
            return r;
        };

        Bobril.updateChildren = function (n, c, inNamespace) {
            var newChildren = n.children || [];
            if (!Array.isArray(newChildren))
                newChildren = [newChildren];
            var cachedChildren = c.children || [];
            if (!Array.isArray(cachedChildren))
                cachedChildren = [cachedChildren];
            var newLength = newChildren.length;
            var cachedLength = cachedChildren.length;
            var minNewCachedLength = newLength < cachedLength ? newLength : cachedLength;
            for (var newIndex = 0; newIndex < newLength; newIndex++) {
                newChildren[newIndex] = Bobril.normalizeNode(newChildren[newIndex]);
            }
            newIndex = 0;
            var element = c.element;
            for (; newIndex < minNewCachedLength; newIndex++) {
                if (newChildren[newIndex].key !== cachedChildren[newIndex].key)
                    break;
                cachedChildren[newIndex] = Bobril.updateNode(newChildren[newIndex], cachedChildren[newIndex], inNamespace);
            }
            if (newIndex === minNewCachedLength) {
                while (newIndex < newLength) {
                    cachedChildren.push(Bobril.createNode(newChildren[newIndex], inNamespace));
                    element.appendChild(cachedChildren[newIndex].element);
                    newIndex++;
                }
                while (cachedLength > newIndex) {
                    cachedLength--;
                    Bobril.removeNode(cachedChildren[cachedLength]);
                    cachedChildren.pop();
                }
            } else {
                var cachedIndex;
                var cachedKeys = {};
                var newKeys = {};
                var key;
                var node;
                var backupCommonIndex = newIndex;
                for (cachedIndex = backupCommonIndex; cachedIndex < cachedLength; cachedIndex++) {
                    node = cachedChildren[cachedIndex];
                    key = node.key;
                    if (key !== undefined && !(key in cachedKeys))
                        cachedKeys[key] = cachedIndex;
                }
                for (cachedIndex = newIndex; cachedIndex < newLength; cachedIndex++) {
                    node = newChildren[cachedIndex];
                    key = node.key;
                    if (key !== undefined && !(key in newKeys))
                        newKeys[key] = cachedIndex;
                }
                var delta = 0;
                newIndex = backupCommonIndex;
                cachedIndex = backupCommonIndex;
                while (cachedIndex < cachedLength && newIndex < newLength) {
                    if (cachedChildren[cachedIndex] === null) {
                        cachedChildren.splice(cachedIndex, 1);
                        cachedLength--;
                        delta--;
                        continue;
                    }
                    var ck = cachedChildren[cachedIndex].key;
                    if (!ck) {
                        cachedIndex++;
                        continue;
                    }
                    key = newChildren[newIndex].key;
                    if (!key) {
                        newIndex++;
                        while (newIndex < newLength) {
                            key = newChildren[newIndex].key;
                            if (key)
                                break;
                        }
                        if (!key)
                            break;
                    }
                    var akpos = cachedKeys[key];
                    if (akpos === undefined) {
                        // New key
                        cachedChildren.splice(cachedIndex, 0, Bobril.createNode(newChildren[newIndex], inNamespace));
                        element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[cachedIndex + 1].element);
                        delta++;
                        newIndex++;
                        cachedIndex++;
                        cachedLength++;
                        continue;
                    }
                    if (!(ck in newKeys)) {
                        // Old key
                        Bobril.removeNode(cachedChildren[cachedIndex]);
                        cachedChildren.splice(cachedIndex, 1);
                        delta--;
                        cachedLength--;
                        continue;
                    }
                    if (cachedIndex === akpos + delta) {
                        // Inplace update
                        cachedChildren[cachedIndex] = Bobril.updateNode(newChildren[newIndex], cachedChildren[cachedIndex], inNamespace);
                        newIndex++;
                        cachedIndex++;
                    } else {
                        // Move
                        cachedChildren.splice(cachedIndex, 0, cachedChildren[akpos + delta]);
                        delta++;
                        cachedChildren[akpos + delta] = null;
                        element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[cachedIndex + 1].element);
                        cachedChildren[cachedIndex] = Bobril.updateNode(newChildren[newIndex], cachedChildren[cachedIndex], inNamespace);
                        cachedIndex++;
                        cachedLength++;
                        newIndex++;
                    }
                }
                while (cachedIndex < cachedLength) {
                    if (cachedChildren[cachedIndex] === null) {
                        cachedChildren.splice(cachedIndex, 1);
                        cachedLength--;
                        continue;
                    }
                    if (cachedChildren[cachedIndex].key) {
                        Bobril.removeNode(cachedChildren[cachedIndex]);
                        cachedChildren.splice(cachedIndex, 1);
                        cachedLength--;
                        continue;
                    }
                    cachedIndex++;
                }
                while (newIndex < newLength) {
                    key = newChildren[newIndex].key;
                    if (key) {
                        cachedChildren.push(Bobril.createNode(newChildren[newIndex], inNamespace));
                        element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[cachedIndex + 1].element);
                        delta++;
                        newIndex++;
                        cachedIndex++;
                        cachedLength++;
                    }
                    newIndex++;
                }
                newIndex = cachedIndex = backupCommonIndex;
                while (cachedIndex < cachedLength && newIndex < newLength) {
                    var ck = cachedChildren[cachedIndex].key;
                    if (ck) {
                        cachedIndex++;
                        continue;
                    }
                    key = newChildren[newIndex].key;
                    if (key) {
                        newIndex++;
                        while (newIndex < newLength) {
                            key = newChildren[newIndex].key;
                            if (!key)
                                break;
                        }
                        if (key)
                            break;
                    }
                    cachedChildren[cachedIndex] = Bobril.updateNode(newChildren[newIndex], cachedChildren[cachedIndex], inNamespace);
                    newIndex++;
                    cachedIndex++;
                }
                while (newIndex < newLength) {
                    if (!newChildren[newIndex].key) {
                        cachedChildren.push(Bobril.createNode(newChildren[newIndex], inNamespace));
                        element.appendChild(cachedChildren[newIndex].element);
                    }
                    newIndex++;
                }
                while (cachedLength > newIndex) {
                    cachedLength--;
                    Bobril.removeNode(cachedChildren[cachedLength]);
                    cachedChildren.pop();
                }
            }
            c.children = cachedChildren;
        };
        return Bobril;
    })();
    _Bobril.Bobril = Bobril;
})(Bobril || (Bobril = {}));

module.exports = Bobril;
//# sourceMappingURL=bobril.js.map
