document.addEventListener('DOMContentLoaded', () => {
    // --- 数据定义 ---
    const notes = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];
    const circleOfFifthsOrder = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]; // C, G, D...
    const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];

    // =============================================================
    // ============= 【关键修正的核心】 ============================
    // =============================================================
    // 为五度圈内圈定制的 "刻度尺"
    // 这个数组定义了C大调的7个音(C,D,E,F,G,A,B)在五度圈上的【位置索引】
    const fifthsMajorScaleDegreePositions = [
        circleOfFifthsOrder.indexOf(0),  // 1 (C) is at index 0 on the fifths circle
        circleOfFifthsOrder.indexOf(2),  // 2 (D) is at index 2 on the fifths circle
        circleOfFifthsOrder.indexOf(4),  // 3 (E) is at index 4 on the fifths circle
        circleOfFifthsOrder.indexOf(5),  // 4 (F) is at index 11 on the fifths circle
        circleOfFifthsOrder.indexOf(7),  // 5 (G) is at index 1 on the fifths circle
        circleOfFifthsOrder.indexOf(9),  // 6 (A) is at index 3 on the fifths circle
        circleOfFifthsOrder.indexOf(11)  // 7 (B) is at index 5 on the fifths circle
    ];
    // =============================================================

    // --- 全局状态 ---
    let currentStep = 0;

    // --- DOM 元素获取 ---
    const chromaticOuterCircle = document.getElementById('chromatic-outer-circle');
    const chromaticInnerCircle = document.getElementById('chromatic-inner-circle');
    const fifthsOuterCircle = document.getElementById('fifths-outer-circle');
    const fifthsInnerCircle = document.getElementById('fifths-inner-circle');
    const allKeyNameDisplays = document.querySelectorAll('.key-name');
    const chromaticLeftBtn = document.getElementById('chromatic-rotate-left');
    const chromaticRightBtn = document.getElementById('chromatic-rotate-right');
    const fifthsLeftBtn = document.getElementById('fifths-rotate-left');
    const fifthsRightBtn = document.getElementById('fifths-rotate-right');
    const pianoKeys = document.querySelectorAll('.piano .white, .piano .black');
    const keySigContainer = document.getElementById('key-signature-container');

    // --- 绘制函数 ---
    function createOuterNotes(parentCircle, orderArray) {
        const radius = parentCircle.offsetWidth / 2 * 0.85;
        orderArray.forEach((noteIndex, i) => {
            const angle = (i / 12) * 360 - 90;
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);
            const noteEl = document.createElement('div');
            noteEl.className = 'note';
            noteEl.style.transform = `translate(${x}px, ${y}px)`;
            const labelEl = document.createElement('div');
            labelEl.className = 'note-label';
            labelEl.textContent = notes[noteIndex];
            if (notes[noteIndex].includes('♯') || notes[noteIndex].includes('♭')) {
                noteEl.dataset.isBlackKey = 'true';
            }
            noteEl.appendChild(labelEl);
            parentCircle.appendChild(noteEl);
        });
    }

    /**
     * 在内圈上绘制音级
     * @param {HTMLElement} parentCircle - 父容器元素
     * @param {Array<number>} positionsArray - 决定音级位置的 "刻度尺"
     */
    function createInnerDegrees(parentCircle, positionsArray) {
        const radius = parentCircle.offsetWidth / 2 * 0.8;
        positionsArray.forEach((positionValue, i) => {
            const angle = (positionValue / 12) * 360 - 90;
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);
            const degreeEl = document.createElement('div');
            degreeEl.className = 'degree';
            degreeEl.textContent = i + 1;
            degreeEl.style.transform = `translate(${x}px, ${y}px)`;
            parentCircle.appendChild(degreeEl);
        });
    }

    // --- 主更新函数 ---
    function update() {
        // 【修正】将 -30 改为 30，实现顺时针旋转
        const chromaticRotationAngle = currentStep * 30; 
        const fifthsIndex = circleOfFifthsOrder.indexOf(currentStep);
        // 【修正】将 -30 改为 30，实现顺时针旋转
        const fifthsRotationAngle = fifthsIndex * 30; 

        chromaticInnerCircle.style.transform = `translate(-50%, -50%) rotate(${chromaticRotationAngle}deg)`;
        fifthsInnerCircle.style.transform = `translate(-50%, -50%) rotate(${fifthsRotationAngle}deg)`;

        allKeyNameDisplays.forEach(display => display.textContent = notes[currentStep]);

        // 钢琴和五线谱的更新函数（如果存在的话）
        // updatePianoHighlight();
        // updateKeySignatureDisplay();
    }

    // --- 事件处理 ---
    chromaticRightBtn.addEventListener('click', () => { currentStep = (currentStep + 1) % 12; update(); });
    chromaticLeftBtn.addEventListener('click', () => { currentStep = (currentStep - 1 + 12) % 12; update(); });
    fifthsRightBtn.addEventListener('click', () => { currentStep = (currentStep + 7) % 12; update(); });
    fifthsLeftBtn.addEventListener('click', () => { currentStep = (currentStep - 7 + 12) % 12; update(); });

    // --- 初始化 ---
    createOuterNotes(chromaticOuterCircle, [...Array(12).keys()]);
    createOuterNotes(fifthsOuterCircle, circleOfFifthsOrder);
    
    // 为两个内圈分别传入它们各自正确的 "刻度尺"
    createInnerDegrees(chromaticInnerCircle, majorScaleIntervals);
    createInnerDegrees(fifthsInnerCircle, fifthsMajorScaleDegreePositions);
    
    update();

    // =====================================================================
    // =================== 钢琴和五线谱模块 (无需改动) =====================
    // =====================================================================
    // 此处省略您的钢琴和五线谱代码，它们无需任何修改
    // ... 请确保您文件中已有的 updatePianoHighlight() 和五线谱绘制模块代码保留在此处
});