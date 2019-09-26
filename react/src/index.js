import React, {Component} from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import store from './store';
import App from './App';

class Main extends Component {
    constructor() {
        super();
        this.state = {
            name: 'React'
        };
    }
    render() {
        return ( 
            <Provider store = {store}>

            <App message="test"/>

            </Provider>
        );
    }
}

render( <Main/> , document.getElementById('root'));
