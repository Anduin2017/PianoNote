document.addEventListener('DOMContentLoaded', () => {
    // --- 数据定义 ---
    const notes = [
        'C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F',
        'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'
    ];
    const notesSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];

    // --- DOM 元素获取 ---
    const outerCircle = document.getElementById('outer-circle');
    const innerCircle = document.getElementById('inner-circle');
    const keyNameDisplay = document.getElementById('key-name');
    const rotateLeftBtn = document.getElementById('rotate-left');
    const rotateRightBtn = document.getElementById('rotate-right');
    const pianoKeys = document.querySelectorAll('.piano .white, .piano .black');
    const keySigContainer = document.getElementById('key-signature-container');

    // --- 状态变量 ---
    let currentStep = 0;
    let visualRotationAngle = 0;

    // =====================================================================
    // =================== 五线谱调号绘制模块 (修正版) =====================
    // =====================================================================

    // 1. 调号数据 (这部分不变)
    const KEY_SIGNATURE_DATA = {
        0: { sharp: { type: 'sharps', count: 0 } }, // C
        7: { sharp: { type: 'sharps', count: 1 } }, // G
        2: { sharp: { type: 'sharps', count: 2 } }, // D
        9: { sharp: { type: 'sharps', count: 3 } }, // A
        4: { sharp: { type: 'sharps', count: 4 } }, // E
        11: { sharp: { type: 'sharps', count: 5 } }, // B
        6: { sharp: { type: 'sharps', count: 6 }, flat: { type: 'flats', count: 6 } }, // F#/Gb
        1: { sharp: { type: 'sharps', count: 7 }, flat: { type: 'flats', count: 5 } }, // C#/Db
        5: { flat: { type: 'flats', count: 1 } }, // F
        10: { flat: { type: 'flats', count: 2 } }, // Bb
        3: { flat: { type: 'flats', count: 3 } }, // Eb
        8: { flat: { type: 'flats', count: 4 } }, // Ab
    };

    // 2.【关键修正】升降号在五线谱上的垂直位置 (单位: em, 0em=顶线)
    const ACCIDENTAL_POSITIONS = {
        treble: {
            sharps: [0, 2.5, -0.5, 2, 3.5, 1.5, 3],   // F#, C#, G#, D#, A#, E#, B#
            flats:  [2, 0.5, 2.5, 1, 3, 1.5, 3.5]    // Bb, Eb, Ab, Db, Gb, Cb, Fb
        },
        bass: {
            sharps: [2, 0.5, 2.5, 1, 3.5, 1.5, 3],   // F#, C#, G#, D#, A#, E#, B#
            flats:  [1, -0.5, 1.5, 0, 2, 0.5, 2.5]    // Bb, Eb, Ab, Db, Gb, Cb, Fb
        }
    };
     // 修正低音谱号降号的位置
     ACCIDENTAL_POSITIONS.bass.flats = [1, 2.5, 0.5, 2, 3.5, 1.5, 3];

    /**
     * 创建一个带谱号的五线谱基础结构
     * @param {string} clefType - 'treble' (高音) 或 'bass' (低音)
     * @returns {HTMLElement}
     */
    function createStaff(clefType) {
        const wrapper = document.createElement('div');
        wrapper.className = 'staff-wrapper';

        for (let i = 0; i < 5; i++) {
            const line = document.createElement('div');
            line.className = 'staff-line';
            line.style.top = `${i}em`;
            wrapper.appendChild(line);
        }

        const clefEl = document.createElement('span');
        clefEl.className = 'clef';
        clefEl.textContent = clefType === 'treble' ? '\uE050' : '\uE062';
        clefEl.style.fontSize = '4em';
        clefEl.style.top = clefType === 'treble' ? '0em' : '1em';
        clefEl.style.left = '5px';
        wrapper.appendChild(clefEl);

        return wrapper;
    }

    /**
     * 在五线谱上绘制调号
     * @param {HTMLElement} staffWrapper
     * @param {string} clefType
     * @param {string} accidentalType - 'sharps' 或 'flats'
     * @param {number} count
     */
    function addKeySignature(staffWrapper, clefType, accidentalType, count) {
        if (count === 0) return;
        const positions = ACCIDENTAL_POSITIONS[clefType][accidentalType];
        for (let i = 0; i < count; i++) {
            const accidentalEl = document.createElement('span');
            accidentalEl.className = 'accidental';
            accidentalEl.textContent = accidentalType === 'sharps' ? '\uE262' : '\uE260';
            accidentalEl.style.fontSize = '2.5em';
            
            // 【关键修正】直接使用em单位，不再进行多余的计算
            accidentalEl.style.top = `${positions[i]}em`; 
            
            accidentalEl.style.left = `${50 + i * 18}px`;
            staffWrapper.appendChild(accidentalEl);
        }
    }
    
    /**
     * 主更新函数：根据当前调性，更新整个五线谱显示区域
     */
    function updateKeySignatureDisplay() {
        keySigContainer.innerHTML = ''; 

        const signatures = KEY_SIGNATURE_DATA[currentStep];
        if (!signatures) return; 

        Object.values(signatures).forEach(sig => {
            if (sig) {
                const trebleStaff = createStaff('treble');
                addKeySignature(trebleStaff, 'treble', sig.type, sig.count);
                keySigContainer.appendChild(trebleStaff);

                const bassStaff = createStaff('bass');
                addKeySignature(bassStaff, 'bass', sig.type, sig.count);
                keySigContainer.appendChild(bassStaff);
            }
        });
    }

    // =====================================================================
    // =================== 主交互逻辑 ======================================
    // =====================================================================

    function updatePianoHighlight() {
        pianoKeys.forEach(key => {
            key.classList.remove('highlight');
            const scaleDegreeEl = key.querySelector('.scale-degree');
            if (scaleDegreeEl) scaleDegreeEl.textContent = '';
        });

        const rootNoteIndex = currentStep;
        majorScaleIntervals.forEach((interval, i) => {
            const noteIndex = (rootNoteIndex + interval) % 12;
            const noteName = notesSharp[noteIndex];
            const octave = (noteIndex < rootNoteIndex) ? '2' : '';
            let noteDataName = noteName + octave;
            // 修正钢琴八度问题，例如 B 大调的 C# 和 D#
            if (noteName.startsWith('C') && octave === '2') {
                 noteDataName = 'C2';
            } else if (noteName.startsWith('D') && octave === '2') {
                noteDataName = 'D2';
            }


            const keyElement = document.querySelector(`.piano [data-note="${noteDataName}"]`);
            if (keyElement) {
                keyElement.classList.add('highlight');
                const scaleDegreeEl = keyElement.querySelector('.scale-degree');
                if (scaleDegreeEl) scaleDegreeEl.textContent = i + 1;
            } else {
                 // 处理跨八度找不到的情况，尝试在第一个八度找
                const keyElementFirstOctave = document.querySelector(`.piano [data-note="${noteName}"]`);
                if(keyElementFirstOctave){
                    keyElementFirstOctave.classList.add('highlight');
                    const scaleDegreeEl = keyElementFirstOctave.querySelector('.scale-degree');
                    if (scaleDegreeEl) scaleDegreeEl.textContent = i + 1;
                }
            }
        });
    }

    function update() {
        innerCircle.style.transform = `translate(-50%, -50%) rotate(${visualRotationAngle}deg)`;
        keyNameDisplay.textContent = notes[currentStep];
        
        updatePianoHighlight();
        updateKeySignatureDisplay();
    }

    function rotateRight() {
        currentStep = (currentStep + 7) % 12; 
        visualRotationAngle += 30;
        update();
    }

    function rotateLeft() {
        currentStep = (currentStep - 7 + 12) % 12; 
        visualRotationAngle -= 30;
        update();
    }
    
    function createOuterNotes() {
        const radius = outerCircle.offsetWidth / 2 * 0.85;
        // 按五度圈顺序排列音符
        const circleOfFifthsOrder = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
        circleOfFifthsOrder.forEach((noteIndex, i) => {
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
            outerCircle.appendChild(noteEl);
        });
    }

    function createInnerDegrees() {
        const radius = innerCircle.offsetWidth / 2 * 0.8;
        majorScaleIntervals.forEach((interval, i) => {
            const angle = (interval / 12) * 360 - 90;
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);
            const degreeEl = document.createElement('div');
            degreeEl.className = 'degree';
            degreeEl.textContent = i + 1;
            degreeEl.style.transform = `translate(${x}px, ${y}px)`;
            innerCircle.appendChild(degreeEl);
        });
    }
    
    // --- 启动 ---
    createOuterNotes();
    createInnerDegrees();
    update();

    rotateLeftBtn.addEventListener('click', rotateLeft);
    rotateRightBtn.addEventListener('click', rotateRight);
});