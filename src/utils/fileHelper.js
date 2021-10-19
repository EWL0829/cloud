const fs = window.require('fs').promises;

const fileHelper = {
    readFile: (path) => {
        return fs.readFile(path, { encoding: 'utf8' });
    },
    writeFile: (path, content) => {
        return fs.writeFile(path, content, { encoding: 'utf8' });
    },
    renameFile: (oldPath, newPath) => {
        return fs.rename(oldPath, newPath);
    },
    deleteFile: (path) => {
        // fs.unlink() 不适用于目录，无论是空目录还是其他目录。 要删除目录，请使用 fs.rmdir()
        return fs.unlink(path);
    }
};

export default fileHelper;
