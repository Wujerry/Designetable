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
            this.version = '0.0.1';
            this.cssNameSpace = cssNameSpace;

            this.selector = selector;
            this.rows = rows;
            this.columns = columns;
            this.data = data;
            this.container = qe(renderTo);

            this.element = qe(selector);


            this.startX = 0;
            this.endX = 0;
            this.startY = 0;
            this.endY = 0;

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
                addOne = (n) => {
                    if (n > -1) {
                        return ++n;
                    } else {
                        return --n;
                    }
                },
                renderPath = (x, y, el) => {

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
                            if(absCurCoord[1] < absPreCoord[1]){
                               removeRow();
                                self.addSelectedClassByPoint(
                                    curPoint,
                                    reserveCoordinate(startPoint,[addOne(preCoord[0]),0])
                                )
                            }else{
                                self.removeSelectedClassByPoint(
                                    prePoint,
                                    reserveCoordinate(startPoint,[addOne(curCoord[0]),0])
                                );
                                self.addSelectedClassByPoint(
                                    curPoint,
                                    reserveCoordinate(startPoint,[0,addOne(preCoord[1])])
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
                        let movedTd = e.target,
                            lastPath = path[path.length - 1],
                            x = movedTd.cellIndex,
                            y = movedTd.parentElement.rowIndex;
                        if (lastPath[0] !== x || lastPath[1] !== y) {
                            renderPath(x, y, movedTd);
                        }
                    }
                },
                mousedown = e => {
                    if (e.target.tagName === 'TD') {
                        this.clearSelected();
                        let td = e.target;
                        self.startX = td.cellIndex;
                        self.startY = td.parentElement.rowIndex;
                        path.length = 0;
                        path.push([self.startX, self.startY]);
                        self.addSelectedClass(td);

                        table.addEventListener('mousemove', mouseMove);

                        //noinspection JSCheckFunctionSignatures
                        document.addEventListener('mouseup', ()=> {
                            table.removeEventListener('mousemove', mouseMove, false);
                        }, {once: true})

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
            return new Array(num).fill(0).map(item => `<${tagName}><${tagName}/>`);
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
            console.log([a, b] + '');
            let [start,end] = this._calPoint(a, b);
            console.log([start, end] + '');
            console.log('----------');
            let trs = this.getAllRows();
            for (let i = start[1], ii = end[1] + 1; i < ii; i++) {
                let tds = this.getAllTdsByRow(trs[i]);
                for (let j = start[0], jj = end[0] + 1; j < jj; j++) {
                    this[handlers[type]](tds[j]);
                }
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

        getPreRowsTd(el, nth) {
            return el.parentNode.previousSibling.querySelector('td:nth-child(' + (nth + 1) + ')');
        }

        getNextRowsTd(el, nth) {
            return el.parentNode.nextSibling.querySelector('td:nth-child(' + (nth + 1) + ')');
        }

        getRowByIndex(i) {
            return this.element.querySelectorAll('tr:nth-child(' + i + ')');
        }

        getAllTdsByRow(tr) {
            return tr.querySelectorAll('td');
        }

        getAllRows() {
            return this.element.querySelectorAll('tr');
        }

        addSelectedClass(el) {
            el.classList.add(SelectedTD);
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


