:- module(proylcc,
	[  
		put/8,
		check_init/5,
		solve/4
	]).

:-use_module(library(lists)).
:-use_module(library(clpfd)).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% replace(?X, +XIndex, +Y, +Xs, -XsY)
%
% XsY es el resultado de reemplazar la ocurrencia de X en la posición XIndex de Xs por Y.

replace(X, 0, Y, [X|Xs], [Y|Xs]).

replace(X, XIndex, Y, [Xi|Xs], [Xi|XsY]):-
    XIndex > 0,
    XIndexS is XIndex - 1,
    replace(X, XIndexS, Y, Xs, XsY).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% ver_subcadena(+Cant, +XXs,-XRes)
%
% XRes es el resultado de sacar la subcadena de Cant "#" consecutivos de XXs.
ver_subcadena(0,[],[]).
ver_subcadena(0,[X|Xs],Xs):- X\=="#".
ver_subcadena(Cant,[X|Xs],XRes):- 
	X=="#",
	CantAux is Cant-1,
	ver_subcadena(CantAux,Xs,XRes).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% check(+PPs,+XXs, -R)
%
% R es el resultado de verificar que la lista XXs de celdas satisface las pistas de la lista PPs.

formatoPistas([X|Xs],L):- X=="#",contarConsecutivas([X|Xs],Res,ListaAux),
    formatoPistas(ListaAux,LAux), append([Res],LAux,L).
formatoPistas([X|Xs],L):- X\=="#", formatoPistas(Xs,L).
formatoPistas([],[]).

contarConsecutivas([X|Xs],R,Restante):- X=="#", 
    contarConsecutivas(Xs,RAux,Restante),
    R is 1+RAux.
contarConsecutivas([X|Xs],0,[X|Xs]):- X\=="#".
contarConsecutivas([],0,[]).

check(P,L,1):-formatoPistas(L,Laux), Laux=P.
check(P,L,0):-formatoPistas(L,Laux), Laux\=P.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% satisfies(+XIndex, +Pistas, +Grilla, -Res)
%
% Res es el resultado de verificar que la lista en XIndex de Grilla satisface la pista XIndex de Pistas.
satisfies(XIndex,Pistas,Grilla,Res):-
	nth0(XIndex,Pistas,PistaX),
	nth0(XIndex,Grilla,ListaX),
	check(PistaX,ListaX,Res).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% put(+Contenido, +Pos, +PistasFilas, +PistasColumnas, +Grilla, -GrillaRes, -FilaSat, -ColSat).
%

put(Contenido, [RowN, ColN], PistasFilas, PistasColumnas, Grilla, NewGrilla, FilaSat, ColSat):-
	% NewGrilla es el resultado de reemplazar la fila Row en la posición RowN de Grilla
	% (RowN-ésima fila de Grilla), por una fila nueva NewRow.
	
	replace(Row, RowN, NewRow, Grilla, NewGrilla),
	
	% NewRow es el resultado de reemplazar la celda Cell en la posición ColN de Row por _,
	% siempre y cuando Cell coincida con Contenido (Cell se instancia en la llamada al replace/5).
	% En caso contrario (;)
	% NewRow es el resultado de reemplazar lo que se que haya (_Cell) en la posición ColN de Row por Contenido.	 
	
	(replace(Cell, ColN, _ , Row, NewRow),
	Cell == Contenido;
	replace(_Cell, ColN, Contenido, Row, NewRow)),
    
	satisfies(RowN,PistasFilas,NewGrilla,FilaSat),
    transpose(NewGrilla,Columns),
	satisfies(ColN,PistasColumnas,Columns,ColSat).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% check_vacio(+XXs, -R)
%
% R es el resultado de verificar si la lista XXs no tiene "#".
check_vacio([],0).
check_vacio([X|_Xs],1):- X=="#".
check_vacio([X|Xs],R):- X\=="#", check_vacio(Xs,R).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% check_init_aux(+XXs, +YYs, -RRs)
%
% RRs es el resultado de verificar si cada lista de YYs satisface la pista correspondiente de XXs.
check_init_aux([],[],[]).
check_init_aux([X|Xs],[Y|Ys],[R|Rs]):-
	(check_vacio(Y,R), R==0 ; check(X,Y,R)),
	check_init_aux(Xs,Ys,Rs).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% check_init(+PistasFilas, +PistasColumnas, +Grilla, -FilasSat, -ColsSat)
