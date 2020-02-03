import React, {Component} from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import store from './store';
import App from './App';
import {
     Router,
    Switch,
    Route,
  } from "react-router-dom";
import history from './history';
import Button from '@material-ui/core/Button'


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
            <Router history={history}>
                <Switch>
                    <Route path="/Donations">
                        <h1></h1>
                        <Button onClick={() => history.push('/')}> go Back</Button>
                    </Route>
                    <Route path="/Settings">
                    <h1>users</h1>
                    </Route>
                    <Route path="/">
                    <App />
                    </Route>
                </Switch>
            
            </Router>
            
            </Provider>
        );
    }
}

render( <Main/> , document.getElementById('root'));
