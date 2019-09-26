import {GlobalActions} from '../Actions/globalActions'


export default (state = {}, action) => {

    
    switch (action.type) 
    {
        case GlobalActions.ALERT_MESSAGE:
            alert(action.payload);
            return {
                ...state
            }

            case GlobalActions.TESTSAGA.START:
            return {
                ...state
            }

            case GlobalActions.TESTSAGA.SUCCESS || GlobalActions.TESTSAGA.FAIL:
            console.log(action.payload);
            alert(JSON.stringify(action.payload));
            return {
                ...state,
                result:action.payload
            }

            default:
                return state

    }
}