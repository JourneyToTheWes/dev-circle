import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import { BrowserRouter as Router, Route } from 'react-router-dom';
// import jwt_decode from 'jwt-decode';
// import setAuthToken from './utils/setAuthToken';
// import { setCurrentUser, logoutUser } from './actions/authActions';
// import { clearCurrentProfile } from './actions/profileActions';

// Redux
import { Provider } from 'react-redux';
import store from './store';

import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Alert from './components/layout/Alert';

import './App.css';

// Check for token
// if (localStorage.jwtToken) {
//     // Set auth token header auth
//     setAuthToken(localStorage.jwtToken);
//     // Decode token and get user info and exp
//     const decoded = jwt_decode(localStorage.jwtToken);
//     // Set user and isAuthenticated
//     store.dispatch(setCurrentUser(decoded));

//     // Check for expired token
//     const currentTime = Date.now() / 1000;
//     if (decoded.exp < currentTime) {
//         // Logout user
//         store.dispatch(logoutUser());
//         // Clear current Profile
//         store.dispatch(clearCurrentProfile());
//         // Redirect to login
//         window.location.href = '/login';
//     }
// }

const App = () => (
    <Provider store={store}>
        <Router>
            <Fragment>
                <Navbar />
                <Route exact path='/' component={Landing} />
                <section className='container'>
                    <Alert />
                    <Switch>
                        <Route exact path='/login' component={Login} />
                        <Route exact path='/register' component={Register} />
                    </Switch>
                </section>
            </Fragment>
        </Router>
    </Provider>
);

export default App;
