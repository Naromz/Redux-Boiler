
import React, { Component } from 'react';
import './App.css';
import { connect } from 'react-redux';
import {alertMessage,sagaStart} from './Actions/globalActions'

function App(props)
{

  return (
    <div className="App">
      <h1 onClick={() => props.alertMessage(props.message)}> Click Default Alert Action</h1>
      <h1 onClick={() => props.sagaStart()}> Click Default Saga Action</h1>
      <h1>Result: </h1>
      <p>{JSON.stringify(props.result)}</p>
    </div>
  );
}
//THIS FUNCTION MAPS STORE TO STATE
const mapState = state => ({
result: state.globalReducer.result,
});


//THIS FUNCTION IS USED TO MAP ACTIONS TO FUNCTIONS
const mapDispatch = dispatch => ({
alertMessage: (val) => dispatch(alertMessage(val)),
sagaStart: ()=> dispatch(sagaStart())

});

export default connect(
  mapState,
  mapDispatch
)(App);



