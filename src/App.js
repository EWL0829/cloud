import React, { useState } from 'react';
import { faFileImport, faPlus, faSave } from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { v4 as uuidv4 } from 'uuid';
import { message } from 'antd';
import FileSearch from "./components/FileSearch";
import FileList from "./components/FileList";
import BottomBtn from "./components/BottomBtn";
import TabList from "./components/TabList";
import { objToArr } from './utils/helper';
import fileHelper from "./utils/fileHelper";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const { remote } = window.require('electron');
const { join } = window.require('path');

const Store = window.require('electron-store');
const fileStore = new Store({ 'name': 'Luna\'s Files' });

const saveFilesToStore = (files) => {
    // we don't have to store any info in file system. eg: isNew, body
    const filesStoreObj = objToArr(files).reduce((result, file) => {
        const { id, createdAt, path, title } = file;
        result[id] = { id, createdAt, path, title };
        return result;
    }, {});
    fileStore.set('files', filesStoreObj);
};

function App() {
    const [files, setFiles] = useState(fileStore.get('files') || {}); // 传递到列表中的fileList 字典
    const [activeFileId, setActiveFileId] = useState(-1); // 当前处于编辑面板激活的文件，只有一个
    const [openedFileIDs, setOpenedFileIDs] = useState([]); // // 当前打开的文件，可能有多个，所以是数组
    const [unsavedFileIDs, setUnsavedFileIDs] = useState([]); // 未被保存的文件
    const [searchedFiles, setSearchedFiles] = useState([]); // 被搜索的数组，files数组被很多场景依赖，这里需要翻出抽取出来进行展示或者过滤
    const filesArray = objToArr(files); // 将字典拍平为数组，方便查询
    const fileSavedPath = remote.app.getPath('documents');
    const activeFile = files[activeFileId];
    // 当搜索的内容不为空的时候，就显示搜索列表否则显示默认的文件列表
    // todo 体验优化的话最好在搜不到的时候添加一个toast提示，提醒用户没有对应的搜索结果
    const fileListArr = searchedFiles.length > 0 ? searchedFiles : filesArray;
    const openedFiles = openedFileIDs.map(openedId => {
        return files[openedId];
    });

    const fileClick = (id) => {
        // 1. 将激活的id设置为当前的id
        setActiveFileId(id);
        const currentFile = files[id];
        console.log('files', currentFile);
        if (!currentFile.isLoaded) {
            fileHelper.readFile(currentFile.path).then((value) => {
                const newFile = { ...files[id], body: value, isLoaded: true };
                setFiles({ ...files, [id]: newFile });
            }).catch((e) => {
                if (e.code === 'ENOENT') {
                    message.info('该文件已从磁盘中删除', 2.5);
                    deleteFile(id);
                }
            });
        }
        // 2. 将editor打开，展示当前激活id的内容
        // 3. 给openedFilesIDs里面push一条记录进去，记得查重 setActiveFileId(id);
        if (!openedFileIDs.includes(id)) {
            setOpenedFileIDs([...openedFileIDs, id]);
        }
    };

    const tabClick = (id) => {
        if (id !== activeFileId) {
            setActiveFileId(id);
        }
    };

    const tabClose = (id) => {
        const filteredTabList = openedFileIDs.filter(fileId => fileId !== id);
        setOpenedFileIDs(filteredTabList);
        if (filteredTabList.length > 0) {
            setActiveFileId(filteredTabList[0]);
        } else {
            setActiveFileId(-1);
        }
    };

    const fileChange = (id, value) => { // 1. update the active file body // 2. update the unsavedFiles
        const newFile = { ...files[id], body: value };

        setFiles({ ...files, [id]: newFile });

        if (!unsavedFileIDs.includes(id)) {
            setUnsavedFileIDs([...unsavedFileIDs, id]);
        }
    };

    const deleteFile = (id) => {
        const { [id]: value, ...afterDelete } = files;
        if (files[id].isNew) {
            setFiles(afterDelete);
        } else {
            fileHelper.deleteFile(files[id].path).then(() => {
                setFiles(afterDelete);
                saveFilesToStore(afterDelete);
                // close tab if open
                tabClose(id);
            }).catch((e) => {
                if (e.code === 'ENOENT') {
                    // 静默删除
                    setFiles(afterDelete);
                    saveFilesToStore(afterDelete);
                    // close tab if open
                    tabClose(id);
                }
            });
        }
    };

    const updateFileName = (id, title, isNew) => {
        const newPath = join(fileSavedPath, `${title}.md`);
        const modifiedFile = { ...files[id], isNew: false, title, path: newPath };
        const newFiles = { ...files, [id]: modifiedFile };
        const isNameDuplicated = filesArray.find(item => item.title === title);
        if (isNameDuplicated) {
            message.info('请勿创建重名文件', 2.5,);
            return;
        }


        if (isNew) {
            // 如果是新创建的文件
            const fileBody = files[id].body;
            fileHelper.writeFile(newPath, fileBody).then(() => {
                setFiles(newFiles);
                saveFilesToStore(newFiles);
            });
        } else {
            // 如果是编辑旧文件
            const oldPath = join(fileSavedPath, `${files[id].title}.md`);
            fileHelper.renameFile(oldPath, newPath).then(() => {
                setFiles(newFiles);
                saveFilesToStore(newFiles);
            });
        }
    };

    const fileSearch = (keyword) => {
        // filter out the new files based on the keyword
        // 如果这里的keyword输入为空，那么includes判断会判断files中每一个都含有空字符串，自然就会展示全量列表了
        const newFiles = filesArray.filter(file => file.title.includes(keyword));
        setSearchedFiles(newFiles);
    };


    const createNewFile = () => {
        const newId = uuidv4();
        const newFile = {
            id: newId,
            title: '新建文件',
            body: '## 文件还是空的哦',
            createAt: Date.now(),
            isNew: true,
        }
        setFiles({ ...files, [newId]: newFile });
    };

    const saveCurrentFile = () => {
        fileHelper.writeFile(join(fileSavedPath, `${activeFile.title}.md`), activeFile.body).then(() => {
           // 将当前的activeFile改为已保存文件，则未保存的文件id列表就不再包含当前的activeFile了
           setUnsavedFileIDs(unsavedFileIDs.filter(item => item !== activeFile.id));
        });
    };

    // 导入文件
    const importFiles = () => {
        remote.dialog.showOpenDialog({
            title: '选择需要导入的 Markdown 文件',
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Markdown Files', extensions: ['md'] },
            ],
        }, (paths) => {
            console.log('paths', paths);
        })
    };
    return (
        <div className="App container-fluid px-0">
            <div className="row no-gutters">
                <div className="col-4 bg-light left-panel">
                    <FileSearch
                        title="我的文档"
                        onFileSearch={(value) => {
                            fileSearch(value);
                        }}
                    />
                    <FileList
                        files={fileListArr}
                        onFileClick={(id) => {
                            fileClick(id);
                        }}
                        onSaveEdit={(id, newValue, isNew) => {
                            // id 与 title
                            updateFileName(id, newValue, isNew);
                        }}
                        onFileDelete={(id) => {
                            deleteFile(id);
                        }}
                    />
                    <div className="row no-gutters button-group">
                        <div className="col">
                            <BottomBtn
                                text="新建"
                                icon={faPlus}
                                colorClass="btn-primary"
                                onBtnClick={() => {
                                    createNewFile();
                                }}
                            />
                        </div>
                        <div className="col">
                            <BottomBtn
                                text="导入"
                                icon={faFileImport}
                                colorClass="btn-success"
                                onBtnClick={importFiles}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-8 right-panel">
                    {
                        !activeFile ?
                            <div className="start-page">选择或者创建新的Markdown文件</div> :
                            <>
                                <TabList
                                    files={openedFiles} activeId={activeFileId} unsavedIds={unsavedFileIDs}
                                    onTabClick={tabClick} onCloseTab={tabClose}
                                />
                                <SimpleMDE
                                    key={activeFile && activeFile.id}
                                    value={activeFile && activeFile.body}
                                    onChange={(value) => {
                                        fileChange(activeFile.id, value);
                                    }} options={{
                                    minHeight: '515px',
                                }}
                                />
                                <BottomBtn
                                    text="保存"
                                    icon={faSave}
                                    colorClass="btn-success"
                                    onBtnClick={saveCurrentFile}
                                />
                            </>
                    } </div>
            </div>
        </div>
    );
}

export default App;
