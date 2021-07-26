import { createContext, useContext, useMemo, useState } from "react";

import { Document, Page, pdfjs } from "react-pdf";

import { Button } from "@miq/components";
import { getClassName, getImgUrl } from "@miq/utils";

import "./index.scss";

const PdfCtx = createContext();
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PdfViewer({ src, children, ...props }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    const value = useMemo(() => {
        function changePage(offset) {
            setPageNumber((prevPageNumber) => prevPageNumber + offset);
        }

        function previousPage() {
            changePage(-1);
        }

        function nextPage() {
            changePage(1);
        }

        return { src, numPages, pageNumber, previousPage, nextPage, setNumPages, setPageNumber };
    }, [src, numPages, pageNumber]);

    return <PdfCtx.Provider value={value}>{children}</PdfCtx.Provider>;
}

const Renderer = (props) => {
    let { src, pageNumber, setNumPages, setPageNumber } = useContext(PdfCtx);

    if (!src) return null;
    src = getImgUrl(src);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setPageNumber(pageNumber);
    }

    return (
        <div id={props.id} className={getClassName(["miq-pdf", props.className])}>
            <Document file={src} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} />
            </Document>
        </div>
    );
};

const Previous = (props) => {
    const { pageNumber, previousPage } = useContext(PdfCtx);

    return (
        <Button id={props.id} className={props.className} disabled={pageNumber <= 1} onClick={previousPage}>
            Previous
        </Button>
    );
};

const Next = (props) => {
    const { pageNumber, numPages, nextPage } = useContext(PdfCtx);

    return (
        <Button id={props.id} className={props.className} disabled={pageNumber >= numPages} onClick={nextPage}>
            Next
        </Button>
    );
};

PdfViewer.Previous = Previous;
PdfViewer.Next = Next;
PdfViewer.Renderer = Renderer;

// {numPages &&
// Array(numPages)
//     .fill()
//     .map((_, i) => <Page pageNumber={i + 1} />)}
