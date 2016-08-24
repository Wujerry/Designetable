(function () {

    const q = document.querySelectorAll.bind(document);
    const qe = document.querySelector.bind(document);
    const assign = Object.assign;
    const SelectedTD = 'selected';
    const SelectedTDSeletor = '.' + SelectedTD;

    class Designetable {

        constructor(selector, {
            rows = 5, columns = 5, data = [], renderTo = 'body', cssNameSpace = 'designetable'
        }) {
            this.id = new Date().getTime() + Math.floor(Math.random() * 1000);
            this.version = '0.0.1';
            this.cssNameSpace = cssNameSpace;

            this.selector = selector;
            this.rows = rows;
            this.columns = columns;
            this.data = data;
            this.container = qe(renderTo);

            this.element = qe(selector);
            this.contextMenu = null;

            this.startX = 0;
            this.endX = 0;
            this.startY = 0;
            this.endY = 0;

            this._mergedCell = [];

            if (this.selector && qe(this.selector)) {
                this._refresh();
            } else {
                this._init();

            }

        }

        _refresh() {

        }

        _init() {
            this.element = this._createTable();
            this._bindEvent();
            if (this.container) {
                this.container.appendChild(this.element);
            }
        }


        _bindEvent() {
            this._bindSelection();
            this._bindContextMenu();
            this._bindDragSize();
        }

        _bindDragSize() {

            let el, line, rect, type, originLine,elWidth,elHeight,originX,originY,
                appendLine = (e, type, rect) => {
                    let line = document.createElement('div'),
                        originLine = document.createElement('div');
                    line.classList.add(`dt-line-${type}`);
                    originLine.classList.add(`dt-line-${type}-origin`);

                    if (type === 'v') {
                        line.style.left = e.clientX - rect.left + 'px';
                        originLine.style.left = e.clientX - rect.left + 'px';
                    } else {
                        line.style.top = e.clientY - rect.top + 'px';
                        originLine.style.top = e.clientY - rect.top + 'px';
                    }

                    this.element.appendChild(line);
                    this.element.appendChild(originLine);

                    return [line, originLine];
                },
                changeEffect = () => {
                    if (type === 'v') {
                        let width = elWidth + (parseInt(line.style.left) - parseInt(originLine.style.left)) + 'px';
                        let index = el.parentElement.cellIndex;
                        for(let i = 0,ii = this.element.rows.length; i < ii; i++){
                            this.element.rows[i].cells[index].style.width = width;
                        }
                    }else{
                        let height = elHeight + (parseInt(line.style.top) - parseInt(originLine.style.top)) + 'px';
                        let row = el.parentElement.parentElement;
                        for(let i = 0,ii = row.cells.length; i < ii; i++){
                            row.cells[i].style.height = height;
                        }
                    }
                },
                mouseMove = e => {
                    if (type === 'v') {
                        if(originX < e.clientX ||  originX - e.clientX < elWidth){
                            line.style.left = e.clientX - rect.left + 'px';
                        }else{
                            line.style.left = originX - elWidth -rect.left + 1 + 'px';
                        }
                    } else {
                        if(originY < e.clientY ||  originY - e.clientY < elHeight ){
                            line.style.top = e.clientY - rect.top + 'px';
                        }else{
                            line.style.top = originY - elHeight -rect.top + 1 + 'px';
                        }
                    }
                },
                mouseUp = e=>{
                    this.element.removeEventListener('mousemove', mouseMove, false);
                    document.removeEventListener('mouseup',mouseUp,false);
                    changeEffect(e);
                    line.remove();
                    originLine.remove();
                },
                mouseDown = e => {
                    if(e.target.tagName === 'SPAN'){
                        el = e.target;
                        rect = this.element.getBoundingClientRect();


                        if (el.classList.contains('v') && e.button === 0) {
                            type = 'v';
                            originX = e.clientX;
                            elWidth = parseInt(this.getComputedStyle(el.parentElement,'width'));
                        } else if (el.classList.contains('h')) {
                            type = 'h';
                            originY = e.clientY;
                            elHeight = parseInt(this.getComputedStyle(el.parentElement,'height'));
                        }

                        let r = appendLine(e, type, rect);
                        line = r[0];
                        originLine = r[1];

                        this.element.addEventListener('mousemove', mouseMove);

                        //noinspection JSCheckFunctionSignatures
                        document.addEventListener('mouseup', mouseUp);
                    }
                };

            this.element.addEventListener('mousedown', mouseDown);
        }

        _bindContextMenu() {
            let self = this;
            let table = self.element;
            let config = self._getContextMenuConfig();

            let clickCoords, clickCoordsX, clickCoordsY,
                menuWidth, menuHeight, windowWidth, windowHeight;

            let clickInsideElement = (e, className) => {
                var el = e.srcElement || e.target;

                if (el.classList.contains(className)) {
                    return el;
                } else {
                    while (el = el.parentNode) {
                        if (el.classList && el.classList.contains(className)) {
                            return el;
                        }
                    }
                }
                return false;
            };

            let createTemplate = ()=> {
                let i = 0;
                return config.reduce((pre, cur)=> {
                    let child = '';
                    if (cur.children) {
                        let ic = 0;
                        child = '<ul class="child-ul">' +
                            cur.children.reduce((preC, curC)=> {
                                return preC + `<li data-i="${i}" data-id="${cur.id || ''}" data-ic="${ic++}">${curC.name}</li>`
                            }, '')
                            + '</ul>'
                    }
                    return pre + `<li data-i="${i++}" data-id="${cur.id || ''}" class="context-li">${cur.name}${child}</li>`;
                }, '');
            };


            let positionMenu = (e)=> {
                let menu = self.contextMenu;
                clickCoords = self.getPosition(e);
                clickCoordsX = clickCoords.x;
                clickCoordsY = clickCoords.y;

                menuWidth = menu.offsetWidth + 2;
                menuHeight = menu.offsetHeight + 2;

                windowWidth = window.innerWidth;
                windowHeight = window.innerHeight;

                if ((windowWidth - clickCoordsX) < menuWidth) {
                    menu.style.left = windowWidth - menuWidth + "px";
                } else {
                    menu.style.left = clickCoordsX + "px";
                }

                if ((windowHeight - clickCoordsY) < menuHeight) {
                    menu.style.top = windowHeight - menuHeight + "px";
                } else {
                    menu.style.top = clickCoordsY + "px";
                }
            };


            //createMenu
            let ul = document.createElement('ul');
            ul.id = self.id + 'cm';
            ul.classList.add('dt-context-menu');
            ul.innerHTML = createTemplate();
            document.body.appendChild(ul);
            self.contextMenu = ul;

            //bind event
            let contextMenuListener = (e) => {
                e.preventDefault();
                positionMenu(e);
                self._toggleContextMenu(true);
            };
            table.addEventListener('contextmenu', contextMenuListener);

            //close menu
            document.addEventListener('mousedown', e=> {
                if (!clickInsideElement(e, 'context-li')) {
                    self._toggleContextMenu(false);
                }
            });

            //bind click
            ul.addEventListener('click', e=> {
                let li = e.target;
                if (li.tagName === 'LI') {
                    let i = li.dataset['i'];
                    let ic = li.dataset['ic'];
                    self._toggleContextMenu(false);
                    if (ic) {
                        config[i].children[ic].fn && config[i].children[ic].fn(e);
                    } else {
                        config[i].fn && config[i].fn(e);
                    }
                }
            })
        }

        _bindSelection() {
            let self = this,
                table = self.element,
                path = [],
                sameSign = (a, b) => {
                    return (a ^ b) > -1;
                },
                transCoordinate = (point, coord) => {
                    //return coord
                    return [coord[0] - point[0], point[1] - coord[1]];
                },
                reserveCoordinate = (point, coord) => {
                    //return point
                    return [point[0] + coord[0], point[1] - coord[1]];
                },
                getPoint = (x, y, td) => {
                    if (td.colSpan > 1 && x >= self.startX) {
                        x = x + td.colSpan - 1;
                    }
                    if (td.rowSpan > 1 && y >= self.startY) {
                        y = y + td.rowSpan - 1;
                    }
                    return [x, y];
                },
                addOne = (n) => {
                    if (n > -1) {
                        return ++n;
                    } else {
                        return --n;
                    }
                },
                renderPath = (x, y) => {

                    let startPoint = [self.startX, self.startY];
                    let prePoint = path[path.length - 1];
                    let preCoord = transCoordinate(startPoint, prePoint);
                    let curPoint = [x, y];
                    let curCoord = transCoordinate(startPoint, curPoint);
                    let removeRow = () => {
                        self.removeSelectedClassByPoint(
                            prePoint,
                            reserveCoordinate(startPoint, [0, addOne(curCoord[1])])
                        );
                    };
                    let removeColumn = ()=> {
                        self.removeSelectedClassByPoint(
                            reserveCoordinate(startPoint, [addOne(curCoord[0]), curCoord[1]]),
                            reserveCoordinate(startPoint, [preCoord[0], 0])
                        );
                    };

                    path.push(curPoint);

                    //same quadrant
                    if (sameSign(preCoord[0], curPoint[0]) && sameSign(preCoord[1], curCoord[1])) {
                        let absPreCoord = preCoord.map(item => Math.abs(item));
                        let absCurCoord = curCoord.map(item => Math.abs(item));

                        if (absCurCoord[0] >= absPreCoord[0] && absCurCoord[1] >= absPreCoord[1]) {
                            self.addSelectedClassByPoint(startPoint, curPoint);
                        } else if (absCurCoord[0] <= absPreCoord[0] && absCurCoord[1] <= absPreCoord[1]) {
                            if (preCoord[0] === curCoord[0]) {
                                removeRow();
                            } else if (preCoord[1] === curCoord[1]) {
                                removeColumn();
                            } else {
                                removeRow();
                                removeColumn();
                            }
                        } else {
                            if (absCurCoord[1] < absPreCoord[1]) {
                                removeRow();
                                self.addSelectedClassByPoint(
                                    curPoint,
                                    reserveCoordinate(startPoint, [addOne(preCoord[0]), 0])
                                )
                            } else {
                                self.removeSelectedClassByPoint(
                                    prePoint,
                                    reserveCoordinate(startPoint, [addOne(curCoord[0]), 0])
                                );
                                self.addSelectedClassByPoint(
                                    curPoint,
                                    reserveCoordinate(startPoint, [0, addOne(preCoord[1])])
                                );
                            }
                        }

                    } else {
                        self.clearSelected();
                        self.addSelectedClassByPoint(startPoint, curPoint);
                    }


                },
                mouseMove = e=> {
                    if (e.target.tagName === 'TD') {
                        e.preventDefault();
                        let movedTd = e.target,
                            lastPath = path[path.length - 1],
                            x = movedTd.cellIndex,
                            y = movedTd.parentElement.rowIndex;

                        if (lastPath[0] !== x || lastPath[1] !== y) {

                            let p = getPoint(x, y, movedTd);
                            self.endX = p[0];
                            self.endY = p[1];
                            renderPath(p[0], p[1]);
                        }
                    }
                },
                mouseUp = ()=> {
                    table.removeEventListener('mousemove', mouseMove, false);
                    document.removeEventListener('mouseup',mouseUp);
                },
                mousedown = e => {
                    if (e.target.tagName === 'TD' && e.button === 0) {
                        this.clearSelected();
                        this.clearStart();
                        let td = e.target;
                        self.startX = self.endX = td.cellIndex;
                        self.startY = self.endY = td.parentElement.rowIndex;
                        path.length = 0;
                        path.push([self.startX, self.startY]);
                        self.addSelectedClass(td);
                        td.classList.add('start');

                        table.addEventListener('mousemove', mouseMove);

                        //noinspection JSCheckFunctionSignatures
                        document.addEventListener('mouseup', mouseUp)

                    }
                };

            table.addEventListener('mousedown', mousedown);
        }

        _createTable() {
            let t = document.createElement('table');
            t.classList.add(this.cssNameSpace);

            if (this.data.length) {

            } else {
                t.innerHTML = this._createRows(this.columns, this.rows).join('');
            }
            return t;
        }

        _createEls(tagName = 'td', num = 1) {
            return new Array(num).fill(0).map(item => `<${tagName}><span class="v"></span><span class="h"></span></${tagName}>`);
        }

        _createRows(colNum, rowNum = 1) {
            return new Array(rowNum).fill(0).map(item => '<tr>' + this._createEls('td', colNum).join('') + '</tr>')
        }

        _calPoint(a, b) {
            return [[Math.min(a[0], b[0]), Math.min(a[1], b[1])],
                [Math.max(a[0], b[0]), Math.max(a[1], b[1])]
            ];
        }

        _handleSelectedClassByPoint(type, a, b) {
            let handlers = {
                'add': 'addSelectedClass',
                'remove': 'removeSelectedClass'
            };
            let [start,end] = this._calPoint(a, b);
            for (let i = start[1], ii = end[1] + 1; i < ii; i++) {
                for (let j = start[0], jj = end[0] + 1; j < jj; j++) {
                    this[handlers[type]](this.getTdByPoint(j, i));
                }
            }
        }

        _toggleContextMenu(type) {
            if (this.contextMenu) {
                if (type) this._BeforeContextMenu();
                this.contextMenu.classList.toggle('show', type)
            }
        }

        _BeforeContextMenu() {
            if (!this._isMergedCellInsideSelection()) {
                this.contextMenu.querySelector('[data-id=mc]').style.display = 'none';
                this.contextMenu.querySelector('[data-id=umc]').style.display = 'block';
            } else {
                this.contextMenu.querySelector('[data-id=mc]').style.display = 'block';
                this.contextMenu.querySelector('[data-id=umc]').style.display = 'none';
            }
        }

        _getContextMenuConfig() {
            return [
                {
                    name: 'Merge cells',
                    id: 'mc',
                    icon: 'copy',
                    fn: (e) => {
                        this.mergeCells(e);
                    }
                },
                {
                    name: 'UnMerge cells',
                    id: 'umc',
                    icon: 'copy',
                    fn: (e) => {
                        this.unMergeCells(e);
                    }
                },
                {
                    name: 'Copy',
                    icon: 'copy'
                },
                {
                    name: 'Paste',
                    icon: 'paste'
                },
                {
                    name: 'Parent',
                    icon: 'parent',
                    children: [
                        {
                            name: 'child'
                        }
                    ]
                }]
        }

        _isMergedCellInsideSelection() {
            if (this._mergedCell.length) {
                // let s = [Math.max(this.startX,this.endX)];
                // let e = [Math.]
            }
            return this._mergedCell.every(item => {
                return !(this._isCellInSelection(item));
            })

        }

        _isCellInSelection(point) {
            return point[0] >= this.startX && point[0] <= this.endX && point[1] >= this.startY && point[1] <= this.endY;
        }

        getComputedStyle(el,prop) {
            return window.getComputedStyle(el,null).getPropertyValue(prop);
        }

        unMergeCells() {
            let rest = [];
            this._mergedCell.filter(cell => {
                if (this._isCellInSelection(cell)) {
                    return true;
                } else {
                    rest.push(cell);
                    return false;
                }
            }).forEach(cell => {
                let td = this.getTdByPoint(cell[0], cell[1]);
                for (let i = cell[1], ii = i + td.rowSpan; i < ii; i++) {
                    for (let j = cell[0], jj = j + td.colSpan; j < jj; j++) {
                        this.getTdByPoint(j, i).style.display = 'table-cell';
                    }
                }
                td.rowSpan = td.colSpan = 1;
            });
            this._mergedCell = rest;
        }

        mergeCells() {
            if (this._isMergedCellInsideSelection() && !this.isEqualPoint()) {
                let [startPoint , endPoint] = this._calPoint([this.startX, this.startY], [this.endX, this.endY]);

                let startTd = this.getTdByPoint(startPoint[0], startPoint[1]);
                startTd.colSpan = endPoint[0] - startPoint[0] + 1;
                startTd.rowSpan = endPoint[1] - startPoint[1] + 1;

                for (let i = startPoint[1], ii = endPoint[1]; i <= ii; i++) {
                    for (let j = startPoint[0], jj = endPoint[0]; j <= jj; j++) {
                        this.getTdByPoint(j, i).style.display = 'none';
                    }
                }
                startTd.style.display = 'table-cell';

                this._mergedCell.push([startPoint[0], startPoint[1]]);
            }
        }

        isEqualPoint(a, b) {
            if (a && b && a[0] === b[0] && a[1] === b[1]) {
                return true;
            } else {
                return this.startX === this.endX && this.startY === this.endY;
            }
        }

        getPosition(e) {
            let posx = 0;
            let posy = 0;

            if (!e)  e = window.event;

            if (e.pageX || e.pageY) {
                posx = e.pageX;
                posy = e.pageY;
            } else if (e.clientX || e.clientY) {
                posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            return {
                x: posx,
                y: posy
            }
        }

        addSelectedClassByPoint(a, b) {
            this._handleSelectedClassByPoint('add', a, b);
        }

        removeSelectedClass(el) {
            el.classList.remove(SelectedTD);
        }

        removeSelectedClassByPoint(a, b) {
            this._handleSelectedClassByPoint('remove', a, b);
        }

        clearSelected() {
            this.element.querySelectorAll(SelectedTDSeletor).forEach(item => item.classList.remove(SelectedTD));
        }

        clearStart() {
            this.element.querySelectorAll('.start').forEach(item => item.classList.remove('start'));

        }

        getTdByPoint(x, y) {
            if (this.element.rows[y]) {
                return this.element.rows[y].cells[x];
            } else {
                return this.element;
            }
        }

        addSelectedClass(el) {
            el.classList.add(SelectedTD);
        }

        destroy() {
            document.querySelectorAll('.dt-context-menu').forEach(item => item.remove());
        }

        logOption() {
            console.log(this.options);
        }

        version() {
            console.log(this.version);
        }
    }


//test

    let dt = new Designetable(null, {rows: 20, columns: 20});

    // qe('body').appendChild(dt.element);

    dt.logOption();


}());


