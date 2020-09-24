'use strict'
var gGame = {
    size: 4,
    mines: 2,
    isOn: true,
    secsPassed: 0,
    lives: 3,
    // hints: 3
};
var gMinesPos;
var gGameInterval
var gFlagsCount;
var gBoard;
var gHintInterval;
var gIsFirstClick;
// var gIsHint = false;
const MINE = '<img src="img/mine.png">';
const FLAG = '<img src="img/flag.png">';
closeContextMenu();


function initGame() {
    gMinesPos = [];
    gBoard = buildBoard();
    renderBoard(gBoard);
    gFlagsCount = gGame.mines;
    gIsFirstClick = true
    var elSpan = document.querySelector('.container span')
    elSpan.innerHTML = '<img src="img/smiley.png">';
    updateFlags();
    updateLives();
}

//gets the minesaround num
function countMinesNegs(i, j) {
    var negsMineCount = 0;
    for (var rowIdx = i - 1; rowIdx <= i + 1; rowIdx++) {
        if (rowIdx < 0 || rowIdx >= gBoard.length) continue;
        for (var colIdx = j - 1; colIdx <= j + 1; colIdx++) {
            if (colIdx < 0 || colIdx >= gBoard.length) continue;
            var currCell = gBoard[rowIdx][colIdx]
            if (!currCell.isMine) continue;
            else negsMineCount++;
        }
    }
    // console.table('negsMineCount:', negsMineCount)
    return negsMineCount;
}
//sets the minesaround num
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = gBoard[i][j];
            currCell.minesAroundCount = countMinesNegs(i, j);
        }
    }
}
//Making the Board
function buildBoard() {

    var board = [];
    for (var i = 0; i < gGame.size; i++) {
        board.push([]);
        for (var j = 0; j < gGame.size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }
    // console.table('board:', board)
    return board;
}

//showing it on the HTML PAGE
function renderBoard(board) {
    var strHTML = `<table border="0"><tbody>`;
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < board[0].length; j++) {
            var cell = gBoard[i][j];
            var cellValue = (cell.isMine) ? MINE : (cell.minesAroundCount) ? cell.minesAroundCount : '';
            var className = `cell cell${i}-${j}`;
            strHTML += `<td  onclick="cellClicked(${i},${j})" oncontextmenu="cellMarked(this,${i},${j})"  class="${className}" > <span>${cellValue}</span></td>`

        }
        strHTML += `</tr>`
    }
    strHTML += `</tbody></table>`;
    var elContainer = document.querySelector('.board-container');
    elContainer.innerHTML = strHTML;
}
//places the mines in random places (with no doubles)
function placesMines() {
    var emptyPos = getsEmptyPos(gBoard);
    // console.log('getsEmptyPos:', emptyPos)
    for (var i = 0; i < gGame.mines; i++) {
        var randIdx = getRandomIntInclusive(0, emptyPos.length - 1);
        var randEmptyPos = emptyPos.splice(randIdx, 1)[0];
        // console.log('randEmptyPos:', randEmptyPos)
        var randCell = gBoard[randEmptyPos.i][randEmptyPos.j]
        // console.log('randCell:', randCell)
        randCell.isMine = true;
        gMinesPos.push(randEmptyPos);
    }
}

function restartGame() {
    clearInterval(gGameInterval)
    closeModals();
    gMinesPos = [];
    gGame.isOn = true;
    gGame.secsPassed = 0;
    gGame.lives = 3;
    gGame.hints = 3;
    initGame();
}

//blocks clicking on marked cell ,blocks double click on same cell, starts timer on first click / updating the model + DOM 
function cellClicked(i, j) {
    if (gBoard[i][j].isMarked || gBoard[i][j].isShown) return

    if (!gGame.isOn) return
    if (gIsFirstClick) {
        placesMines();
        setMinesNegsCount(gBoard);
        renderBoard(gBoard);
        gGameInterval = setInterval(showTimer, 1000);
        gIsFirstClick = false;
    }
   
    gBoard[i][j].isShown = true;
    var elSpan = document.querySelector(`.cell${i}-${j} span`)
    var elCell = document.querySelector(`.cell${i}-${j}`)
    // console.log('elCell:', elCell)
    elCell.classList.add('revealed')
    //console.log('elSpan:', elSpan)
    if (!gBoard[i][j].minesAroundCount) expandShown(gBoard, i, j)
    elSpan.style.visibility = 'visible';
    if (elSpan.innerHTML === MINE) {
        elCell.classList.add('exploade')
        gGame.lives--;
        updateLives();
        if (!gGame.lives) gameOver();
    }
    checkVictory();
}
//marks the cell with flag , and removes it,blocks marking a shown cell / updating the model+dom
function cellMarked(event, i, j) {
    if (gBoard[i][j].isShown) return
    var currCell = gBoard[i][j];
    currCell.isMarked = !currCell.isMarked;
    var location = { i, j }
    // console.log('gBoard[i][j].isMarked:', currCell.isMarked)
    if (currCell.isMarked) {
        event.classList.add('mark')
        renderCell(location, FLAG)
        gFlagsCount--;
        updateFlags();
    }
    else {
        var oldCell = (currCell.isMine) ? MINE : (currCell.minesAroundCount) ? currCell.minesAroundCount : '';
        var cellValue = `<span>${oldCell}</span>`
        event.classList.remove('mark');
        event.classList.add('cell')
        renderCell(location, cellValue)
        gFlagsCount++;
        updateFlags();
    }
    checkVictory();

}



function gameOver() {
    if (gGame.lives = 0);
    gGame.isOn = false;
    clearInterval(gGameInterval)
    revealAllMines();
    var elSpan = document.querySelector('.container span')
    elSpan.innerHTML = '<img src="img/dead.png">';
    openGameOverModal();
}

