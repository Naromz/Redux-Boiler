
import reducer from './Reducers/rootReducer'
import {createStore,applyMiddleware} from 'redux'
import createSagaMiddleware from 'redux-saga'
import {createLogger} from 'redux-logger'

import mySaga from './Sagas/globalSaga'


const sagaMiddleware = createSagaMiddleware()



const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware,createLogger())
)

// then run the saga
sagaMiddleware.run(mySaga)

export default store;