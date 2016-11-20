import * as b from 'bobril';
import { Header } from './components/header';
import { GameController } from './gameController';

let startLiveCell = [
    [-12, -6], [-12, -5],
    [-11, -6], [-11, -5],
    [-3, -6], [-3, -5], [-3, -4],
    [-2, -7],
    [-1, -8],
    [0, -8],
    [-2, -3],
    [-1, -2],
    [0, -2]
];

b.init(() => {
    b.invalidate();
    return [
        Header({ content: 'Game of life' }),
        GameController({
            runing: true,            
            startLiveCell: startLiveCell
        })
    ];
});