%
% FilasSat es el resultado de verificar fila por fila si satisfacen su correspondiente pista.
% ColsSat es el resultado de verificar columna por columna si satisfacen su correspondiente pista.

check_init(PistasFilas, PistasColumnas, Grilla, FilasSat, ColsSat):-
	check_init_aux(PistasFilas,Grilla,FilasSat),
	transpose(Grilla,GrillaCols),
	check_init_aux(PistasColumnas,GrillaCols,ColsSat).


%genera una linea que satisface la pista P
%generarLinea(?L, +P)
%
generarLinea(["#"|Xs],P):-generarCadena(["#"|Xs],N,LineaAux),
    generarLinea(LineaAux,PAux), 
    append([N],PAux,P).
generarLinea(["X"|Xs],P):-generarLinea(Xs,P).
generarLinea([],[]).

%genera una cadena de N # seguidos
%generarCadena(?XXs, +N, -R)
%
generarCadena(["#"|Xs],R,Restante):- 
    generarCadena(Xs,RAux,Restante),
    R is 1+RAux.
generarCadena(["X"|Xs],0,["X"|Xs]).
generarCadena([],0,[]).

%Dada una Pista y una Long de linea genera la linea segura
%%lineaSegura(+Pista, +Long, -Linea)
lineaSegura(P, Long, Lact, Linea):-
    length(Lvacia,Long),
    unirListas(Lvacia, Lact, L),
    findall(L,generarLinea(L,P),LRes),
    transpose(LRes, LTrans),
    segura(LTrans, Linea).

unirListas([_X], [Y], [Y]):-Y=="X".
unirListas([_X], [Y], [Y]):-Y=="#".
unirListas([X], [_Y], [X]).
unirListas([_X|Xs], [Y|Ys], [Y|Zs]):-Y=="X", unirListas(Xs,Ys,Zs).
unirListas([_X|Xs], [Y|Ys], [Y|Zs]):-Y=="#", unirListas(Xs,Ys,Zs).
unirListas([X|Xs], [_Y|Ys], [X|Zs]):-unirListas(Xs,Ys,Zs).

%Dada una lista de lineas devuelve la linea con caracteres seguros
%%segura(+L, -R)

segura([X],["#"]):-not(member("X",X)).
segura([X],["X"]):-not(member("#",X)).
segura([_X],[_]).

segura([X|Xs],["#"|Rs]):-not(member("X",X)), segura(Xs,Rs).
segura([X|Xs],["X"|Rs]):-not(member("#",X)), segura(Xs,Rs).
segura([_X|Xs],[_|Rs]):- segura(Xs,Rs).


%Dada una lista de pistas y una longitud de linea devuelvo una lista con todas las lineas seguras
%%grillaSeguras(+PPs, +L, -R)
grillaSeguras([P], L, [G], [R]):- lineaSegura(P,L,G,R).
grillaSeguras([P|Ps], L, [G|Gs], [R|Rs]):- lineaSegura(P,L,G,R), grillaSeguras(Ps,L,Gs,Rs).

%Dadas las Pistas y longitudes de filas y columnas se obtiene una grilla con valores seguros
%%filasColsSeguras(+PistasFila, +LargoPistasFila, +PistasCols, +LargoPistasCols, -G)
filasColsSeguras(PF, LF, PC, LC, Gact, GRes):-
    grillaSeguras(PF, LF, Gact, R1),
	transpose(R1, Gact2),
    grillaSeguras(PC, LC, Gact2, R2),
    transpose(R2, GRes).

solve(_PF, _PC, Gact, Gact):-
    completo(Gact).

solve(PF, PC, Gact, GRes):-
	length(PC, LF),
	length(PF, LC),
    filasColsSeguras(PF, LF, PC, LC, Gact, GSig),
    solve(PF, PC,GSig, GRes).

completo([]).
completo([F|Fs]):-
    filaCompleta(F),
    completo(Fs).

filaCompleta([]).
filaCompleta([X|Xs]):- X=="X", filaCompleta(Xs).
filaCompleta([X|Xs]):- X=="#", filaCompleta(Xs).

