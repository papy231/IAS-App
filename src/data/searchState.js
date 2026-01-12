let hasSearched = false;

export const getHasSearched = () => hasSearched;

export const setHasSearched = (value) => {
  hasSearched = !!value;
};

export const resetSearchState = () => {
  hasSearched = false;
};
