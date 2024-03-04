// pages/_app.js

import './styles/UploadForm.css'; // Adjust the path as necessary
import React from 'react';


function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}


// pages/_app.js

// import { useEffect } from 'react';
// import updateViewCounts from '../tasks/updateViewCounts';

// function MyApp({ Component, pageProps }) {
//     // Run the updateViewCounts task when the application starts
//     useEffect(() => {
//         updateViewCounts();
//     }, []);

//     return <Component {...pageProps} />;
// }

export default MyApp;



