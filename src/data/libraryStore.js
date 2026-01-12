import { folders as defaultFolders, folderFiles as defaultFolderFiles } from './libraryData';

let foldersState = defaultFolders.map((folder) => ({ ...folder }));
let filesByFolderState = Object.fromEntries(
  Object.entries(defaultFolderFiles).map(([key, files]) => [
    key,
    files.map((file) => ({ ...file })),
  ]),
);

export const getLibraryState = () => ({
  folders: foldersState,
  filesByFolder: filesByFolderState,
});

export const setLibraryFolders = (nextFolders) => {
  foldersState = nextFolders;
};

export const setLibraryFilesByFolder = (nextFilesByFolder) => {
  filesByFolderState = nextFilesByFolder;
};
