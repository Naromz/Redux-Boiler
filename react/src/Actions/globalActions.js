

export const GlobalActions ={
ALERT_MESSAGE: 'ALERT_MESSAGE',
TESTSAGA: {START:'TESTSAGASTART',SUCCESS:'TESTSAGAGOOD',FAIL:'TESTSAGABAD'}
};

export const alertMessage = (val) => ({
    type:GlobalActions.ALERT_MESSAGE,
    payload: val
})

export const sagaStart = () => ({
    type: GlobalActions.TESTSAGA.START,
    payload: null
})