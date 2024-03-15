// pages/UploadForm.js
import "../components/Nupload.module.css"; // Import CSS file for styling

import React, { useState } from "react";
import styles from "../components/Nupload.module.css";
import { AiOutlineCloseCircle } from "react-icons/ai";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UploadForm = ({ session }) => {
  const [files, setFiles] = useState([]);
  const [videoLinks, setVideoLinks] = useState([]); // State to store uploaded video links
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // Check if adding the selected files exceeds the limit of 10
    if (files.length + selectedFiles.length > 10) {
      alert("Maximum file upload limit is 10");
      return;
    }
    // If not exceeding the limit, add the selected files to the state
    setFiles([...files, ...selectedFiles]);
  };

  const handleRemoveFile = (indexToRemove) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
  };

  function copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch((error) => {
        console.error("Unable to copy link: ", error);
      });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUploading(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("videos", file);
    });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // If the response is successful, update the UI with the uploaded video links
        const data = await response.json();
        console.log(data);
        setVideoLinks([...videoLinks, ...data.videoUrls]); // Update videoLinks state with newly uploaded video links
      } else {
        console.error("Error uploading video");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
    }

    setUploading(false);
  };

  return (
    <div className={styles.maincontainer}>
      <Header />
      <div className={styles.content}>
        <div className={styles.container}>
          <div className={styles.leftpart}>
            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className={styles.form}
            >
              <label htmlFor="videoInput" className={styles.customButton}>
                {uploading
                  ? "Uploading..."
                  : files.length === 0
                    ? "Select Video"
                    : `${files.length} Video(s) Selected`}
              </label>
              <input
                type="file"
                name="videos"
                accept="video/*"
                id="videoInput"
                multiple
                onChange={handleFileChange}
                className={styles.videoField}
                style={{ display: "none" }}
              />
              <br />
              <div
                className={styles.selectedVideosContainer}
                style={{ display: files.length === 0 ? "none" : "block" }}
              >
                {files.map((file, index) => (
                  <div key={index} className={styles.selectedVideo}>
                    <video
                      src={URL.createObjectURL(file)}
                      className={styles.videoPreview}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className={styles.removeButton}
                    >
                      <AiOutlineCloseCircle />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className={styles.button}
                disabled={uploading || files.length > 10}
              >
                {uploading ? "Uploading..." : "Upload Video"}
              </button>
            </form>
          </div>
          <div className={styles.rightpart}>
            <div className={styles.textcontainer}>
              <h3>Important</h3>
              <ul>
                <li>We offer video share and earn revenue model.</li>
                <li>
                  Easy to use, earning method by doing almost nothing.
                </li>
                <li>
                  You can just get started with uploading a video.
                </li>
              </ul>
            </div>
            <div className={styles.linkcontainer}>
              <h3>Links to your uploaded videos:</h3>
              {videoLinks.length > 0 && (
                <div className={styles.videoLink}>
                  <ul>
                    {videoLinks.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link}
                        </a>
                        <button
                          className={styles.copybutton}
                          onClick={() => copyToClipboard(link)}
                        >
                          Copy
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UploadForm;
