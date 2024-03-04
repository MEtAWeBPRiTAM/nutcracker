// pages/index.js

// import UploadForm from './UploadForm';
import React from 'react';
import Header from '../components/Header';
import Banner from '../components/Banner';
import Footer from '../components/Footer';


const IndexPage = () => {
  // return (
  //   <div>
  //     <h1>Upload Video</h1>
  //     <UploadForm />
  //   </div>
  // );
  return (
    <div className="container">
      {/* <Header /> */}
      <Banner />
      {/* <Footer /> */}
    </div>
  );
};

export default IndexPage;
