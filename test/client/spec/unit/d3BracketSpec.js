var D3Bracket = require('../../../../app/scripts/utils/d3Bracket.js').D3Bracket;
var assert = require('chai').assert;
var sinon = require('sinon');

describe('D3ToBracket', function(){
    describe('Bracket conversion from toodle to D3', function(){
        it('should return an empty object if no data exists', function(){
            //setup
            var d3Bracket = new D3Bracket();
            var bracket = {};
            //action
            var actual = d3Bracket.convertBracketToD3Tree(bracket);
            //assert
            assert.equal(Object.keys(actual).length, 0);
        });

        it('should return an object w/ a single element if initial bracket contains one', function(){
            //setup
            var d3Bracket = new D3Bracket();
            var bracket ={
                1: {
                    number:1,
                    player1: {name: 'john'},
                    player2: {name: 'jane'}
            }};
            //action
            var actual = d3Bracket.convertBracketToD3Tree(bracket);
            //assert
            assert.equal(actual.player1.name, 'john');
            assert.equal(actual.player2.name, 'jane');
            assert.equal(actual.parent, 'null');
            assert.equal(actual.children, null);
        });

        it('should correctly position a node and its children, children should refer to parent (1 level)', function(){
            //setup
            var d3Bracket = new D3Bracket();
            var bracket = {
                1: {
                    number:1,
                    player1: {name: 'bob'},
                    player2: {name: 'alice'},
                    next:3
                },
                2: {
                    number:2,
                    player1: null,
                    player2:{name:'frank'},
                    next:3
                },
                3:{
                    number:3,
                    player1:null,
                    player2:{name:'frank'}
                }
            };
            //action
            var actual = d3Bracket.convertBracketToD3Tree(bracket);

            //assert
            assert.equal(actual.player1, null);
            assert.equal(actual.player2.name, 'frank');
            assert.equal(actual.parent, 'null');
            assert.equal(actual.children.length, 2);
            assert.equal(actual.children[0].player1.name, 'bob');
            assert.equal(actual.children[0].player2.name, 'alice');
            assert.equal(actual.children[0].parent, 3);
            assert.equal(actual.children[1].player1, null);
            assert.equal(actual.children[1].player2.name, 'frank');
            assert.equal(actual.children[1].parent, 3);
        });

        it('should be able to link children to parents on multiple levels', function(){
            //setup
            var d3Bracket = new D3Bracket();
            var bracket ={
                1: {
                    number:1,
                    player1: {name: 'mario'},
                    player2: {name: 'bowser'},
                    next:5
                },
                2: {
                    number:2,
                    player1: {name:'mufassa'},
                    player2: {name:'scar'},
                    next:5
                },
                3:{
                    number:3,
                    player1:null,
                    player2:null,
                    next:6
                },
                4:{
                    number:4,
                    player1:null,
                    player2:null,
                    next:6
                },
                5:{
                    number:5,
                    player1: {name:'toad'},
                    player2: {name:'peach'},
                    next:7
                },
                6:{
                    number:6,
                    player1:null,
                    player2:null,
                    next:7
                },
                7:{
                    number:7,
                    player1: {name:'scrooge'},
                    player2: {name:'donald'}
                }
            };
            //action
            var actual = d3Bracket.convertBracketToD3Tree(bracket);

            //assert
            assert.equal(actual.player1.name, 'scrooge');
            assert.equal(actual.player2.name, 'donald');
            assert.equal(actual.parent, 'null');
            assert.equal(actual.children.length, 2);

            assert.equal(actual.children[0].name, 5);
            assert.equal(actual.children[0].player1.name, 'toad');
            assert.equal(actual.children[0].player2.name, 'peach');
            assert.equal(actual.children[0].parent, 7);
            assert.equal(actual.children[0].children.length, 2);
            assert.equal(actual.children[0].children[0].name, 1);
            assert.equal(actual.children[0].children[0].player1.name, 'mario' );
            assert.equal(actual.children[0].children[0].player2.name, 'bowser');
            assert.equal(actual.children[0].children[0].parent, 5);
            assert.equal(actual.children[0].children[1].name, 2);
            assert.equal(actual.children[0].children[1].player1.name, 'mufassa' );
            assert.equal(actual.children[0].children[1].player2.name, 'scar');
            assert.equal(actual.children[0].children[1].parent, 5);

            assert.equal(actual.children[1].children.length, 2);
            assert.equal(actual.children[1].children[0].name, 3);
            assert.equal(actual.children[1].children[0].parent, 6);
            assert.equal(actual.children[1].children[1].name, 4);
            assert.equal(actual.children[1].children[1].parent, 6);

        });
    });
});