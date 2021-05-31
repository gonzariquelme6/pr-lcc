import React from 'react';
import Square from './Square';
import Clue from './Clue';

class Board extends React.Component {
    render() {
        const numOfRows = this.props.grid.length;
        const numOfCols = this.props.grid[0].length;

        //obtengo las listas de pistas de las filas y de las columnas del padre
        const rowClues = this.props.rowClues;
        const colClues = this.props.colClues;

        //obtengo la lista de filas y columnas satisfechas del padre
        const filaSat = this.props.rowSat;
        const colSat = this.props.colSat;

        return (
            <div className="vertical">
                <div
                    className="colClues"
                    style={{
                        gridTemplateRows: '90px',
                        gridTemplateColumns: '60px repeat(' + numOfCols + ', 40px)'
                        /*
                           60px  40px 40px 40px 40px 40px 40px 40px   (gridTemplateColumns)
                          ______ ____ ____ ____ ____ ____ ____ ____
                         |      |    |    |    |    |    |    |    |  90px
                         |      |    |    |    |    |    |    |    |  (gridTemplateRows)
                          ------ ---- ---- ---- ---- ---- ---- ---- 
                         */
                    }}
                >
                    <div>{/* top-left corner square */}</div>
                    {colClues.map((clue, i) =>
                        //creo las pistas de las columnas y les paso si estan satisfechas
                        <Clue clue={clue} key={i} satisfies={colSat[i]}/>
                    )}
                </div>
                <div className="horizontal">
                    <div
                        className="rowClues"
                        style={{
                            gridTemplateRows: 'repeat(' + numOfRows + ', 40px)',
                            gridTemplateColumns: '60px'
                            /* IDEM column clues above */
                        }}
                    >
                        {rowClues.map((clue, i) =>
                            //creo las pistas de las columnas y les paso si estan satisfechas
                            <Clue clue={clue} key={i} satisfies={filaSat[i]}/>
                        )}
                    </div>
                    <div className="board" 
                        style={{
                        gridTemplateRows: 'repeat(' + numOfRows + ', 40px)',
                        gridTemplateColumns: 'repeat(' + numOfCols + ', 40px)'
                        }}>
                        {this.props.grid.map((row, i) =>
                            row.map((cell, j) =>
                                <Square
                                    value={cell}
                                    onClick={() => this.props.onClick(i, j)}
                                    key={i + j}
                                />
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default Board;