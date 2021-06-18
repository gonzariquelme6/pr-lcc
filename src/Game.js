import React from 'react';
import PengineClient from './PengineClient';
import Board from './Board';
import Mode from './Mode';
import Restart from './Restart';
import Hint from './Hint';
import Solution from './Solution';

class Game extends React.Component {

  pengine;

  constructor(props) {
    super(props);
    this.state = {
      grid: null,
      rowClues: null,
      colClues: null,
      waiting: false,
      won:false,
      current_mode: '#',
      filasCorrectas:[],
      colsCorrectas:[],
      statusText:null,
      gridSolution:null,
      filasCorrectasSol:[],
      colsCorrectasSol:[],
      help:false,
      solve:false,
      gridAux:null,
      filasAux:[],
      colsAux:[],
    };
    this.handleClick = this.handleClick.bind(this);
    this.handlePengineCreate = this.handlePengineCreate.bind(this);
    this.pengine = new PengineClient(this.handlePengineCreate);
  }

  handlePengineCreate() {
    //llamamos a init de prolog y con la respuestas actualizamos el estado del componente
    const queryS = 'init(PistasFilas, PistasColumns, Grilla)';
    this.pengine.query(queryS, (success, response) => {
      if (success) {
        this.setState({
          grid: response['Grilla'],
          rowClues: response['PistasFilas'],
          colClues: response['PistasColumns'],
          won:false,
          statusText:"Partida en curso."
        });
      //llamamos al metodo auxiliar checkInicio que sirve para verificar si las celdas pintadas iniciales verifican alguna pista
      this.checkInicio();
      this.solveBoard();

      this.state.grid.forEach(() => {
        this.state.filasCorrectasSol.push(1);
      });

      this.state.grid[0].forEach(() => {
        this.state.colsCorrectasSol.push(1);
      });

      }
    });
  }

  checkInicio(){
    const pistasf = JSON.stringify(this.state.rowClues);
    const pistasc = JSON.stringify(this.state.colClues);
    const grilla = JSON.stringify(this.state.grid).replaceAll('"_"', "_"); 

    //llamamos al metodo check_init de prolog con mis pistas actuales y mi grilla actual, justo despues de haberlas inicializado
    const queryS = `check_init(${pistasf}, ${pistasc}, ${grilla}, FilasSat, ColsSat)`;
    //y usamos la respuesta para inicializar las listas filasCorrectas y colsCorrectas
    this.pengine.query(queryS,(success, response) =>{
      if (success){
        this.setState({
          filasCorrectas: response['FilasSat'],
          colsCorrectas: response['ColsSat']
        })
      }  
    });
  }

  solveBoard(){
    const pistasf = JSON.stringify(this.state.rowClues);
    const pistasc = JSON.stringify(this.state.colClues);
    const grilla = JSON.stringify(this.state.grid).replaceAll('"_"', "_"); 

    //llamamos al metodo de prolog 
    const queryS = `solve(${pistasf},${pistasc},${grilla}, GRes)`;
    //y usamos la respuesta para inicializar la grilla resuelta
    this.pengine.query(queryS,(success, response) =>{
      if (success){
        this.setState({
          gridSolution: response['GRes'],
        });
      }  
    });
  }

  handleClick(i, j) {
    // Si esta esperando, o el jugador gano y no clickeo en reiniciar juego no hago nada.
    if (this.state.waiting || this.state.won) {
      return;
    }

    if (this.state.help){
      console.log(this.state.help);
      let gridHelp  = this.state.grid.slice();
      gridHelp[i][j] = this.state.gridSolution[i][j];
      this.setState({
        grid: gridHelp
      })
    }else{
      const squaresS = JSON.stringify(this.state.grid).replaceAll('"_"', "_"); // Remove quotes for variables.
      const filas = JSON.stringify(this.state.rowClues);
      const columnas = JSON.stringify(this.state.colClues);
      
      //llamamos al metodo put de prolog y usamos su respuesta para actualizar las pistas correctas
      const queryS = `put("${this.state.current_mode}", [${i}, ${j}], ${filas}, ${columnas}, ${squaresS}, GrillaRes, FilaSat, ColSat)`;
      
      this.setState({
        waiting: true
      });
      
      this.pengine.query(queryS, (success, response) => {
        //copiamos los arreglos actuales filasCorrectas y colsCorrectas a variables auxiliares
  
        let auxFilas = this.state.filasCorrectas.slice();
        let auxCols = this.state.colsCorrectas.slice();
        if (success) {
          //usamos la respuesta de prolog para actualizar los arreglos auxiliares
          auxFilas[i] = response['FilaSat'];
          auxCols[j] = response['ColSat'];
          
          this.setState({
            //uso la respuesta de prolog para actualizar el estado actual de la grilla y reemplazo los arreglos
            //actuales de filasCorrectas y colsCorrectas por los arreglos auxiliares que ya modifique
            grid: response['GrillaRes'],
            waiting: false,
            filasCorrectas:auxFilas,
            colsCorrectas:auxCols
          });
  
          //control por React de que ej jugador gano
          //si todas las filas y todas las columnas son correctas gano el juego
          let todasFilas = this.state.filasCorrectas.every(elem=> elem===1);
          let todasCols = this.state.colsCorrectas.every(elem=> elem===1);
  
          if(todasFilas&&todasCols){
            this.setState({
              won:true,
              statusText: "Ganaste!!"
            })
          }
        }else {
          this.setState({
            waiting: false
          });
        }
      });
    }
  }

  //funcion onClick para el componente Mode que alterna entre los 2 modos posibles (pintar o poner X)
  modeClick(){
    if(this.state.current_mode==='#'){
      this.setState({current_mode:'X'});
    }else{
      this.setState({current_mode:'#'});
    }
  }


  showHint(){
    if (!this.state.help) {
      this.setState({
        help:true,
        statusText:"Revelando"
      });
    }else{
      this.setState({
        help:false,
        statusText:"Partida en curso."
      });
    }
    
  }
  
  showSolution(){
    if(!this.state.solve){
      this.setState({
        solve:true,
        waiting:true,
        gridAux: this.state.grid.slice(),
        grid:this.state.gridSolution,
        filasAux: this.state.filasCorrectas.slice(),
        colsAux:this.state.colsCorrectas.slice(),
        filasCorrectas: this.state.filasCorrectasSol,
        colsCorrectas: this.state.colsCorrectasSol
      });
    }else{
      this.setState({
        solve:false,
        waiting:false,
        grid:this.state.gridAux,
        filasCorrectas: this.state.filasAux,
        colsCorrectas: this.state.colsAux
      });
    }
  }

  render() {
    if (this.state.grid === null) {
      return null;
    }
    return (
      <div className="game">
        <div className="pistasCol"></div>
        <Board
          grid={this.state.grid}
          rowClues={this.state.rowClues}
          colClues={this.state.colClues}
          onClick={(i, j) => this.handleClick(i,j)}
          rowSat = {this.state.filasCorrectas}
          colSat = {this.state.colsCorrectas}
        />
        <div className="modo">
          Modo actual: <Mode value={this.state.current_mode} onClick={() => this.modeClick()} />
        </div>

        <div className="div">
          {this.state.statusText}
         </div>
        
        <div className="bottom">
          <div className="uno">
            <Restart onClick={() => this.handlePengineCreate()} />
          </div>
          <div className="dos">
              <Hint onClick={(i,j) => this.showHint()}/>
            </div>
          <div className="tres">
              <Solution onClick={() => this.showSolution()}/>
          </div>
        </div>
              
      </div>
    );
  }
}

export default Game;
