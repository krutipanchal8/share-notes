import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const MyPdfViewer= ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={pageNumber} />
      </Document>
      {numPages && (
        <div style={{marginLeft:'25px'}}>
          <p>
            Page {pageNumber} of {numPages}
          </p>
          <button
            onClick={() =>
              setPageNumber((prevPageNumber) => prevPageNumber - 1)
            }
            disabled={pageNumber <= 1}
          >
            Prev
          </button>
          <button
            onClick={() =>
              setPageNumber((prevPageNumber) => prevPageNumber + 1)
            }
            disabled={pageNumber >= numPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyPdfViewer;
