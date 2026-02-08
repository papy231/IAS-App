let hasSearched = false;
let recordCount = 0;
let drawCount = 0;
let uploadCount = 0;

export const getHasSearched = () => hasSearched;

export const setHasSearched = (value) => {
  hasSearched = !!value;
};

export const getRecordCount = () => recordCount;
export const getDrawCount = () => drawCount;
export const getUploadCount = () => uploadCount;

export const incrementRecordCount = () => { recordCount += 1; };
export const incrementDrawCount = () => { drawCount += 1; };
export const incrementUploadCount = () => { uploadCount += 1; };

export const resetSearchState = () => {
  hasSearched = false;
  recordCount = 0;
  drawCount = 0;
  uploadCount = 0;
};
