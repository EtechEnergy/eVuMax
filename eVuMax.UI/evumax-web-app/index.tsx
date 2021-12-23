import '@progress/kendo-theme-material'



import 'bootstrap/dist/css/bootstrap.min.css';



import $ from 'jquery';
import Popper from 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'axios-progress-bar/dist/nprogress.css'


import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


import * as serviceWorker from './serviceWorker';
import App from './components/app/app';

ReactDOM.render(

    <App />,

    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

serviceWorker.unregister();