function openGameOverModal() {
    var elModal = document.querySelector('.restart-container ');
    elModal.style.display = 'block';
}
function closeModals() {
    var modal = document.querySelector('.restart-container ')
    modal.style.display = 'none';
    var elModal = document.querySelector('.victory-container ');
    elModal.style.display = 'none';
}


function setDiffLvl(num) { //set game diffcult
    if (gGame.size > 4) {
        gGame.size = 4;
        gGame.mines = 2;
    }
    if (gGame.size === 4) gGame.size *= num;
    if (gGame.size === 8) gGame.mines = 12;
    if (gGame.size === 12) gGame.mines = 30;
    // console.log('gGame.mines:', gGame.mines)
    // console.log('gGame.size:', gGame.size)
    restartGame();

}

function updateFlags() { //set flags on the dom
    var elSpan = document.querySelector('.flags span');
    elSpan.innerText = gFlagsCount;
}


function countAllMarkedMines(board) { //counts only corrected marked mines
    var markedMinesCount = 0;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            if (currCell.isMine && currCell.isMarked) markedMinesCount++;
        }
    }
    return markedMinesCount
}

function checkVictory() {//checks victory by the num of opened cells and corrected marks
    // console.log('(countCorrectMarks(gBoard) + countShownCells(gBoard)):', (countCorrectMarks(gBoard) + countShownCells(gBoard)))
    if ((countCorrectMarks(gBoard) + countShownCells(gBoard)) !== (gGame.size * gGame.size)) return;
    if (!gGame.isOn) return
    gGame.isOn = false;
    clearInterval(gGameInterval)
    openVictoryModal();
    var elSpan = document.querySelector('.container span')
    elSpan.innerHTML = '<img src="img/sunglass.png">';
}

function getsEmptyPos(board) { //util for the placeMines
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var coord = {
                i: i,
                j: j
            }
            emptyCells.push(coord);
        }
    }
    // if (!emptyCells.length) return ;
    return emptyCells;
}

function expandShown(board, i, j) { //reveals negs 
    for (var rowIdx = i - 1; rowIdx <= i + 1; rowIdx++) {
        if (rowIdx < 0 || rowIdx >= board.length) continue;
        for (var colIdx = j - 1; colIdx <= j + 1; colIdx++) {
            if (colIdx < 0 || colIdx >= board.length) continue;
            if (i === rowIdx && j === colIdx) continue;
            cellClicked(rowIdx, colIdx)
        }
    }
}

function showTimer() {
    gGame.secsPassed++;
    var elTimer = document.querySelector('.timer span')
    elTimer.innerText = gGame.secsPassed
}
function updateLives() {
    var elTimer = document.querySelector('.lives span')
    elTimer.innerText = gGame.lives;
}

function revealAllMines() {
    for (var idx = 0; idx < gMinesPos.length; idx++) {
        var mineIidx = gMinesPos[idx].i
        var mineJidx = gMinesPos[idx].j
        gBoard[mineIidx][mineJidx].isShown = true;
        var elSpan = document.querySelector(`.cell${mineIidx}-${mineJidx} span`)
        var elCell = document.querySelector(`.cell${mineIidx}-${mineJidx}`)
        elCell.classList.add('revealed')
        elSpan.style.visibility = 'visible';
    }
}

function openVictoryModal() {
    var elModal = document.querySelector('.victory-container ');
    elModal.style.display = 'block';
}


function countShownCells(board) {
    var shownCount = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (gBoard[i][j].isShown) shownCount++;
        }
    }
    // console.log('shownCount:', shownCount)
    return shownCount;
}
function countCorrectMarks(board) {
    var correctedMarks = 0;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (gBoard[i][j].isMarked && gBoard[i][j].isMine) correctedMarks++;
        }
    }
    // console.log('correctedMarks:', correctedMarks)
    return correctedMarks;
}





                            // tried hint//

// if (gIsHint) {
//     revealNegs(i,j);
//     gIsHint = !gIsHint;
// }
// function hintClicked() {
//     gIsHint = true;
// }
// function revealNegs(i, j) {
//     for (var rowIdx = i - 1; rowIdx <= i + 1; rowIdx++) {
//         if (rowIdx < 0 || rowIdx >= gBoard.length) continue;
//         for (var colIdx = j - 1; colIdx <= j + 1; colIdx++) {
//             if (colIdx < 0 || colIdx >= gBoard.length) continue;
//             if (i === rowIdx && j === colIdx) continue;
//             var elSpan = document.querySelector(`.cell${rowIdx}-${colIdx} span`)
//             var elCell = document.querySelector(`.cell${rowIdx}-${colIdx}`)
//             elCell.classList.add('revealed')
//             elSpan.style.visibility = 'visible';
//             gHintInterval = setTimeout(closesNegs(rowIdx, colIdx),1000)
//         }
//     }
// }

// function closesNegs(i, j) {
//     for (var rowIdx = i - 1; rowIdx <= i + 1; rowIdx++) {
//         if (rowIdx < 0 || rowIdx >= gBoard.length) continue;
//         for (var colIdx = j - 1; colIdx <= j + 1; colIdx++) {
//             if (colIdx < 0 || colIdx >= gBoard.length) continue;
//             if (i === rowIdx && j === colIdx) continue;
//             var currCell = gBoard[rowIdx][colIdx];
//             var oldCell = (currCell.isMine) ? MINE : (currCell.minesAroundCount) ? currCell.minesAroundCount : '';
//             var cellValue = `<span>${oldCell}</span>`
//             currCell.classList.remove('revealed');
//             currCell.classList.add('cell')
//             renderCell(location, cellValue)
//         }
//     }
// }