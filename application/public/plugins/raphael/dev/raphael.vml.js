define(["./raphael.core"], function (R) {
    if (R && !R.vml) {
        return
    }

    const has = "hasOwnProperty"
        const Str = String
        const toFloat = parseFloat
        const math = Math
        const round = math.round
        const mmax = math.max
        const mmin = math.min
        const abs = math.abs
        const fillString = "fill"
        const separator = /[, ]+/
        const eve = R.eve
        const ms = " progid:DXImageTransform.Microsoft"
        const S = " "
        const E = ""
        const map = { M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x" }
        const bites = /([clmz]),?([^clmz]*)/gi
        const blurregexp = / progid:\S+Blur\([^\)]+\)/g
        const val = /-?[^,\s-]+/g
        const cssDot = "position:absolute;left:0;top:0;width:1px;height:1px;behavior:url(#default#VML)"
        const zoom = 21600
        const pathTypes = { path: 1, rect: 1, image: 1 }
        const ovalTypes = { circle: 1, ellipse: 1 }
        const path2vml = function (path) {
            let total = /[ahqstv]/ig
                let command = R._pathToAbsolute
            Str(path).match(total) && (command = R._path2curve)
            total = /[clmz]/g
            if (command == R._pathToAbsolute && !Str(path).match(total)) {
                var res = Str(path).replace(bites, function (all, command, args) {
                    let vals = []
                        const isMove = command.toLowerCase() == "m"
                        let res = map[command]
                    args.replace(val, function (value) {
                        if (isMove && vals.length == 2) {
                            res += vals + map[command == "m" ? "l" : "L"]
                            vals = []
                        }
                        vals.push(round(value * zoom))
                    })
                    return res + vals
                })
                return res
            }
            const pa = command(path); let p; let r
            res = []
            for (let i = 0, ii = pa.length; i < ii; i++) {
                p = pa[i]
                r = pa[i][0].toLowerCase()
                r == "z" && (r = "x")
                for (let j = 1, jj = p.length; j < jj; j++) {
                    r += round(p[j] * zoom) + (j != jj - 1 ? "," : E)
                }
                res.push(r)
            }
            return res.join(S)
        }
        const compensation = function (deg, dx, dy) {
            const m = R.matrix()
            m.rotate(-deg, 0.5, 0.5)
            return {
                dx: m.x(dx, dy),
                dy: m.y(dx, dy)
            }
        }
        const setCoords = function (p, sx, sy, dx, dy, deg) {
            const _ = p._
                const m = p.matrix
                const fillpos = _.fillpos
                const o = p.node
                const s = o.style
                let y = 1
                let flip = ""
                let dxdy
                const kx = zoom / sx
                const ky = zoom / sy
            s.visibility = "hidden"
            if (!sx || !sy) {
                return
            }
            o.coordsize = abs(kx) + S + abs(ky)
            s.rotation = deg * (sx * sy < 0 ? -1 : 1)
            if (deg) {
                var c = compensation(deg, dx, dy)
                dx = c.dx
                dy = c.dy
            }
            sx < 0 && (flip += "x")
            sy < 0 && (flip += " y") && (y = -1)
            s.flip = flip
            o.coordorigin = (dx * -kx) + S + (dy * -ky)
            if (fillpos || _.fillsize) {
                let fill = o.getElementsByTagName(fillString)
                fill = fill && fill[0]
                o.removeChild(fill)
                if (fillpos) {
                    c = compensation(deg, m.x(fillpos[0], fillpos[1]), m.y(fillpos[0], fillpos[1]))
                    fill.position = c.dx * y + S + c.dy * y
                }
                if (_.fillsize) {
                    fill.size = _.fillsize[0] * abs(sx) + S + _.fillsize[1] * abs(sy)
                }
                o.appendChild(fill)
            }
            s.visibility = "visible"
        }
    R.toString = function () {
        return "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version
    }
    const addArrow = function (o, value, isEnd) {
        const values = Str(value).toLowerCase().split("-")
            const se = isEnd ? "end" : "start"
            let i = values.length
            let type = "classic"
            let w = "medium"
            let h = "medium"
        while (i--) {
            switch (values[i]) {
                case "block":
                case "classic":
                case "oval":
                case "diamond":
                case "open":
                case "none":
                    type = values[i]
                    break
                case "wide":
                case "narrow": h = values[i]; break
                case "long":
                case "short": w = values[i]; break
            }
        }
        const stroke = o.node.getElementsByTagName("stroke")[0]
        stroke[se + "arrow"] = type
        stroke[se + "arrowlength"] = w
        stroke[se + "arrowwidth"] = h
    }
    const setFillAndStroke = function (o, params) {
        // o.paper.canvas.style.display = "none";
        o.attrs = o.attrs || {}
        const node = o.node
            const a = o.attrs
            let s = node.style
            let xy
            const newpath = pathTypes[o.type] && (params.x != a.x || params.y != a.y || params.width != a.width || params.height != a.height || params.cx != a.cx || params.cy != a.cy || params.rx != a.rx || params.ry != a.ry || params.r != a.r)
            const isOval = ovalTypes[o.type] && (a.cx != params.cx || a.cy != params.cy || a.r != params.r || a.rx != params.rx || a.ry != params.ry)
            const res = o

        for (const par in params) {
 if (params[has](par)) {
            a[par] = params[par]
        }
}
        if (newpath) {
            a.path = R._getPath[o.type](o)
            o._.dirty = 1
        }
        params.href && (node.href = params.href)
        params.title && (node.title = params.title)
        params.target && (node.target = params.target)
        params.cursor && (s.cursor = params.cursor)
        "blur" in params && o.blur(params.blur)
        if (params.path && o.type == "path" || newpath) {
            node.path = path2vml(~Str(a.path).toLowerCase().indexOf("r") ? R._pathToAbsolute(a.path) : a.path)
            o._.dirty = 1
            if (o.type == "image") {
                o._.fillpos = [a.x, a.y]
                o._.fillsize = [a.width, a.height]
                setCoords(o, 1, 1, 0, 0, 0)
            }
        }
        "transform" in params && o.transform(params.transform)
        if (isOval) {
            const cx = +a.cx
                const cy = +a.cy
                const rx = +a.rx || +a.r || 0
                const ry = +a.ry || +a.r || 0
            node.path = R.format("ar{0},{1},{2},{3},{4},{1},{4},{1}x", round((cx - rx) * zoom), round((cy - ry) * zoom), round((cx + rx) * zoom), round((cy + ry) * zoom), round(cx * zoom))
            o._.dirty = 1
        }
        if ("clip-rect" in params) {
            const rect = Str(params["clip-rect"]).split(separator)
            if (rect.length == 4) {
                rect[2] = +rect[2] + (+rect[0])
                rect[3] = +rect[3] + (+rect[1])
                const div = node.clipRect || R._g.doc.createElement("div")
                    const dstyle = div.style
                dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect)
                if (!node.clipRect) {
                    dstyle.position = "absolute"
                    dstyle.top = 0
                    dstyle.left = 0
                    dstyle.width = o.paper.width + "px"
                    dstyle.height = o.paper.height + "px"
                    node.parentNode.insertBefore(div, node)
                    div.appendChild(node)
                    node.clipRect = div
                }
            }
            if (!params["clip-rect"]) {
                node.clipRect && (node.clipRect.style.clip = "auto")
            }
        }
        if (o.textpath) {
            const textpathStyle = o.textpath.style
            params.font && (textpathStyle.font = params.font)
            params["font-family"] && (textpathStyle.fontFamily = '"' + params["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g, E) + '"')
            params["font-size"] && (textpathStyle.fontSize = params["font-size"])
            params["font-weight"] && (textpathStyle.fontWeight = params["font-weight"])
            params["font-style"] && (textpathStyle.fontStyle = params["font-style"])
        }
        if ("arrow-start" in params) {
            addArrow(res, params["arrow-start"])
        }
        if ("arrow-end" in params) {
            addArrow(res, params["arrow-end"], 1)
        }
        if (params.opacity != null ||
            params.fill != null ||
            params.src != null ||
            params.stroke != null ||
            params["stroke-width"] != null ||
            params["stroke-opacity"] != null ||
            params["fill-opacity"] != null ||
            params["stroke-dasharray"] != null ||
            params["stroke-miterlimit"] != null ||
            params["stroke-linejoin"] != null ||
            params["stroke-linecap"] != null) {
            let fill = node.getElementsByTagName(fillString)
                let newfill = false
            fill = fill && fill[0]
            !fill && (newfill = fill = createNode(fillString))
            if (o.type == "image" && params.src) {
                fill.src = params.src
            }
            params.fill && (fill.on = true)
            if (fill.on == null || params.fill == "none" || params.fill === null) {
                fill.on = false
            }
            if (fill.on && params.fill) {
                const isURL = Str(params.fill).match(R._ISURL)
                if (isURL) {
                    fill.parentNode == node && node.removeChild(fill)
                    fill.rotate = true
                    fill.src = isURL[1]
                    fill.type = "tile"
                    const bbox = o.getBBox(1)
                    fill.position = bbox.x + S + bbox.y
                    o._.fillpos = [bbox.x, bbox.y]

                    R._preload(isURL[1], function () {
                        o._.fillsize = [this.offsetWidth, this.offsetHeight]
                    })
                } else {
                    fill.color = R.getRGB(params.fill).hex
                    fill.src = E
                    fill.type = "solid"
                    if (R.getRGB(params.fill).error && (res.type in { circle: 1, ellipse: 1 } || Str(params.fill).charAt() != "r") && addGradientFill(res, params.fill, fill)) {
                        a.fill = "none"
                        a.gradient = params.fill
                        fill.rotate = false
                    }
                }
            }
            if ("fill-opacity" in params || "opacity" in params) {
                var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+R.getRGB(params.fill).o + 1 || 2) - 1)
                opacity = mmin(mmax(opacity, 0), 1)
                fill.opacity = opacity
                if (fill.src) {
                    fill.color = "none"
                }
            }
            node.appendChild(fill)
            let stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0])
            let newstroke = false
            !stroke && (newstroke = stroke = createNode("stroke"))
            if ((params.stroke && params.stroke != "none") ||
                params["stroke-width"] ||
                params["stroke-opacity"] != null ||
                params["stroke-dasharray"] ||
                params["stroke-miterlimit"] ||
                params["stroke-linejoin"] ||
                params["stroke-linecap"]) {
                stroke.on = true
            }
            (params.stroke == "none" || params.stroke === null || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false)
            const strokeColor = R.getRGB(params.stroke)
            stroke.on && params.stroke && (stroke.color = strokeColor.hex)
            opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+strokeColor.o + 1 || 2) - 1)
            let width = (toFloat(params["stroke-width"]) || 1) * 0.75
            opacity = mmin(mmax(opacity, 0), 1)
            params["stroke-width"] == null && (width = a["stroke-width"])
            params["stroke-width"] && (stroke.weight = width)
            width && width < 1 && (opacity *= width) && (stroke.weight = 1)
            stroke.opacity = opacity

            params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter")
            stroke.miterlimit = params["stroke-miterlimit"] || 8
            params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round")
            if ("stroke-dasharray" in params) {
                const dasharray = {
                    "-": "shortdash",
                    ".": "shortdot",
                    "-.": "shortdashdot",
                    "-..": "shortdashdotdot",
                    ". ": "dot",
                    "- ": "dash",
                    "--": "longdash",
                    "- .": "dashdot",
                    "--.": "longdashdot",
                    "--..": "longdashdotdot"
                }
                stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E
            }
            newstroke && node.appendChild(stroke)
        }
        if (res.type == "text") {
            res.paper.canvas.style.display = E
            const span = res.paper.span
                const m = 100
                let fontSize = a.font && a.font.match(/\d+(?:\.\d*)?(?=px)/)
            s = span.style
            a.font && (s.font = a.font)
            a["font-family"] && (s.fontFamily = a["font-family"])
            a["font-weight"] && (s.fontWeight = a["font-weight"])
            a["font-style"] && (s.fontStyle = a["font-style"])
            fontSize = toFloat(a["font-size"] || fontSize && fontSize[0]) || 10
            s.fontSize = fontSize * m + "px"
            res.textpath.string && (span.innerHTML = Str(res.textpath.string).replace(/</g, "&#60;").replace(/&/g, "&#38;").replace(/\n/g, "<br>"))
            const brect = span.getBoundingClientRect()
            res.W = a.w = (brect.right - brect.left) / m
            res.H = a.h = (brect.bottom - brect.top) / m
            // res.paper.canvas.style.display = "none";
            res.X = a.x
            res.Y = a.y + res.H / 2;

            ("x" in params || "y" in params) && (res.path.v = R.format("m{0},{1}l{2},{1}", round(a.x * zoom), round(a.y * zoom), round(a.x * zoom) + 1))
            const dirtyattrs = ["x", "y", "text", "font", "font-family", "font-weight", "font-style", "font-size"]
            for (let d = 0, dd = dirtyattrs.length; d < dd; d++) {
 if (dirtyattrs[d] in params) {
                res._.dirty = 1
                break
            }
}

            // text-anchor emulation
            switch (a["text-anchor"]) {
                case "start":
                    res.textpath.style["v-text-align"] = "left"
                    res.bbx = res.W / 2
                break
                case "end":
                    res.textpath.style["v-text-align"] = "right"
                    res.bbx = -res.W / 2
                break
                default:
                    res.textpath.style["v-text-align"] = "center"
                    res.bbx = 0
                break
            }
            res.textpath.style["v-text-kern"] = true
        }
        // res.paper.canvas.style.display = E;
    }
    var addGradientFill = function (o, gradient, fill) {
        o.attrs = o.attrs || {}
        const attrs = o.attrs
            const pow = Math.pow
            let opacity
            let oindex
            let type = "linear"
            let fxfy = ".5 .5"
        o.attrs.gradient = gradient
        gradient = Str(gradient).replace(R._radial_gradient, function (all, fx, fy) {
            type = "radial"
            if (fx && fy) {
                fx = toFloat(fx)
                fy = toFloat(fy)
                pow(fx - 0.5, 2) + pow(fy - 0.5, 2) > 0.25 && (fy = math.sqrt(0.25 - pow(fx - 0.5, 2)) * ((fy > 0.5) * 2 - 1) + 0.5)
                fxfy = fx + S + fy
            }
            return E
        })
        gradient = gradient.split(/\s*\-\s*/)
        if (type == "linear") {
            var angle = gradient.shift()
            angle = -toFloat(angle)
            if (isNaN(angle)) {
                return null
            }
        }
        const dots = R._parseDots(gradient)
        if (!dots) {
            return null
        }
        o = o.shape || o.node
        if (dots.length) {
            o.removeChild(fill)
            fill.on = true
            fill.method = "none"
            fill.color = dots[0].color
            fill.color2 = dots[dots.length - 1].color
            const clrs = []
            for (let i = 0, ii = dots.length; i < ii; i++) {
                dots[i].offset && clrs.push(dots[i].offset + S + dots[i].color)
            }
            fill.colors = clrs.length ? clrs.join() : "0% " + fill.color
            if (type == "radial") {
                fill.type = "gradientTitle"
                fill.focus = "100%"
                fill.focussize = "0 0"
                fill.focusposition = fxfy
                fill.angle = 0
            } else {
                // fill.rotate= true;
                fill.type = "gradient"
                fill.angle = (270 - angle) % 360
            }
            o.appendChild(fill)
        }
        return 1
    }
    const Element = function (node, vml) {
        this[0] = this.node = node
        node.raphael = true
        this.id = R._oid++
        node.raphaelid = this.id
        this.X = 0
        this.Y = 0
        this.attrs = {}
        this.paper = vml
        this.matrix = R.matrix()
        this._ = {
            transform: [],
            sx: 1,
            sy: 1,
            dx: 0,
            dy: 0,
            deg: 0,
            dirty: 1,
            dirtyT: 1
        }
        !vml.bottom && (vml.bottom = this)
        this.prev = vml.top
        vml.top && (vml.top.next = this)
        vml.top = this
        this.next = null
    }
    const elproto = R.el

    Element.prototype = elproto
    elproto.constructor = Element
    elproto.transform = function (tstr) {
        if (tstr == null) {
            return this._.transform
        }
        const vbs = this.paper._viewBoxShift
            const vbt = vbs ? "s" + [vbs.scale, vbs.scale] + "-1-1t" + [vbs.dx, vbs.dy] : E
            let oldt
        if (vbs) {
            oldt = tstr = Str(tstr).replace(/\.{3}|\u2026/g, this._.transform || E)
        }
        R._extractTransform(this, vbt + tstr)
        const matrix = this.matrix.clone()
            const skew = this.skew
            const o = this.node
            let split
            const isGrad = ~Str(this.attrs.fill).indexOf("-")
            const isPatt = !Str(this.attrs.fill).indexOf("url(")
        matrix.translate(1, 1)
        if (isPatt || isGrad || this.type == "image") {
            skew.matrix = "1 0 0 1"
            skew.offset = "0 0"
            split = matrix.split()
            if ((isGrad && split.noRotation) || !split.isSimple) {
                o.style.filter = matrix.toFilter()
                const bb = this.getBBox()
                    const bbt = this.getBBox(1)
                    const dx = bb.x - bbt.x
                    const dy = bb.y - bbt.y
                o.coordorigin = (dx * -zoom) + S + (dy * -zoom)
                setCoords(this, 1, 1, dx, dy, 0)
            } else {
                o.style.filter = E
                setCoords(this, split.scalex, split.scaley, split.dx, split.dy, split.rotate)
            }
        } else {
            o.style.filter = E
            skew.matrix = Str(matrix)
            skew.offset = matrix.offset()
        }
        if (oldt !== null) { // empty string value is true as well
            this._.transform = oldt
            R._extractTransform(this, oldt)
        }
        return this
    }
    elproto.rotate = function (deg, cx, cy) {
        if (this.removed) {
            return this
        }
        if (deg == null) {
            return
        }
        deg = Str(deg).split(separator)
        if (deg.length - 1) {
            cx = toFloat(deg[1])
            cy = toFloat(deg[2])
        }
        deg = toFloat(deg[0]);
        (cy == null) && (cx = cy)
        if (cx == null || cy == null) {
            const bbox = this.getBBox(1)
            cx = bbox.x + bbox.width / 2
            cy = bbox.y + bbox.height / 2
        }
        this._.dirtyT = 1
        this.transform(this._.transform.concat([["r", deg, cx, cy]]))
        return this
    }
    elproto.translate = function (dx, dy) {
        if (this.removed) {
            return this
        }
        dx = Str(dx).split(separator)
        if (dx.length - 1) {
            dy = toFloat(dx[1])
        }
        dx = toFloat(dx[0]) || 0
        dy = +dy || 0
        if (this._.bbox) {
            this._.bbox.x += dx
            this._.bbox.y += dy
        }
        this.transform(this._.transform.concat([["t", dx, dy]]))
        return this
    }
    elproto.scale = function (sx, sy, cx, cy) {
        if (this.removed) {
            return this
        }
        sx = Str(sx).split(separator)
        if (sx.length - 1) {
            sy = toFloat(sx[1])
            cx = toFloat(sx[2])
            cy = toFloat(sx[3])
            isNaN(cx) && (cx = null)
            isNaN(cy) && (cy = null)
        }
        sx = toFloat(sx[0]);
        (sy == null) && (sy = sx);
        (cy == null) && (cx = cy)
        if (cx == null || cy == null) {
            var bbox = this.getBBox(1)
        }
        cx = cx == null ? bbox.x + bbox.width / 2 : cx
        cy = cy == null ? bbox.y + bbox.height / 2 : cy

        this.transform(this._.transform.concat([["s", sx, sy, cx, cy]]))
        this._.dirtyT = 1
        return this
    }
    elproto.hide = function () {
        !this.removed && (this.node.style.display = "none")
        return this
    }
    elproto.show = function () {
        !this.removed && (this.node.style.display = E)
        return this
    }
    // Needed to fix the vml setViewBox issues
    elproto.auxGetBBox = R.el.getBBox
    elproto.getBBox = function () {
      const b = this.auxGetBBox()
      if (this.paper && this.paper._viewBoxShift) {
        const c = {}
        const z = 1 / this.paper._viewBoxShift.scale
        c.x = b.x - this.paper._viewBoxShift.dx
        c.x *= z
        c.y = b.y - this.paper._viewBoxShift.dy
        c.y *= z
        c.width = b.width * z
        c.height = b.height * z
        c.x2 = c.x + c.width
        c.y2 = c.y + c.height
        return c
      }
      return b
    }
    elproto._getBBox = function () {
        if (this.removed) {
            return {}
        }
        return {
            x: this.X + (this.bbx || 0) - this.W / 2,
            y: this.Y - this.H,
            width: this.W,
            height: this.H
        }
    }
    elproto.remove = function () {
        if (this.removed || !this.node.parentNode) {
            return
        }
        this.paper.__set__ && this.paper.__set__.exclude(this)
        R.eve.unbind("raphael.*.*." + this.id)
        R._tear(this, this.paper)
        this.node.parentNode.removeChild(this.node)
        this.shape && this.shape.parentNode.removeChild(this.shape)
        for (const i in this) {
            this[i] = typeof this[i] === "function" ? R._removedFactory(i) : null
        }
        this.removed = true
    }
    elproto.attr = function (name, value) {
        if (this.removed) {
            return this
        }
        if (name == null) {
            const res = {}
            for (const a in this.attrs) {
 if (this.attrs[has](a)) {
                res[a] = this.attrs[a]
            }
}
            res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient
            res.transform = this._.transform
            return res
        }
        if (value == null && R.is(name, "string")) {
            if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                return this.attrs.gradient
            }
            const names = name.split(separator)
                var out = {}
            for (var i = 0, ii = names.length; i < ii; i++) {
                name = names[i]
                if (name in this.attrs) {
                    out[name] = this.attrs[name]
                } else if (R.is(this.paper.customAttributes[name], "function")) {
                    out[name] = this.paper.customAttributes[name].def
                } else {
                    out[name] = R._availableAttrs[name]
                }
            }
            return ii - 1 ? out : out[names[0]]
        }
        if (this.attrs && value == null && R.is(name, "array")) {
            out = {}
            for (i = 0, ii = name.length; i < ii; i++) {
                out[name[i]] = this.attr(name[i])
            }
            return out
        }
        let params
        if (value != null) {
            params = {}
            params[name] = value
        }
        value == null && R.is(name, "object") && (params = name)
        for (var key in params) {
            eve("raphael.attr." + key + "." + this.id, this, params[key])
        }
        if (params) {
            for (key in this.paper.customAttributes) {
 if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                const par = this.paper.customAttributes[key].apply(this, [].concat(params[key]))
                this.attrs[key] = params[key]
                for (const subkey in par) {
 if (par[has](subkey)) {
                    params[subkey] = par[subkey]
                }
}
            }
}
            // this.paper.canvas.style.display = "none";
            if (params.text && this.type == "text") {
                this.textpath.string = params.text
            }
            setFillAndStroke(this, params)
            // this.paper.canvas.style.display = E;
        }
        return this
    }
    elproto.toFront = function () {
        !this.removed && this.node.parentNode.appendChild(this.node)
        this.paper && this.paper.top != this && R._tofront(this, this.paper)
        return this
    }
    elproto.toBack = function () {
        if (this.removed) {
            return this
        }
        if (this.node.parentNode.firstChild != this.node) {
            this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild)
            R._toback(this, this.paper)
        }
        return this
    }
    elproto.insertAfter = function (element) {
        if (this.removed) {
            return this
        }
        if (element.constructor == R.st.constructor) {
            element = element[element.length - 1]
        }
        if (element.node.nextSibling) {
            element.node.parentNode.insertBefore(this.node, element.node.nextSibling)
        } else {
            element.node.parentNode.appendChild(this.node)
        }
        R._insertafter(this, element, this.paper)
        return this
    }
    elproto.insertBefore = function (element) {
        if (this.removed) {
            return this
        }
        if (element.constructor == R.st.constructor) {
            element = element[0]
        }
        element.node.parentNode.insertBefore(this.node, element.node)
        R._insertbefore(this, element, this.paper)
        return this
    }
    elproto.blur = function (size) {
        const s = this.node.runtimeStyle
            let f = s.filter
        f = f.replace(blurregexp, E)
        if (+size !== 0) {
            this.attrs.blur = size
            s.filter = f + S + ms + ".Blur(pixelradius=" + (+size || 1.5) + ")"
            s.margin = R.format("-{0}px 0 0 -{0}px", round(+size || 1.5))
        } else {
            s.filter = f
            s.margin = 0
            delete this.attrs.blur
        }
        return this
    }

    R._engine.path = function (pathString, vml) {
        const el = createNode("shape")
        el.style.cssText = cssDot
        el.coordsize = zoom + S + zoom
        el.coordorigin = vml.coordorigin
        const p = new Element(el, vml)
            const attr = { fill: "none", stroke: "#000" }
        pathString && (attr.path = pathString)
        p.type = "path"
        p.path = []
        p.Path = E
        setFillAndStroke(p, attr)
        vml.canvas && vml.canvas.appendChild(el)
        const skew = createNode("skew")
        skew.on = true
        el.appendChild(skew)
        p.skew = skew
        p.transform(E)
        return p
    }
    R._engine.rect = function (vml, x, y, w, h, r) {
        const path = R._rectPath(x, y, w, h, r)
            const res = vml.path(path)
            const a = res.attrs
        res.X = a.x = x
        res.Y = a.y = y
        res.W = a.width = w
        res.H = a.height = h
        a.r = r
        a.path = path
        res.type = "rect"
        return res
    }
    R._engine.ellipse = function (vml, x, y, rx, ry) {
        const res = vml.path()
            const a = res.attrs
        res.X = x - rx
        res.Y = y - ry
        res.W = rx * 2
        res.H = ry * 2
        res.type = "ellipse"
        setFillAndStroke(res, {
            cx: x,
            cy: y,
            rx,
            ry
        })
        return res
    }
    R._engine.circle = function (vml, x, y, r) {
        const res = vml.path()
            const a = res.attrs
        res.X = x - r
        res.Y = y - r
        res.W = res.H = r * 2
        res.type = "circle"
        setFillAndStroke(res, {
            cx: x,
            cy: y,
            r
        })
        return res
    }
    R._engine.image = function (vml, src, x, y, w, h) {
        const path = R._rectPath(x, y, w, h)
            const res = vml.path(path).attr({ stroke: "none" })
            const a = res.attrs
            const node = res.node
            const fill = node.getElementsByTagName(fillString)[0]
        a.src = src
        res.X = a.x = x
        res.Y = a.y = y
        res.W = a.width = w
        res.H = a.height = h
        a.path = path
        res.type = "image"
        fill.parentNode == node && node.removeChild(fill)
        fill.rotate = true
        fill.src = src
        fill.type = "tile"
        res._.fillpos = [x, y]
        res._.fillsize = [w, h]
        node.appendChild(fill)
        setCoords(res, 1, 1, 0, 0, 0)
        return res
    }
    R._engine.text = function (vml, x, y, text) {
        const el = createNode("shape")
            const path = createNode("path")
            const o = createNode("textpath")
        x = x || 0
        y = y || 0
        text = text || ""
        path.v = R.format("m{0},{1}l{2},{1}", round(x * zoom), round(y * zoom), round(x * zoom) + 1)
        path.textpathok = true
        o.string = Str(text)
        o.on = true
        el.style.cssText = cssDot
        el.coordsize = zoom + S + zoom
        el.coordorigin = "0 0"
        const p = new Element(el, vml)
            const attr = {
                fill: "#000",
                stroke: "none",
                font: R._availableAttrs.font,
                text
            }
        p.shape = el
        p.path = path
        p.textpath = o
        p.type = "text"
        p.attrs.text = Str(text)
        p.attrs.x = x
        p.attrs.y = y
        p.attrs.w = 1
        p.attrs.h = 1
        setFillAndStroke(p, attr)
        el.appendChild(o)
        el.appendChild(path)
        vml.canvas.appendChild(el)
        const skew = createNode("skew")
        skew.on = true
        el.appendChild(skew)
        p.skew = skew
        p.transform(E)
        return p
    }
    R._engine.setSize = function (width, height) {
        const cs = this.canvas.style
        this.width = width
        this.height = height
        width == +width && (width += "px")
        height == +height && (height += "px")
        cs.width = width
        cs.height = height
        cs.clip = "rect(0 " + width + " " + height + " 0)"
        if (this._viewBox) {
            R._engine.setViewBox.apply(this, this._viewBox)
        }
        return this
    }
    R._engine.setViewBox = function (x, y, w, h, fit) {
        R.eve("raphael.setViewBox", this, this._viewBox, [x, y, w, h, fit])
        const paperSize = this.getSize()
            const width = paperSize.width
            const height = paperSize.height
            let H; let W
        if (fit) {
            H = height / h
            W = width / w
            if (w * H < width) {
                x -= (width - w * H) / 2 / H
            }
            if (h * W < height) {
                y -= (height - h * W) / 2 / W
            }
        }
        this._viewBox = [x, y, w, h, !!fit]
        this._viewBoxShift = {
            dx: -x,
            dy: -y,
            scale: paperSize
        }
        this.forEach(function (el) {
            el.transform("...")
        })
        return this
    }
    let createNode
    R._engine.initWin = function (win) {
            const doc = win.document
            if (doc.styleSheets.length < 31) {
                doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)")
            } else {
                // no more room, add to the existing one
                // http://msdn.microsoft.com/en-us/library/ms531194%28VS.85%29.aspx
                doc.styleSheets[0].addRule(".rvml", "behavior:url(#default#VML)")
            }
            try {
                !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml")
                createNode = function (tagName) {
                    return doc.createElement('<rvml:' + tagName + ' class="rvml">')
                }
            } catch (e) {
                createNode = function (tagName) {
                    return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">')
                }
            }
        }
    R._engine.initWin(R._g.win)
    R._engine.create = function () {
        const con = R._getContainer.apply(0, arguments)
            const container = con.container
            let height = con.height
            let s
            let width = con.width
            let x = con.x
            let y = con.y
        if (!container) {
            throw new Error("VML container not found.")
        }
        const res = new R._Paper()
            const c = res.canvas = R._g.doc.createElement("div")
            const cs = c.style
        x = x || 0
        y = y || 0
        width = width || 512
        height = height || 342
        res.width = width
        res.height = height
        width == +width && (width += "px")
        height == +height && (height += "px")
        res.coordsize = zoom * 1e3 + S + zoom * 1e3
        res.coordorigin = "0 0"
        res.span = R._g.doc.createElement("span")
        res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;"
        c.appendChild(res.span)
        cs.cssText = R.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", width, height)
        if (container == 1) {
            R._g.doc.body.appendChild(c)
            cs.left = x + "px"
            cs.top = y + "px"
            cs.position = "absolute"
        } else {
            if (container.firstChild) {
                container.insertBefore(c, container.firstChild)
            } else {
                container.appendChild(c)
            }
        }
        res.renderfix = function () {}
        return res
    }
    R.prototype.clear = function () {
        R.eve("raphael.clear", this)
        this.canvas.innerHTML = E
        this.span = R._g.doc.createElement("span")
        this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;"
        this.canvas.appendChild(this.span)
        this.bottom = this.top = null
    }
    R.prototype.remove = function () {
        R.eve("raphael.remove", this)
        this.canvas.parentNode.removeChild(this.canvas)
        for (const i in this) {
            this[i] = typeof this[i] === "function" ? R._removedFactory(i) : null
        }
        return true
    }

    const setproto = R.st
    for (const method in elproto) {
 if (elproto[has](method) && !setproto[has](method)) {
        setproto[method] = (function (methodname) {
            return function () {
                const arg = arguments
                return this.forEach(function (el) {
                    el[methodname].apply(el, arg)
                })
            }
        })(method)
    }
}
})
