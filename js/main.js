'use strict'
var gGame = {
    size: 4,
    mines: 2
};

var gBoard;
const MINE = '<img src="img/mine.png">';
const FLAG = '<img src="img/flag.png">';
closeContextMenu();
function initGame() {
    gBoard = buildBoard();
    placesMines();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
}

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

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = gBoard[i][j];
            currCell.minesAroundCount = countMinesNegs(i, j);
        }
    }
}

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
    //board[1][1].isMine = true;
    // console.log('board[1][1].isMine:', board[1][1].isMine)
    // console.table('board:', board)
    return board;
}


function renderBoard(board) {
    var strHTML = `<table border="0"><tbody>`;
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < board[0].length; j++) {
            var cell = gBoard[i][j];
            var cellValue = (cell.isMine) ? MINE : (cell.minesAroundCount) ? cell.minesAroundCount : '';
            var className = `cell cell${i}-${j}`;
            strHTML += `<td  onclick="cellClicked(event,${i},${j})" oncontextmenu="cellMarked(this,${i},${j})"  class="${className}" > <span>${cellValue}</span></td>`

        }
        strHTML += `</tr>`
    }
    strHTML += `</tbody></table>`;
    var elContainer = document.querySelector('.board-container');
    elContainer.innerHTML = strHTML;
}

function placesMines() {
    for (var i = 0; i < gGame.mines; i++) {
        var randI = getRandomIntInclusive(0, gBoard.length - 1);
        var randJ = getRandomIntInclusive(0, gBoard[0].length - 1);
        var randCell = gBoard[randI][randJ];
        randCell.isMine = true;
    }
}



function cellClicked(event, i, j) {
    var elSpan = document.querySelector(`.cell${i}-${j} span`)
    //console.log('elSpan:', elSpan)
    console.log(event)
    elSpan.style.visibility = 'visible';
    if (elSpan.innerHTML === MINE) {
        gameOver();
    }


}


function cellMarked(event, i, j) {
    var currCell = gBoard[i][j];
    currCell.isMarked = !currCell.isMarked;
    var location = { i, j }
    // console.log('gBoard[i][j].isMarked:', currCell.isMarked)
    if (currCell.isMarked) {
        event.classList.add('mark')
        renderCell(location, FLAG)
    }
    else {
        event.classList.remove('mark');
        event.classList.add('cell')
        event.style =''
        console.log('event.classList:', event.classList)
        renderCell(location, '')
    }
}

function gameOver() {
    console.log('u lost')
}


function setDiffLvl(num) {
    if (gGame.size > 4) {
        gGame.size = 4;
        gGame.mines = 2;
    }
    if (gGame.size === 4) gGame.size *= num;
    if (gGame.size === 8) gGame.mines = 12;
    if (gGame.size === 12) gGame.mines = 30;
    // console.log('gGame.mines:', gGame.mines)
    // console.log('gGame.size:', gGame.size)
    initGame();

}


function countAllMarkedMines(board) {
    var markedMinesCount = 0;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            if (currCell.isMine && currCell.isMarked) markedMinesCount++;
        }
    }
    return markedMinesCount
}

function checkGameOver() {
    if (!countAllMarkedMines(gBoard) === gGame.mines) return
    console.log('victory')
}

