var init = function() {

var puzzle,
    move_num = 0,
    board,
    game,
    statusMsg = '',
    timeouts = [],
    random = Math.round(Math.random()*(puzzles.length-1));
    puzzle_num = random;


if (isNaN(puzzle_num) || puzzle_num < 0 || puzzle_num >= puzzles.length) puzzle_num = 0;//puzzles.length - 1;
puzzle = puzzles[puzzle_num];
game = new Chess(puzzle.start);

function clearTimeouts() {
    for (var i=0; i<timeouts.length; i++) {
        clearTimeout(timeouts[i]);
    }
    timeouts = [];
}

var onDragStart = function(source, piece, position, orientation) {
    if (game.game_over() === true ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
        move_num >= puzzle.moves.length) {
    return false;
    }
};

var onDrop = function(source, target) {
    // see if the move is legal
    correct_move = puzzle.moves[move_num];
    if (source == target) return 'snapback';
    if (correct_move.indexOf(source) != 0 || correct_move.indexOf(target) != 3) {
        $('#msg').text('Wrong move, try again! '); //+puzzle.balM );
			$('#msg').css("color", "red");
     //   $.post("./minus.php", {balM: puzzle.balM, move: correct_move}); 
        return 'snapback';
    }
    var move = game.move({
        from: source,
        to: target,
        promotion: (correct_move.length<6?'q':correct_move.substr(5,1))
    });

    if (move === null) return 'snapback';

    move_num++;
    if (move_num >= puzzle.moves.length) {
        statusMsg = 'Right move. Solve next puzzle! '; //+puzzle.balP;
      //  $.post("./plus.php", {balP: puzzle.balP, move: correct_move}); 
        setTimeout(function() {load_puzzle(puzzle_num + 1)}, 1000);
    } else {
        statusMsg = '';
        var next_move = puzzle.moves[move_num];
        board.move(next_move);
        move = game.move({
            from: next_move.substr(0,2),
            to: next_move.substr(3,2),
            promotion: ((next_move.length<6)?'q':next_move.substr(5,1))
        });
        move_num++;
    }
    updateStatus();
};

var onSnapEnd = function() {
    board.position(game.fen());
};

var updateStatus = function() {
    //$('#date').text(puzzle.date);
    if (typeof(puzzle.description) !== 'undefined') $('#description').text(puzzle.description); else $('#description').text('');
//	if(statusMsg=='Solved!'){
    $('#title').text(puzzle.title);
    $('#msg').text(statusMsg);
	$('#msg').css("color", "green");
   // }
	if (statusMsg == 'Solved!') $('#solve').hide();
};


var cfg = {
    draggable: true,
    showNotation: false,
    position: game.fen(),
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
};
board = new ChessBoard('board', cfg);

updateStatus();

function load_puzzle(num) {
    
    clearTimeouts();
    move_num = 0;
    puzzle_num = num;
    if (num < 0) puzzle_num = 0;
    if (num >= puzzles.length) puzzle_num = 0;
    puzzle = puzzles[puzzle_num];
    game.load(puzzle.start);
    board.position(game.fen(), false);
    statusMsg = '';
    $('#solve').show();
    updateStatus();
}

$('#first').click(function() {
    load_puzzle(0);
});

$('#prev').click(function() {
    load_puzzle(puzzle_num - 1);
});

$('#next').click(function() {
    load_puzzle(puzzle_num + 1);
});

$('#last').click(function() {
    load_puzzle(0);
});

$('#solve').click(function() {
    $('#msg').text('');
    (function() {
        next_move();
        function next_move() {
            if (move_num >= puzzle.moves.length) {
                $('#msg').text('Solved!');
                return;
            }
            board.move(puzzle.moves[move_num]);
            var move = game.move({
                from: puzzle.moves[move_num].substr(0,2),
                to: puzzle.moves[move_num].substr(3,2),
                promotion: (puzzle.moves[move_num].length<6?'q':puzzle.moves[move_num].substr(5,1))
            });
            move_num++;
            board.position(game.fen());
            timeouts.push(setTimeout(next_move, 1500));
        }
    })();
    $('#solve').hide();
});

}; 
$(document).ready(init);